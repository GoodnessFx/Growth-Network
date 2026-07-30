import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { sendTextMessage, sendTemplateMessage, verifyWebhook, parseWebhookPayload } from "../services/whatsapp.js"
import { recordAudit } from "../middleware/audit.js"
import { evaluateTriggers } from "../services/automations.js"

const whatsapp = new Hono()

whatsapp.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode") || ""
  const token = c.req.query("hub.verify_token") || ""
  const challenge = c.req.query("hub.challenge") || ""

  const result = verifyWebhook(mode, token, challenge)
  if (result) {
    return c.text(result)
  }
  c.status(403)
  return c.text("Verification failed")
})

whatsapp.post("/webhook", async (c) => {
  const body = await c.req.json()
  const messages = parseWebhookPayload(body)

  const db = getDb()
  for (const msg of messages) {
    const id = uuid()
    db.prepare(
      "INSERT INTO whatsapp_messages (id, business_id, contact_phone, direction, message_type, content, status, created_at) VALUES (?, ?, ?, 'inbound', 'text', ?, 'received', datetime('now'))",
    ).run(id, "unknown", msg.from, msg.text)

    selectBusinessId(msg.from)
    evaluateTriggers(msg.from, "whatsapp_inbound", { from: msg.from, text: msg.text })
  }

  return c.json({ success: true })
})

whatsapp.post("/send", async (c) => {
  const { businessId, to, text, templateName, templateParams } = await c.req.json()

  if (!to || (!text && !templateName)) {
    c.status(400)
    return c.json({ error: "to and (text or templateName) are required" })
  }

  let result
  if (templateName) {
    result = await sendTemplateMessage(to, templateName, templateParams || [])
  } else {
    result = await sendTextMessage(to, text)
  }

  if (!result.success) {
    c.status(502)
    return c.json({ error: result.error || "Failed to send message" })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO whatsapp_messages (id, business_id, contact_id, contact_phone, direction, message_type, content, template_name, status, whatsapp_message_id, created_at) VALUES (?, ?, ?, ?, 'outbound', ?, ?, ?, 'sent', ?, datetime('now'))",
  ).run(
    id,
    businessId || null,
    null,
    to,
    templateName ? "template" : "text",
    text || "",
    templateName || null,
    result.messageId || null,
  )

  recordAudit(c, "send_whatsapp", "whatsapp_messages", id, { to, templateName })
  return c.json({ success: true, messageId: id, platformId: result.messageId })
})

whatsapp.get("/messages", (c) => {
  const businessId = c.req.query("businessId")
  const limit = parseInt(c.req.query("limit") || "50")
  const offset = parseInt(c.req.query("offset") || "0")

  const db = getDb()
  let sql = "SELECT * FROM whatsapp_messages"
  const params: unknown[] = []

  if (businessId) {
    sql += " WHERE business_id = ?"
    params.push(businessId)
  }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return c.json({ messages: db.prepare(sql).all(...params) })
})

function selectBusinessId(phone: string): string | null {
  const db = getDb()
  const contact = db
    .prepare("SELECT business_id FROM contacts WHERE phone = ? LIMIT 1")
    .get(phone) as { business_id: string } | undefined
  return contact?.business_id ?? null
}

export { whatsapp }
