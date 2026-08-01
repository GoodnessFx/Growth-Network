import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { fetchMetaAdCampaigns, fetchGoogleAdsCampaigns, fetchTikTokAdCampaigns } from "../services/ads.js"
import { resolveCredentials } from "../services/connections.js"
import { recordAudit } from "../middleware/audit.js"

const ads = new Hono()

ads.get("/campaigns/:platform", async (c) => {
  const { platform } = c.req.param()
  const businessId = c.req.query("businessId")
  const sync = c.req.query("sync") === "true"

  if (sync && platform === "meta") {
    const { accessToken, accountId } = resolveCredentials(getDb(), businessId || undefined, "meta", process.env)
    if (!accessToken || !accountId) {
      c.status(400)
      return c.json({ error: "No Meta Ads account connected for this business. Add a connection first." })
    }
    const campaigns = await fetchMetaAdCampaigns(accountId, accessToken)
    const db = getDb()
    for (const camp of campaigns) {
      const existing = db.prepare("SELECT id FROM ad_campaigns WHERE platform_id = ?").get(camp.id)
      if (!existing) {
        db.prepare(
          "INSERT INTO ad_campaigns (id, business_id, platform, name, status, budget, spent, impressions, clicks, conversions, platform_id, start_date, created_at) VALUES (?, ?, 'meta', ?, ?, 0, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
        ).run(
          uuid(),
          businessId || "unknown",
          camp.name,
          camp.status,
          camp.metrics.spent,
          camp.metrics.impressions,
          camp.metrics.clicks,
          camp.metrics.conversions,
          camp.id,
          new Date().toISOString(),
        )
      }
    }
    recordAudit(c, "sync_ads", "ad_campaigns", undefined, { platform, count: campaigns.length })
    return c.json({ campaigns, synced: campaigns.length })
  }

  if (sync && platform === "google") {
    const { accessToken, accountId, refreshToken } = resolveCredentials(getDb(), businessId || undefined, "google", process.env)
    if (!accessToken || !accountId || !refreshToken) {
      c.status(400)
      return c.json({ error: "No Google Ads account connected for this business. Add a connection first." })
    }
    const campaigns = await fetchGoogleAdsCampaigns(
      accountId,
      refreshToken,
      accessToken,
    )
    return c.json({ campaigns, synced: campaigns.length })
  }

  if (sync && platform === "tiktok") {
    const { accessToken, accountId } = resolveCredentials(getDb(), businessId || undefined, "tiktok", process.env)
    if (!accessToken || !accountId) {
      c.status(400)
      return c.json({ error: "No TikTok Ads account connected for this business. Add a connection first." })
    }
    const campaigns = await fetchTikTokAdCampaigns(
      accountId,
      accessToken,
    )
    return c.json({ campaigns, synced: campaigns.length })
  }

  const db = getDb()
  let sql = "SELECT * FROM ad_campaigns WHERE platform = ?"
  const params: unknown[] = [platform]

  if (businessId) {
    sql += " AND business_id = ?"
    params.push(businessId)
  }

  sql += " ORDER BY created_at DESC"
  return c.json({ campaigns: db.prepare(sql).all(...params) })
})

ads.post("/campaigns", async (c) => {
  const { businessId, platform, name, budget, startDate, endDate } = await c.req.json()

  if (!businessId || !platform || !name) {
    c.status(400)
    return c.json({ error: "businessId, platform, and name are required" })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO ad_campaigns (id, business_id, platform, name, status, budget, start_date, end_date, created_at) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, datetime('now'))",
  ).run(id, businessId, platform, name, budget || 0, startDate || new Date().toISOString(), endDate || null)

  recordAudit(c, "create_campaign", "ad_campaigns", id, { platform, name, budget })
  return c.json({ campaign: { id, businessId, platform, name, status: "active", budget, startDate, endDate } })
})

export { ads }
