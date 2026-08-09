import Database from "better-sqlite3"
import path from "node:path"
import fs from "node:fs"
import { SCHEMA_SQL } from "./schema.js"

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "growth-network.db")
  const dbDir = path.dirname(dbPath)

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  db.exec(SCHEMA_SQL)
  migrate(db)

  return db
}

/**
 * In-place migrations for databases created before a schema column existed.
 * CREATE TABLE IF NOT EXISTS does not add columns to existing tables, so we
 * ALTER and swallow the "duplicate column" error.
 */
function migrate(db: Database.Database): void {
  const cols = db.pragma("table_info(social_connections)") as Array<{ name: string }>
  const names = new Set(cols.map((c) => c.name))
  if (!names.has("account_name")) {
    try {
      db.exec("ALTER TABLE social_connections ADD COLUMN account_name TEXT")
    } catch {}
  }
  if (!names.has("expires_at")) {
    try {
      db.exec("ALTER TABLE social_connections ADD COLUMN expires_at TEXT")
    } catch {}
  }

  const reportCols = db.pragma("table_info(reports)") as Array<{ name: string }>
  const reportNames = new Set(reportCols.map((c) => c.name))
  if (!reportNames.has("source")) {
    try {
      db.exec("ALTER TABLE reports ADD COLUMN source TEXT NOT NULL DEFAULT 'self-reported'")
    } catch {}
  }

  const bizCols = db.pragma("table_info(businesses)") as Array<{ name: string }>
  const bizNames = new Set(bizCols.map((c) => c.name))
  if (!bizNames.has("visible")) {
    try {
      db.exec("ALTER TABLE businesses ADD COLUMN visible INTEGER NOT NULL DEFAULT 1")
    } catch {}
  }

  const calCols = db.pragma("table_info(content_calendar)") as Array<{ name: string }>
  const calNames = new Set(calCols.map((c) => c.name))
  if (!calNames.has("media_asset_id")) {
    try {
      db.exec("ALTER TABLE content_calendar ADD COLUMN media_asset_id TEXT")
    } catch {}
  }
  if (!calNames.has("publish_status")) {
    try {
      db.exec("ALTER TABLE content_calendar ADD COLUMN publish_status TEXT NOT NULL DEFAULT 'pending'")
    } catch {}
  }
  if (!calNames.has("published_at")) {
    try {
      db.exec("ALTER TABLE content_calendar ADD COLUMN published_at TEXT")
    } catch {}
  }
  if (!calNames.has("publish_error")) {
    try {
      db.exec("ALTER TABLE content_calendar ADD COLUMN publish_error TEXT")
    } catch {}
  }

  // Auth moved to Supabase (Google-only): the legacy `users` table with
  // password hashes is gone. `businesses.owner_id` referenced users(id), so on
  // databases created before the switch we rebuild the table without the FK and
  // drop the users table. The new schema already defines owner_id as a plain
  // nullable TEXT column for fresh databases.
  const hasUsersTable = !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
  if (hasUsersTable) {
    db.pragma("foreign_keys = OFF")
    db.exec(`
      CREATE TABLE businesses_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        owner_id TEXT,
        domain TEXT,
        logo TEXT,
        visible INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO businesses_new SELECT id, name, type, status, owner_id, domain, logo, visible, created_at, updated_at FROM businesses;
      DROP TABLE businesses;
      ALTER TABLE businesses_new RENAME TO businesses;
      DROP TABLE IF EXISTS users;
    `)
    db.pragma("foreign_keys = ON")
    db.exec("CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id)")
  }
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
