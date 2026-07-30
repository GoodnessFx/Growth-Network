import type { Context } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"

export function recordAudit(
  c: Context,
  action: string,
  resource: string,
  resourceId?: string,
  details: Record<string, unknown> = {},
): void {
  const user = c.get("user") as { id: string } | undefined
  const tenantIds = c.get("tenantIds") as string[] | null
  const businessId = c.get("currentBusinessId") as string | undefined

  const db = getDb()
  db.prepare(
    `INSERT INTO audit_logs (id, business_id, user_id, action, resource, resource_id, details, ip, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(
    uuid(),
    businessId || (tenantIds?.[0] ?? null),
    user?.id ?? "system",
    action,
    resource,
    resourceId ?? null,
    JSON.stringify(details),
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null,
  )
}
