import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"

const trends = new Hono()

interface TrendRow {
  id: string
  business_id: string | null
  title: string
  platform: string | null
  description: string | null
  category: string | null
  source_url: string | null
  status: string
  created_by: string | null
  created_at: string
}

// Suggested posting windows per platform. The trend engine surfaces these so the
// team can slot content where it is most likely to perform.
export interface PostingWindow {
  platform: string
  label: string
  windows: Array<{ days: string; times: string; note: string }>
}

export const POSTING_WINDOWS: PostingWindow[] = [
  {
    platform: "linkedin",
    label: "LinkedIn",
    windows: [
      { days: "Tue-Thu", times: "8:00-10:00", note: "Professional weekday mornings clear B2B attention" },
      { days: "Wed", times: "12:00-13:00", note: "Lunch-hour peak for longer reads" },
    ],
  },
  {
    platform: "instagram",
    label: "Instagram",
    windows: [
      { days: "Mon-Fri", times: "11:00-13:00", note: "Midday scroll window" },
      { days: "Tue-Fri", times: "18:00-21:00", note: "Reels perform best in the early evening" },
    ],
  },
  {
    platform: "facebook",
    label: "Facebook",
    windows: [
      { days: "Tue-Thu", times: "13:00-15:00", note: "Post-lunch engagement window" },
      { days: "Fri", times: "16:00-18:00", note: "Weekend-planning scroll" },
    ],
  },
  {
    platform: "x",
    label: "X",
    windows: [
      { days: "Mon-Fri", times: "8:00-10:00", note: "Early-morning news cycle" },
      { days: "Mon-Fri", times: "12:00-13:00", note: "Lunch break spike" },
    ],
  },
  {
    platform: "threads",
    label: "Threads",
    windows: [
      { days: "Mon-Fri", times: "18:00-21:00", note: "Casual early-evening conversation" },
    ],
  },
  {
    platform: "tiktok",
    label: "TikTok",
    windows: [
      { days: "Tue-Thu", times: "18:00-21:00", note: "Prime short-video window" },
      { days: "Fri-Sat", times: "12:00-15:00", note: "Weekend discovery" },
    ],
  },
  {
    platform: "youtube",
    label: "YouTube",
    windows: [
      { days: "Thu-Sat", times: "12:00-15:00", note: "Long-form watch window" },
    ],
  },
]

const TREND_CATEGORIES = ["Industry", "Product", "Culture", "Local", "Platform"]

function tenantBusinessIds(c: import("hono").Context): string[] | null {
  const user = c.get("user") as { role: string } | undefined
  if (user?.role === "admin") return null
  return (c.get("tenantIds") as string[] | null) ?? []
}

function canAccess(c: import("hono").Context, businessId: string | null): boolean {
  if (!businessId) return true
  const ids = tenantBusinessIds(c)
  if (ids === null) return true
  return ids.includes(businessId)
}

// List trends. Filters: status (active/archived), businessId.
trends.get("/", (c) => {
  const status = c.req.query("status")
  const businessId = c.req.query("businessId")

  const db = getDb()
  const conditions: string[] = []
  const params: unknown[] = []

  const ids = tenantBusinessIds(c)
  if (ids !== null) {
    conditions.push(`(business_id IS NULL OR business_id IN (${ids.map(() => "?").join(",")}))`)
    params.push(...ids)
  }
  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (status) {
    conditions.push("status = ?")
    params.push(status)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = db
    .prepare(`SELECT * FROM trends ${where} ORDER BY created_at DESC`)
    .all(...params) as TrendRow[]

  // "New trend" alert count: active trends logged within the last 7 days.
  const recentCount = db
    .prepare("SELECT COUNT(*) AS n FROM trends WHERE status = 'active' AND created_at >= datetime('now', '-7 days')")
    .get() as { n: number }

  return c.json({ trends: rows, recentCount: recentCount.n })
})

// Create a trend. Owner-only. `isAlert` is derived: a fresh active trend always
// counts as a dashboard alert for 7 days.
trends.post("/", async (c) => {
  const user = c.get("user") as { id: string; email?: string }
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  const title = body.title ? String(body.title).trim() : ""

  if (!title) {
    c.status(400)
    return c.json({ error: "title is required" })
  }

  const businessId = body.businessId ? String(body.businessId) : null
  if (!canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const category = body.category ? String(body.category) : null
  if (category && !TREND_CATEGORIES.includes(category)) {
    c.status(400)
    return c.json({ error: `category must be one of: ${TREND_CATEGORIES.join(", ")}` })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO trends (id, business_id, title, platform, description, category, source_url, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, datetime('now'))",
  ).run(
    id,
    businessId,
    title,
    body.platform ? String(body.platform) : null,
    body.description ? String(body.description) : null,
    category,
    body.sourceUrl ? String(body.sourceUrl) : null,
    user.email ?? null,
  )

  recordAudit(c, "create_trend", "trends", id, { title, businessId })
  const trend = db.prepare("SELECT * FROM trends WHERE id = ?").get(id)
  return c.json({ trend })
})

trends.patch("/:id", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM trends WHERE id = ?").get(c.req.param("id")) as TrendRow | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Trend not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  if (body.status !== undefined && !["active", "archived"].includes(String(body.status))) {
    c.status(400)
    return c.json({ error: "status must be 'active' or 'archived'" })
  }

  db.prepare(
    "UPDATE trends SET title = COALESCE(?, title), platform = COALESCE(?, platform), description = COALESCE(?, description), category = COALESCE(?, category), source_url = COALESCE(?, source_url), status = COALESCE(?, status) WHERE id = ?",
  ).run(
    body.title ? String(body.title) : null,
    body.platform !== undefined ? (body.platform ? String(body.platform) : null) : null,
    body.description !== undefined ? (body.description ? String(body.description) : null) : null,
    body.category !== undefined ? (body.category ? String(body.category) : null) : null,
    body.sourceUrl !== undefined ? (body.sourceUrl ? String(body.sourceUrl) : null) : null,
    body.status !== undefined ? String(body.status) : null,
    c.req.param("id"),
  )

  recordAudit(c, "update_trend", "trends", c.req.param("id"), { status: body.status })
  const updated = db.prepare("SELECT * FROM trends WHERE id = ?").get(c.req.param("id"))
  return c.json({ trend: updated })
})

trends.delete("/:id", (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM trends WHERE id = ?").get(c.req.param("id")) as TrendRow | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Trend not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  db.prepare("DELETE FROM trends WHERE id = ?").run(c.req.param("id"))
  recordAudit(c, "delete_trend", "trends", c.req.param("id"))
  return c.json({ success: true })
})

// Posting-window recommendations (static best-practice config).
trends.get("/timing", (c) => {
  return c.json({ windows: POSTING_WINDOWS })
})

export { trends }
