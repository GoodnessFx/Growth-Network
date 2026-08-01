import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import bcrypt from "bcryptjs"
import { generateToken, authMiddleware } from "../middleware/auth.js"

const auth = new Hono()

auth.post("/register", async (c) => {
  const { email, name, password } = await c.req.json()
  if (!email || !name || !password) {
    c.status(400)
    return c.json({ error: "email, name, and password are required" })
  }

  const db = getDb()
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) {
    c.status(409)
    return c.json({ error: "Email already registered" })
  }

  const id = uuid()
  const passwordHash = await bcrypt.hash(password, 10)
  db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'operator')").run(
    id,
    email,
    name,
    passwordHash,
  )

  const token = generateToken({ id, email, name, role: "operator" })
  return c.json({ token, user: { id, email, name, role: "operator" } })
})

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    c.status(400)
    return c.json({ error: "email and password are required" })
  }

  const db = getDb()
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as Record<string, unknown> | undefined
  if (!user) {
    c.status(401)
    return c.json({ error: "Invalid credentials" })
  }

  const valid = await bcrypt.compare(password, user.password_hash as string)
  if (!valid) {
    c.status(401)
    return c.json({ error: "Invalid credentials" })
  }

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
