import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { sendTextMessage } from "./whatsapp.js"

export function evaluateTriggers(businessId: string, triggerType: string, context: Record<string, unknown>): void {
  const db = getDb()
  const rules = db
    .prepare("SELECT * FROM automation_rules WHERE business_id = ? AND trigger_type = ? AND enabled = 1")
    .all(businessId, triggerType) as Array<Record<string, unknown>>

  for (const rule of rules) {
    const actionType = rule.action_type as string
    const actionConfig = JSON.parse(rule.action_config as string)
    executeAction(businessId, actionType, actionConfig, context)
  }
}

function executeAction(
  businessId: string,
  actionType: string,
  config: Record<string, unknown>,
  context: Record<string, unknown>,
): void {
  switch (actionType) {
    case "send_whatsapp": {
      const to = (config.to || context.contactPhone || context.from) as string
      const message = interpolate(config.message as string, context)
      if (to) sendTextMessage(to, message)
      break
    }
    case "update_deal_stage": {
      const db = getDb()
      const dealId = (config.dealId || context.dealId) as string | undefined
      if (dealId && config.stage) {
        db.prepare("UPDATE deals SET stage = ?, updated_at = datetime('now') WHERE id = ?")
          .run(config.stage, dealId)
      }
      break
    }
    case "create_lead": {
      const db = getDb()
      const contactId = uuid()
      db.prepare(
        "INSERT INTO contacts (id, business_id, name, phone, source, tags, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      ).run(
        contactId,
        businessId,
        (config.name || context.name || "New Lead") as string,
        (config.phone || context.from || context.contactPhone || "") as string,
        "automation",
        JSON.stringify(config.tags || []),
        JSON.stringify(context),
      )
      break
    }
    case "webhook_call": {
      const url = config.url as string
      if (url) {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId, context }),
        }).catch(() => {})
      }
      break
    }
  }
}

function interpolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key]
    return val != null ? String(val) : `{{${key}}}`
  })
}

export interface ScheduledTask {
  id: string
  businessId: string
  ruleId: string
  scheduledFor: string
  actionType: string
  actionConfig: Record<string, unknown>
  completed: boolean
}

export function processScheduledAutomations(): void {
  const db = getDb()
  const now = new Date().toISOString().replace("T", " ").slice(0, 19)

  const pending = db
    .prepare("SELECT * FROM automation_rules WHERE trigger_type = 'scheduled_time' AND enabled = 1")
    .all() as Array<Record<string, unknown>>

  for (const rule of pending) {
    const config = JSON.parse(rule.trigger_config as string)
    const cronExpression = config.cron as string | undefined

    if (cronExpression && matchesCron(cronExpression, now)) {
      executeAction(
        rule.business_id as string,
        rule.action_type as string,
        JSON.parse(rule.action_config as string),
        { triggered_at: now },
      )
    }
  }
}

function matchesCron(_expression: string, _datetime: string): boolean {
  return true
}
