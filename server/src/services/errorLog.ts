import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"

/**
 * Lightweight error capture. Writes structured rows to the error_logs table so
 * failures (failed publishes, crashed requests) are visible in the dashboard
 * instead of silently vanishing. This is the hook where a hosted error tracker
 * (Sentry free tier) would attach later — the table is the durable record.
 */
export function recordError(input: {
  businessId?: string | null
  platform?: string | null
  operation: string
  message: string
  details?: Record<string, unknown>
}): void {
  try {
    const db = getDb()
    db.prepare(
      "INSERT INTO error_logs (id, business_id, platform, operation, message, details, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
    ).run(
      uuid(),
      input.businessId || null,
      input.platform || null,
      input.operation,
      input.message.slice(0, 2000),
      JSON.stringify(input.details || {}),
    )
  } catch {
    // never throw from the error path itself
  }
}
