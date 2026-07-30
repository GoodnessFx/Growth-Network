import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { getClient } from "../services/social.js"
import { recordAudit } from "../middleware/audit.js"

const social = new Hono()

social.get("/accounts", (c) => {
  const available: string[] = []
  if (process.env.META_ACCESS_TOKEN) available.push("facebook", "instagram")
  if (process.env.TIKTOK_ACCESS_TOKEN) available.push("tiktok")
  if (process.env.X_BEARER_TOKEN) available.push("x")
  if (process.env.YOUTUBE_API_KEY) available.push("youtube")
  if (process.env.LINKEDIN_ACCESS_TOKEN) available.push("linkedin")
  return c.json({ accounts: available })
})

social.post("/publish", async (c) => {
  const { businessId, platform, content, mediaUrls, scheduledFor } = await c.req.json()

  if (!businessId || !platform || !content) {
    c.status(400)
    return c.json({ error: "businessId, platform, and content are required" })
  }

  const client = getClient(platform)
  if (!client) {
    c.status(400)
    return c.json({ error: `Platform "${platform}" not configured. Set the required env vars.` })
  }

  const db = getDb()
  const id = uuid()
  const status = scheduledFor ? "scheduled" : "published"

  db.prepare(
    "INSERT INTO social_posts (id, business_id, platform, content, media_urls, scheduled_for, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
  ).run(id, businessId, platform, content, JSON.stringify(mediaUrls || []), scheduledFor || null, status)

  if (!scheduledFor) {
    const result = await client.publish(content, mediaUrls || [])
    if (result.success) {
      db.prepare("UPDATE social_posts SET post_id = ?, published_at = datetime('now'), status = 'published' WHERE id = ?")
        .run(result.postId || null, id)
    } else {
      db.prepare("UPDATE social_posts SET status = 'failed' WHERE id = ?").run(id)
    }
    recordAudit(c, "publish_social", "social_posts", id, { platform, result: result.success ? "published" : "failed" })
    return c.json({ post: { id, platform, content, status: result.success ? "published" : "failed", postId: result.postId } })
  }

  recordAudit(c, "schedule_social", "social_posts", id, { platform, scheduledFor })
  return c.json({ post: { id, platform, content, status: "scheduled", scheduledFor } })
})

social.get("/posts", (c) => {
  const businessId = c.req.query("businessId")
  const platform = c.req.query("platform")
  const limit = parseInt(c.req.query("limit") || "50")

  const db = getDb()
  let sql = "SELECT * FROM social_posts"
  const params: unknown[] = []

  const conditions: string[] = []
  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (platform) {
    conditions.push("platform = ?")
    params.push(platform)
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  sql += " ORDER BY created_at DESC LIMIT ?"
  params.push(limit)

  return c.json({ posts: db.prepare(sql).all(...params) })
})

social.get("/metrics/:platform/:postId", async (c) => {
  const { platform, postId } = c.req.param()
  const client = getClient(platform)

  if (!client) {
    c.status(400)
    return c.json({ error: `Platform "${platform}" not configured` })
  }

  const metrics = await client.getMetrics(postId)
  return c.json({ metrics })
})

export { social }
