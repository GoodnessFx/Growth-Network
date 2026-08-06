/**
 * Minimal per-business, per-platform rate limiting for external API calls.
 *
 * Platforms (Meta, X, TikTok, LinkedIn, Google) each enforce their own rate
 * limits. When one app manages many businesses, aggregate call volume can trip
 * a limit faster than a single account would. This is a simple sliding window
 * that refuses to fire another call for the same business+platform until a
 * cooldown elapses, and surfaces a clear "try again in Xs" message — rather
 * than silently hitting the platform and failing.
 *
 * Not a replacement for per-platform quotas (those are documented per API);
 * it's a backstop so a burst doesn't slam an endpoint and produce confusing
 * provider errors. Configurable via RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX.
 */

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10) || 60000
const MAX_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX || "30", 10) || 30

const calls = new Map<string, number[]>()
const last429 = new Map<string, number>()

export function rateLimitKey(businessId: string, platform: string): string {
  return `${businessId}:${platform}`
}

export function checkRateLimit(key: string): { ok: boolean; retryAfterMs?: number; retryAfterSeconds?: number } {
  const now = Date.now()

  // If the provider returned 429, hold that platform for a backoff window.
  const backoffUntil = last429.get(key)
  if (backoffUntil && now < backoffUntil) {
    const ms = backoffUntil - now
    return { ok: false, retryAfterMs: ms, retryAfterSeconds: Math.ceil(ms / 1000) }
  }

  const window = (calls.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (window.length >= MAX_PER_WINDOW) {
    const ms = WINDOW_MS - (now - window[0]!)
    return { ok: false, retryAfterMs: ms, retryAfterSeconds: Math.ceil(ms / 1000) }
  }
  window.push(now)
  calls.set(key, window)
  return { ok: true }
}

export function markRateLimited(key: string, backoffMs = 60000): void {
  last429.set(key, Date.now() + backoffMs)
}
