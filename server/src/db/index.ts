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

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
