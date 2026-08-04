import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import {
  generatePost,
  contentHash,
  validateBody,
  addDays,
  todayUTC,
  SLOTS_PER_DAY,
  type BusinessInput,
} from "../services/contentCalendar.js"

const contentCalendar = new Hono()

interface CalendarRow {
  id: string
  business_id: string
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  status: string
  is_ai_generated: number
  source: string
  content_hash: string
  created_at: string
}

function tenantBusinessIds(c: import("hono").Context): string[] | null {
  const user = c.get("user") as { role: string } | undefined
  if (user?.role === "admin") return null
  return (c.get("tenantIds") as string[] | null) ?? []
}

function canAccess(c: import("hono").Context, businessId: string): boolean {
  const ids = tenantBusinessIds(c)
  if (ids === null) return true
  return ids.includes(businessId)
}

// List calendar entries (owner-only). Filters: businessId, from, to, status.
contentCalendar.get("/", (c) => {
  const businessId = c.req.query("businessId")
  const from = c.req.query("from")
  const to = c.req.query("to")
  const status = c.req.query("status")

  if (businessId && !canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const conditions: string[] = []
  const params: unknown[] = []

  const ids = tenantBusinessIds(c)
  if (ids !== null) {
    conditions.push(`business_id IN (${ids.map(() => "?").join(",")})`)
    params.push(...ids)
  }
  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (from) {
    conditions.push("scheduled_date >= ?")
    params.push(from)
  }
  if (to) {
    conditions.push("scheduled_date <= ?")
    params.push(to)
  }
  if (status) {
    conditions.push("status = ?")
    params.push(status)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = db
    .prepare(`SELECT * FROM content_calendar ${where} ORDER BY scheduled_date ASC, slot ASC`)
    .all(...params) as CalendarRow[]

  return c.json({ entries: rows })
})

// Coverage summary per business: days filled out of the requested window.
contentCalendar.get("/coverage", (c) => {
  const businessId = c.req.query("businessId")
  const days = Math.min(parseInt(c.req.query("days") || "365", 10) || 365, 3650)
  const startDate = c.req.query("startDate") || todayUTC()

  if (businessId && !canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const ids = tenantBusinessIds(c)

  const list = (ids === null
    ? db.prepare("SELECT id, name FROM businesses ORDER BY name").all()
    : db
        .prepare(`SELECT id, name FROM businesses WHERE id IN (${ids.map(() => "?").join(",")}) ORDER BY name`)
        .all(...ids)) as Array<{ id: string; name: string }>

  const endDate = addDays(startDate, days - 1)
  const coverage = list.map((biz) => {
    const count = db
      .prepare(
        "SELECT COUNT(*) AS n FROM content_calendar WHERE business_id = ? AND scheduled_date >= ? AND scheduled_date <= ?",
      )
      .get(biz.id, startDate, endDate) as { n: number }
    const filledDays = Math.floor(count.n / SLOTS_PER_DAY)
    return { ...biz, filledDays, totalDays: days, filledSlots: count.n, slotsPerDay: SLOTS_PER_DAY }
  })

  return c.json({ coverage, startDate, endDate })
})

// Generate the calendar for a business: `days` (default 365) x 3 slots, filling
// only gaps. Never overwrites existing entries and never repeats a stored hash.
contentCalendar.post("/generate", async (c) => {
  const { businessId, days, startDate } = await c.req.json()
  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const count = Math.min(parseInt(String(days || 365), 10) || 365, 3650)
  const start = typeof startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : todayUTC()

  const db = getDb()
  const biz = db.prepare("SELECT id, name, type FROM businesses WHERE id = ?").get(businessId) as
    | BusinessInput
    | undefined
  if (!biz) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  const existingHashes = new Set(
    (db.prepare("SELECT content_hash FROM content_calendar WHERE business_id = ?").all(businessId) as Array<{
      content_hash: string
    }>).map((r) => r.content_hash),
  )

  let created = 0
  let skippedExisting = 0
  let failed = 0

  const insert = db.prepare(
    "INSERT OR IGNORE INTO content_calendar (id, business_id, scheduled_date, slot, platform, title, body, status, is_ai_generated, source, content_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 1, 'ai', ?, datetime('now'))",
  )

  db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const date = addDays(start, i)
      for (let slot = 1; slot <= SLOTS_PER_DAY; slot++) {
        const taken = db
          .prepare("SELECT 1 FROM content_calendar WHERE business_id = ? AND scheduled_date = ? AND slot = ?")
          .get(businessId, date, slot)
        if (taken) {
          skippedExisting++
          continue
        }
        const post = generatePost(biz, date, slot, (hash) => existingHashes.has(hash))
        if (!post) {
          failed++
          continue
        }
        const id = uuid()
        insert.run(id, businessId, post.scheduled_date, post.slot, post.platform, post.title, post.body, post.content_hash)
        existingHashes.add(post.content_hash)
        created++
      }
    }
  })()

  recordAudit(c, "generate_calendar", "content_calendar", businessId, { days: count, created, failed })
  return c.json({ created, skippedExisting, failed, startDate: start, days: count })
})

// Edit a draft entry (review/edit step). Re-hashes and re-validates the body.
contentCalendar.patch("/:id", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id")) as
    | CalendarRow
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Entry not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const { title, body, status } = await c.req.json()

  if (body !== undefined && typeof body === "string") {
    const newTitle = title !== undefined && title !== null ? String(title) : existing.title
    const problems = validateBody(body, newTitle)
    if (problems.length > 0) {
      c.status(400)
      return c.json({ error: `Invalid content: ${problems.join("; ")}` })
    }
  }

  const allowedStatuses = ["draft", "approved"]
  const nextStatus = status !== undefined ? String(status) : existing.status
  if (!allowedStatuses.includes(nextStatus)) {
    c.status(400)
    return c.json({ error: "Status must be 'draft' or 'approved'" })
  }

  const nextTitle = title !== undefined && title !== null ? String(title) : existing.title
  const nextBody = body !== undefined && typeof body === "string" ? body : existing.body
  const nextHash = contentHash(nextBody)

  db.prepare(
    "UPDATE content_calendar SET title = ?, body = ?, content_hash = ?, status = ?, edited_at = datetime('now') WHERE id = ?",
  ).run(nextTitle, nextBody, nextHash, nextStatus, c.req.param("id"))

  recordAudit(c, "edit_calendar", "content_calendar", c.req.param("id"), { status: nextStatus })
  const updated = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id"))
  return c.json({ entry: updated })
})

// Approve an entry for future publishing.
contentCalendar.post("/:id/approve", (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id")) as
    | CalendarRow
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Entry not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  db.prepare("UPDATE content_calendar SET status = 'approved' WHERE id = ?").run(c.req.param("id"))
  recordAudit(c, "approve_calendar", "content_calendar", c.req.param("id"))
  return c.json({ success: true, status: "approved" })
})

contentCalendar.delete("/:id", (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id")) as
    | CalendarRow
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Entry not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  db.prepare("DELETE FROM content_calendar WHERE id = ?").run(c.req.param("id"))
  recordAudit(c, "delete_calendar", "content_calendar", c.req.param("id"))
  return c.json({ success: true })
})

export { contentCalendar }
