import type { Context, Next } from "hono"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function authMiddleware(c: Context, next: Next): Promise<void> {
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
