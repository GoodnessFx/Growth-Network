import { Hono } from "hono"
import { recordEvent, getEvents, generateTrackingSnippet } from "../services/tracking.js"
import { evaluateTriggers } from "../services/automations.js"
import { authMiddleware, requireOwner } from "../middleware/auth.js"
import { randomBytes } from "crypto"

// Secret used by the tracking pixel to authenticate event ingestion. Prefer a
// fixed TRACKING_SECRET in production (stable across restarts). When unset we
// derive one at boot so the endpoint is never wide open.
const TRACKING_SECRET = process.env.TRACKING_SECRET || randomBytes(24).toString("hex")

if (!process.env.TRACKING_SECRET) {
  console.warn("[GN] WARNING: TRACKING_SECRET not set - using an ephemeral boot secret. Set TRACKING_SECRET in production.")
}

const tracking = new Hono()

// Public event ingestion, authenticated by the secret embedded in the pixel.
// This is the only tracking endpoint the embedded script may call.
tracking.post("/event", async (c) => {
  const secret = c.req.query("secret")
  if (!secret || secret !== TRACKING_SECRET) {
    c.status(401)
    return c.json({ error: "Invalid tracking secret" })
  }

  const payload = await c.req.json().catch(() => ({}))
  if (!payload.businessId || !payload.eventType || !payload.pageUrl) {
    c.status(400)
    return c.json({ error: "businessId, eventType, and pageUrl are required" })
  }
  if (!payload.sessionId || !payload.visitorId) {
    c.status(400)
    return c.json({ error: "sessionId and visitorId are required" })
  }

  payload.ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || undefined
  payload.userAgent = c.req.header("user-agent") || undefined

  const result = recordEvent(payload)

  try {
    evaluateTriggers(payload.businessId, "tracking_event", payload)
  } catch {}

  return c.json(result)
})

// Owner-only: raw event feed.
tracking.get("/events", authMiddleware, requireOwner, (c) => {
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

// Owner-only: the embeddable pixel includes the tracking secret, so it is not
// handed out to unauthenticated callers.
tracking.get("/snippet/:businessId", authMiddleware, requireOwner, (c) => {
  const { businessId } = c.req.param()
  const apiUrl = `${c.req.header("x-forwarded-proto") || "http"}://${c.req.header("host") || "localhost:3001"}`
  const snippet = generateTrackingSnippet(businessId, apiUrl, TRACKING_SECRET)
  return c.json({ snippet, businessId })
})

tracking.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

export { tracking }
