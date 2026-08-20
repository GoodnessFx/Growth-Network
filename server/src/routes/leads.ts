import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"

const leads = new Hono()

const LEAD_STATUSES = ["new", "contacted", "converted", "closed"]

interface LeadRow {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  message: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
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

// List leads (owner-only). Filters: businessId, status, search (name/email).
leads.get("/", (c) => {
  const businessId = c.req.query("businessId")
  const status = c.req.query("status")
  const search = c.req.query("search")

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
  if (status) {
    conditions.push("status = ?")
    params.push(status)
  }
  if (search) {
    conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)")
    const like = `%${search}%`
    params.push(like, like, like)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = db
    .prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC`)
    .all(...params) as LeadRow[]

  const summary = {
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    converted: rows.filter((r) => r.status === "converted").length,
    closed: rows.filter((r) => r.status === "closed").length,
    total: rows.length,
  }

  return c.json({ leads: rows, summary })
})

// Create a lead manually (owner-only).
leads.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { businessId, name, email, phone, source, message, status } = body as Record<string, unknown>

  if (!businessId || !name) {
    c.status(400)
    return c.json({ error: "businessId and name are required" })
  }
  if (!canAccess(c, String(businessId))) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const biz = db.prepare("SELECT id FROM businesses WHERE id = ?").get(businessId)
  if (!biz) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  const nextStatus = status && LEAD_STATUSES.includes(String(status)) ? String(status) : "new"
  const id = uuid()
  db.prepare(
    "INSERT INTO leads (id, business_id, name, email, phone, source, message, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, datetime('now'), datetime('now'))",
  ).run(
    id,
    businessId,
    String(name),
    email ? String(email) : null,
    phone ? String(phone) : null,
    source ? String(source) : null,
    message ? String(message) : null,
    nextStatus,
  )

  recordAudit(c, "create_lead", "leads", id, { businessId, name, status: nextStatus })
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id)
  return c.json({ lead })
})

// Update a lead — status is the common move (new → contacted → converted).
leads.patch("/:id", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM leads WHERE id = ?").get(c.req.param("id")) as LeadRow | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Lead not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  const status = body.status !== undefined ? String(body.status) : undefined
  if (status !== undefined && !LEAD_STATUSES.includes(status)) {
    c.status(400)
    return c.json({ error: `status must be one of: ${LEAD_STATUSES.join(", ")}` })
  }

  db.prepare(
    "UPDATE leads SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), source = COALESCE(?, source), message = COALESCE(?, message), status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?",
  ).run(
    body.name ? String(body.name) : null,
    body.email !== undefined ? (body.email ? String(body.email) : null) : null,
    body.phone !== undefined ? (body.phone ? String(body.phone) : null) : null,
    body.source !== undefined ? (body.source ? String(body.source) : null) : null,
    body.message !== undefined ? (body.message ? String(body.message) : null) : null,
    status ?? null,
    body.notes !== undefined ? (body.notes ? String(body.notes) : null) : null,
    c.req.param("id"),
  )

  recordAudit(c, "update_lead", "leads", c.req.param("id"), { status: status ?? undefined })
  const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(c.req.param("id"))
  return c.json({ lead: updated })
})

leads.delete("/:id", (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM leads WHERE id = ?").get(c.req.param("id")) as LeadRow | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Lead not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  db.prepare("DELETE FROM leads WHERE id = ?").run(c.req.param("id"))
  recordAudit(c, "delete_lead", "leads", c.req.param("id"))
  return c.json({ success: true })
})

export { leads }
