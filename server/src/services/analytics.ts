import { getDb } from "../db/index.js"
import { recordEvent } from "./tracking.js"
import { v4 as uuid } from "uuid"

interface Row {
  [key: string]: unknown
}

function countDistinct(db: ReturnType<typeof getDb>, businessId: string, column: string, since: string): number {
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT ${column}) AS n FROM tracking_events WHERE business_id = ? AND timestamp >= ${since}`,
    )
    .get(businessId) as Row
  return (row.n as number) || 0
}

function countEvents(db: ReturnType<typeof getDb>, businessId: string, condition: string, params: unknown[] = []): number {
  const row = db
    .prepare(`SELECT COUNT(*) AS n FROM tracking_events WHERE business_id = ? AND ${condition}`)
    .get(businessId, ...params) as Row
  return (row.n as number) || 0
}

export function getAnalyticsOverview(
  businessId: string,
  options: { recentLimit?: number } = {},
): Record<string, unknown> {
  const db = getDb()

  const live = countDistinct(db, businessId, "visitor_id", "datetime('now', '-5 minutes')")
  const todayPageviews = countEvents(db, businessId, "event_type = 'pageview' AND timestamp >= date('now')")
  const todayVisitors = countDistinct(db, businessId, "visitor_id", "date('now')")
  const sessions = countDistinct(db, businessId, "session_id", "datetime('now', '-30 days')")
  const clicks = countEvents(db, businessId, "event_type IN ('click','button_click') AND timestamp >= date('now')")
  const formSubmits = countEvents(db, businessId, "event_type = 'form_submit' AND timestamp >= date('now')")
  const lastHourEvents = countEvents(db, businessId, "timestamp >= datetime('now', '-1 hour')")

  const conversionRate = sessions > 0 ? Number((((formSubmits + clicks) / sessions) * 100).toFixed(1)) : 0

  const hourlyTrend = db
    .prepare(
      `SELECT strftime('%Y-%m-%d %H:00', timestamp) AS hour,
              COUNT(*) AS events,
              COUNT(DISTINCT visitor_id) AS visitors
       FROM tracking_events
       WHERE business_id = ? AND timestamp >= datetime('now', '-24 hours')
       GROUP BY hour ORDER BY hour ASC`,
    )
    .all(businessId) as Row[]

  const topPages = db
    .prepare(
      `SELECT page_url AS page, COUNT(*) AS count
       FROM tracking_events
       WHERE business_id = ? AND event_type = 'pageview'
       GROUP BY page_url ORDER BY count DESC LIMIT 8`,
    )
    .all(businessId) as Row[]

  const referrers = db
    .prepare(
      `SELECT COALESCE(NULLIF(referrer, ''), '(direct)') AS referrer, COUNT(*) AS count
       FROM tracking_events
       WHERE business_id = ?
       GROUP BY referrer ORDER BY count DESC LIMIT 8`,
    )
    .all(businessId) as Row[]

  const recentRows = db
    .prepare("SELECT * FROM tracking_events WHERE business_id = ? ORDER BY timestamp DESC LIMIT ?")
    .all(businessId, options.recentLimit || 30) as Row[]

  const devices: Record<string, number> = {}
  for (const row of recentRows) {
    const ua = (row.user_agent as string) || ""
    let bucket = "desktop"
    if (/iPhone|Android|Mobile|BlackBerry|Windows Phone/i.test(ua)) bucket = "mobile"
    else if (/iPad|Tablet/i.test(ua)) bucket = "tablet"
    devices[bucket] = (devices[bucket] || 0) + 1
  }
  const deviceList = Object.entries(devices)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count)

  return {
    overview: {
      live,
      todayPageviews,
      todayVisitors,
      sessions,
      clicks,
      formSubmits,
      conversionRate,
      lastHourEvents,
    },
    hourlyTrend,
    topPages,
    referrers,
    devices: deviceList,
    recent: recentRows.map((r) => ({
      id: r.id,
      eventType: r.event_type,
      pageUrl: r.page_url,
      timestamp: r.timestamp,
    })),
    generatedAt: new Date().toISOString(),
  }
}

const SAMPLE_PAGES = [
  "/",
  "/pricing",
  "/about",
  "/products",
  "/products/colab-kit",
  "/blog/top-10-2026",
  "/blog/whatsapp-cta",
  "/contact",
  "/careers",
  "/docs",
]

const SAMPLE_REFERRERS = ["", "", "", "https://google.com", "https://instagram.com", "https://facebook.com", "https://x.com", "https://linkedin.com"]

const SAMPLE_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]

/**
 * Demo traffic generator — posts plausible tracking events through the same
 * ingestion path used by the browser pixel. Lets the real-time dashboard show
 * live movement without a connected website.
 */
export function simulateTraffic(businessId: string, count: number): { events: number; visitors: number } {
  const visitors = Math.max(1, Math.ceil(count / 4))
  const eventsPerVisitor = Math.max(1, Math.round(count / visitors))
  let inserted = 0

  for (let v = 0; v < visitors; v++) {
    const visitorId = `vis_sim_${uuid().slice(0, 8)}`
    const sessionId = `sess_sim_${uuid().slice(0, 8)}`
    const agent = SAMPLE_AGENTS[Math.floor(Math.random() * SAMPLE_AGENTS.length)]

    for (let e = 0; e < eventsPerVisitor; e++) {
      const roll = Math.random()
      let eventType = "pageview"
      if (roll > 0.92) eventType = "form_submit"
      else if (roll > 0.8) eventType = "button_click"
      else if (roll > 0.65) eventType = "click"

      const page = SAMPLE_PAGES[Math.floor(Math.random() * SAMPLE_PAGES.length)]
      const referrer = SAMPLE_REFERRERS[Math.floor(Math.random() * SAMPLE_REFERRERS.length)]

      recordEvent({
        businessId,
        sessionId,
        visitorId,
        eventType,
        pageUrl: page,
        referrer,
        metadata: { simulated: true },
        userAgent: agent,
      })
      inserted++
    }
  }

  return { events: inserted, visitors }
}
