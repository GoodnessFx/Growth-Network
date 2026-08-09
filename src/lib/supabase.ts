import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The Supabase project + Google OAuth provider are configured out-of-band (the
// project is shared with another app). If the env vars are missing the app still
// renders the public showcase; only Google sign-in is unavailable.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || "https://project-not-configured.supabase.co",
  supabaseAnonKey || "no-anon-key",
)

// The session lives in localStorage managed internally by the Supabase SDK —
// this is the only place tokens are read, so callers never touch storage.
export async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
