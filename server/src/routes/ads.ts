import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import {
  fetchMetaAdCampaigns,
  fetchGoogleAdsCampaigns,
  fetchTikTokAdCampaigns,
  fetchLinkedInAdCampaigns,
  fetchSnapchatAdCampaigns,
} from "../services/ads.js"
import { resolveCredentials } from "../services/connections.js"
import { recordAudit } from "../middleware/audit.js"

const ads = new Hono()

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

ads.get("/campaigns/:platform", async (c) => {
  const { platform } = c.req.param()
  const businessId = c.req.query("businessId")
  const sync = c.req.query("sync") === "true"

  if (sync) {
    if (!businessId) {
      c.status(400)
      return c.json({ error: "businessId is required for a live sync" })
    }
    if (!isOwned(c, businessId)) {
      c.status(403)
      return c.json({ error: "You do not have access to this business" })
    }

    const db = getDb()
    const conn = { meta: "meta", google: "google", tiktok: "tiktok", linkedin: "linkedin", snapchat: "snapchat" } as const

    if (platform === conn.meta) {
      const { accessToken, accountId } = resolveCredentials(db, businessId, "meta", process.env)
      if (!accessToken || !accountId) {
        c.status(400)
        return c.json({ error: "No Meta Ads account connected for this business. Add a connection first." })
      }
      const campaigns = await fetchMetaAdCampaigns(accountId, accessToken)
      for (const camp of campaigns) {
        const existing = db.prepare("SELECT id FROM ad_campaigns WHERE platform_id = ?").get(camp.id)
        if (!existing) {
          db.prepare(
            "INSERT INTO ad_campaigns (id, business_id, platform, name, status, budget, spent, impressions, clicks, conversions, platform_id, start_date, created_at) VALUES (?, ?, 'meta', ?, ?, 0, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
          ).run(
            uuid(),
            businessId,
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

    if (platform === conn.google) {
      const { accessToken, accountId, refreshToken } = resolveCredentials(db, businessId, "google", process.env)
      if (!accessToken || !accountId || !refreshToken) {
        c.status(400)
        return c.json({ error: "No Google Ads account connected for this business. Add a connection first." })
      }
      const campaigns = await fetchGoogleAdsCampaigns(accountId, refreshToken, accessToken)
      return c.json({ campaigns, synced: campaigns.length })
    }

    if (platform === conn.tiktok) {
      const { accessToken, accountId } = resolveCredentials(db, businessId, "tiktok", process.env)
      if (!accessToken || !accountId) {
        c.status(400)
        return c.json({ error: "No TikTok Ads account connected for this business. Add a connection first." })
      }
      const campaigns = await fetchTikTokAdCampaigns(accountId, accessToken)
      return c.json({ campaigns, synced: campaigns.length })
    }

    if (platform === conn.linkedin) {
      const { accessToken } = resolveCredentials(db, businessId, "linkedin", process.env)
      if (!accessToken) {
        c.status(400)
        return c.json({ error: "No LinkedIn Ads account connected for this business. Add a connection first." })
      }
      const campaigns = await fetchLinkedInAdCampaigns(accessToken)
      return c.json({ campaigns, synced: campaigns.length })
    }

    if (platform === conn.snapchat) {
      const { accessToken, accountId } = resolveCredentials(db, businessId, "snapchat", process.env)
      if (!accessToken || !accountId) {
        c.status(400)
        return c.json({ error: "No Snapchat Ads account connected for this business. Add a connection first." })
      }
      const campaigns = await fetchSnapchatAdCampaigns(accountId, accessToken)
      return c.json({ campaigns, synced: campaigns.length })
    }

    c.status(400)
    return c.json({ error: `No live sync for ads platform "${platform}"` })
  }

  const db = getDb()
  let sql = "SELECT * FROM ad_campaigns WHERE platform = ?"
  const params: unknown[] = [platform]

  if (businessId) {
    if (!isOwned(c, businessId)) {
      c.status(403)
      return c.json({ error: "You do not have access to this business" })
    }
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
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
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
