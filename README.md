# Growth Network

> An operating system for agencies, operators, and holding companies managing multiple African SMEs — portfolio tracking, unified social publishing, ads/SEO monitoring, WhatsApp, automations, and an AI content calendar, all behind a single owner account.

Built with **React 19 + Vite 8 + Tailwind CSS v4** on the frontend and a **Hono + SQLite** API on the backend. Works in Figma Make or any Node environment.

---

## Quick Start

```bash
pnpm install

# Create .env from the template (see "Configuration" below)
cp .env.example .env

# Start both frontend and backend
pnpm dev:all          # backend on :3001, frontend on :8443

# Seed the owner account and demo businesses
# REQUIRED: OWNER_PASSWORD must be set, or the seed fails.
pnpm db:seed

# Open http://localhost:8443 and sign in as the owner.
```

Separately: `pnpm dev` (frontend only) or `pnpm dev:server` (backend only). The Vite dev server proxies `/api/*` to `:3001`.

---

## What It Does

- **Portfolio grid** — every business on one screen: revenue trend, pipeline value, social growth, campaign performance, and health status (growing / flat / declining).
- **Per-business dashboard** — CRM, sales pipeline (kanban), content calendar, finance, export/trade shipments, and automation rules.
- **Content calendar** — owner-only AI drafting for every business: **365 days × 3 posts per day**, spanning Instagram, Facebook, LinkedIn, X, and Threads. Deterministic rule-based generation (no LLM) that composes copy **only from real business data** — no phone numbers, prices, percentages, or stats are ever invented. Generation is deduplicated by content hash and fills only gaps, so re-running never repeats. Posts are **draft until the owner approves them**; nothing is ever auto-published.
- **WhatsApp Cloud API** — send messages, broadcast to segments, automated follow-ups, response-time tracking (requires Meta Business Verification).
- **Unified social publishing** — Facebook, Instagram, TikTok, X, YouTube, LinkedIn, Snapchat (Ads), Pinterest, Threads, Google Business Profile, and more.
- **Ads monitoring** — live campaign sync for Meta, Google, TikTok, LinkedIn, and Snapchat Ads.
- **SEO monitoring** — Google Search Console performance (impressions, clicks, position, top queries) per business.
- **Website tracking pixel** — generated per business; paste into any site to stream pageviews, clicks, and form submissions into Analytics.
- **Export/Trade vertical** — shipments, customs documents, payment status, incoterms.
- **Automations** — real triggers (WhatsApp inbound, deal stage change, tracking event, scheduled time) with audit logging.
- **Growth snapshots** — shareable before/after posters, each labeled by data source.
- **Audit logging & tenant isolation** — every action logged; data strictly isolated per business.

---

## Access Model

Growth Network is a **single-owner showcase**. There is no public sign-up — no `POST /api/auth/register` route.

- **Roles:** `owner` (full control, including the content calendar), `admin`, `client`. The legacy `operator` role was renamed to `client`; existing rows are migrated on boot.
- **Anyone can view** the landing page's live portfolio and each business's public growth-snapshot poster (`/public/:id`) — no auth required.
- **Only the owner can write.** Every write route (businesses, social publish, ads, automations, export-trade, audit, content calendar) is gated by the `requireOwner` middleware.
- **Visibility control.** Each business has a `visible` flag: hidden businesses disappear from the public listing, the public poster returns 404, and the tracking snippet refuses to emit events.
- **Tracking is secret-gated.** `POST /api/tracking/event` requires a per-install `TRACKING_SECRET`; events without it are rejected with 401.

Reset to a clean owner state anytime with `pnpm db:seed` (idempotent — removes demo/test users and their data, then upserts the owner and demo businesses).

---

## Configuration

Copy `.env.example` to `.env` and fill in what you need. It is fully commented with developer-console links and scope lists. **Nothing is required to run the app locally** — integrations only activate once a platform is connected.

| What you want | What you need | Where to get it |
|---|---|---|
| Owner password | `OWNER_PASSWORD` (**required for `pnpm db:seed`**; no default — the seed exits if unset) | Set it in `.env` |
| WhatsApp Cloud API | Meta Business Verification + WABA + permanent token | [developers.facebook.com/docs/whatsapp/cloud-api/get-started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| Meta Ads / Instagram / Facebook | Meta app (client ID + secret), long-lived token for fallback | [developers.facebook.com](https://developers.facebook.com) |
| Google Ads / YouTube / Search Console / Business Profile | One Google OAuth app covering all four scopes | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) |
| Google Ads API | Developer token (apply via the Ads API center) | [developers.google.com/google-ads](https://developers.google.com/google-ads) |
| TikTok organic + TikTok Ads | TikTok app (client key/secret), advertiser ID | [developers.tiktok.com](https://developers.tiktok.com) |
| X (Twitter) | X OAuth 2.0 app | [developer.x.com](https://developer.x.com) |
| LinkedIn (organic + Ads) | LinkedIn app (client ID/secret) | [developer.linkedin.com](https://developer.linkedin.com) |
| Snapchat Ads | Snapchat Marketing API application + approval | [developers.snap.com](https://developers.snap.com) |
| Pinterest | Pinterest app | [developers.pinterest.com](https://developers.pinterest.com) |
| Threads | Meta app with the Threads product | [developers.facebook.com](https://developers.facebook.com) |
| Website tracking | None — paste the generated snippet | Generated in Connections → "Website tracking snippet" |
| CORS / tracking origins | `ALLOWED_ORIGINS`, `TRACKING_ALLOWED_ORIGINS` + `TRACKING_SECRET` | Set in `.env`; see `.env.example` |
| Demo data | `ENABLE_DEMO_DATA=1` (default) | On by default; set `0` to require real connections |

### OAuth Model

Each platform is connected **per business**, not per account. The server stores tokens in the `social_connections` table (`access_token`, `refresh_token`, `account_id`, `account_name`, `expires_at`).

- **Local/first-run flow (what the UI uses today):** paste a long-lived token (and account ID where relevant) into the Connections view, or set the `*_ACCESS_TOKEN` fallback variables in `.env`. The server prefers the per-business row and falls back to the env var.
- Tokens are verified per platform with the "Verify" button, which calls the platform API with the stored credential.

### Demo Data

Until a platform is actually connected (or its env fallback is set), every credential-gated feature returns **labeled demo data** so the dashboard is explorable without accounts:

- Ads, SEO, social publishing, per-post metrics, WhatsApp messaging, and connection verification fall back to sample numbers when no working credential exists — or when a live call fails.
- Every fallback is flagged `demo: true`; the UI shows a "demo" badge so you always know you're looking at sample numbers.
- The moment a working connection is added, real data replaces demo values automatically.
- Set `ENABLE_DEMO_DATA=0` to turn this off and get the original "connect a platform" errors instead.

---

## Content Calendar (AI Drafting)

Owner-only, at **Content → Calendar** in the app. Nothing is posted automatically.

- **Generate:** fills up to 365 days × 3 slots (morning / afternoon / evening) for one business, distributing across Instagram, Facebook, LinkedIn, X, and Threads.
- **No invented facts:** the generator is deterministic and rule-based — it composes copy only from each business's real name and type plus fixed editorial templates. `validateBody` rejects currency amounts, percentages, phone numbers, emails, and long numeric strings in both generated and edited content (e.g. `5000 naira`, `0801 234 5678`, `2.5%` all fail).
- **No repetition:** every post stores a sha-256 `content_hash`; generation retries with new seeds until a slot's text is unique for that business, and re-running only fills gaps (`skippedExisting`).
- **Review flow:** posts are `draft` until the owner edits and/or approves them (`PATCH /:id`, `POST /:id/approve`). Deleting a slot lets you regenerate just that slot.
- **Coverage:** the coverage strip shows filled days vs. a rolling 365-day window (today → today+364) for every business.
- **Access:** all calendar routes sit behind `authMiddleware → tenantMiddleware → requireOwner`; non-owners get 403.

### API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/content-calendar` | List entries (filters: `businessId`, `from`, `to`, `status`) |
| `GET` | `/api/content-calendar/coverage` | Filled days per business over the rolling window |
| `POST` | `/api/content-calendar/generate` | Fill gaps (`businessId`, `days`, `startDate`); returns `created`/`skippedExisting`/`failed` |
| `PATCH` | `/api/content-calendar/:id` | Edit title/body (re-validated, re-hashed) |
| `POST` | `/api/content-calendar/:id/approve` | Mark approved |
| `DELETE` | `/api/content-calendar/:id` | Remove a slot (regenerable) |

---

## Project Structure

```
src/
  main.tsx / App.tsx / index.css   React entry, routing, global styles
  pages/                           Landing, Auth, Operator, Business, PublicResults
  components/                      ContentCalendarView, Analytics, Connections, …
  lib/api.ts                       typed API client (all backend calls)
server/src/
  index.ts                         Hono app + auth/tenant middleware wiring
  routes/                          auth, businesses, whatsapp, social, ads,
                                   tracking, analytics, automations, export-trade,
                                   public, audit, content-calendar
  services/                        platform integrations (whatsapp, social, ads,
                                   searchConsole, connections, analytics,
                                   automations, tracking, reports) + contentCalendar
  middleware/                      auth (JWT), tenant isolation, audit logging
  db/                              schema.ts + index.ts (connection + migration)
```

---

## Real Data vs. Simulated Data (Honesty Policy)

- **Analytics:** the browser pixel ingests real events through `/api/tracking`. A clearly-labeled "Simulate traffic" button exists for demoing the UI; simulated events are stamped.
- **Ads & SEO:** numbers come **only** from connected platform APIs. If a platform is not connected, the dashboard says "Not connected" — it never fabricates campaign or search numbers.
- **Growth snapshots:** each report is labeled `Live data` (pulled from Analytics, CRM won-deals, and connected platforms) or `Self-reported` (numbers typed by the owner). The label is shown on the public poster.
- **Content calendar:** all copy is rule-generated from real business data and validated — no invented prices, phones, percentages, or statistics.

---

## Known Limitations

1. **No OAuth redirect flow yet.** The Connections UI accepts tokens manually; server-side code exchange at `/api/oauth/callback/:platform` is documented but not implemented. Real "Connect Instagram/X" flows need per-platform OAuth apps plus review.
2. **Snapchat organic and Google Business Profile have no public organic-posting APIs** — those integrations return an honest "no organic posting API" error. Snapchat Ads and Google search data are supported.
3. **YouTube uploads require an OAuth access token**; TikTok publishing requires a published video URL.
4. **Real API verification needs credentials.** WhatsApp requires Meta Business Verification; Meta/LinkedIn/Snapchat/Google Ads require their developer approvals. Until then sections show explicit "not connected" states.
5. **Charts load as one bundle** — no code-splitting yet (Vite warns the main chunk exceeds 500 kB).
6. **localStorage tokens** — sessions live in localStorage; an httpOnly-cookie flow is future hardening (no CSRF middleware today, so cookies are not used).
7. **Search Console requires a verified property** in the queried Google Search Console account.
8. **No server deploy target wired yet** — the frontend ships as static Vite output (`dist/`); the Hono API + SQLite backend needs a VPS/container target before the public showcase goes fully live.

---

## Branches

- **master** — production-ready baseline.
- **main** — active development (identical history to master, pushed in parallel).
- **staging** — pre-production testing (use as needed).

---

## Why Growth Network?

Running 10 businesses should not require a 10-person ops team. Your clients deserve response times under 2 minutes, not "between now and never." Nigerian, Ghanaian, Kenyan, South African, and Ugandan entrepreneurs deserve software that understands their markets instead of forcing them into foreign workflows.

**Iyamah Goodness** — Founder, Growth Network
[GitHub](https://github.com/GoodnessFx) · IG @Youtube
