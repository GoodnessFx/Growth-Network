import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { getClient } from "../services/social.js"
import {
  getConnections,
  getConnection,
  getConnectionById,
  upsertConnection,
  deleteConnection,
  resolveCredentials,
} from "../services/connections.js"
import { recordAudit } from "../middleware/audit.js"

const social = new Hono()

const PLATFORMS = ["facebook", "instagram", "tiktok", "x", "youtube", "linkedin", "whatsapp", "meta", "google"]

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

// ─── Connections ──────────────────────────────────────────────────────────────

social.get("/connections", (c) => {
  const businessId = c.req.query("businessId")
  const db = getDb()
  const ids = tenantBusinessIds(c)

  if (ids === null) {
    const rows = businessId
      ? db.prepare("SELECT * FROM social_connections WHERE business_id = ? ORDER BY platform").all(businessId)
      : db.prepare("SELECT * FROM social_connections ORDER BY platform").all()
    return c.json({ connections: rows })
  }

  const rows = getConnections(db, ids)
  const filtered = businessId ? rows.filter((r) => r.business_id === businessId) : rows
  return c.json({ connections: filtered })
})

social.post("/connections", async (c) => {
  const { businessId, platform, accessToken, refreshToken, accountId } = await c.req.json()

  if (!businessId || !platform) {
    c.status(400)
    return c.json({ error: "businessId and platform are required" })
  }
  if (!PLATFORMS.includes(platform)) {
    c.status(400)
    return c.json({ error: `Unknown platform "${platform}". Supported: ${PLATFORMS.join(", ")}` })
  }
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const conn = upsertConnection(db, { businessId, platform, accessToken, refreshToken, accountId })
  recordAudit(c, "connect", "social_connections", conn.id, { platform, businessId })
  return c.json({ connection: conn })
})

social.delete("/connections/:id", (c) => {
  const db = getDb()
  const existing = getConnectionById(db, c.req.param("id"))
  if (!existing) {
    c.status(404)
    return c.json({ error: "Connection not found" })
  }
  if (!isOwned(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  deleteConnection(db, existing.id)
  recordAudit(c, "disconnect", "social_connections", existing.id, { platform: existing.platform })
  return c.json({ success: true })
})

social.post("/connections/:id/verify", async (c) => {
  const db = getDb()
  const existing = getConnectionById(db, c.req.param("id"))
  if (!existing) {
    c.status(404)
    return c.json({ error: "Connection not found" })
  }
  if (!isOwned(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const client = getClient(existing.platform, existing.access_token)
  if (!client) {
    return c.json({ ok: false, detail: `No token stored for ${existing.platform} — reconnect this account` })
  }

  // Best-effort connectivity probe. Without live platform credentials this
  // will report a provider error, which is expected until real OAuth tokens
  // are attached.
  const result = await client.publish("__growthnet_connectivity_probe__", [])
  return c.json({ ok: result.success, detail: result.error || `Connected as ${existing.account_id || existing.platform}` })
})

// ─── Publishing ───────────────────────────────────────────────────────────────

social.post("/publish", async (c) => {
  const { businessId, platform, content, mediaUrls, scheduledFor } = await c.req.json()

  if (!businessId || !platform || !content) {
    c.status(400)
    return c.json({ error: "businessId, platform, and content are required" })
  }
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const { accessToken } = resolveCredentials(db, businessId, platform, process.env)
  const client = getClient(platform, accessToken)
  if (!client) {
    c.status(400)
    return c.json({
      error: `Platform "${platform}" is not connected for this business. Add a connection first.`,
    })
  }

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
  const db = getDb()

  // Look up the owning business from the post, then resolve that business's token.
  const post = db.prepare("SELECT business_id FROM social_posts WHERE id = ?").get(postId) as
    | { business_id: string }
    | undefined
  const { accessToken } = resolveCredentials(db, post?.business_id, platform, process.env)
  const client = getClient(platform, accessToken)

  if (!client) {
    c.status(400)
    return c.json({ error: `Platform "${platform}" is not connected` })
  }

  const metrics = await client.getMetrics(postId)
  return c.json({ metrics })
})

export { social }
