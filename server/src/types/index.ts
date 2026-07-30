export type BusinessType = "ecommerce" | "saas" | "agency" | "export-trade"
export type BusinessStatus = "active" | "paused" | "archived"

export interface Business {
  id: string
  name: string
  type: BusinessType
  status: BusinessStatus
  ownerId: string
  domain?: string
  logo?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: "admin" | "operator"
  createdAt: string
}

export interface Contact {
  id: string
  businessId: string
  name: string
  email?: string
  phone?: string
  source?: string
  tags: string[]
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Deal {
  id: string
  businessId: string
  contactId: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  assignedTo?: string
  expectedCloseDate?: string
  createdAt: string
  updatedAt: string
}

export interface WhatsAppMessage {
  id: string
  businessId: string
  contactId?: string
  contactPhone: string
  direction: "inbound" | "outbound"
  messageType: "text" | "template" | "image" | "document" | "interactive"
  content: string
  templateName?: string
  mediaUrl?: string
  status: "sent" | "delivered" | "read" | "failed"
  whatsappMessageId?: string
  createdAt: string
}

export interface SocialPost {
  id: string
  businessId: string
  platform: "instagram" | "facebook" | "tiktok" | "x" | "youtube" | "linkedin"
  postId?: string
  content: string
  mediaUrls: string[]
  scheduledFor?: string
  publishedAt?: string
  status: "draft" | "scheduled" | "published" | "failed"
  metrics?: {
    likes: number
    comments: number
    shares: number
    impressions: number
  }
  createdAt: string
}

export interface AdCampaign {
  id: string
  businessId: string
  platform: "meta" | "google" | "tiktok"
  name: string
  status: "active" | "paused" | "completed" | "draft"
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  platformId?: string
  startDate: string
  endDate?: string
  createdAt: string
}

export interface TrackingEvent {
  id: string
  businessId: string
  sessionId: string
  visitorId: string
  eventType: string
  pageUrl: string
  referrer?: string
  metadata: Record<string, unknown>
  ip?: string
  userAgent?: string
  timestamp: string
}

export interface AutomationRule {
  id: string
  businessId: string
  name: string
  trigger: {
    type: "whatsapp_inbound" | "form_submission" | "lead_created" | "deal_stage_changed" | "scheduled_time" | "tracking_event"
    config: Record<string, unknown>
  }
  action: {
    type: "send_whatsapp" | "send_email" | "update_deal_stage" | "create_lead" | "webhook_call"
    config: Record<string, unknown>
  }
  enabled: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  businessId: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, unknown>
  ip?: string
  createdAt: string
}

export interface ExportShipment {
  id: string
  businessId: string
  orderNumber: string
  supplier: string
  buyer: string
  origin: string
  destination: string
  productDescription: string
  quantity: number
  unit: string
  totalValue: number
  currency: string
  incoterm: string
  status: "pending" | "in_transit" | "cleared" | "delivered"
  estimatedDelivery?: string
  actualDelivery?: string
  documents: string[]
  paymentStatus: "pending" | "partial" | "completed"
  createdAt: string
}

export interface ResponseTime {
  id: string
  businessId: string
  channel: "whatsapp" | "email" | "instagram" | "facebook"
  receivedAt: string
  respondedAt?: string
  responseTimeSeconds?: number
  breached: boolean
  targetSeconds: number
}

export interface FollowUp {
  id: string
  businessId: string
  contactId: string
  scheduledFor: string
  executedAt?: string
  status: "pending" | "completed" | "skipped"
  message: string
  channel: "whatsapp" | "email"
  createdAt: string
}

export interface Report {
  id: string
  businessId: string
  type: "weekly" | "monthly" | "quarterly" | "custom"
  periodStart: string
  periodEnd: string
  metrics: Record<string, number>
  beforeImage?: string
  afterImage?: string
  generatedAt: string
}
