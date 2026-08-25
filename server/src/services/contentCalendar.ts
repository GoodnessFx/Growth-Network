import { createHash } from "node:crypto"

/**
 * Content calendar generator.
 *
 * Deliberately rule-based and deterministic (seeded by business + date + slot)
 * rather than calling an LLM: there is no external AI integration in this
 * codebase, and a template engine cannot invent facts the way a language model
 * can. Every post is composed ONLY from the business's real DB fields (name,
 * type) plus fixed editorial copy — no phone numbers, addresses, prices, or
 * statistics are ever fabricated, and `validateBody` guards against that.
 *
 * Dedup: each post is stored with a sha-256 `content_hash`. When generating a
 * slot, the engine retries with a different seed until the composed text has no
 * matching hash already stored for that business. Re-running generation for the
 * same date range only fills gaps (existing slots are skipped), so the calendar
 * can never repeat itself.
 */

export interface BusinessInput {
  id: string
  name: string
  type: string
}

export interface GeneratedPost {
  scheduled_date: string
  slot: number
  platform: string
  title: string | null
  body: string
  content_hash: string
}

export const DEFAULT_PLATFORMS = ["instagram", "facebook", "linkedin", "x", "threads"]

export const SLOTS_PER_DAY = 3

// ─── Hashing / seeding ───────────────────────────────────────────────────────

export function contentHash(body: string): string {
  const normalized = body.toLowerCase().replace(/\s+/g, " ").trim()
  return createHash("sha256").update(normalized).digest("hex")
}

function hashStr(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

// ─── Copy pools (fixed editorial copy, no invented specifics) ─────────────────

const OPENERS = [
  "Is your supply chain running on autopilot?",
  "The best time to plan ahead was last quarter.",
  "Every deal starts with a question nobody asked out loud.",
  "Consistency beats intensity in business growth.",
  "A clear process beats a clever shortcut, every time.",
  "What is one thing you could simplify this week?",
  "Growth rarely announces itself — it shows up as small, repeated wins.",
  "The businesses that win are the ones that show up every single day.",
  "Before you scale, make sure the foundation is boring and reliable.",
  "Most delays in trade aren't about the deal — they're about the details.",
  "Trust is the cheapest currency and the slowest to build.",
  "A partner who communicates is worth more than one who never misses a price.",
  "Good documentation is a silent teammate.",
  "The market rewards those who move with information, not guesswork.",
  "Every shipment has a story between 'ordered' and 'delivered'.",
  "The right process turns chaos into a checklist.",
  "Ask the question the room is avoiding. That is where the opportunity is.",
  "Slow is smooth, and smooth is fast — especially across borders.",
]

const BODY_BY_TYPE: Record<string, string[]> = {
  export: [
    "Export trade works when documents, payment terms, and delivery dates all line up before the goods move.",
    "A successful export starts with compliance — the right paperwork prevents the wrong surprises at the border.",
    "For exporters, the shipment isn't done at the port; it's done when the buyer confirms receipt.",
    "Incoterms, currency, and inspection schedules decide whether an export makes money or just moves boxes.",
    "The best exporters treat documentation as part of the product, not an afterthought.",
    "An export partner who flags risks early protects your margin better than one who promises it away.",
    "Every border crossing rewards preparation: correct forms, accurate weights, and realistic dates.",
    "The difference between a smooth export and a stalled one is usually ten minutes of correct preparation.",
    "Reliable buyers are earned with consistent delivery, not the other way around.",
    "Trade finance moves faster when the paperwork already matches what the bank expects.",
  ],
  energy: [
    "Reliable energy is a business enabler — downtime is a cost most budgets never price in.",
    "Energy projects succeed when planning, safety, and supply chain are treated as one system.",
    "An energy partner who plans for maintenance keeps your operations running past the forecast.",
    "Energy resilience is built in the details: capacity, fuel, delivery schedules, and contingency.",
    "The cheapest unit of energy is the one you never lose to an outage.",
    "Continuity of supply comes from relationships, not from last-minute spot purchases.",
    "A maintenance calendar is cheaper than an emergency call-out, every single time.",
    "Energy decisions are really risk decisions — visibility is the first form of control.",
    "Procurement and energy belong in the same conversation, because outages cost more than fuel.",
    "A clear schedule of needs lets suppliers deliver better prices and steadier supply.",
  ],
  trading: [
    "Trade moves on timing, trust, and accurate paperwork. Get those three right and the margins follow.",
    "In trading, the window between opportunity and expiry is short. Preparedness wins.",
    "Buyers want certainty about what they're getting; sellers want certainty about payment. Great trading solves both.",
    "Price is negotiated at the table; success is decided by logistics and follow-through.",
    "A trading relationship that survives one difficult shipment is worth more than ten easy orders.",
    "The best trades are agreed in minutes because the groundwork was done in weeks.",
    "A good trading partner checks the details twice so you don't have to.",
    "Margins are protected by inspection, insurance, and timing — not by hope.",
    "When both sides understand the terms, renegotiation becomes the exception, not the rule.",
    "Trust in trade is built shipment by shipment, then leveraged deal by deal.",
  ],
  procurement: [
    "Solid procurement keeps projects moving: the right goods, at the right quality, when they're actually needed.",
    "Good procurement saves money before the invoice arrives — by asking the right questions up front.",
    "Procurement is about more than price. Reliable supply, clear specs, and honest delivery windows matter just as much.",
    "A strong procurement process protects margins long before a single order is placed.",
    "When suppliers understand your requirements, fewer things get reordered, reworked, or returned.",
    "Procurement is a relationship business before it is a transactions business.",
    "The real cost of a supplier is delivered cost, not the quoted price.",
    "Clear specifications are the cheapest form of insurance in any purchase.",
    "A shortlist of trusted suppliers beats a directory of strangers every time.",
    "Good procurement turns unpredictable needs into a predictable pipeline.",
  ],
}

const GENERIC_BODIES = [
  "Small consistent actions, done weekly, compound into results clients actually notice.",
  "Businesses that communicate progress build trust faster than those that only celebrate wins.",
  "A simple dashboard beats a complicated report. Clarity is a feature.",
  "When every stakeholder sees the same numbers, meetings get shorter and decisions get faster.",
  "The gap between 'we should' and 'we did' is a process.",
  "The best time to fix a process is before it becomes a bottleneck.",
  "Growth is a series of unglamorous checklists executed on time.",
  "What gets measured quietly improves.",
  "Clients forgive mistakes; they rarely forgive silence.",
  "A business that plans its week is easier to take seriously.",
]

const NAME_LINES = [
  "That is the standard we work to at {name}.",
  "It is the kind of discipline {name} brings to every engagement.",
  "This is where {name} earns its keep.",
  "It's a principle {name} builds its calendar around.",
  "Ask us about it at {name}.",
]

const CTAS = [
  "DM us to talk about your current setup.",
  "Book a conversation — we'll map out the gaps together.",
  "Reach out and tell us what you're planning this quarter.",
  "Send us a message; we'd love to see where we can help.",
  "Have a question? We're one message away.",
  "Let's talk about what a smoother process could save you.",
]

const HASHTAGS: Record<string, string> = {
  export: "#ExportTrade #Logistics #InternationalTrade #BusinessGrowth",
  energy: "#Energy #Reliability #BusinessGrowth #SME",
  trading: "#Trade #Logistics #BusinessGrowth #SME",
  procurement: "#Procurement #SupplyChain #BusinessGrowth #SME",
  generic: "#BusinessGrowth #SME",
}

function typeKey(type: string): string {
  const t = type.toLowerCase()
  if (t.includes("export")) return "export"
  if (t.includes("energy")) return "energy"
  if (t.includes("trade")) return "trading"
  if (t.includes("procurement")) return "procurement"
  return "generic"
}

// ─── Validation ──────────────────────────────────────────────────────────────

const FORBIDDEN_PATTERNS: RegExp[] = [
  /(?:₦|NGN|US\$|\$|£|€)\s?\d[\d,]*(?:\.\d+)?/i, // currency amounts (symbol-prefixed)
  /\b\d[\d,]*(?:\.\d+)?\s?(?:naira|ngn|usd|dollars?|euros?|pounds?)\b/i, // worded currency amounts
  /\b\d+(?:\.\d+)?\s?%(?!\w)/, // percentage claims (incl. decimals)
  /\+\d[\d\s-]{6,}/, // international phone numbers
  /(?:^|\D)0\d{2,4}(?:[-\s.]?)\d{3}(?:[-\s.]?)\d{3,4}(?:\D|$)/, // local (Nigerian) phone numbers
  /[\w.+-]+@[\w-]+\.[\w.]+/, // email addresses
  /\b\d{6,}\b/, // long numeric strings (ids/accounts)
]

/**
 * Returns a list of reasons the body is invalid. An empty array means it
 * passes. Guards against generated or edited content that invents specifics the
 * calendar must never fabricate.
 */
export function validateBody(body: string, title: string | null): string[] {
  const problems: string[] = []
  const combined = `${title || ""} ${body}`
  if (combined.trim().length < 20) problems.push("content is too short")
  if (combined.trim().length > 2200) problems.push("content is too long")
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(combined)) problems.push("content contains a fabricated detail (phone, price, percentage, or account number)")
  }
  return problems
}

// ─── Composition ─────────────────────────────────────────────────────────────

function compose(business: BusinessInput, rng: () => number): { body: string; title: string | null } {
  const opener = pick(rng, OPENERS)
  const key = typeKey(business.type)
  const pool = BODY_BY_TYPE[key] || GENERIC_BODIES
  const body = pick(rng, pool)
  const insight = pick(rng, GENERIC_BODIES)
  const cta = pick(rng, CTAS)
  const tags = HASHTAGS[key] || HASHTAGS.generic!

  const parts: string[] = []
  if (rng() < 0.45) {
    parts.push(`[${business.name}] ${opener}`)
  } else {
    parts.push(opener)
  }
  parts.push(body)
  if (rng() < 0.3) parts.push(insight)
  if (rng() < 0.4) parts.push(pick(rng, NAME_LINES).replace("{name}", business.name))
  parts.push(cta)
  parts.push("")
  parts.push(tags)

  return { body: parts.join(" "), title: null }
}

/**
 * Generate a single post for a business/date/slot, retrying with different
 * seeds until the composed body hashes to something not already in `isUsed`.
 * Returns null if a unique candidate could not be found within the attempt cap.
 */
export function generatePost(
  business: BusinessInput,
  date: string,
  slot: number,
  isUsed: (hash: string) => boolean,
): GeneratedPost | null {
  const baseSeed = hashStr(`${business.id}|${date}|${slot}`)
  const platform = DEFAULT_PLATFORMS[(baseSeed + slot) % DEFAULT_PLATFORMS.length]!

  for (let attempt = 0; attempt < 60; attempt++) {
    const rng = mulberry32(baseSeed + attempt * 7919)
    const { body, title } = compose(business, rng)
    if (validateBody(body, title).length > 0) continue
    const hash = contentHash(body)
    if (isUsed(hash)) continue
    return { scheduled_date: date, slot, platform, title, body, content_hash: hash }
  }
  return null
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}
