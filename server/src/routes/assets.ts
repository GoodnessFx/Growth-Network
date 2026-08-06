import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"
import { storage } from "../services/storage.js"

const assets = new Hono()

const CATEGORIES = ["logo", "post-image", "brand-guide", "document", "other"]

interface AssetRow {
  id: string
  business_id: string
  file_name: string
  file_url: string
  mime_type: string | null
  size: number
  category: string
  uploaded_by: string
  created_at: string
}

function tenantBusinessIds(c: import("hono").Context): string[] | null {
  const user = c.get("user") as { role: string } | undefined
  if (user?.role === "admin") return null
  return (c.get("tenantIds") as string[] | null) ?? []
}

function canAccess(c: import("hono").Context, businessId: string): boolean {
  const ids = tenantBusinessIds(c)
  if (ids === null) return true
  return ids.includes(businessId)
}

// List assets for a business (owner: any business; client: own business only).
assets.get("/", (c) => {
  const businessId = c.req.query("businessId")
  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const category = c.req.query("category")
  const db = getDb()
  const rows = (category
    ? db.prepare("SELECT * FROM assets WHERE business_id = ? AND category = ? ORDER BY created_at DESC").all(businessId, category)
    : db.prepare("SELECT * FROM assets WHERE business_id = ? ORDER BY created_at DESC").all(businessId)) as AssetRow[]

  return c.json({ assets: rows })
})

// Upload one file (multipart field "file"; optional "category" field).
assets.post("/", async (c) => {
  const businessId = c.req.query("businessId")
  if (!businessId) {
    c.status(400)
    return c.json({ error: "businessId is required" })
  }
  if (!canAccess(c, businessId)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const user = c.get("user") as { id: string }
  const body = await c.req.parseBody()
  const file = body["file"]
  const category = typeof body["category"] === "string" ? body["category"] : "post-image"

  if (!file || typeof file === "string") {
    c.status(400)
    return c.json({ error: "A file upload is required (multipart field 'file')" })
  }
  if (!CATEGORIES.includes(category)) {
    c.status(400)
    return c.json({ error: `Category must be one of: ${CATEGORIES.join(", ")}` })
  }

  const bytes = file instanceof ArrayBuffer ? Buffer.from(file) : Buffer.from(await file.arrayBuffer())
  if (bytes.length === 0) {
    c.status(400)
    return c.json({ error: "Uploaded file is empty" })
  }
  // 20 MB cap — design files, not arbitrary archives.
  if (bytes.length > 20 * 1024 * 1024) {
    c.status(413)
    return c.json({ error: "File too large (max 20 MB)" })
  }

  const mimeType = file.type || "application/octet-stream"
  const stored = await storage.put({ businessId, fileName: file.name || "upload.bin", mimeType, data: bytes })

  const db = getDb()
  const id = uuid()
  db.prepare(
    "INSERT INTO assets (id, business_id, file_name, file_url, mime_type, size, category, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
  ).run(id, businessId, file.name || "upload.bin", stored.url, mimeType, stored.size, category, user.id)

  recordAudit(c, "upload_asset", "assets", id, { businessId, category, size: stored.size })
  const row = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as AssetRow
  return c.json({ asset: row })
})

// Stream a stored file back (local driver URLs are /api/assets/file/:key).
assets.get("/file/*", async (c) => {
  const key = c.req.path.replace(/^\/api\/assets\/file\//, "")
  if (!key) {
    c.status(400)
    return c.json({ error: "Missing object key" })
  }
  const obj = await storage.get(decodeURIComponent(key))
  if (!obj) {
    c.status(404)
    return c.json({ error: "File not found" })
  }
  c.header("Cache-Control", "private, max-age=86400")
  return new Response(new Uint8Array(obj.data), { headers: { "Content-Type": obj.mimeType } })
})

// Delete an asset (owner or the business's owner user).
assets.delete("/:id", async (c) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM assets WHERE id = ?").get(c.req.param("id")) as AssetRow | undefined
  if (!existing) {
    c.status(404)
    return c.json({ error: "Asset not found" })
  }
  if (!canAccess(c, existing.business_id)) {
    c.status(403)
    return c.json({ error: "You do not have access to this business" })
  }

  const key = existing.file_url.replace(/^\/api\/assets\/file\//, "")
  if (key && key.startsWith("businesses/")) {
    await storage.delete(decodeURIComponent(key)).catch(() => {})
  }

  db.prepare("DELETE FROM assets WHERE id = ?").run(existing.id)
  db.prepare("UPDATE content_calendar SET media_asset_id = NULL WHERE media_asset_id = ?").run(existing.id)
  recordAudit(c, "delete_asset", "assets", existing.id, { businessId: existing.business_id })
  return c.json({ success: true })
})

export { assets }
