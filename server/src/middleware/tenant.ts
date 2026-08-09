import type { Context, Next } from "hono"
import { getDb } from "../db/index.js"

export async function tenantMiddleware(c: Context, next: Next): Promise<void> {
  const user = c.get("user") as { id: string; role: string } | undefined
  if (!user) {
    c.status(401)
    return c.json({ error: "Not authenticated" })
  }

  // Google sign-in via Supabase has no client/owner split (no users table), so
  // the owner sees every business — same scope as the legacy admin role.
  if (user.role === "admin" || user.role === "owner") {
    c.set("tenantIds", null)
    await next()
    return
  }

  const db = getDb()
  const rows = db
    .prepare("SELECT id FROM businesses WHERE owner_id = ?")
    .all(user.id) as { id: string }[]

  const tenantIds = rows.map((r) => r.id)
  c.set("tenantIds", tenantIds)
  await next()
}
