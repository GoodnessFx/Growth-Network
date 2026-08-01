import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { authMiddleware, requireOwner } from "./middleware/auth.js"
import { tenantMiddleware } from "./middleware/tenant.js"
import { auth } from "./routes/auth.js"
import { businesses } from "./routes/businesses.js"
import { whatsapp } from "./routes/whatsapp.js"
import { social } from "./routes/social.js"
import { ads } from "./routes/ads.js"
import { tracking } from "./routes/tracking.js"
import { analytics } from "./routes/analytics.js"
import { automations } from "./routes/automations.js"
import { exportTrade } from "./routes/export-trade.js"
import { publicApi } from "./routes/public.js"
import { audit } from "./routes/audit.js"
import { processScheduledAutomations } from "./services/automations.js"

const app = new Hono()

// CORS: allow the local dev origins plus anything explicitly allowed via
// ALLOWED_ORIGINS / TRACKING_ALLOWED_ORIGINS (customer sites that embed the
// tracking pixel). Same-origin requests (origin === undefined) are allowed.
const ALLOWED_ORIGINS = new Set([
  "http://localhost:8443",
  "http://127.0.0.1:8443",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  ...(process.env.TRACKING_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("http") ? s : `https://${s}`)),
])

app.use(
  "*",
  cors({
    origin: (origin) => (!origin || ALLOWED_ORIGINS.has(origin) ? origin : null),
    credentials: true,
  }),
)

app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

app.route("/api/auth", auth)

app.use("/api/businesses/*", authMiddleware, tenantMiddleware)
app.route("/api/businesses", businesses)

app.use("/api/whatsapp/*", authMiddleware, requireOwner)
app.route("/api/whatsapp", whatsapp)

app.use("/api/social/*", authMiddleware, tenantMiddleware, requireOwner)
app.route("/api/social", social)

app.use("/api/ads/*", authMiddleware, tenantMiddleware, requireOwner)
app.route("/api/ads", ads)

app.route("/api/tracking", tracking)

app.route("/api/public", publicApi)

app.use("/api/analytics/*", authMiddleware, tenantMiddleware)
app.route("/api/analytics", analytics)

app.use("/api/automations/*", authMiddleware, requireOwner)
app.route("/api/automations", automations)

app.use("/api/export-trade/*", authMiddleware, requireOwner)
app.route("/api/export-trade", exportTrade)

app.use("/api/audit/*", authMiddleware, requireOwner)
app.route("/api/audit", audit)

const PORT = parseInt(process.env.PORT || "3001")

serve({
  fetch: app.fetch,
  port: PORT,
})

console.log(`[GN Server] Running on http://0.0.0.0:${PORT}`)

setInterval(() => {
  try {
    processScheduledAutomations()
  } catch {}
}, 60_000)
