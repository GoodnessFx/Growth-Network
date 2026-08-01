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

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
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

export interface ApiConnection {
  id: string
  business_id: string
  platform: string
  access_token: string | null
  refresh_token: string | null
  account_id: string | null
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
