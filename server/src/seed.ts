import "dotenv/config"
import { getDb, closeDb } from "./db/index.js"

/**
 * Idempotent seed for the Growth Network public showcase.
 *
 * Auth is Google-only via Supabase (no local users table), so this seed only
 * manages the four real client businesses and their public `visible` flags.
 * Content tables are deliberately kept EMPTY: these are real clients, so the
 * app shows an honest "awaiting data" state until real data is connected.
 * No fabricated figures are seeded.
 *
 * Run with: pnpm db:seed
 */

// Business IDs are stable so API consumers (e.g. the export-trade shipment
// feature) can rely on them. a98c48ec-... is the Export Trade business wired
// into the export_shipments feature.
const DEMO_BUSINESSES = [
  {
    id: "60f1434e-220f-4417-98f0-5683bf3df00e",
    name: "BuySmart Procurement Limited",
    type: "Procurement",
    visible: 1,
  },
  {
    id: "15e7d817-faef-4551-aa17-26053116169d",
    name: "Goodman & Goldsmith",
    type: "Trading",
    visible: 1,
  },
  {
    id: "da56fb84-ddc7-4789-9c41-011bca3492e3",
    name: "OPES (Oguntimehin Procurement & Energy Services)",
    type: "Procurement & Energy",
    visible: 1,
  },
  {
    id: "a98c48ec-06cf-4a49-a0eb-0ee279f02418",
    name: "Export Trade",
    type: "Export / Trade",
    visible: 1,
  },
]

// Deletion order is FK-safe: rows referencing contacts are cleared first.
const CONTENT_TABLES: Array<[string, string]> = [
  ["deals", "business_id"],
  ["whatsapp_messages", "business_id"],
  ["follow_ups", "business_id"],
  ["contacts", "business_id"],
  ["social_posts", "business_id"],
  ["social_connections", "business_id"],
  ["ad_campaigns", "business_id"],
  ["tracking_events", "business_id"],
  ["automation_rules", "business_id"],
  ["export_shipments", "business_id"],
  ["response_times", "business_id"],
  ["reports", "business_id"],
  ["content_calendar", "business_id"],
]

const db = getDb()

db.transaction(() => {
  // ─── 1. Upsert the real client businesses ──────────────────────────────────
  // owner_id is NULL: ownership is derived from the Supabase session, and the
  // signed-in Google user (the owner) is given full access by the API.
  for (const biz of DEMO_BUSINESSES) {
    const existing = db.prepare("SELECT id FROM businesses WHERE id = ?").get(biz.id) as { id: string } | undefined
    if (!existing) {
      db.prepare("INSERT INTO businesses (id, name, type, status, owner_id, visible) VALUES (?, ?, ?, 'active', NULL, ?)").run(
        biz.id,
        biz.name,
        biz.type,
        biz.visible,
      )
      console.log(`[seed] Created business ${biz.name} (${biz.id})`)
    } else {
      db.prepare("UPDATE businesses SET owner_id = NULL, name = ?, type = ?, visible = ?, updated_at = datetime('now') WHERE id = ?").run(
        biz.name,
        biz.type,
        biz.visible,
        biz.id,
      )
      console.log(`[seed] Business ${biz.name} already exists - ensured visible=${biz.visible === 1}`)
    }
  }

  // ─── 2. Honest content sweep ──────────────────────────────────────────────
  // These are real clients. All content tables are cleared so the app shows an
  // honest "awaiting data" state instead of fabricated figures.
  for (const biz of DEMO_BUSINESSES) {
    for (const [table, col] of CONTENT_TABLES) {
      db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`).run(biz.id)
    }
    db.prepare("DELETE FROM audit_logs WHERE business_id = ?").run(biz.id)
    console.log(`[seed] Cleared content tables for ${biz.name}`)
  }
})()

const summary = {
  businesses: db.prepare("SELECT id, name, visible FROM businesses").all(),
  contentTables: "cleared (awaiting data)",
}
console.log("[seed] Summary:", JSON.stringify(summary, null, 2))

closeDb()
