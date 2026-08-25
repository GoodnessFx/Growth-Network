import { getAccessToken } from "./supabase"

/**
 * API base URL. In dev, Vite proxies `/api/*` to the local backend, so the
 * relative default just works. In production, set VITE_API_URL to the deployed
 * API origin (e.g. https://growth-network-api.up.railway.app) — the trailing
 * /api is appended here so callers keep using path-only routes.
 */
const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? ""
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : "/api"

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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Auth is Supabase-only: the access token lives in the SDK's own session
  // storage and is attached here as a Bearer token for the backend to verify.
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
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
  demo?: boolean
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
  demo?: boolean
}

export function fetchSeo(businessId: string): Promise<{ connected: boolean; demo?: boolean; seo?: SeoPerformance; error?: string }> {
  return apiFetch<{ connected: boolean; demo?: boolean; seo?: SeoPerformance; error?: string }>(
    `/social/seo?businessId=${encodeURIComponent(businessId)}`,
  )
}

export function fetchTrackingSnippet(businessId: string): Promise<{ snippet: string; businessId: string }> {
  return apiFetch<{ snippet: string; businessId: string }>(`/tracking/snippet/${encodeURIComponent(businessId)}`)
}

// ─── Content calendar (owner-only) ───────────────────────────────────────────

export interface CalendarEntry {
  id: string
  business_id: string
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  status: string
  is_ai_generated: number
  source: string
  content_hash: string
  created_at: string
}

export interface CalendarCoverage {
  id: string
  name: string
  filledDays: number
  totalDays: number
  filledSlots: number
  slotsPerDay: number
}

export function fetchCalendarEntries(params?: {
  businessId?: string
  from?: string
  to?: string
  status?: string
}): Promise<{ entries: CalendarEntry[] }> {
  const q = new URLSearchParams()
  if (params?.businessId) q.set("businessId", params.businessId)
  if (params?.from) q.set("from", params.from)
  if (params?.to) q.set("to", params.to)
  if (params?.status) q.set("status", params.status)
  const qs = q.toString()
  return apiFetch<{ entries: CalendarEntry[] }>(`/content-calendar${qs ? `?${qs}` : ""}`)
}

export function fetchCalendarCoverage(): Promise<{ coverage: CalendarCoverage[]; startDate: string; endDate: string }> {
  return apiFetch<{ coverage: CalendarCoverage[]; startDate: string; endDate: string }>("/content-calendar/coverage")
}

export function generateCalendar(
  businessId: string,
  days?: number,
  startDate?: string,
): Promise<{ created: number; skippedExisting: number; failed: number; startDate: string; days: number }> {
  return apiFetch<{ created: number; skippedExisting: number; failed: number; startDate: string; days: number }>(
    "/content-calendar/generate",
    {
      method: "POST",
      body: JSON.stringify({ businessId, days, startDate }),
    },
  )
}

export function updateCalendarEntry(
  id: string,
  patch: { title?: string; body?: string; status?: string },
): Promise<{ entry: CalendarEntry }> {
  return apiFetch<{ entry: CalendarEntry }>(`/content-calendar/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export function approveCalendarEntry(id: string): Promise<{ success: boolean; status: string }> {
  return apiFetch<{ success: boolean; status: string }>(`/content-calendar/${encodeURIComponent(id)}/approve`, {
    method: "POST",
  })
}

export function deleteCalendarEntry(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/content-calendar/${encodeURIComponent(id)}`, { method: "DELETE" })
}

// ─── Review queue (approve & post) ───────────────────────────────────────────

export interface QueueEntry {
  id: string
  business_id: string
  business_name: string
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  status: string
  publish_status: "pending" | "in_flight" | "published" | "failed"
  published_at: string | null
  publish_error: string | null
  media_asset_id: string | null
  media_url: string | null
  content_hash: string
  created_at: string
}

export interface QueueResponse {
  entries: QueueEntry[]
  pendingCount: number
}

export function fetchReviewQueue(params?: {
  businessId?: string
  platform?: string
  status?: string
  limit?: number
}): Promise<QueueResponse> {
  const q = new URLSearchParams()
  if (params?.businessId) q.set("businessId", params.businessId)
  if (params?.platform) q.set("platform", params.platform)
  if (params?.status) q.set("status", params.status)
  if (params?.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  return apiFetch<QueueResponse>(`/review-queue${qs ? `?${qs}` : ""}`)
}

export function editQueueEntry(
  id: string,
  patch: { title?: string; body?: string; mediaAssetId?: string | null },
): Promise<{ entry: QueueEntry }> {
  return apiFetch<{ entry: QueueEntry }>(`/review-queue/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export interface PublishResult {
  success: boolean
  demo?: boolean
  status: string
  postId?: string | null
  publishError?: string
  retryAfterSeconds?: number
}

export function publishQueueEntry(id: string): Promise<PublishResult> {
  return apiFetch<PublishResult>(`/review-queue/${encodeURIComponent(id)}/post`, { method: "POST" })
}

// ─── Assets (per-business library) ───────────────────────────────────────────

export interface Asset {
  id: string
  business_id: string
  file_name: string
  file_url: string
  mime_type: string | null
  size: number
  category: string
  uploaded_by: string
  created_at: string
}

export function fetchAssets(businessId: string, category?: string): Promise<{ assets: Asset[] }> {
  const q = new URLSearchParams({ businessId })
  if (category) q.set("category", category)
  return apiFetch<{ assets: Asset[] }>(`/assets?${q.toString()}`)
}

export async function uploadAsset(businessId: string, file: File, category = "post-image"): Promise<{ asset: Asset }> {
  const token = await getAccessToken()
  const fd = new FormData()
  fd.append("file", file)
  fd.append("category", category)
  const res = await fetch(`${API_BASE}/assets?businessId=${encodeURIComponent(businessId)}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Upload failed"
    throw new ApiError(message, res.status)
  }
  return body as { asset: Asset }
}

export function deleteAsset(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/assets/${encodeURIComponent(id)}`, { method: "DELETE" })
}

// ─── Error log (owner-only monitoring) ───────────────────────────────────────

export interface ErrorLogEntry {
  id: string
  business_id: string | null
  platform: string | null
  operation: string
  message: string
  details: string
  created_at: string
}

export function fetchErrorLogs(params?: { businessId?: string; limit?: number }): Promise<{ errors: ErrorLogEntry[] }> {
  const q = new URLSearchParams()
  if (params?.businessId) q.set("businessId", params.businessId)
  if (params?.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  return apiFetch<{ errors: ErrorLogEntry[] }>(`/audit/errors${qs ? `?${qs}` : ""}`)
}
