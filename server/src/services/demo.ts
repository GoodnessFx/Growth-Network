import { randomBytes } from "crypto"

/**
 * Deterministic demo-data fallbacks for features that need live platform
 * credentials (ads, SEO, social publishing, WhatsApp). While ENABLE_DEMO_DATA
 * is on (default) and no real token is stored, the API returns believable
 * sample numbers so the dashboard is fully explorable without credentials.
 * Every fallback response is flagged `demo: true` so clients can label it, and
 * real data replaces the demo values the moment a working connection exists.
 */

export function demoEnabled(): boolean {
  const v = process.env.ENABLE_DEMO_DATA
  return v === undefined || (v !== "0" && v.toLowerCase() !== "false")
}

function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rngFor(...parts: string[]): () => number {
  return mulberry32(hashSeed(parts.join("|")))
}

function round(n: number, dp = 2): number {
  return Number(n.toFixed(dp))
}

export interface DemoAdCampaign {
  id: string
  name: string
  status: string
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    spent: number
    ctr: number
    cpc: number
  }
}

const AD_CAMPAIGNS: Record<string, string[]> = {
  meta: ["Always-On Conversions — Web", "Retargeting — Site Visitors", "Prospecting — LAL 1%", "Brand Awareness — Reach"],
  google: ["Search — Brand", "Search — Non-brand", "Performance Max — Conversions", "Shopping — Best Sellers"],
  tiktok: ["Spark Ads — Viral CTAs", "Catalog Sales — Retargeting", "Top-View — Launch"],
  linkedin: ["Lead Gen — Decision Makers", "Content — Awareness", "Retargeting — Engaged Visits"],
  snapchat: ["Snap Ads — Drive to Site", "Collection — Gen Z", "Story — Launch"],
}

/** Plausible live ad campaign rows for a platform + business. */
export function demoAdCampaigns(platform: string, businessId: string): DemoAdCampaign[] {
  const names = AD_CAMPAIGNS[platform] || ["General — Conversions", "General — Awareness"]
  const rng = rngFor("ads", platform, businessId)

  return names.map((name, i) => {
    const impressions = Math.floor(8_000 + rng() * 90_000)
    const ctr = 0.8 + rng() * 2.4
    const clicks = Math.max(1, Math.floor((impressions * ctr) / 100))
    const cpc = 0.25 + rng() * 2.0
    const conversions = Math.floor(clicks * (1.5 + rng() * 5) / 100)
    return {
      id: `demo_${platform}_${i + 1}`,
      name,
      status: rng() > 0.25 ? "ACTIVE" : "PAUSED",
      metrics: {
        impressions,
        clicks,
        conversions,
        spent: round(clicks * cpc),
        ctr: round(ctr, 2),
        cpc: round(cpc),
      },
    }
  })
}

export interface DemoSqlQuery {
  query: string
  impressions: number
  clicks: number
  position: number
}

const SEO_QUERIES = [
  "best african business software",
  "agency management tool nigeria",
  "business dashboard kenya",
  "growth tracking for smes",
  "africa sme software",
  "client reporting agency",
  "whatsapp business automation",
  "social media scheduler africa",
  "revenue tracking app",
  "marketing agency crm",
]

/** Plausible 28-day Search Console performance for a business. */
export function demoSearConsole(name: string, businessId: string): {
  siteUrl: string
  impressions: number
  clicks: number
  position: number
  queryCount: number
  queries: DemoSqlQuery[]
  dateFrom: string
  dateTo: string
  demo: true
} {
  const rng = rngFor("seo", businessId)
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20) || "business"

  const queries = SEO_QUERIES.slice(0, 6 + Math.floor(rng() * 4)).map((query, i) => {
    const impressions = Math.floor(300 + rng() * 8_000)
    const position = round(2.5 + rng() * 14, 1)
    const clicks = Math.floor(impressions * (0.8 + rng() * 5) / 100)
    return { query, impressions, clicks, position }
  })

  const impressions = queries.reduce((s, q) => s + q.impressions, 0)
  const clicks = queries.reduce((s, q) => s + q.clicks, 0)
  const position = queries.length > 0 ? round(queries.reduce((s, q) => s + q.position, 0) / queries.length, 1) : 0

  const dateTo = new Date()
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - 27)

  return {
    siteUrl: `sc-domain:${slug}.com`,
    impressions,
    clicks,
    position,
    queryCount: queries.length,
    queries,
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
    demo: true,
  }
}

/** Plausible per-post social engagement for a platform + post. */
export function demoSocialMetrics(platform: string, postId: string): {
  likes: number
  comments: number
  shares: number
  impressions: number
} {
  const rng = rngFor("social", platform, postId)
  const impressions = Math.floor(500 + rng() * 7_500)
  const likes = Math.floor(impressions * (0.02 + rng() * 0.04))
  return {
    likes,
    comments: Math.floor(likes * (0.03 + rng() * 0.08)),
    shares: Math.floor(likes * (0.02 + rng() * 0.06)),
    impressions,
  }
}

/** Demo post id for a simulated publish. */
export function demoPostId(platform: string): string {
  return `demo_${platform}_${randomBytes(4).toString("hex")}`
}

/** Demo WhatsApp message id for a simulated send. */
export function demoWhatsAppId(): string {
  return `wa_demo_${randomBytes(6).toString("hex")}`
}
