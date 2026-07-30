import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"

export function generateReport(
  businessId: string,
  type: string,
  periodStart: string,
  periodEnd: string,
): { reportId: string; metrics: Record<string, number> } {
  const db = getDb()
  const reportId = uuid()

  const beforeDeals = db
    .prepare("SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as value FROM deals WHERE business_id = ? AND created_at < ?")
    .get(businessId, periodStart) as { count: number; value: number }

  const periodDeals = db
    .prepare("SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as value FROM deals WHERE business_id = ? AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number; value: number }

  const messagesSent = db
    .prepare("SELECT COUNT(*) as count FROM whatsapp_messages WHERE business_id = ? AND direction = 'outbound' AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number }

  const messagesDelivered = db
    .prepare("SELECT COUNT(*) as count FROM whatsapp_messages WHERE business_id = ? AND status = 'delivered' AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number }

  const responseTimes = db
    .prepare("SELECT AVG(response_time_seconds) as avg_time FROM response_times WHERE business_id = ? AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { avg_time: number | null }

  const campaigns = db
    .prepare("SELECT COUNT(*) as count, COALESCE(SUM(spent), 0) as spent, COALESCE(SUM(impressions), 0) as impressions, COALESCE(SUM(clicks), 0) as clicks, COALESCE(SUM(conversions), 0) as conversions FROM ad_campaigns WHERE business_id = ? AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number; spent: number; impressions: number; clicks: number; conversions: number }

  const newContacts = db
    .prepare("SELECT COUNT(*) as count FROM contacts WHERE business_id = ? AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number }

  const followUpsCompleted = db
    .prepare("SELECT COUNT(*) as count FROM follow_ups WHERE business_id = ? AND status = 'completed' AND created_at >= ? AND created_at <= ?")
    .get(businessId, periodStart, periodEnd) as { count: number }

  const metrics: Record<string, number> = {
    deals_before: beforeDeals.count,
    deals_value_before: beforeDeals.value,
    deals_new: periodDeals.count,
    deals_value_new: periodDeals.value,
    deals_growth_percent: beforeDeals.count > 0
      ? Math.round(((periodDeals.count - beforeDeals.count) / beforeDeals.count) * 100)
      : periodDeals.count > 0 ? 100 : 0,
    messages_sent: messagesSent.count,
    messages_delivered: messagesDelivered.count,
    delivery_rate: messagesSent.count > 0
      ? Math.round((messagesDelivered.count / messagesSent.count) * 100)
      : 0,
    avg_response_time_seconds: Math.round(responseTimes.avg_time ?? 0),
    ad_spent: campaigns.spent,
    ad_impressions: campaigns.impressions,
    ad_clicks: campaigns.clicks,
    ad_conversions: campaigns.conversions,
    new_contacts: newContacts.count,
    follow_ups_completed: followUpsCompleted.count,
  }

  db.prepare(
    `INSERT INTO reports (id, business_id, type, period_start, period_end, metrics, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(reportId, businessId, type, periodStart, periodEnd, JSON.stringify(metrics))

  return { reportId, metrics }
}

export function getReports(businessId: string, limit = 10): Array<Record<string, unknown>> {
  const db = getDb()
  return db
    .prepare("SELECT * FROM reports WHERE business_id = ? ORDER BY generated_at DESC LIMIT ?")
    .all(businessId, limit) as Array<Record<string, unknown>>
}

export function trackResponseTime(
  businessId: string,
  channel: string,
  receivedAt: string,
  respondedAt: string,
  targetSeconds: number,
): void {
  const db = getDb()
  const received = new Date(receivedAt).getTime()
  const responded = new Date(respondedAt).getTime()
  const responseTimeSeconds = Math.round((responded - received) / 1000)

  db.prepare(
    `INSERT INTO response_times (id, business_id, channel, received_at, responded_at, response_time_seconds, breached, target_seconds, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(
    uuid(),
    businessId,
    channel,
    receivedAt,
    respondedAt,
    responseTimeSeconds,
    responseTimeSeconds > targetSeconds ? 1 : 0,
    targetSeconds,
  )
}
