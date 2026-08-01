import { getDb, closeDb } from "./db/index.js"
import { v4 as uuid } from "uuid"
import bcrypt from "bcryptjs"

/**
 * Idempotent seed for the Growth Network public showcase.
 *
 * Provisions exactly one platform owner (`founder@growthnetwork.app`) and the
 * demo businesses, setting their public `visible` flags. Any stray test users
 * and businesses created during earlier development are removed so the app is
 * genuinely read-only for everyone except the owner.
 *
 * Run with: pnpm db:seed
 */

const OWNER_EMAIL = process.env.OWNER_EMAIL || "founder@growthnetwork.app"
const OWNER_NAME = process.env.OWNER_NAME || "Iyamah Goodness"
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Founder123!"

const DEMO_BUSINESSES = [
  {
    id: "60f1434e-220f-4417-98f0-5683bf3df00e",
    name: "BuySmart NG",
    type: "E-commerce",
    visible: 1,
  },
  {
    id: "da56fb84-ddc7-4789-9c41-011bca3492e3",
    name: "Opes Agency",
    type: "Marketing Agency",
    visible: 1,
  },
  {
    id: "a98c48ec-06cf-4a49-a0eb-0ee279f02418",
    name: "Hamdan Global",
    type: "Export / Trade",
    visible: 1,
  },
]

const db = getDb()

// ─── 1. Remove smoke-test artifacts from earlier development ─────────────────
const staleUsers = db
  .prepare("SELECT id FROM users WHERE email IN ('smoke@test.local', 'other@test.local')")
  .all() as Array<{ id: string }>

for (const user of staleUsers) {
  const bizIds = db.prepare("SELECT id FROM businesses WHERE owner_id = ?").all(user.id) as Array<{ id: string }>
  for (const biz of bizIds) {
    const tables: Array<[string, string]> = [
      ["contacts", "business_id"],
      ["deals", "business_id"],
      ["whatsapp_messages", "business_id"],
      ["social_posts", "business_id"],
      ["social_connections", "business_id"],
      ["ad_campaigns", "business_id"],
      ["tracking_events", "business_id"],
      ["automation_rules", "business_id"],
      ["export_shipments", "business_id"],
      ["response_times", "business_id"],
      ["follow_ups", "business_id"],
      ["reports", "business_id"],
    ]
    for (const [table, col] of tables) {
      db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`).run(biz.id)
    }
    db.prepare("DELETE FROM audit_logs WHERE business_id = ? OR user_id = ?").run(biz.id, user.id)
    db.prepare("DELETE FROM businesses WHERE id = ?").run(biz.id)
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id)
}

// ─── 2. Upsert the owner ─────────────────────────────────────────────────────
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
  db.prepare("UPDATE users SET role = 'owner', name = ? WHERE id = ?").run(OWNER_NAME, ownerId)
  console.log(`[seed] Owner ${OWNER_EMAIL} already exists - ensured role 'owner'`)
}

const finalOwner = db.prepare("SELECT id FROM users WHERE email = ?").get(OWNER_EMAIL) as { id: string }

// ─── 3. Upsert demo businesses ───────────────────────────────────────────────
for (const biz of DEMO_BUSINESSES) {
  const existing = db.prepare("SELECT id FROM businesses WHERE id = ?").get(biz.id) as { id: string } | undefined
  if (!existing) {
    db.prepare(
      "INSERT INTO businesses (id, name, type, status, owner_id, visible) VALUES (?, ?, ?, 'active', ?, ?)",
    ).run(biz.id, biz.name, biz.type, finalOwner.id, biz.visible)
    console.log(`[seed] Created business ${biz.name} (${biz.id})`)
  } else {
    db.prepare("UPDATE businesses SET owner_id = ?, visible = ?, updated_at = datetime('now') WHERE id = ?").run(
      finalOwner.id,
      biz.visible,
      biz.id,
    )
    console.log(`[seed] Business ${biz.name} already exists - ensured owner + visible=${biz.visible === 1}`)
  }
}

// ─── 4. Mock content for the demo businesses ────────────────────────────────
// Deterministic, believable rows for every content table so the API-driven
// frontend (analytics, connections, results, public posters) is fully
// populated out of the box. Re-running the seed resets these to the same set.

function mockRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function mockPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function mockDate(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString().slice(0, 19).replace("T", " ")
}

const MOCK_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]
const MOCK_REFERRERS = ["", "", "https://google.com", "https://instagram.com", "https://facebook.com", "https://x.com", "https://linkedin.com"]

interface MockProfile {
  businessId: string
  pages: string[]
  report: {
    revenueBefore: number
    revenueAfter: number
    clientsBefore: number
    clientsAfter: number
    headline: string
    channels: string[]
  }
  contacts: Array<{ name: string; email: string; phone: string; source: string; tags: string[] }>
  deals: Array<{ title: string; value: number; currency: string; stage: string; probability: number; closeInDays: number }>
  messages: Array<{ phone: string; content: string; direction: "outbound" | "inbound"; hoursAgo: number }>
  posts: Array<{ platform: string; content: string; hoursAgo: number }>
  campaigns: Array<{ platform: string; name: string; budget: number; spent: number; impressions: number; clicks: number; conversions: number; status: string }>
  automations: Array<{ name: string; triggerType: string; actionType: string; actionConfig: Record<string, unknown> }>
  shipments: Array<{ orderNumber: string; supplier: string; buyer: string; origin: string; destination: string; productDescription: string; quantity: number; unit: string; totalValue: number; currency: string; incoterm: string; status: string; paymentStatus: string }>
}

const MOCK_PROFILES: MockProfile[] = [
  {
    businessId: "60f1434e-220f-4417-98f0-5683bf3df00e", // BuySmart NG
    pages: ["/", "/products", "/products/colab-kit", "/products/standing-desk", "/products/cables", "/pricing", "/about", "/blog/whatsapp-cta", "/contact"],
    report: {
      revenueBefore: 12400000,
      revenueAfter: 28900000,
      clientsBefore: 120,
      clientsAfter: 340,
      headline: "0.0% to 1.8% pageview-to-purchase rate in 4 months",
      channels: ["Meta Ads", "SEO", "WhatsApp"],
    },
    contacts: [
      { name: "Chiamaka Okafor", email: "chiamaka@gmail.com", phone: "+2348012345001", source: "instagram", tags: ["returning", "wholesale"] },
      { name: "Tunde Bakare", email: "tunde@yandex.com", phone: "+2348022345002", source: "whatsapp", tags: ["warm"] },
      { name: "Amara Eze", email: "amara.eze@outlook.com", phone: "+2348032345003", source: "facebook", tags: ["new"] },
      { name: "Kelechi Nwosu", email: "kelechi.n@gmail.com", phone: "+2348052345004", source: "referral", tags: ["returning"] },
      { name: "Fatima Bello", email: "fatima.bello@yahoo.com", phone: "+2348062345005", source: "google", tags: ["wholesale"] },
      { name: "Segun Adeyemi", email: "segun.adeyemi@gmail.com", phone: "+2348072345006", source: "instagram", tags: ["new"] },
    ],
    deals: [
      { title: "Colab-Kit bundle x50", value: 2450000, currency: "NGN", stage: "won", probability: 100, closeInDays: -12 },
      { title: "Office standing desks x20", value: 1860000, currency: "NGN", stage: "proposal", probability: 70, closeInDays: 9 },
      { title: "Cable restock - wholesale", value: 980000, currency: "NGN", stage: "qualified", probability: 55, closeInDays: 16 },
      { title: "Back-to-school laptop bundles", value: 4100000, currency: "NGN", stage: "negotiation", probability: 65, closeInDays: 21 },
      { title: "Retail shelf display units", value: 640000, currency: "NGN", stage: "lead", probability: 25, closeInDays: 30 },
      { title: "Corporate gift packs x200", value: 3200000, currency: "NGN", stage: "qualified", probability: 50, closeInDays: 24 },
    ],
    messages: [
      { phone: "+2348012345001", content: "Your Colab-Kit bundle has been dispatched. Track: 4PX-NG-8821", direction: "outbound", hoursAgo: 2 },
      { phone: "+2348032345003", content: "Do you restock the standing desks?", direction: "inbound", hoursAgo: 5 },
      { phone: "+2348032345003", content: "Yes! New stock lands Thursday. I can reserve 10 units for you.", direction: "outbound", hoursAgo: 4 },
      { phone: "+2348022345002", content: "Please send the 2026 price list", direction: "inbound", hoursAgo: 9 },
      { phone: "+2348022345002", content: "Attached. Wholesale pricing applies from 10 units.", direction: "outbound", hoursAgo: 8 },
      { phone: "+2348072345006", content: "Your order #GN-4412 was delivered. Enjoy!", direction: "outbound", hoursAgo: 26 },
    ],
    posts: [
      { platform: "instagram", content: "Meet the Colab-Kit: 3 gadgets, 1 cable, zero clutter. DM to order.", hoursAgo: 3 },
      { platform: "instagram", content: "Flat 15% off standing desks this weekend only.", hoursAgo: 27 },
      { platform: "facebook", content: "Why 340 Lagos offices buy their kit from BuySmart.", hoursAgo: 51 },
      { platform: "tiktok", content: "Unboxing the new power bank - 2x your daily charge.", hoursAgo: 75 },
    ],
    campaigns: [
      { platform: "meta", name: "Always-On Conversions - Web", budget: 150000, spent: 128400, impressions: 210000, clicks: 4200, conversions: 148, status: "ACTIVE" },
      { platform: "meta", name: "Retargeting - Site Visitors", budget: 80000, spent: 62400, impressions: 96000, clicks: 1800, conversions: 72, status: "ACTIVE" },
      { platform: "meta", name: "Brand Awareness - Reach", budget: 60000, spent: 41000, impressions: 310000, clicks: 900, conversions: 12, status: "PAUSED" },
      { platform: "tiktok", name: "Spark Ads - Viral CTAs", budget: 90000, spent: 76800, impressions: 260000, clicks: 3300, conversions: 95, status: "ACTIVE" },
      { platform: "google", name: "Search - Non-brand", budget: 110000, spent: 89000, impressions: 140000, clicks: 2600, conversions: 61, status: "ACTIVE" },
    ],
    automations: [
      { name: "WhatsApp welcome", triggerType: "whatsapp_inbound", actionType: "send_message", actionConfig: { channel: "whatsapp", message: "Welcome to BuySmart! Reply 1 for catalog, 2 for order status." } },
      { name: "Abandoned cart follow-up", triggerType: "tracking_event", actionType: "send_message", actionConfig: { channel: "whatsapp", event: "cart_abandon", message: "You left items in your cart - here's a 5% code: BUY5" } },
      { name: "Review request", triggerType: "deal_stage", actionType: "send_message", actionConfig: { channel: "whatsapp", stage: "won", message: "Thanks for your order! How was your experience?" } },
    ],
    shipments: [
      { orderNumber: "EXP-9001", supplier: "Shenzhen Gizmo Co", buyer: "BuySmart NG", origin: "Shenzhen, CN", destination: "Lagos, NG", productDescription: "Smart home gadgets (mixed)", quantity: 1200, unit: "units", totalValue: 18500, currency: "USD", incoterm: "FOB", status: "in_transit", paymentStatus: "partially_paid" },
    ],
  },
  {
    businessId: "da56fb84-ddc7-4789-9c41-011bca3492e3", // Opes Agency
    pages: ["/", "/work", "/services", "/case-studies", "/pricing", "/about", "/contact", "/blog/agency-playbook"],
    report: {
      revenueBefore: 8200000,
      revenueAfter: 19500000,
      clientsBefore: 14,
      clientsAfter: 32,
      headline: "0.0% to 3.1% visitor-to-lead rate in 3 months",
      channels: ["Meta Ads", "LinkedIn", "SEO"],
    },
    contacts: [
      { name: "Bolanle Ade", email: "bolanle@nova.ng", phone: "+2348012345101", source: "linkedin", tags: ["client", "retainer"] },
      { name: "David Mwangi", email: "david@savannah.co.ke", phone: "+254701234102", source: "referral", tags: ["client"] },
      { name: "Ivy Wanjiru", email: "ivy@peakcollective.co.ke", phone: "+254711234103", source: "website", tags: ["lead"] },
      { name: "Adewale Johnson", email: "wale@afrikbank.ng", phone: "+2348022345104", source: "event", tags: ["lead", "enterprise"] },
      { name: "Ngozi Ede", email: "ngozi@brightpath.ng", phone: "+2348032345105", source: "linkedin", tags: ["prospect"] },
      { name: "Samuel Boateng", email: "sam@kentegh.gh", phone: "+233241234106", source: "referral", tags: ["client"] },
    ],
    deals: [
      { title: "Nova Fintech - paid social retainer", value: 3600000, currency: "NGN", stage: "won", probability: 100, closeInDays: -30 },
      { title: "Peak Collective - full-funnel build", value: 5400000, currency: "NGN", stage: "proposal", probability: 75, closeInDays: 8 },
      { title: "Afrikbank - enterprise campaign", value: 9800000, currency: "NGN", stage: "negotiation", probability: 60, closeInDays: 14 },
      { title: "BrightPath Schools - SEO package", value: 1800000, currency: "NGN", stage: "qualified", probability: 50, closeInDays: 20 },
      { title: "Savannah Co - monthly content", value: 2400000, currency: "NGN", stage: "won", probability: 100, closeInDays: -45 },
      { title: "Kente GH - WhatsApp automation", value: 1200000, currency: "NGN", stage: "lead", probability: 30, closeInDays: 28 },
    ],
    messages: [
      { phone: "+2348012345101", content: "New creative round is live in the review folder. Feedback by Friday?", direction: "outbound", hoursAgo: 1 },
      { phone: "+254701234102", content: "Can we bump Q3 budget by 20%?", direction: "inbound", hoursAgo: 6 },
      { phone: "+254701234102", content: "Yes - I'll update the plan and forecast. Expect it by 5pm.", direction: "outbound", hoursAgo: 5 },
      { phone: "+2348022345104", content: "What's included in the enterprise tier?", direction: "inbound", hoursAgo: 12 },
      { phone: "+2348022345104", content: "Sending the one-pager now. Happy to walk through it Thursday.", direction: "outbound", hoursAgo: 11 },
      { phone: "+2348032345105", content: "Your proposal is ready for review.", direction: "outbound", hoursAgo: 30 },
    ],
    posts: [
      { platform: "linkedin", content: "How we cut a fintech's CAC by 38% in one quarter.", hoursAgo: 4 },
      { platform: "linkedin", content: "The 5 metrics every African agency should track weekly.", hoursAgo: 28 },
      { platform: "instagram", content: "Behind the scenes: building a WhatsApp funnel.", hoursAgo: 52 },
      { platform: "facebook", content: "Client win: Peak Collective joins the roster.", hoursAgo: 100 },
    ],
    campaigns: [
      { platform: "meta", name: "Client - Nova Fintech prospecting", budget: 250000, spent: 198000, impressions: 420000, clicks: 8400, conversions: 210, status: "ACTIVE" },
      { platform: "meta", name: "Client - Peak Collective retargeting", budget: 120000, spent: 91000, impressions: 180000, clicks: 3100, conversions: 96, status: "ACTIVE" },
      { platform: "meta", name: "Agency - lead gen", budget: 90000, spent: 72000, impressions: 150000, clicks: 2400, conversions: 44, status: "ACTIVE" },
      { platform: "linkedin", name: "Client - enterprise awareness", budget: 180000, spent: 124000, impressions: 98000, clicks: 1500, conversions: 33, status: "ACTIVE" },
      { platform: "linkedin", name: "Agency - decision makers", budget: 70000, spent: 48000, impressions: 62000, clicks: 900, conversions: 21, status: "PAUSED" },
      { platform: "google", name: "Client - Nova brand search", budget: 100000, spent: 78000, impressions: 210000, clicks: 3100, conversions: 58, status: "ACTIVE" },
    ],
    automations: [
      { name: "Lead welcome", triggerType: "whatsapp_inbound", actionType: "send_message", actionConfig: { channel: "whatsapp", message: "Hi! We're Opes. Tell us your goal and we'll reply with a plan within the hour." } },
      { name: "Proposal follow-up", triggerType: "deal_stage", actionType: "send_message", actionConfig: { channel: "whatsapp", stage: "proposal", message: "Just checking in on the proposal - happy to walk through any section." } },
    ],
    shipments: [],
  },
  {
    businessId: "a98c48ec-06cf-4a49-a0eb-0ee279f02418", // Hamdan Global
    pages: ["/", "/commodities", "/logistics", "/markets", "/about", "/contact", "/docs/incoterms"],
    report: {
      revenueBefore: 1200000,
      revenueAfter: 3400000,
      clientsBefore: 18,
      clientsAfter: 46,
      headline: "0.0% to 4.2% shipment-to-repeat-buyer rate in 6 months",
      channels: ["LinkedIn", "Email", "Trade Shows"],
    },
    contacts: [
      { name: "Omar Al-Farsi", email: "omar@dubaitrade.ae", phone: "+971501234201", source: "linkedin", tags: ["buyer", "repeat"] },
      { name: "Grace Kamau", email: "grace@eastgate.ke", phone: "+254721234202", source: "email", tags: ["buyer"] },
      { name: "Chen Wei", email: "chenw@ningboimp.cn", phone: "+8613800012343", source: "trade-show", tags: ["supplier"] },
      { name: "Fatima Zahra", email: "fatima@casablancaexport.ma", phone: "+212661234204", source: "referral", tags: ["supplier", "repeat"] },
      { name: "Daniel Osei", email: "d.osei@takoradi.gh", phone: "+233241234205", source: "email", tags: ["buyer", "new"] },
    ],
    deals: [
      { title: "Cocoa beans - Q3 contract (80MT)", value: 310000, currency: "USD", stage: "won", probability: 100, closeInDays: -20 },
      { title: "Dried ginger - Dubai (45MT)", value: 168000, currency: "USD", stage: "negotiation", probability: 65, closeInDays: 10 },
      { title: "Shea butter - Mombasa port", value: 94000, currency: "USD", stage: "qualified", probability: 55, closeInDays: 18 },
      { title: "Sesame seeds - Qingdao (60MT)", value: 225000, currency: "USD", stage: "proposal", probability: 70, closeInDays: 12 },
    ],
    messages: [
      { phone: "+971501234201", content: "Shipment HG-1184 left Tema. ETA Dubai: Thursday 09:00 local.", direction: "outbound", hoursAgo: 3 },
      { phone: "+254721234202", content: "Do you have capacity for 40MT before September?", direction: "inbound", hoursAgo: 8 },
      { phone: "+254721234202", content: "Yes - 45MT is available. Sending a provisional booking now.", direction: "outbound", hoursAgo: 7 },
      { phone: "+971501234201", content: "Requesting the certificate of origin for this consignment.", direction: "inbound", hoursAgo: 20 },
      { phone: "+971501234201", content: "Shared via portal. All docs are in the shipment record.", direction: "outbound", hoursAgo: 19 },
    ],
    posts: [
      { platform: "linkedin", content: "Inside the 2026 cocoa harvest: quality scores and farm-gate prices.", hoursAgo: 6 },
      { platform: "linkedin", content: "FOB vs CIF: choosing the right incoterm for West African exports.", hoursAgo: 30 },
      { platform: "x", content: "New: sea-freight rate updates from Tema to Dubai weekly.", hoursAgo: 54 },
    ],
    campaigns: [
      { platform: "linkedin", name: "Buyer outreach - GCC importers", budget: 5000, spent: 3400, impressions: 88000, clicks: 1200, conversions: 28, status: "ACTIVE" },
      { platform: "linkedin", name: "Brand - export credibility", budget: 3000, spent: 2100, impressions: 64000, clicks: 700, conversions: 12, status: "ACTIVE" },
      { platform: "google", name: "Search - agri export lead gen", budget: 4000, spent: 2900, impressions: 76000, clicks: 1100, conversions: 19, status: "ACTIVE" },
    ],
    automations: [
      { name: "Shipment status alert", triggerType: "tracking_event", actionType: "send_message", actionConfig: { channel: "whatsapp", event: "shipment_update", message: "Your shipment just cleared customs - {reference}." } },
      { name: "Document reminder", triggerType: "deal_stage", actionType: "send_message", actionConfig: { channel: "whatsapp", stage: "qualified", message: "Docs needed for this export: certificate of origin, phytosanitary." } },
    ],
    shipments: [
      { orderNumber: "HG-1181", supplier: "Casablanca Export", buyer: "Omar Al-Farsi (Dubai)", origin: "Casablanca, MA", destination: "Jebel Ali, AE", productDescription: "Extra virgin olive oil (bulk)", quantity: 40, unit: "MT", totalValue: 98000, currency: "USD", incoterm: "CFR", status: "delivered", paymentStatus: "paid" },
      { orderNumber: "HG-1182", supplier: "Ningbo Imp & Exp", buyer: "Grace Kamau (Nairobi)", origin: "Ningbo, CN", destination: "Mombasa, KE", productDescription: "FMCG machinery spares", quantity: 12, unit: "units", totalValue: 74000, currency: "USD", incoterm: "CIF", status: "in_transit", paymentStatus: "partially_paid" },
      { orderNumber: "HG-1183", supplier: "Tema Agro Exports", buyer: "Eastgate Trading (Mombasa)", origin: "Tema, GH", destination: "Mombasa, KE", productDescription: "Premium cocoa beans", quantity: 80, unit: "MT", totalValue: 310000, currency: "USD", incoterm: "FOB", status: "in_transit", paymentStatus: "paid" },
      { orderNumber: "HG-1184", supplier: "Tema Agro Exports", buyer: "Omar Al-Farsi (Dubai)", origin: "Tema, GH", destination: "Jebel Ali, AE", productDescription: "Dried ginger", quantity: 25, unit: "MT", totalValue: 96000, currency: "USD", incoterm: "FOB", status: "processing", paymentStatus: "pending" },
    ],
  },
]

const mockContentTables: Array<[string, string]> = [
  ["contacts", "business_id"],
  ["deals", "business_id"],
  ["whatsapp_messages", "business_id"],
  ["social_posts", "business_id"],
  ["ad_campaigns", "business_id"],
  ["tracking_events", "business_id"],
  ["automation_rules", "business_id"],
  ["export_shipments", "business_id"],
  ["response_times", "business_id"],
  ["follow_ups", "business_id"],
  ["reports", "business_id"],
]

const mockRowCounts: Record<string, number> = {}

for (const profile of MOCK_PROFILES) {
  const businessId = profile.businessId
  const rng = mockRng(businessId.length * 7919 + 17)
  const inserted: Record<string, number> = {}

  for (const [table, col] of mockContentTables) {
    db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`).run(businessId)
  }

  // Contacts
  const contactIds: string[] = []
  for (const c of profile.contacts) {
    const id = uuid()
    contactIds.push(id)
    db.prepare(
      "INSERT INTO contacts (id, business_id, name, email, phone, source, tags, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, '{}', datetime('now'))",
    ).run(id, businessId, c.name, c.email, c.phone, c.source, JSON.stringify(c.tags))
  }
  inserted.contacts = contactIds.length

  // Deals
  for (const d of profile.deals) {
    const contactId = contactIds.length > 0 ? mockPick(rng, contactIds) : null
    db.prepare(
      "INSERT INTO deals (id, business_id, contact_id, title, value, currency, stage, probability, expected_close_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    ).run(uuid(), businessId, contactId, d.title, d.value, d.currency, d.stage, d.probability, mockDate(d.closeInDays * 86400000))
  }
  inserted.deals = profile.deals.length

  // WhatsApp messages
  for (const m of profile.messages) {
    const contactId = contactIds.length > 0 ? mockPick(rng, contactIds) : null
    db.prepare(
      "INSERT INTO whatsapp_messages (id, business_id, contact_id, contact_phone, direction, message_type, content, status, whatsapp_message_id, created_at) VALUES (?, ?, ?, ?, ?, 'text', ?, 'sent', ?, ?)",
    ).run(uuid(), businessId, contactId, m.phone, m.direction, m.content, `wa_seed_${uuid().slice(0, 8)}`, mockDate(m.hoursAgo * 3600000))
  }
  inserted.whatsapp_messages = profile.messages.length

  // Social posts
  for (const p of profile.posts) {
    db.prepare(
      "INSERT INTO social_posts (id, business_id, platform, post_id, content, media_urls, scheduled_for, published_at, status, metrics, created_at) VALUES (?, ?, ?, ?, ?, '[]', NULL, ?, 'published', '{}', ?)",
    ).run(uuid(), businessId, p.platform, `seed_${p.platform}_${uuid().slice(0, 8)}`, p.content, mockDate(p.hoursAgo * 3600000), mockDate(p.hoursAgo * 3600000))
  }
  inserted.social_posts = profile.posts.length

  // Stored ad campaigns
  for (const c of profile.campaigns) {
    const startDaysAgo = 40 + Math.floor(rng() * 60)
    db.prepare(
      "INSERT INTO ad_campaigns (id, business_id, platform, name, status, budget, spent, impressions, clicks, conversions, platform_id, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    ).run(uuid(), businessId, c.platform, c.name, c.status, c.budget, c.spent, c.impressions, c.clicks, c.conversions, `seed_${c.platform}_${uuid().slice(0, 8)}`, mockDate(startDaysAgo * 86400000), mockDate(7 * 86400000))
  }
  inserted.ad_campaigns = profile.campaigns.length

  // Tracking events: ~28 days of traffic + a live spike in the last hour
  const eventTypes = ["pageview", "pageview", "pageview", "pageview", "pageview", "click", "click", "button_click", "view", "view", "form_submit"]
  let trackingCount = 0
  const todayDow = new Date().getDay()
  for (let d = 0; d < 28; d++) {
    const dow = (todayDow - d + 7) % 7
    const weekendDip = dow === 0 || dow === 6 ? 0.55 : 1
    const eventsToday = Math.max(6, Math.floor((9 + rng() * 7) * weekendDip))
    const visitors: Array<{ visitorId: string; sessionId: string }> = []
    const vCount = Math.max(3, Math.round(eventsToday / 3))
    for (let v = 0; v < vCount; v++) {
      visitors.push({ visitorId: `vis_seed_${uuid().slice(0, 8)}`, sessionId: `sess_seed_${uuid().slice(0, 8)}` })
    }
    for (let e = 0; e < eventsToday; e++) {
      const visitor = visitors[e % visitors.length]
      const msAgo = d * 86400000 + Math.floor(rng() * 86400000)
      db.prepare(
        "INSERT INTO tracking_events (id, business_id, session_id, visitor_id, event_type, page_url, referrer, metadata, ip, user_agent, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        uuid(),
        businessId,
        visitor.sessionId,
        visitor.visitorId,
        mockPick(rng, eventTypes),
        mockPick(rng, profile.pages),
        mockPick(rng, MOCK_REFERRERS),
        JSON.stringify({ seeded: true }),
        "102.89.23.14",
        mockPick(rng, MOCK_AGENTS),
        mockDate(msAgo),
      )
      trackingCount++
    }
  }
  for (let e = 0; e < 10; e++) {
    const visitor = { visitorId: `vis_seed_${uuid().slice(0, 8)}`, sessionId: `sess_seed_${uuid().slice(0, 8)}` }
    db.prepare(
      "INSERT INTO tracking_events (id, business_id, session_id, visitor_id, event_type, page_url, referrer, metadata, ip, user_agent, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      uuid(),
      businessId,
      visitor.sessionId,
      visitor.visitorId,
      mockPick(rng, eventTypes),
      mockPick(rng, profile.pages),
      mockPick(rng, MOCK_REFERRERS),
      JSON.stringify({ seeded: true }),
      "102.89.23.14",
      mockPick(rng, MOCK_AGENTS),
      mockDate(Math.floor(rng() * 3600000)),
    )
    trackingCount++
  }
  inserted.tracking_events = trackingCount

  // Automation rules
  for (const a of profile.automations) {
    db.prepare(
      "INSERT INTO automation_rules (id, business_id, name, trigger_type, trigger_config, action_type, action_config, enabled, created_at) VALUES (?, ?, ?, ?, '{}', ?, ?, 1, datetime('now'))",
    ).run(uuid(), businessId, a.name, a.triggerType, a.actionType, JSON.stringify(a.actionConfig))
  }
  inserted.automation_rules = profile.automations.length

  // Export shipments
  for (const s of profile.shipments) {
    db.prepare(
      "INSERT INTO export_shipments (id, business_id, order_number, supplier, buyer, origin, destination, product_description, quantity, unit, total_value, currency, incoterm, status, estimated_delivery, actual_delivery, documents, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, '[]', ?, datetime('now'))",
    ).run(uuid(), businessId, s.orderNumber, s.supplier, s.buyer, s.origin, s.destination, s.productDescription, s.quantity, s.unit, s.totalValue, s.currency, s.incoterm, s.status, mockDate(s.status === "delivered" ? 21 * 86400000 : 14 * 86400000), s.paymentStatus)
  }
  inserted.export_shipments = profile.shipments.length

  // Response times
  for (let i = 0; i < 6; i++) {
    const target = 300
    const seconds = Math.floor(40 + rng() * 900)
    db.prepare(
      "INSERT INTO response_times (id, business_id, channel, received_at, responded_at, response_time_seconds, breached, target_seconds, created_at) VALUES (?, ?, 'whatsapp', ?, ?, ?, ?, ?, ?)",
    ).run(uuid(), businessId, mockDate((1 + i * 20) * 3600000), mockDate((1 + i * 20) * 3600000 - seconds * 1000), seconds, seconds > target ? 1 : 0, target, datetimeNow())
  }
  inserted.response_times = 6

  // Follow-ups
  for (let i = 0; i < 3; i++) {
    const contactId = contactIds.length > 0 ? contactIds[i % contactIds.length] : null
    db.prepare(
      "INSERT INTO follow_ups (id, business_id, contact_id, scheduled_for, executed_at, status, message, channel, created_at) VALUES (?, ?, ?, ?, NULL, 'pending', ?, 'whatsapp', datetime('now'))",
    ).run(uuid(), businessId, contactId, mockDate((i + 1) * 86400000), "Just following up on our last conversation - happy to help if you have questions.")
  }
  inserted.follow_ups = 3

  // Growth snapshot report (drives the public poster)
  const reportId = uuid()
  db.prepare(
    "INSERT INTO reports (id, business_id, type, period_start, period_end, metrics, before_image, after_image, source, generated_at) VALUES (?, ?, 'growth-snapshot', ?, ?, ?, NULL, NULL, 'self-reported', datetime('now'))",
  ).run(
    reportId,
    businessId,
    mockDate(90 * 86400000).slice(0, 10),
    mockDate(0).slice(0, 10),
    JSON.stringify(profile.report),
  )
  inserted.reports = 1

  mockRowCounts[businessId] = Object.values(inserted).reduce((s, n) => s + n, 0)
  console.log(
    `[seed] Mock data for ${db.prepare("SELECT name FROM businesses WHERE id = ?").get(businessId)?.name}: ${JSON.stringify(inserted)}`,
  )
}

function datetimeNow(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ")
}

const summary = {
  users: db.prepare("SELECT id, email, role FROM users").all(),
  businesses: db.prepare("SELECT id, name, visible FROM businesses").all(),
  mockRows: mockRowCounts,
}
console.log("[seed] Summary:", JSON.stringify(summary, null, 2))

closeDb()
