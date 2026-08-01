import { Hono } from "hono"
import { getDb } from "../db/index.js"

const publicApi = new Hono()

// Public read-only listing: only businesses the owner has marked visible.
publicApi.get("/", (c) => {
  const db = getDb()
  const rows = db
    .prepare("SELECT id, name, type, status, domain, created_at FROM businesses WHERE visible = 1 ORDER BY created_at DESC")
    .all()
  return c.json({ businesses: rows })
})

publicApi.get("/:businessId", (c) => {
  const { businessId } = c.req.param()
  const db = getDb()

  const business = db
    .prepare("SELECT id, name, type, status, domain, created_at, visible FROM businesses WHERE id = ?")
    .get(businessId) as Record<string, unknown> | undefined

  // Hidden businesses are indistinguishable from missing ones to the public:
  // no leak of existence, no report, no poster.
  if (!business || business.visible !== 1) {
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
