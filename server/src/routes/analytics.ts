import { Hono } from "hono"
import { getAnalyticsOverview, simulateTraffic } from "../services/analytics.js"
import { recordAudit } from "../middleware/audit.js"

const analytics = new Hono()

function tenantBusinessIds(c: import("hono").Context): string[] | null {
  const user = c.get("user") as { role: string } | undefined
  if (user?.role === "admin") return null
  return (c.get("tenantIds") as string[] | null) ?? []
}

function isOwned(c: import("hono").Context, businessId: string): boolean {
  const ids = tenantBusinessIds(c)
  if (ids === null) return true
  return ids.includes(businessId)
}

analytics.get("/overview", (c) => {
  const businessId = c.req.query("businessId")
  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const recentLimit = parseInt(c.req.query("recentLimit") || "30")
  return c.json(getAnalyticsOverview(businessId, { recentLimit }))
})

analytics.post("/simulate", async (c) => {
  const { businessId, count } = (await c.req.json().catch(() => ({}))) as { businessId?: string; count?: number }

  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const events = Math.min(500, Math.max(1, count || 25))
  const result = simulateTraffic(businessId, events)
  recordAudit(c, "simulate_traffic", "tracking_events", undefined, { events: result.events, visitors: result.visitors })
  return c.json({ ...result, simulated: true })
})

export { analytics }
