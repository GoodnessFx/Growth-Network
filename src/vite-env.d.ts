/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Deployed API origin (option b) — e.g. https://growth-network-api.up.railway.app */
  readonly VITE_API_URL?: string
  /** Supabase project URL (shared project — Google sign-in provider) */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon/publishable key */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Google OAuth client ID (reference only — the SDK uses Supabase's provider) */
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
