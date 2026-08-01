import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { getAnalyticsOverview, simulateTraffic } from "../services/analytics.js"
import { resolveCredentials } from "../services/connections.js"
import {
  fetchMetaAdCampaigns,
  fetchGoogleAdsCampaigns,
  fetchTikTokAdCampaigns,
  fetchLinkedInAdCampaigns,
  fetchSnapchatAdCampaigns,
} from "../services/ads.js"
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

// ─── Unified ads monitoring ──────────────────────────────────────────────────

const AD_PLATFORMS = [
  { platform: "meta", label: "Meta Ads" },
  { platform: "google", label: "Google Ads" },
  { platform: "tiktok", label: "TikTok Ads" },
  { platform: "linkedin", label: "LinkedIn Ads" },
  { platform: "snapchat", label: "Snapchat Ads" },
] as const

analytics.get("/ads", async (c) => {
  const businessId = c.req.query("businessId")
  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!isOwned(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const db = getDb()
  const platforms = await Promise.all(
    AD_PLATFORMS.map(async ({ platform, label }) => {
      const { accessToken, accountId, refreshToken } = resolveCredentials(db, businessId, platform, process.env)
      const base = { platform, label }
      if (!accessToken) return { ...base, connected: false }
      if (!accountId && platform !== "linkedin") {
        return { ...base, connected: false, error: "Connected but no account ID stored — reconnect and add the account/page ID" }
      }
      try {
        let campaigns: Array<{ id: string; name: string; status: string; metrics: { impressions: number; clicks: number; conversions: number; spent: number; ctr: number; cpc: number } }>
        switch (platform) {
          case "meta":
            campaigns = await fetchMetaAdCampaigns(accountId as string, accessToken)
            break
          case "google":
            campaigns = await fetchGoogleAdsCampaigns(accountId as string, refreshToken as string, accessToken)
            break
          case "tiktok":
            campaigns = await fetchTikTokAdCampaigns(accountId as string, accessToken)
            break
          case "linkedin":
            campaigns = await fetchLinkedInAdCampaigns(accessToken)
            break
          case "snapchat":
            campaigns = await fetchSnapchatAdCampaigns(accountId as string, accessToken)
            break
          default:
            campaigns = []
        }
        return { ...base, connected: true, campaigns }
      } catch (err: unknown) {
        return { ...base, connected: true, campaigns: [], error: err instanceof Error ? err.message : String(err) }
      }
    }),
  )

  return c.json({ platforms, generatedAt: new Date().toISOString() })
})

export { analytics }
