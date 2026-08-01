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
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
