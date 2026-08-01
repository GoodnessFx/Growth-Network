const TOKEN_KEY = "gn_token"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Request failed") || "Request failed"
    throw new ApiError(message, res.status)
  }

  return body as T
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function fetchMe(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>("/auth/me")
}

export interface ApiBusiness {
  id: string
  name: string
  type: string
  status: string
  owner_id: string
  domain: string | null
  visible: number
  created_at: string
  updated_at: string
}

export function fetchBusinesses(): Promise<{ businesses: ApiBusiness[] }> {
  return apiFetch<{ businesses: ApiBusiness[] }>("/businesses")
}

export function createBusiness(payload: { name: string; type: string; domain?: string }): Promise<{ business: ApiBusiness }> {
  return apiFetch<{ business: ApiBusiness }>("/businesses", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateBusinessVisibility(businessId: string, visible: boolean): Promise<{ business: ApiBusiness }> {
  return apiFetch<{ business: ApiBusiness }>(`/businesses/${encodeURIComponent(businessId)}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ visible }),
  })
}

// Public, unauthenticated listing of the businesses the owner has made visible.
export function fetchPublicBusinesses(): Promise<{ businesses: Pick<ApiBusiness, "id" | "name" | "type" | "status" | "domain" | "created_at">[] }> {
  return apiFetch<{ businesses: Pick<ApiBusiness, "id" | "name" | "type" | "status" | "domain" | "created_at">[] }>("/public")
}

export interface ApiConnection {
  id: string
  business_id: string
  platform: string
  access_token: string | null
  refresh_token: string | null
  account_id: string | null
  account_name: string | null
  expires_at: string | null
  status: string
  created_at: string
  updated_at: string
}

export function fetchConnections(businessId?: string): Promise<{ connections: ApiConnection[] }> {
  const q = businessId ? `?businessId=${encodeURIComponent(businessId)}` : ""
  return apiFetch<{ connections: ApiConnection[] }>(`/social/connections${q}`)
}

export function createConnection(payload: {
  businessId: string
  platform: string
  accessToken?: string
  accountId?: string
  refreshToken?: string
  accountName?: string
  expiresAt?: string
}): Promise<{ connection: ApiConnection }> {
  return apiFetch<{ connection: ApiConnection }>("/social/connections", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function deleteConnection(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/social/connections/${id}`, { method: "DELETE" })
}

export function verifyConnection(id: string): Promise<{ ok: boolean; detail: string }> {
  return apiFetch<{ ok: boolean; detail: string }>(`/social/connections/${id}/verify`, { method: "POST" })
}

export interface AnalyticsOverview {
  overview: {
    live: number
    todayPageviews: number
    todayVisitors: number
    sessions: number
    clicks: number
    formSubmits: number
    conversionRate: number
    lastHourEvents: number
  }
  hourlyTrend: { hour: string; events: number; visitors: number }[]
  topPages: { page: string; count: number }[]
  referrers: { referrer: string; count: number }[]
  devices: { device: string; count: number }[]
  recent: { id: string; eventType: string; pageUrl: string; timestamp: string }[]
  generatedAt: string
}

export function fetchAnalytics(businessId: string): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>(`/analytics/overview?businessId=${encodeURIComponent(businessId)}`)
}

export function simulateTraffic(businessId: string, count: number): Promise<{ events: number; visitors: number; simulated: boolean }> {
  return apiFetch<{ events: number; visitors: number; simulated: boolean }>("/analytics/simulate", {
    method: "POST",
    body: JSON.stringify({ businessId, count }),
  })
}

export interface SnapshotMetrics {
  revenueBefore: number
  revenueAfter: number
  clientsBefore: number
  clientsAfter: number
  headline: string
  channels: string[]
  source?: 'live' | 'self-reported'
}

export interface ApiReport {
  id: string
  business_id: string
  type: string
  period_start: string
  period_end: string
  metrics: SnapshotMetrics
  before_image: string | null
  after_image: string | null
  source: string
  generated_at: string
}

export function fetchPublicResults(businessId: string): Promise<{ business: ApiBusiness; report: ApiReport | null }> {
  return apiFetch<{ business: ApiBusiness; report: ApiReport | null }>(`/public/${encodeURIComponent(businessId)}`)
}

export function saveSnapshot(businessId: string, metrics: SnapshotMetrics): Promise<{ report: ApiReport }> {
  return apiFetch<{ report: ApiReport }>(`/businesses/${encodeURIComponent(businessId)}/snapshot`, {
    method: "POST",
    body: JSON.stringify({ metrics, source: metrics.source ?? 'self-reported' }),
  })
}

export function fetchSnapshotDraft(
  businessId: string,
): Promise<{ draft: Partial<SnapshotMetrics>; dataSources: string[]; suggested: boolean }> {
  return apiFetch<{ draft: Partial<SnapshotMetrics>; dataSources: string[]; suggested: boolean }>(
    `/businesses/${encodeURIComponent(businessId)}/snapshot-draft`,
  )
}

// ─── Ads + SEO monitoring ─────────────────────────────────────────────────────

export interface AdCampaign {
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

export interface AdPlatformOverview {
  platform: string
  label: string
  connected: boolean
  campaigns?: AdCampaign[]
  error?: string
}

export function fetchAdsOverview(businessId: string): Promise<{ platforms: AdPlatformOverview[]; generatedAt: string }> {
  return apiFetch<{ platforms: AdPlatformOverview[]; generatedAt: string }>(
    `/analytics/ads?businessId=${encodeURIComponent(businessId)}`,
  )
}

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

export function fetchSeo(businessId: string): Promise<{ connected: boolean; seo?: SeoPerformance; error?: string }> {
  return apiFetch<{ connected: boolean; seo?: SeoPerformance; error?: string }>(
    `/social/seo?businessId=${encodeURIComponent(businessId)}`,
  )
}

export function fetchTrackingSnippet(businessId: string): Promise<{ snippet: string; businessId: string }> {
  return apiFetch<{ snippet: string; businessId: string }>(`/tracking/snippet/${encodeURIComponent(businessId)}`)
}
