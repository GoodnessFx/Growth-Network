import Database from "better-sqlite3"
import path from "node:path"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

let supabaseAdmin: SupabaseClient | null = null
let sqliteDb: Database | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdmin
}

export function getSupabaseAuth(token: string): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

export function getDb(): Database {
  if (sqliteDb) return sqliteDb

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "growth-network.db")
  sqliteDb = new Database(dbPath, { readonly: false })
  // Enable WAL mode for better concurrency; ignore errors if already set.
  try {
    sqliteDb.pragma("journal_mode = WAL")
  } catch {}

  return sqliteDb
}
