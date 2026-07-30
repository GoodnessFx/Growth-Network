import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import { evaluateTriggers } from "../services/automations.js"

const automations = new Hono()

automations.get("/rules", (c) => {
  const businessId = c.req.query("businessId")
  const enabled = c.req.query("enabled")

  const db = getDb()
  let sql = "SELECT * FROM automation_rules"
  const params: unknown[] = []
  const conditions: string[] = []

  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (enabled !== undefined) {
    conditions.push("enabled = ?")
    params.push(enabled === "true" ? 1 : 0)
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  sql += " ORDER BY created_at DESC"
  return c.json({ rules: db.prepare(sql).all(...params) })
})

automations.post("/rules", async (c) => {
  const { businessId, name, trigger, action } = await c.req.json()

  if (!businessId || !name || !trigger?.type || !action?.type) {
    c.status(400)
    return c.json({ error: "businessId, name, trigger.type, and action.type are required" })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO automation_rules (id, business_id, name, trigger_type, trigger_config, action_type, action_config, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))",
  ).run(id, businessId, name, trigger.type, JSON.stringify(trigger.config || {}), action.type, JSON.stringify(action.config || {}))

  recordAudit(c, "create_automation", "automation_rules", id, { name, triggerType: trigger.type, actionType: action.type })
  return c.json({ rule: { id, businessId, name, trigger, action, enabled: true } })
})

automations.put("/rules/:id", async (c) => {
  const { id } = c.req.param()
  const { name, trigger, action, enabled } = await c.req.json()

  const db = getDb()
  const existing = db.prepare("SELECT * FROM automation_rules WHERE id = ?").get(id)
  if (!existing) {
    c.status(404)
    return c.json({ error: "Rule not found" })
  }

  db.prepare(
    "UPDATE automation_rules SET name = COALESCE(?, name), trigger_type = COALESCE(?, trigger_type), trigger_config = COALESCE(?, trigger_config), action_type = COALESCE(?, action_type), action_config = COALESCE(?, action_config), enabled = COALESCE(?, enabled) WHERE id = ?",
  ).run(
    name || null,
    trigger?.type || null,
    trigger?.config ? JSON.stringify(trigger.config) : null,
    action?.type || null,
    action?.config ? JSON.stringify(action.config) : null,
    enabled !== undefined ? (enabled ? 1 : 0) : null,
    id,
  )

  recordAudit(c, "update_automation", "automation_rules", id, { name, enabled })
  return c.json({ success: true })
})

automations.delete("/rules/:id", (c) => {
  const { id } = c.req.param()
  const db = getDb()
  db.prepare("DELETE FROM automation_rules WHERE id = ?").run(id)
  recordAudit(c, "delete_automation", "automation_rules", id)
  return c.json({ success: true })
})

automations.post("/test/:ruleId", (c) => {
  const { ruleId } = c.req.param()
  const db = getDb()
  const rule = db.prepare("SELECT * FROM automation_rules WHERE id = ?").get(ruleId) as Record<string, unknown> | undefined

  if (!rule) {
    c.status(404)
    return c.json({ error: "Rule not found" })
  }

  evaluateTriggers(
    rule.business_id as string,
    rule.trigger_type as string,
    JSON.parse(rule.trigger_config as string),
  )

  recordAudit(c, "test_automation", "automation_rules", ruleId)
  return c.json({ success: true, message: "Trigger evaluated" })
})

export { automations }
