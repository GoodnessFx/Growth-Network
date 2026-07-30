import axios from "axios"

export interface AdMetrics {
  impressions: number
  clicks: number
  conversions: number
  spent: number
  ctr: number
  cpc: number
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
