import "dotenv/config"
import { getDb, closeDb } from "./db/index.js"
import { v4 as uuid } from "uuid"
import bcrypt from "bcryptjs"

/**
 * Idempotent seed for the Growth Network public showcase.
 *
 * Provisions exactly one platform owner (`founder@growthnetwork.app`) and the
 * four real client businesses, setting their public `visible` flags. Any stray
 * test users and businesses created during earlier development are removed.
 *
 * Content tables are deliberately kept EMPTY: these are real clients, so the
 * app shows an honest "awaiting data" state until real data is connected.
 * No fabricated figures are seeded.
 *
 * Run with: pnpm db:seed
 */

const OWNER_EMAIL = process.env.OWNER_EMAIL || "founder@growthnetwork.app"
const OWNER_NAME = process.env.OWNER_NAME || "Iyamah Goodness"
const OWNER_PASSWORD = process.env.OWNER_PASSWORD

if (!OWNER_PASSWORD) {
  console.error(
    "[seed] OWNER_PASSWORD is not set. Set OWNER_PASSWORD (strong, unique) in your environment before seeding — it is never committed to the repo.",
  )
  process.exit(1)
}

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

// ─── 1. Upsert the owner ─────────────────────────────────────────────────────
const ownerId = (db.prepare("SELECT id FROM users WHERE email = ?").get(OWNER_EMAIL) as { id: string } | undefined)?.id
if (!ownerId) {
  db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, 'owner')").run(
    uuid(),
    OWNER_EMAIL,
    OWNER_NAME,
    await bcrypt.hash(OWNER_PASSWORD, 10),
  )
  console.log(`[seed] Created owner ${OWNER_EMAIL}`)
} else {
  db.prepare("UPDATE users SET role = 'owner', name = ?, password_hash = ? WHERE id = ?").run(
    OWNER_NAME,
    await bcrypt.hash(OWNER_PASSWORD, 10),
    ownerId,
  )
  console.log(`[seed] Owner ${OWNER_EMAIL} exists - ensured role 'owner' and refreshed password from OWNER_PASSWORD`)
}

const finalOwner = db.prepare("SELECT id FROM users WHERE email = ?").get(OWNER_EMAIL) as { id: string }

db.transaction(() => {
  // ─── 2. Remove smoke-test artifacts from earlier development ───────────────
  const staleUsers = db
    .prepare("SELECT id FROM users WHERE email IN ('smoke@test.local', 'other@test.local')")
    .all() as Array<{ id: string }>

  for (const user of staleUsers) {
    const bizIds = db.prepare("SELECT id FROM businesses WHERE owner_id = ?").all(user.id) as Array<{ id: string }>
    for (const biz of bizIds) {
      for (const [table, col] of CONTENT_TABLES) {
        db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`).run(biz.id)
      }
      db.prepare("DELETE FROM audit_logs WHERE business_id = ? OR user_id = ?").run(biz.id, user.id)
      db.prepare("DELETE FROM businesses WHERE id = ?").run(biz.id)
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(user.id)
  }

  // ─── 3. Upsert the real client businesses ──────────────────────────────────
  for (const biz of DEMO_BUSINESSES) {
    const existing = db.prepare("SELECT id FROM businesses WHERE id = ?").get(biz.id) as { id: string } | undefined
    if (!existing) {
      db.prepare(
        "INSERT INTO businesses (id, name, type, status, owner_id, visible) VALUES (?, ?, ?, 'active', ?, ?)",
      ).run(biz.id, biz.name, biz.type, finalOwner.id, biz.visible)
      console.log(`[seed] Created business ${biz.name} (${biz.id})`)
    } else {
      db.prepare("UPDATE businesses SET owner_id = ?, name = ?, type = ?, visible = ?, updated_at = datetime('now') WHERE id = ?").run(
        finalOwner.id,
        biz.name,
        biz.type,
        biz.visible,
        biz.id,
      )
      console.log(`[seed] Business ${biz.name} already exists - ensured owner + visible=${biz.visible === 1}`)
    }
  }

  // ─── 4. Honest content sweep ──────────────────────────────────────────────
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
  users: db.prepare("SELECT id, email, role FROM users").all(),
  businesses: db.prepare("SELECT id, name, visible FROM businesses").all(),
  contentTables: "cleared (awaiting data)",
}
console.log("[seed] Summary:", JSON.stringify(summary, null, 2))

closeDb()
