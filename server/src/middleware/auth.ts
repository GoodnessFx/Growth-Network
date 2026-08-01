import type { Context, Next } from "hono"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

if (!process.env.JWT_SECRET) {
  console.warn("[GN] WARNING: JWT_SECRET not set - using the insecure default. Set JWT_SECRET in production.")
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | undefined> {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    c.status(401)
    return c.json({ error: "Missing or invalid Authorization header" })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser
    c.set("user", payload)
    await next()
  } catch {
    c.status(401)
    return c.json({ error: "Invalid or expired token" })
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
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
