import { Hono } from "hono"
import { getSupabaseAdmin, getSupabaseAuth } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import { requireOwner } from "../middleware/auth.js"
import { storage } from "../services/storage.js"

const businesses = new Hono()

businesses.get("/", async (c) => {
  const user = c.get("user") as { id: string; role: string }
  
  // Use auth token if available to leverage RLS
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ businesses: data || [] })
})

businesses.get("/:id", async (c) => {
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  const { data: row, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', c.req.param("id"))
    .single()

  if (error || !row) {
    c.status(404)
    return c.json({ error: "Business not found" })
  }

  c.set("currentBusinessId", c.req.param("id"))
  recordAudit(c, "read", "business", c.req.param("id"))
  return c.json({ business: row })
})

businesses.post("/", requireOwner, async (c) => {
  const user = c.get("user") as { id: string }
  const { name, type, domain } = await c.req.json()

  if (!name || !type) {
    c.status(400)
    return c.json({ error: "name and type are required" })
  }

  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()
  const id = uuid()

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      id,
      name,
      type,
      domain: domain || null,
      status: 'active',
      owner_id: user.id
    })
    .select()
    .single()

  if (error) {
    c.status(500)
    return c.json({ error: error.message })
  }

  recordAudit(c, "create", "business", id, { name, type })
  return c.json({ business: data })
})

businesses.put("/:id", requireOwner, async (c) => {
  const { name, type, status, domain } = await c.req.json()
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  const updates: any = {}
  if (name !== undefined) updates.name = name
  if (type !== undefined) updates.type = type
  if (status !== undefined) updates.status = status
  if (domain !== undefined) updates.domain = domain

  const { data: updated, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', c.req.param("id"))
    .select()
    .single()

  if (error || !updated) {
    c.status(404)
    return c.json({ error: "Business not found or could not be updated" })
  }

  recordAudit(c, "update", "business", c.req.param("id"), { name, type, status })
  return c.json({ business: updated })
})

businesses.patch("/:id/visibility", requireOwner, async (c) => {
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  const body = await c.req.json().catch(() => ({}))
  const visible = body.visible === true ? true : body.visible === false ? false : null
  
  if (visible === null) {
    c.status(400)
    return c.json({ error: "visible (boolean) is required" })
  }

  const { data: updated, error } = await supabase
    .from('businesses')
    .update({ visible })
    .eq('id', c.req.param("id"))
    .select()
    .single()

  if (error || !updated) {
    c.status(404)
    return c.json({ error: "Business not found or update failed" })
  }

  recordAudit(c, "set_visibility", "business", c.req.param("id"), { visible })
  return c.json({ business: updated })
})

businesses.post("/:id/snapshot", requireOwner, async (c) => {
  const { metrics, source } = await c.req.json()
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  if (!metrics || typeof metrics.revenueBefore !== "number" || typeof metrics.revenueAfter !== "number") {
    c.status(400)
    return c.json({ error: "metrics.revenueBefore and metrics.revenueAfter are required (numbers)" })
  }

  const reportSource = source === "live" ? "live" : "self-reported"

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      id: uuid(),
      business_id: c.req.param("id"),
      type: 'growth_snapshot',
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      metrics: JSON.stringify(metrics),
      source: reportSource
    })
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  recordAudit(c, "publish_snapshot", "reports", c.req.param("id"), { revenueAfter: metrics.revenueAfter, source: reportSource })
  return c.json({ report })
})

businesses.get("/:id/snapshot-draft", requireOwner, async (c) => {
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  const draft: Record<string, number | null> = { revenueAfter: null, revenueBefore: null, clientsAfter: null, clientsBefore: null }
  const dataSources: string[] = []

  // Check deals for revenue
  const { data: deals } = await supabase
    .from('deals')
    .select('value')
    .eq('business_id', c.req.param("id"))
    .eq('stage', 'closed')

  if (deals && deals.length > 0) {
    const total = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0)
    if (total > 0) {
      draft.revenueAfter = total
      dataSources.push("CRM — won deals")
    }
  }

  // Check contacts for clients
  const { count: contactCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', c.req.param("id"))
  
  if (contactCount && contactCount > 0) {
    draft.clientsAfter = contactCount
    dataSources.push("CRM — contacts")
  }

  return c.json({ draft, dataSources, suggested: true })
})

businesses.delete("/:id", requireOwner, async (c) => {
  const token = c.req.header("Authorization")?.slice(7)
  const supabase = token ? getSupabaseAuth(token) : getSupabaseAdmin()

  // Grab assets first to delete files
  const { data: assets } = await supabase
    .from('assets')
    .select('id, file_url')
    .eq('business_id', c.req.param("id"))

  // Delete business (cascade should handle related tables)
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', c.req.param("id"))

  if (error) {
    c.status(500)
    return c.json({ error: error.message })
  }

  if (assets) {
    for (const a of assets) {
      const key = a.file_url.replace(/^\/api\/assets\/file\//, "")
      if (key && key.startsWith("businesses/")) {
        await storage.delete(decodeURIComponent(key)).catch(() => {})
      }
    }
  }

  recordAudit(c, "offboard", "business", c.req.param("id"), { assetsRemoved: assets?.length || 0 })
  return c.json({ success: true, assetsRemoved: assets?.length || 0 })
})

export { businesses }
