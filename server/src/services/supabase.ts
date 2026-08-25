import { createClient } from "@supabase/supabase-js"

// The backend verifies Supabase-issued access tokens via supabase.auth.getUser()
// (server-side token validation against the shared project). The anon key is
// publishable — safe to embed — and no JWT secret is needed for this flow.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[GN] WARNING: SUPABASE_URL / SUPABASE_ANON_KEY not set — all API auth will reject requests. " +
      "Set them (server-side names, or VITE_ variants as fallback) to enable Google sign-in.",
  )
}

export const supabase = createClient(
  SUPABASE_URL || "https://project-not-configured.supabase.co",
  SUPABASE_ANON_KEY || "no-anon-key",
)
