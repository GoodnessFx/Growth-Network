import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { authMiddleware } from "./middleware/auth.js"
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
import { audit } from "./routes/audit.js"
import { processScheduledAutomations } from "./services/automations.js"

const app = new Hono()

app.use("*", cors({ origin: "*", credentials: true }))

app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

app.route("/api/auth", auth)

app.use("/api/businesses/*", authMiddleware, tenantMiddleware)
app.route("/api/businesses", businesses)

app.use("/api/whatsapp/*", authMiddleware)
app.route("/api/whatsapp", whatsapp)

app.use("/api/social/*", authMiddleware, tenantMiddleware)
app.route("/api/social", social)

app.use("/api/ads/*", authMiddleware)
app.route("/api/ads", ads)

app.route("/api/tracking", tracking)

app.use("/api/analytics/*", authMiddleware, tenantMiddleware)
app.route("/api/analytics", analytics)

app.use("/api/automations/*", authMiddleware)
app.route("/api/automations", automations)

app.use("/api/export-trade/*", authMiddleware)
app.route("/api/export-trade", exportTrade)

app.use("/api/audit/*", authMiddleware)
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
