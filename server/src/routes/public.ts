import { Hono } from "hono"
import { getDb } from "../db/index.js"

const publicApi = new Hono()

publicApi.get("/:businessId", (c) => {
  const { businessId } = c.req.param()
  const db = getDb()

  const business = db
    .prepare("SELECT id, name, type, status, domain, created_at FROM businesses WHERE id = ?")
    .get(businessId) as Record<string, unknown> | undefined

  if (!business) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  const report = db
    .prepare("SELECT * FROM reports WHERE business_id = ? ORDER BY generated_at DESC LIMIT 1")
    .get(businessId) as Record<string, unknown> | undefined

  if (report && typeof report.metrics === "string") {
    try {
      report.metrics = JSON.parse(report.metrics)
    } catch {}
  }

  return c.json({ business, report: report || null })
})

export { publicApi }
