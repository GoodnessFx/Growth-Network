import type { Context, Next } from "hono"
import { getDb } from "../db/index.js"

export async function tenantMiddleware(c: Context, next: Next): Promise<void> {
  const user = c.get("user") as { id: string; role: string } | undefined
  if (!user) {
    c.status(401)
    c.json({ error: "Not authenticated" })
    return
  }

  if (user.role === "admin") {
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
