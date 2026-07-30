import { Hono } from "hono"
import { recordEvent, getEvents, generateTrackingSnippet } from "../services/tracking.js"
import { evaluateTriggers } from "../services/automations.js"

const tracking = new Hono()

tracking.post("/event", async (c) => {
  const payload = await c.req.json()

  if (!payload.businessId || !payload.eventType || !payload.pageUrl) {
    c.status(400)
    return c.json({ error: "businessId, eventType, and pageUrl are required" })
  }

  payload.ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || undefined
  payload.userAgent = c.req.header("user-agent") || undefined

  const result = recordEvent(payload)

  try {
    evaluateTriggers(payload.businessId, "tracking_event", payload)
  } catch {}

  return c.json(result)
})

tracking.get("/events", (c) => {
  const businessId = c.req.query("businessId")
  const eventType = c.req.query("eventType") || undefined

  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }

  const events = getEvents(businessId, {
    limit: parseInt(c.req.query("limit") || "100"),
    offset: parseInt(c.req.query("offset") || "0"),
    eventType,
  })

  return c.json({ events })
})

tracking.get("/snippet/:businessId", (c) => {
  const { businessId } = c.req.param()
  const apiUrl = `${c.req.header("x-forwarded-proto") || "http"}://${c.req.header("host") || "localhost:3001"}`
  const snippet = generateTrackingSnippet(businessId, apiUrl)
  return c.json({ snippet, businessId })
})

tracking.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

export { tracking }
