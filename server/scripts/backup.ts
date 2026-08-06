/**
 * SQLite backup script. Copies the live database (with WAL checkpoint) into
 * `BACKUP_DIR` (default `./data/backups`) with a timestamped name and prunes
 * backups older than BACKUP_RETENTION_DAYS (default 14).
 *
 * Usage: pnpm tsx server/scripts/backup.ts
 * Cron (Railway): schedule `pnpm tsx server/scripts/backup.ts` daily.
 *
 * Because better-sqlite3 supports VACUUM INTO, the backup is a single
 * self-contained file with no dependency on the WAL — safe to download to a
 * laptop, a nightly S3/R2 object, or any object storage bucket.
 */

import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "growth-network.db")
const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "data", "backups")
const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || "14", 10) || 14

if (!fs.existsSync(dbPath)) {
  console.error(`[backup] DB not found at ${dbPath}`)
  process.exit(1)
}

fs.mkdirSync(backupDir, { recursive: true })

const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const target = path.join(backupDir, `growth-network-${stamp}.db`)

// Opening the DB and VACUUM INTO takes a consistent snapshot even while the
// server holds the file open (SQLite handles concurrent writers via WAL).
const db = new Database(dbPath, { readonly: true })
db.prepare("VACUUM INTO ?").run(target)
db.close()

// Prune old backups.
const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
let pruned = 0
for (const f of fs.readdirSync(backupDir)) {
  if (!f.startsWith("growth-network-") || !f.endsWith(".db")) continue
  const p = path.join(backupDir, f)
  if (fs.statSync(p).mtimeMs < cutoff) {
    fs.unlinkSync(p)
    pruned++
  }
}

const size = fs.statSync(target).size
console.log(`[backup] OK ${path.basename(target)} (${(size / 1024 / 1024).toFixed(2)} MB), pruned ${pruned} old`)
