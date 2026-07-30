import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"

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
  const db = getDb()
  const row = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  if (!row) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  c.set("currentBusinessId", c.req.param("id"))
  recordAudit(c, "read", "business", c.req.param("id"))
  return c.json({ business: row })
})

businesses.post("/", async (c) => {
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

businesses.put("/:id", async (c) => {
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

businesses.delete("/:id", (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM businesses WHERE id = ?").get(c.req.param("id"))
  if (!existing) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  db.prepare("DELETE FROM businesses WHERE id = ?").run(c.req.param("id"))
  recordAudit(c, "delete", "business", c.req.param("id"))
  return c.json({ success: true })
})

export { businesses }
