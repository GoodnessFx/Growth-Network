import { Hono } from "hono"
import { getDb } from "../db/index.js"

const audit = new Hono()

audit.get("/logs", (c) => {
  const businessId = c.req.query("businessId")
  const action = c.req.query("action")
  const limit = parseInt(c.req.query("limit") || "100")
  const offset = parseInt(c.req.query("offset") || "0")

  const db = getDb()
  let sql = "SELECT * FROM audit_logs"
  const params: unknown[] = []
  const conditions: string[] = []

  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (action) {
    conditions.push("action = ?")
    params.push(action)
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return c.json({ logs: db.prepare(sql).all(...params), total: db.prepare("SELECT COUNT(*) as count FROM audit_logs").get() })
})

audit.get("/stats", (c) => {
  const businessId = c.req.query("businessId")

  const db = getDb()
  let sql = "SELECT action, COUNT(*) as count FROM audit_logs"
  const params: unknown[] = []

  if (businessId) {
    sql += " WHERE business_id = ?"
    params.push(businessId)
  }

  sql += " GROUP BY action ORDER BY count DESC"

  return c.json({ stats: db.prepare(sql).all(...params) })
})

// Error log reader (monitoring dashboard). Reads the durable error_logs table
// written by the error logger during failed operations (publishes, webhooks).
audit.get("/errors", (c) => {
  const businessId = c.req.query("businessId")
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10) || 50, 200)

  const db = getDb()
  const conditions: string[] = []
  const params: unknown[] = []
  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = db
    .prepare(`SELECT * FROM error_logs ${where} ORDER BY created_at DESC LIMIT ?`)
    .all(...params, limit) as Array<{
    id: string
    business_id: string | null
    platform: string | null
    operation: string
    message: string
    details: string
    created_at: string
  }>
  const total = db.prepare("SELECT COUNT(*) AS n FROM error_logs").get() as { n: number }
  return c.json({ errors: rows, total: total.n })
})

export { audit }
