/**
 * Growth Network — idempotent seed script.
 *
 * Two-role model (as of Aug 2026):
 *   - role: "operator"  → the agency/founder who manages the portfolio
 *   - role: "owner"     → an individual business owner logging in to run their own business
 *
 * Auth is Supabase Google OAuth for real users. This seed manages:
 *   1. Demo businesses (real client businesses, unchanged)
 *   2. A profiles table row for each demo user so role-based routing works
 *      without requiring a real Google login during local development.
 *
 * Run with: pnpm db:seed
 *
 * NOTE: The profiles table must exist in Supabase. If it doesn't, the seed
 * skips profile upserts gracefully and logs a warning.
 *
 * Demo credentials (for local dev / Figma Make preview):
 *   Operator login: use the dummy sign-in button on the Auth page (role = "owner" / admin)
 *   Owner login:    same dummy sign-in, role determined by Supabase profile
 */

import "dotenv/config"
import { getSupabaseAdmin } from "./db/index.js"

// ── Real client businesses (unchanged from previous seed) ─────────────────
const DEMO_BUSINESSES = [
  {
    id: "60f1434e-220f-4417-98f0-5683bf3df00e",
    name: "BuySmart Procurement Limited",
    type: "Procurement",
    visible: true,
  },
  {
    id: "15e7d817-faef-4551-aa17-26053116169d",
    name: "Goodman & Goldsmith",
    type: "Trading",
    visible: true,
  },
  {
    id: "da56fb84-ddc7-4789-9c41-011bca3492e3",
    name: "OPES (Oguntimehin Procurement & Energy Services)",
    type: "Procurement & Energy",
    visible: true,
  },
  {
    id: "a98c48ec-06cf-4a49-a0eb-0ee279f02418",
    name: "Export Trade",
    type: "Export / Trade",
    visible: true,
  },
]

/**
 * Demo owner accounts — two Owner-role users, each scoped to one business.
 * These rows go into a `profiles` table (user_id, role, business_id, name).
 * The dummy sign-in in AuthContext.tsx sets role = "owner" (operator).
 * These demo profiles are for the Owner dashboard demo flow.
 *
 * In production, profiles are created/updated on first Google OAuth sign-in
 * via a Supabase trigger or the auth middleware.
 */
const DEMO_PROFILES = [
  {
    id: "demo-operator-001",
    user_id: "demo-operator-001",
    role: "operator",
    name: "Goodness Iyamah",
    email: "operator@growthnet.demo",
    business_id: null,   // operator sees all businesses
  },
  {
    id: "demo-owner-buysmart",
    user_id: "demo-owner-buysmart",
    role: "owner",
    name: "BuySmart Owner",
    email: "owner-buysmart@growthnet.demo",
    business_id: "60f1434e-220f-4417-98f0-5683bf3df00e",
  },
  {
    id: "demo-owner-goodman",
    user_id: "demo-owner-goodman",
    role: "owner",
    name: "Goodman & Goldsmith Owner",
    email: "owner-goodman@growthnet.demo",
    business_id: "15e7d817-faef-4551-aa17-26053116169d",
  },
]

async function seed() {
  const supabase = getSupabaseAdmin()

  console.log("[seed] Starting Growth Network seed (two-role model)...")

  // ── 1. Upsert demo businesses ─────────────────────────────────────────
  for (const biz of DEMO_BUSINESSES) {
    const { error } = await supabase
      .from("businesses")
      .upsert(
        {
          id: biz.id,
          name: biz.name,
          type: biz.type,
          status: "active",
          owner_id: null,
          visible: biz.visible ? 1 : 0,
        },
        { onConflict: "id" },
      )

    if (error) {
      console.error(`[seed] Failed to upsert business ${biz.name}:`, error.message)
    } else {
      console.log(`[seed] ✓ Business: ${biz.name}`)
    }
  }

  // ── 2. Upsert demo profiles (role + business scoping) ─────────────────
  // Try to upsert into a `profiles` table. If the table doesn't exist yet
  // (fresh Supabase project), log a warning and continue — don't crash.
  for (const profile of DEMO_PROFILES) {
    const { error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "user_id" })

    if (error) {
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        console.warn("[seed] ⚠ profiles table not found — skipping profile seed. Create it with:")
        console.warn("  create table profiles (")
        console.warn("    id uuid primary key default gen_random_uuid(),")
        console.warn("    user_id text unique not null,")
        console.warn("    role text not null default 'owner',")
        console.warn("    name text,")
        console.warn("    email text,")
        console.warn("    business_id uuid references businesses(id)")
        console.warn("  );")
        break // Don't repeat the warning for every profile
      } else {
        console.error(`[seed] Failed to upsert profile ${profile.name}:`, error.message)
      }
    } else {
      console.log(`[seed] ✓ Profile: ${profile.name} (role: ${profile.role})`)
    }
  }

  // ── 3. Summary ────────────────────────────────────────────────────────
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, visible")

  console.log("\n[seed] Done. Businesses in DB:")
  businesses?.forEach(b => console.log(`  - ${b.name} (visible: ${b.visible === 1})`))

  console.log("\n[seed] Demo roles:")
  console.log("  Operator (full portfolio view):  log in with the dummy sign-in button")
  console.log("  Owner (BuySmart):                demo-owner-buysmart profile")
  console.log("  Owner (Goodman & Goldsmith):     demo-owner-goodman profile")
  console.log("\n  Both dashboard flows are explorable via the dummy sign-in on the Auth page.")
}

seed().catch(err => {
  console.error("[seed] Fatal error:", err)
  process.exit(1)
})
