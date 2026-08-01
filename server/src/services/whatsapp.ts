import axios from "axios"
import { demoEnabled, demoWhatsAppId } from "./demo.js"

const WHATSAPP_API_BASE = "https://graph.facebook.com/v21.0"

function getConfig(): { phoneNumberId: string; accessToken: string } | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    return null
  }

  return { phoneNumberId, accessToken }
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
  demo?: boolean
}

export async function sendTextMessage(to: string, text: string): Promise<WhatsAppSendResult> {
  const config = getConfig()
  if (!config) {
    if (demoEnabled()) {
      return { success: true, messageId: demoWhatsAppId(), demo: true }
    }
    return { success: false, error: "WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set in .env" }
  }
  try {
    const { phoneNumberId, accessToken } = config
    const { data } = await axios.post(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err: unknown) {
    if (demoEnabled()) {
      return { success: true, messageId: demoWhatsAppId(), demo: true }
    }
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  parameters: string[] = [],
): Promise<WhatsAppSendResult> {
  const config = getConfig()
  if (!config) {
    if (demoEnabled()) {
      return { success: true, messageId: demoWhatsAppId(), demo: true }
    }
    return { success: false, error: "WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set in .env" }
  }
  try {
    const { phoneNumberId, accessToken } = config
    const components = parameters.length > 0
      ? [{ type: "body", parameters: parameters.map((p) => ({ type: "text", text: p })) }]
      : undefined

    const { data } = await axios.post(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to.replace(/[^0-9]/g, ""),
        type: "template",
        template: { name: templateName, language: { code: "en" }, components },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err: unknown) {
    if (demoEnabled()) {
      return { success: true, messageId: demoWhatsAppId(), demo: true }
    }
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

export function verifyWebhook(mode: string, token: string, challenge: string): string | null {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "growth-network-webhook-verify-2024"
  if (mode === "subscribe" && token === verifyToken) {
    return challenge
  }
  return null
}

export function parseWebhookPayload(body: Record<string, unknown>): Array<{
  from: string
  text: string
  messageId: string
  timestamp: string
}> {
  const messages: Array<{ from: string; text: string; messageId: string; timestamp: string }> = []

  const entries = body?.entry as Array<Record<string, unknown>> | undefined
  if (!entries) return messages

  for (const entry of entries) {
    const changes = entry?.changes as Array<Record<string, unknown>> | undefined
    if (!changes) continue

    for (const change of changes) {
      const value = change?.value as Record<string, unknown> | undefined
      const msgs = value?.messages as Array<Record<string, unknown>> | undefined
      if (!msgs) continue

      for (const msg of msgs) {
        messages.push({
          from: msg.from as string,
          text: (msg.text as Record<string, string>)?.body || "",
          messageId: msg.id as string,
          timestamp: msg.timestamp as string,
        })
      }
    }
  }

  return messages
}
