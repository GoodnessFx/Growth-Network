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

export { audit }
