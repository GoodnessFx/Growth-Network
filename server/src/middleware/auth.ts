import type { Context, Next } from "hono"
import { supabase } from "../services/supabase.js"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

/**
 * Verifies the Supabase access token from the Authorization header against the
 * Supabase Auth API. There is no local users table and no self-issued JWT —
 * identity comes entirely from the Supabase project (Google OAuth). Every
 * signed-in user is treated as the platform owner (full access).
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | undefined> {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    c.status(401)
    return c.json({ error: "Missing or invalid Authorization header" })
  }

  const token = authHeader.slice(7)

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    c.status(401)
    return c.json({ error: "Invalid or expired session" })
  }

  const su = data.user
  const metadata = (su.user_metadata ?? {}) as Record<string, unknown>
  const fullName = metadata.full_name
  const user: AuthUser = {
    id: su.id,
    email: su.email ?? "",
    name: typeof fullName === "string" && fullName ? fullName : (su.email ?? "Owner"),
    role: "owner",
  }

  c.set("user", user)
  await next()
}

/**
 * Requires an authenticated user whose role is the platform owner (or admin).
 * The app is read-only for everyone else; only the owner can write.
 * Must run AFTER authMiddleware (reads c.get("user")).
 */
export async function requireOwner(c: Context, next: Next): Promise<Response | undefined> {
  const user = c.get("user") as { id?: string; role?: string } | undefined
  if (!user?.id) {
    c.status(401)
    return c.json({ error: "Not authenticated" })
  }
  if (user.role !== "owner" && user.role !== "admin") {
    c.status(403)
    return c.json({ error: "Owner access required - only the Growth Network owner can do this" })
  }
  await next()
}
