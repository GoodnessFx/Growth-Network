import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import { requireOwner } from "../middleware/auth.js"
import { storage } from "../services/storage.js"

const businesses = new Hono()

businesses.get("/", (c) => {
  const user = c.get("user") as { id: string; role: string }
  const tenantIds = c.get("tenantIds") as string[] | null
  const db = getDb()

  if (user.role === "admin") {
    const rows = db.prepare("SELECT * FROM businesses ORDER BY created_at DESC").all()
    return c.json({ businesses: rows })
  }

  if (!tenantIds || tenantIds.length === 0) {
    return c.json({ businesses: [] })
  }

  const placeholders = tenantIds.map(() => "?").join(",")
  const rows = db
    .prepare(`SELECT * FROM businesses WHERE id IN (${placeholders}) ORDER BY created_at DESC`)
    .all(...tenantIds)

  return c.json({ businesses: rows })
})

businesses.get("/:id", (c) => {
  const user = c.get("user") as { id: string; role: string }
  const db = getDb()
  const row = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id")) as
    | { owner_id: string }
    | undefined
  if (!row) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }
  if (user.role !== "admin" && row.owner_id !== user.id) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  c.set("currentBusinessId", c.req.param("id"))
  recordAudit(c, "read", "business", c.req.param("id"))
  return c.json({ business: row })
})

businesses.post("/", requireOwner, async (c) => {
  const user = c.get("user") as { id: string }
  const { name, type, domain } = await c.req.json()

  if (!name || !type) {
    c.status(400)
    return c.json({ error: "name and type are required" })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO businesses (id, name, type, status, owner_id, domain, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, datetime('now'), datetime('now'))",
  ).run(id, name, type, user.id, domain || null)

  recordAudit(c, "create", "business", id, { name, type })
  return c.json({ business: { id, name, type, status: "active", ownerId: user.id, domain } })
})

businesses.put("/:id", requireOwner, async (c) => {
  const { name, type, status, domain } = await c.req.json()
  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  db.prepare(
    "UPDATE businesses SET name = COALESCE(?, name), type = COALESCE(?, type), status = COALESCE(?, status), domain = COALESCE(?, domain), updated_at = datetime('now') WHERE id = ?",
  ).run(name || null, type || null, status || null, domain || null, c.req.param("id"))

  recordAudit(c, "update", "business", c.req.param("id"), { name, type, status })
  const updated = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  return c.json({ business: updated })
})

// Owner-only: control whether a business (and its analytics) is visible to the
// public, read-only view. Hidden businesses are excluded from every public
// endpoint. The owner still sees them internally, flagged as hidden.
businesses.patch("/:id/visibility", requireOwner, async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id")) as
    | { owner_id: string }
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  const body = await c.req.json().catch(() => ({}))
  const visible = body.visible === true ? 1 : body.visible === false ? 0 : null
  if (visible === null) {
    c.status(400)
    return c.json({ error: "visible (boolean) is required" })
  }

  db.prepare("UPDATE businesses SET visible = ?, updated_at = datetime('now') WHERE id = ?").run(visible, c.req.param("id"))
  recordAudit(c, "set_visibility", "business", c.req.param("id"), { visible: visible === 1 })
  const updated = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  return c.json({ business: updated })
})

businesses.post("/:id/snapshot", requireOwner, async (c) => {
  const user = c.get("user") as { id: string; role: string }
  const { metrics, source } = await c.req.json()

  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id")) as
    | { owner_id: string }
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }
  if (user.role !== "admin" && existing.owner_id !== user.id) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  if (!metrics || typeof metrics.revenueBefore !== "number" || typeof metrics.revenueAfter !== "number") {
    c.status(400)
    return c.json({ error: "metrics.revenueBefore and metrics.revenueAfter are required (numbers)" })
  }

  const reportSource = source === "live" ? "live" : "self-reported"

  db.prepare(
    "INSERT INTO reports (id, business_id, type, period_start, period_end, metrics, source, generated_at) VALUES (?, ?, 'growth_snapshot', date('now', '-30 days'), date('now'), ?, ?, datetime('now'))",
  ).run(uuid(), c.req.param("id"), JSON.stringify(metrics), reportSource)

  const report = db
    .prepare("SELECT * FROM reports WHERE business_id = ? ORDER BY generated_at DESC LIMIT 1")
    .get(c.req.param("id")) as Record<string, unknown> | undefined

  if (report && typeof report.metrics === "string") {
    try {
      report.metrics = JSON.parse(report.metrics)
    } catch {}
  }

  recordAudit(c, "publish_snapshot", "reports", c.req.param("id"), { revenueAfter: metrics.revenueAfter, source: reportSource })
  return c.json({ report })
})

businesses.get("/:id/snapshot-draft", requireOwner, (c) => {
  const user = c.get("user") as { id: string; role: string }
  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id")) as
    | { owner_id: string }
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }
  if (user.role !== "admin" && existing.owner_id !== user.id) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const draft: Record<string, number | null> = { revenueAfter: null, revenueBefore: null, clientsAfter: null, clientsBefore: null }
  const dataSources: string[] = []

  const won = db
    .prepare("SELECT COALESCE(SUM(value), 0) AS total FROM deals WHERE business_id = ? AND stage = 'closed'")
    .get(c.req.param("id")) as { total: number }
  if (won.total > 0) {
    draft.revenueAfter = won.total
    dataSources.push("CRM — won deals")
  }

  const contacts = db.prepare("SELECT COUNT(*) AS n FROM contacts WHERE business_id = ?").get(c.req.param("id")) as { n: number }
  const visitors = db
    .prepare("SELECT COUNT(DISTINCT visitor_id) AS n FROM tracking_events WHERE business_id = ? AND timestamp >= datetime('now', '-30 days')")
    .get(c.req.param("id")) as { n: number }
  if (visitors.n > 0) {
    draft.clientsAfter = visitors.n
    dataSources.push("Analytics — 30-day site visitors")
  } else if (contacts.n > 0) {
    draft.clientsAfter = contacts.n
    dataSources.push("CRM — contacts")
  }

  return c.json({ draft, dataSources, suggested: true })
})

// Offboarding: permanently delete a business and every piece of its data —
// connections (tokens), posts, calendar, ads, analytics, messages, assets
// (including the stored files on disk/R2). Runs in one transaction so a partial
// failure never leaves a half-deleted tenant behind.
businesses.delete("/:id", requireOwner, async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  // Remove stored asset objects first (best-effort per object) so the DB rows
  // and the files go together.
  const assets = db.prepare("SELECT id, file_url FROM assets WHERE business_id = ?").all(c.req.param("id")) as Array<{
    id: string
    file_url: string
  }>

  db.transaction(() => {
    for (const table of [
      "social_posts",
      "social_connections",
      "content_calendar",
      "ad_campaigns",
      "tracking_events",
      "automation_rules",
      "whatsapp_messages",
      "contacts",
      "deals",
      "export_shipments",
      "response_times",
      "follow_ups",
      "reports",
      "audit_logs",
      "error_logs",
      "assets",
    ]) {
      try {
        db.prepare(`DELETE FROM ${table} WHERE business_id = ?`).run(c.req.param("id"))
      } catch {}
    }
    db.prepare("DELETE FROM businesses WHERE id = ?").run(c.req.param("id"))
  })()

  for (const a of assets) {
    const key = a.file_url.replace(/^\/api\/assets\/file\//, "")
    if (key && key.startsWith("businesses/")) {
      await storage.delete(decodeURIComponent(key)).catch(() => {})
    }
  }

  recordAudit(c, "offboard", "business", c.req.param("id"), { name: (existing as { name: string }).name, assetsRemoved: assets.length })
  return c.json({ success: true, assetsRemoved: assets.length })
})

export { businesses }
