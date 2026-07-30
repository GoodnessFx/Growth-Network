import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { fetchMetaAdCampaigns, fetchGoogleAdsCampaigns, fetchTikTokAdCampaigns } from "../services/ads.js"
import { recordAudit } from "../middleware/audit.js"

const ads = new Hono()

ads.get("/campaigns/:platform", async (c) => {
  const { platform } = c.req.param()
  const businessId = c.req.query("businessId")
  const sync = c.req.query("sync") === "true"

  if (sync && platform === "meta") {
    if (!process.env.META_AD_ACCOUNT_ID || !process.env.META_ACCESS_TOKEN) {
      c.status(400)
      return c.json({ error: "META_AD_ACCOUNT_ID and META_ACCESS_TOKEN must be set in .env" })
    }
    const campaigns = await fetchMetaAdCampaigns(process.env.META_AD_ACCOUNT_ID, process.env.META_ACCESS_TOKEN)
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
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      c.status(400)
      return c.json({ error: "GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_REFRESH_TOKEN must be set" })
    }
    const campaigns = await fetchGoogleAdsCampaigns(
      process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || "",
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      process.env.GOOGLE_ADS_REFRESH_TOKEN,
    )
    return c.json({ campaigns, synced: campaigns.length })
  }

  if (sync && platform === "tiktok") {
    if (!process.env.TIKTOK_ACCESS_TOKEN || !process.env.TIKTOK_ADVERTISER_ID) {
      c.status(400)
      return c.json({ error: "TIKTOK_ACCESS_TOKEN and TIKTOK_ADVERTISER_ID must be set" })
    }
    const campaigns = await fetchTikTokAdCampaigns(
      process.env.TIKTOK_ADVERTISER_ID,
      process.env.TIKTOK_ACCESS_TOKEN,
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
