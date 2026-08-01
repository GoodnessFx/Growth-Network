import { Hono } from "hono"
import { getDb } from "../db/index.js"
import bcrypt from "bcryptjs"
import { generateToken, authMiddleware } from "../middleware/auth.js"

const auth = new Hono()

// ─── Login rate limiting (in-memory) ──────────────────────────────────────────
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000

interface Attempt {
  count: number
  firstAt: number
}

const attempts = new Map<string, Attempt>()

function rateLimited(key: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec) return { limited: false, retryAfterSec: 0 }
  if (now - rec.firstAt > WINDOW_MS) {
    attempts.delete(key)
    return { limited: false, retryAfterSec: 0 }
  }
  if (rec.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.max(1, Math.ceil((rec.firstAt + WINDOW_MS - now) / 1000))
    return { limited: true, retryAfterSec }
  }
  return { limited: false, retryAfterSec: 0 }
}

function recordFailure(key: string): void {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec) {
    attempts.set(key, { count: 1, firstAt: now })
    return
  }
  if (now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
    return
  }
  rec.count += 1
}

function clearAttempts(key: string): void {
  attempts.delete(key)
}

// Public registration is intentionally disabled: the only account is the
// platform owner, provisioned via `pnpm db:seed` (see server/src/seed.ts).

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    c.status(400)
    return c.json({ error: "email and password are required" })
  }

  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown"
  const key = `${ip}|${String(email).toLowerCase()}`
  const { limited, retryAfterSec } = rateLimited(key)
  if (limited) {
    c.header("Retry-After", String(retryAfterSec))
    c.status(429)
    return c.json({ error: `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.` })
  }

  const db = getDb()
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as Record<string, unknown> | undefined
  if (!user) {
    recordFailure(key)
    c.status(401)
    return c.json({ error: "Invalid credentials" })
  }

  const valid = await bcrypt.compare(password, user.password_hash as string)
  if (!valid) {
    recordFailure(key)
    c.status(401)
    return c.json({ error: "Invalid credentials" })
  }

  clearAttempts(key)

  const token = generateToken({
    id: user.id as string,
    email: user.email as string,
    name: user.name as string,
    role: user.role as string,
  })

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
})

auth.get("/me", authMiddleware, (c) => {
  const user = c.get("user")
  return c.json({ user })
})

export { auth }
