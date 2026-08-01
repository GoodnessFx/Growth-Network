import axios from "axios"
import type { Database } from "better-sqlite3"
import { resolveCredentials } from "./connections.js"
import { demoEnabled, demoAdCampaigns } from "./demo.js"

export interface AdMetrics {
  impressions: number
  clicks: number
  conversions: number
  spent: number
  ctr: number
  cpc: number
}

export interface AdPlatformOverview {
  platform: string
  label: string
  connected: boolean
  campaigns?: Array<{ id: string; name: string; status: string; metrics: AdMetrics }>
  error?: string
}

const AD_PLATFORMS = [
  { platform: "meta", label: "Meta Ads" },
  { platform: "google", label: "Google Ads" },
  { platform: "tiktok", label: "TikTok Ads" },
  { platform: "linkedin", label: "LinkedIn Ads" },
  { platform: "snapchat", label: "Snapchat Ads" },
] as const

/**
 * Aggregates per-platform campaign data for a business by resolving its stored
 * credentials. Used by both the owner dashboard and the public (visible-only)
 * read view, so ad performance can be shown publicly when a business opts in.
 */
export async function getAdsOverview(
  db: Database,
  businessId: string,
): Promise<{ platforms: AdPlatformOverview[]; generatedAt: string }> {
  const platforms = await Promise.all(
    AD_PLATFORMS.map(async ({ platform, label }) => {
      const { accessToken, accountId, refreshToken } = resolveCredentials(db, businessId, platform, process.env)
      const base = { platform, label }
      const demo = () => ({ ...base, connected: true, demo: true, campaigns: demoAdCampaigns(platform, businessId) })

      // No stored token, or a token without the account/page id required to
      // actually query the platform → show demo data until real creds exist.
      if (!accessToken || (!accountId && platform !== "linkedin")) {
        if (demoEnabled()) return demo()
        return !accessToken
          ? { ...base, connected: false }
          : { ...base, connected: false, error: "Connected but no account ID stored — reconnect and add the account/page ID" }
      }

      try {
        let campaigns: Array<{ id: string; name: string; status: string; metrics: AdMetrics }>
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
        // Live sync failed (bad/expired token, network). Fall back to demo
        // data so the dashboard keeps working; real data returns on success.
        if (demoEnabled()) return demo()
        return { ...base, connected: true, campaigns: [], error: err instanceof Error ? err.message : String(err) }
      }
    }),
  )

  return { platforms, generatedAt: new Date().toISOString() }
}

export async function fetchMetaAdCampaigns(
  adAccountId: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string; status: string; metrics: AdMetrics }>> {
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v21.0/${adAccountId}/campaigns`,
      {
        params: {
          fields: "id,name,status,insights{impressions,clicks,conversions,spend,ctr,cpc}",
          access_token: accessToken,
        },
      },
    )

    return (data.data || []).map((c: Record<string, unknown>) => {
      const insights = (c.insights as Record<string, unknown>)?.data?.[0] || {}
      return {
        id: c.id as string,
        name: c.name as string,
        status: c.status as string,
        metrics: {
          impressions: parseInt(insights.impressions as string || "0"),
          clicks: parseInt(insights.clicks as string || "0"),
          conversions: parseInt(insights.conversions as string || "0"),
          spent: parseFloat(insights.spend as string || "0"),
          ctr: parseFloat(insights.ctr as string || "0"),
          cpc: parseFloat(insights.cpc as string || "0"),
        },
      }
    })
  } catch (err: unknown) {
    throw new Error(`Meta Ads API: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function fetchGoogleAdsCampaigns(
  customerId: string,
  developerToken: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string; status: string; metrics: AdMetrics }>> {
  try {
    const { data } = await axios.post(
      `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:search`,
      {
        query: `
          SELECT campaign.id, campaign.name, campaign.status,
                 metrics.impressions, metrics.clicks, metrics.conversions,
                 metrics.cost_micros, metrics.ctr, metrics.average_cpc
          FROM campaign
          WHERE campaign.status != 'REMOVED'
          ORDER BY campaign.name
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "login-customer-id": customerId,
        },
      },
    )

    return (data.results || []).map((r: Record<string, unknown>) => {
      const c = r.campaign as Record<string, unknown> || {}
      const m = r.metrics as Record<string, unknown> || {}
      return {
        id: String(c.id as string),
        name: c.name as string,
        status: c.status as string,
        metrics: {
          impressions: (m.impressions as number) || 0,
          clicks: (m.clicks as number) || 0,
          conversions: (m.conversions as number) || 0,
          spent: ((m.cost_micros as number) || 0) / 1_000_000,
          ctr: (m.ctr as number) || 0,
          cpc: ((m.average_cpc as number) || 0) / 1_000_000,
        },
      }
    })
  } catch (err: unknown) {
    throw new Error(`Google Ads API: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function fetchTikTokAdCampaigns(
  advertiserId: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string; status: string; metrics: AdMetrics }>> {
  try {
    const { data } = await axios.post(
      "https://ads.tiktok.com/open_api/v1.3/campaign/get/",
      {
        advertiser_id: advertiserId,
        fields: ["campaign_id", "campaign_name", "campaign_status", "impressions", "clicks", "conversions", "spend", "ctr", "cpc"],
      },
      { headers: { "Access-Token": accessToken } },
    )

    return (data.data?.list || []).map((c: Record<string, unknown>) => ({
      id: c.campaign_id as string,
      name: c.campaign_name as string,
      status: c.campaign_status as string,
      metrics: {
        impressions: (c.impressions as number) || 0,
        clicks: (c.clicks as number) || 0,
        conversions: (c.conversions as number) || 0,
        spent: (c.spend as number) || 0,
        ctr: (c.ctr as number) || 0,
        cpc: (c.cpc as number) || 0,
      },
    }))
  } catch (err: unknown) {
    throw new Error(`TikTok Ads API: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function fetchLinkedInAdCampaigns(
  accessToken: string,
): Promise<Array<{ id: string; name: string; status: string; metrics: AdMetrics }>> {
  try {
    // LinkedIn Marketing API — list campaigns owned by the authorized account.
    // Analytics are requested per campaign; any failure degrades to zeros so a
    // live token still shows the campaign list.
    const { data } = await axios.get("https://api.linkedin.com/v2/adCampaignsV2", {
      params: { q: "search" },
      headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" },
    })

    const elements = ((data.elements || []) as Array<Record<string, unknown>>).map((c) => ({
      id: c.id as string,
      name: (c.name as string) || String(c.id),
      status: (c.status as string) || "UNKNOWN",
      metrics: { impressions: 0, clicks: 0, conversions: 0, spent: 0, ctr: 0, cpc: 0 },
    }))

    // Best-effort analytics pull. The API needs a dateRange + paging; on error
    // we keep the zeroed metrics rather than failing the whole sync.
    try {
      const today = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 28)
      const range = { start: { day: start.getDate(), month: start.getMonth() + 1, year: start.getFullYear() }, end: { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() } }
      const analytics = await axios.get("https://api.linkedin.com/v2/adAnalyticsV2", {
        params: {
          q: "analytics",
          timeRange: JSON.stringify(range),
          fields: "pivotValues,costInUsd,impressions,clicks,externalWebsiteConversions,clickThroughRate,costPerClick",
        },
        headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" },
      })
      const byCampaign = new Map<string, Record<string, unknown>>()
      for (const row of (analytics.data.elements || []) as Array<Record<string, unknown>>) {
        const pivot = String(row.pivotValue || row.pivotValues?.[0] || "")
        if (pivot) byCampaign.set(pivot, row)
      }
      return elements.map((c) => {
        const a = byCampaign.get(c.id) || {}
        const impressions = Number(a.impressions || 0)
        const clicks = Number(a.clicks || 0)
        const spent = Number(a.costInUsd || 0)
        return {
          ...c,
          metrics: {
            impressions,
            clicks,
            conversions: Number(a.externalWebsiteConversions || 0),
            spent,
            ctr: impressions > 0 ? Number((clicks / impressions) * 100) : 0,
            cpc: clicks > 0 ? Number((spent / clicks).toFixed(2)) : 0,
          },
        }
      })
    } catch {
      return elements
    }
  } catch (err: unknown) {
    throw new Error(`LinkedIn Ads API: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function fetchSnapchatAdCampaigns(
  adAccountId: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string; status: string; metrics: AdMetrics }>> {
  try {
    // Snapchat Marketing API. Campaign-level analytics require a second call
    // per campaign (snapchats/stats); we fetch the list and zero the metrics so
    // an authenticated account still returns its campaigns.
    const { data } = await axios.get(`https://adsapi.snapchat.com/v1/adaccounts/${adAccountId}/campaigns`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return ((data.campaigns || []) as Array<{ campaign: Record<string, unknown> }>).map((entry) => {
      const c = entry.campaign || {}
      return {
        id: String(c.id ?? ""),
        name: (c.name as string) || String(c.id ?? ""),
        status: (c.status as string) || "UNKNOWN",
        metrics: { impressions: 0, clicks: 0, conversions: 0, spent: 0, ctr: 0, cpc: 0 },
      }
    })
  } catch (err: unknown) {
    throw new Error(`Snapchat Ads API: ${err instanceof Error ? err.message : String(err)}`)
  }
}
