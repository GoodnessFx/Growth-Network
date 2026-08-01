import axios from "axios"

export interface SeoQueryRow {
  query: string
  impressions: number
  clicks: number
  position: number
}

export interface SeoPerformance {
  siteUrl: string
  impressions: number
  clicks: number
  position: number
  queryCount: number
  queries: SeoQueryRow[]
  dateFrom: string
  dateTo: string
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Pull 28-day search performance for one site from the Google Search Console
 * API. `siteUrl` is the resource the OAuth account owns, e.g. `sc-domain:example.com`
 * or `https://example.com/`. Requires an OAuth token with the
 * webmasters.readonly scope.
 */
export async function fetchSearchPerformance(siteUrl: string, accessToken: string, days = 28): Promise<SeoPerformance> {
  const dateTo = new Date()
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - (days - 1))

  const body = {
    startDate: isoDate(dateFrom),
    endDate: isoDate(dateTo),
    dimensions: ["query"],
    rowLimit: 10,
  }

  const { data } = await axios.post(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    body,
    {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    },
  )

  const queries: SeoQueryRow[] = ((data.rows || []) as Array<Record<string, unknown>>).map((r) => ({
    query: String(r.keys?.[0] ?? "(other)"),
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
    position: Number(r.position ?? 0),
  }))

  return {
    siteUrl,
    impressions: queries.reduce((s, q) => s + q.impressions, 0),
    clicks: queries.reduce((s, q) => s + q.clicks, 0),
    position: queries.length > 0 ? Number((queries.reduce((s, q) => s + q.position, 0) / queries.length).toFixed(1)) : 0,
    queryCount: queries.length,
    queries,
    dateFrom: isoDate(dateFrom),
    dateTo: isoDate(dateTo),
  }
}

/** List the sites the OAuth account can access via Search Console. */
export async function listSearchSites(accessToken: string): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  const { data } = await axios.get("https://searchconsole.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return ((data.siteEntry || []) as Array<Record<string, unknown>>).map((s) => ({
    siteUrl: String(s.siteUrl ?? ""),
    permissionLevel: String(s.permissionLevel ?? ""),
  }))
}
