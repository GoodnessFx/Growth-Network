import type { Database } from "better-sqlite3"
import { v4 as uuid } from "uuid"

export interface ConnectionRow {
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

export function getConnections(db: Database, businessIds: string[]): ConnectionRow[] {
  if (businessIds.length === 0) return []
  const placeholders = businessIds.map(() => "?").join(",")
  return db
    .prepare(`SELECT * FROM social_connections WHERE business_id IN (${placeholders}) ORDER BY platform`)
    .all(...businessIds) as ConnectionRow[]
}

export function getConnection(db: Database, businessId: string, platform: string): ConnectionRow | null {
  return db.prepare("SELECT * FROM social_connections WHERE business_id = ? AND platform = ?").get(businessId, platform) as
    | ConnectionRow
    | null
}

export function getConnectionById(db: Database, id: string): ConnectionRow | null {
  return db.prepare("SELECT * FROM social_connections WHERE id = ?").get(id) as ConnectionRow | null
}

export function upsertConnection(
  db: Database,
  input: { businessId: string; platform: string; accessToken?: string; refreshToken?: string; accountId?: string },
): ConnectionRow {
  const existing = getConnection(db, input.businessId, input.platform)
  if (existing) {
    db.prepare(
      "UPDATE social_connections SET access_token = COALESCE(?, access_token), refresh_token = COALESCE(?, refresh_token), account_id = COALESCE(?, account_id), status = 'connected', updated_at = datetime('now') WHERE id = ?",
    ).run(
      input.accessToken || null,
      input.refreshToken || null,
      input.accountId || null,
      existing.id,
    )
    return getConnectionById(db, existing.id) as ConnectionRow
  }

  const id = uuid()
  db.prepare(
    "INSERT INTO social_connections (id, business_id, platform, access_token, refresh_token, account_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'connected', datetime('now'), datetime('now'))",
  ).run(
    id,
    input.businessId,
    input.platform,
    input.accessToken || null,
    input.refreshToken || null,
    input.accountId || null,
  )
  return getConnectionById(db, id) as ConnectionRow
}

export function deleteConnection(db: Database, id: string): boolean {
  const info = db.prepare("DELETE FROM social_connections WHERE id = ?").run(id)
  return info.changes > 0
}

/**
 * Resolve credentials for a platform. Prefers a per-business connection row,
 * falling back to global .env credentials (single-tenant mode).
 */
export function resolveCredentials(
  db: Database,
  businessId: string | undefined,
  platform: string,
  env: NodeJS.ProcessEnv,
): { accessToken: string | null; accountId: string | null; refreshToken: string | null; fromConnection: boolean } {
  if (businessId) {
    const conn = getConnection(db, businessId, platform)
    if (conn && conn.access_token) {
      return { accessToken: conn.access_token, accountId: conn.account_id, refreshToken: conn.refresh_token, fromConnection: true }
    }
  }

  const envMap: Record<string, { token: string; account?: string; refresh?: string }> = {
    facebook: { token: "META_ACCESS_TOKEN" },
    instagram: { token: "META_ACCESS_TOKEN" },
    tiktok: { token: "TIKTOK_ACCESS_TOKEN", account: "TIKTOK_ADVERTISER_ID" },
    x: { token: "X_BEARER_TOKEN" },
    youtube: { token: "YOUTUBE_API_KEY" },
    linkedin: { token: "LINKEDIN_ACCESS_TOKEN" },
    meta: { token: "META_ACCESS_TOKEN", account: "META_AD_ACCOUNT_ID" },
    google: { token: "GOOGLE_ADS_REFRESH_TOKEN", account: "GOOGLE_ADS_MANAGER_CUSTOMER_ID", refresh: "GOOGLE_ADS_DEVELOPER_TOKEN" },
    whatsapp: { token: "WHATSAPP_ACCESS_TOKEN" },
  }

  const keys = envMap[platform]
  if (!keys) return { accessToken: null, accountId: null, refreshToken: null, fromConnection: false }
  return {
    accessToken: env[keys.token] || null,
    accountId: keys.account ? env[keys.account] || null : null,
    refreshToken: keys.refresh ? env[keys.refresh] || null : null,
    fromConnection: false,
  }
}
