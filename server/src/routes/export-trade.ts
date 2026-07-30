import { Hono } from "hono"
import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"
import { recordAudit } from "../middleware/audit.js"

const exportTrade = new Hono()

exportTrade.get("/shipments", (c) => {
  const businessId = c.req.query("businessId")
  const status = c.req.query("status")

  const db = getDb()
  let sql = "SELECT * FROM export_shipments"
  const params: unknown[] = []
  const conditions: string[] = []

  if (businessId) {
    conditions.push("business_id = ?")
    params.push(businessId)
  }
  if (status) {
    conditions.push("status = ?")
    params.push(status)
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  sql += " ORDER BY created_at DESC"
  return c.json({ shipments: db.prepare(sql).all(...params) })
})

exportTrade.post("/shipments", async (c) => {
  const {
    businessId, orderNumber, supplier, buyer, origin, destination,
    productDescription, quantity, unit, totalValue, currency,
    incoterm, estimatedDelivery,
  } = await c.req.json()

  if (!businessId || !orderNumber || !supplier || !buyer || !origin || !destination) {
    c.status(400)
    return c.json({ error: "businessId, orderNumber, supplier, buyer, origin, destination are required" })
  }

  const db = getDb()
  const id = uuid()
  db.prepare(
    `INSERT INTO export_shipments (id, business_id, order_number, supplier, buyer, origin, destination,
     product_description, quantity, unit, total_value, currency, incoterm, status, estimated_delivery, documents, payment_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, '[]', 'pending', datetime('now'))`,
  ).run(
    id, businessId, orderNumber, supplier, buyer, origin, destination,
    productDescription || "", quantity || 0, unit || "units", totalValue || 0,
    currency || "USD", incoterm || "FOB", estimatedDelivery || null,
  )

  recordAudit(c, "create_shipment", "export_shipments", id, { orderNumber, supplier, buyer })
  return c.json({ shipment: { id, businessId, orderNumber, supplier, buyer, origin, destination, status: "pending" } })
})

exportTrade.put("/shipments/:id", async (c) => {
  const { id } = c.req.param()
  const { status, paymentStatus, actualDelivery, documents } = await c.req.json()

  const db = getDb()
  const existing = db.prepare("SELECT * FROM export_shipments WHERE id = ?").get(id)
  if (!existing) {
    c.status(404)
    return c.json({ error: "Shipment not found" })
  }

  db.prepare(
    "UPDATE export_shipments SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status), actual_delivery = COALESCE(?, actual_delivery), documents = COALESCE(?, documents) WHERE id = ?",
  ).run(status || null, paymentStatus || null, actualDelivery || null, documents ? JSON.stringify(documents) : null, id)

  recordAudit(c, "update_shipment", "export_shipments", id, { status, paymentStatus })
  const updated = db.prepare("SELECT * FROM export_shipments WHERE id = ?").get(id)
  return c.json({ shipment: updated })
})

exportTrade.get("/contacts", (c) => {
  const businessId = c.req.query("businessId")

  const db = getDb()
  let sql = "SELECT * FROM contacts WHERE source = 'export-trade'"
  const params: unknown[] = []

  if (businessId) {
    sql += " AND business_id = ?"
    params.push(businessId)
  }

  sql += " ORDER BY created_at DESC"
  return c.json({ contacts: db.prepare(sql).all(...params) })
})

export { exportTrade }
