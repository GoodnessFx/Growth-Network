import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import { getClient } from "../services/social.js"
import { resolveCredentials } from "../services/connections.js"
import { contentHash, validateBody } from "../services/contentCalendar.js"
import { demoEnabled, demoPostId } from "../services/demo.js"
import { checkRateLimit, markRateLimited, rateLimitKey } from "../services/rateLimit.js"
import { recordError } from "../services/errorLog.js"

const reviewQueue = new Hono()

interface QueueRow {
  id: string
  business_id: string
  business_name: string
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  status: string
  publish_status: string
  published_at: string | null
  publish_error: string | null
  media_asset_id: string | null
  media_url: string | null
  content_hash: string
  created_at: string
}

interface CalendarRow {
  id: string
  business_id: string
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  status: string
  publish_status: string
  published_at: string | null
  publish_error: string | null
  media_asset_id: string | null
  content_hash: string
  created_at: string
}

function tenantBusinessIds(c: import("hono").Context): string[] | null {
  const user = c.get("user") as { role: string } | undefined
  if (user?.role === "admin") return null
  return (c.get("tenantIds") as string[] | null) ?? []
}

function canAccess(c: import("hono").Context, businessId: string): boolean {
  const ids = tenantBusinessIds(c)
  if (ids === null) return true
  return ids.includes(businessId)
}

const SELECT = `
  SELECT cc.id, cc.business_id, b.name AS business_name, cc.scheduled_date, cc.slot, cc.platform,
         cc.title, cc.body, cc.status, cc.publish_status, cc.published_at, cc.publish_error,
         cc.media_asset_id, a.file_url AS media_url, cc.content_hash, cc.created_at
  FROM content_calendar cc
  JOIN businesses b ON b.id = cc.business_id
  LEFT JOIN assets a ON a.id = cc.media_asset_id
`

// Review queue: calendar entries awaiting approval/publishing. Default shows
// drafts + approved-but-unpublished. Filters: businessId, platform, status.
reviewQueue.get("/", (c) => {
  const businessId = c.req.query("businessId")
  const platform = c.req.query("platform")
  const status = c.req.query("status")
  const limit = Math.min(parseInt(c.req.query("limit") || "100", 10) || 100, 500)

  if (businessId && !canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const conditions: string[] = []
  const params: unknown[] = []

  const ids = tenantBusinessIds(c)
  if (ids !== null) {
    conditions.push(`cc.business_id IN (${ids.map(() => "?").join(",")})`)
    params.push(...ids)
  }
  if (businessId) {
    conditions.push("cc.business_id = ?")
    params.push(businessId)
  }
  if (platform) {
    conditions.push("cc.platform = ?")
    params.push(platform)
  }
  if (status) {
    conditions.push("cc.status = ?")
    params.push(status)
  } else {
    conditions.push("cc.publish_status = 'pending'")
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  const rows = db
    .prepare(
      `${SELECT} ${where} ORDER BY CASE WHEN cc.scheduled_date < date('now') THEN 1 ELSE 0 END, cc.scheduled_date ASC, cc.slot ASC LIMIT ?`,
    )
    .all(...params, limit) as QueueRow[]

  const pendingCount = db
    .prepare(
      `SELECT COUNT(*) AS n FROM content_calendar cc ${ids !== null ? `WHERE cc.business_id IN (${ids.map(() => "?").join(",")}) AND ` : "WHERE "}cc.publish_status = 'pending'`,
    )
    .get(...(ids !== null ? ids : [])) as { n: number }

  return c.json({ entries: rows, pendingCount: pendingCount.n })
})

// Edit caption/body before posting. Re-validates (no fabricated details) and
// allows attaching an asset from the business's asset library.
reviewQueue.patch("/:id", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id")) as
    | CalendarRow
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Entry not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }
  if (existing.publish_status === "published") {
    c.status(400)
    return c.json({ error: "This entry was already published and can no longer be edited" })
  }

  const { title, body, mediaAssetId } = await c.req.json()

  if (body !== undefined && typeof body === "string") {
    const newTitle = title !== undefined && title !== null ? String(title) : existing.title
    const problems = validateBody(body, newTitle)
    if (problems.length > 0) {
      c.status(400)
      return c.json({ error: `Invalid content: ${problems.join("; ")}` })
    }
  }

  let assetId = existing.media_asset_id
  if (mediaAssetId !== undefined && mediaAssetId !== null && mediaAssetId !== "") {
    const asset = db.prepare("SELECT id FROM assets WHERE id = ? AND business_id = ?").get(mediaAssetId, existing.business_id)
    if (!asset) {
      c.status(400)
      return c.json({ error: "Asset not found in this business's library" })
    }
    assetId = mediaAssetId
  }

  const nextTitle = title !== undefined && title !== null ? String(title) : existing.title
  const nextBody = body !== undefined && typeof body === "string" ? body : existing.body
  const nextHash = contentHash(nextBody)

  db.prepare(
    "UPDATE content_calendar SET title = ?, body = ?, content_hash = ?, media_asset_id = ?, edited_at = datetime('now') WHERE id = ?",
  ).run(nextTitle, nextBody, nextHash, assetId, c.req.param("id"))

  recordAudit(c, "edit_calendar", "content_calendar", c.req.param("id"), { source: "review_queue" })
  const updated = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id"))
  return c.json({ entry: updated })
})

// Approve & post: publishes immediately through the platform's real API using
// the business's stored token. No confirmation modal — this is the one-click
// action. Result is written back to the card so failures never vanish.
reviewQueue.post("/:id/post", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM content_calendar WHERE id = ?").get(c.req.param("id")) as
    | CalendarRow
    | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Entry not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }
  if (existing.publish_status === "published") {
    c.status(400)
    return c.json({ error: "This entry was already published" })
  }
  if (existing.publish_status === "in_flight") {
    c.status(409)
    return c.json({ error: "This post is already being published" })
  }

  const { accessToken, fromConnection } = resolveCredentials(db, existing.business_id, existing.platform, process.env)
  const client = getClient(existing.platform, accessToken)

  // Per-business/per-platform rate-limit backstop before hitting the provider.
  const limitKey = rateLimitKey(existing.business_id, existing.platform)
  const limit = checkRateLimit(limitKey)
  if (!limit.ok) {
    const message = `Rate limit reached — try again in ${limit.retryAfterSeconds} seconds`
    db.prepare("UPDATE content_calendar SET publish_status = 'failed', publish_error = ? WHERE id = ?").run(message, existing.id)
    recordError({ businessId: existing.business_id, platform: existing.platform, operation: "review_queue.publish", message })
    c.status(429)
    return c.json({ success: false, status: "failed", publishError: message, retryAfterSeconds: limit.retryAfterSeconds })
  }

  // No real connection and no demo mode: fail loudly on the card.
  if (!client && !demoEnabled()) {
    const message = `Platform "${existing.platform}" is not connected for this business — add a connection first`
    db.prepare("UPDATE content_calendar SET publish_status = 'failed', publish_error = ? WHERE id = ?").run(message, existing.id)
    recordAudit(c, "publish_social", "content_calendar", existing.id, { platform: existing.platform, result: "failed", reason: "not_connected" })
    c.status(400)
    return c.json({ error: message, publishError: message })
  }

  const asset = existing.media_asset_id
    ? (db.prepare("SELECT file_url FROM assets WHERE id = ?").get(existing.media_asset_id) as { file_url: string } | undefined)
    : undefined
  const mediaUrls = asset?.file_url ? [asset.file_url] : []
  const content = existing.title ? `${existing.title}\n\n${existing.body}` : existing.body

  db.prepare("UPDATE content_calendar SET publish_status = 'in_flight' WHERE id = ?").run(existing.id)

  // Demo fallback (clearly labeled) only when no real connection exists.
  if (!client) {
    const postId = demoPostId(existing.platform)
    db.prepare(
      "UPDATE content_calendar SET publish_status = 'published', published_at = datetime('now'), publish_error = NULL, status = 'published' WHERE id = ?",
    ).run(existing.id)
    db.prepare(
      "INSERT INTO social_posts (id, business_id, platform, content, media_urls, status, post_id, published_at, created_at) VALUES (?, ?, ?, ?, ?, 'published', ?, datetime('now'), datetime('now'))",
    ).run(uuid(), existing.business_id, existing.platform, content, JSON.stringify(mediaUrls), postId)
    recordAudit(c, "publish_social", "content_calendar", existing.id, { platform: existing.platform, result: "published", demo: true })
    return c.json({ success: true, demo: true, status: "published", postId })
  }

  const result = await client.publish(content, mediaUrls)

  // Provider returned a rate limit — back off this platform for a while.
  if (/429|rate limit|too many requests/i.test(result.error || "")) {
    markRateLimited(limitKey)
  }

  // A live publish that fails falls back to demo ONLY if demo mode is on;
  // otherwise the card shows the real error.
  if (!result.success && demoEnabled()) {
    const postId = demoPostId(existing.platform)
    db.prepare(
      "UPDATE content_calendar SET publish_status = 'published', published_at = datetime('now'), publish_error = NULL, status = 'published' WHERE id = ?",
    ).run(existing.id)
    db.prepare(
      "INSERT INTO social_posts (id, business_id, platform, content, media_urls, status, post_id, published_at, created_at) VALUES (?, ?, ?, ?, ?, 'published', ?, datetime('now'), datetime('now'))",
    ).run(uuid(), existing.business_id, existing.platform, content, JSON.stringify(mediaUrls), postId)
    recordAudit(c, "publish_social", "content_calendar", existing.id, {
      platform: existing.platform,
      result: "published",
      demo: true,
      error: result.error,
    })
    return c.json({ success: true, demo: true, status: "published", postId })
  }

  if (result.success) {
    db.prepare(
      "UPDATE content_calendar SET publish_status = 'published', published_at = datetime('now'), publish_error = NULL, status = 'published' WHERE id = ?",
    ).run(existing.id)
    db.prepare(
      "INSERT INTO social_posts (id, business_id, platform, content, media_urls, status, post_id, published_at, created_at) VALUES (?, ?, ?, ?, ?, 'published', ?, datetime('now'), datetime('now'))",
    ).run(uuid(), existing.business_id, existing.platform, content, JSON.stringify(mediaUrls), result.postId || null)
    recordAudit(c, "publish_social", "content_calendar", existing.id, { platform: existing.platform, result: "published", fromConnection })
    return c.json({ success: true, status: "published", postId: result.postId })
  }

  const message = result.error || "Publish failed"
  db.prepare("UPDATE content_calendar SET publish_status = 'failed', publish_error = ?, status = 'draft' WHERE id = ?").run(
    message,
    existing.id,
  )
  recordError({
    businessId: existing.business_id,
    platform: existing.platform,
    operation: "review_queue.publish",
    message,
    details: { fromConnection, mediaCount: mediaUrls.length },
  })
  recordAudit(c, "publish_social", "content_calendar", existing.id, { platform: existing.platform, result: "failed", error: message })
  c.status(502)
  return c.json({ success: false, status: "failed", publishError: message })
})

export { reviewQueue }
