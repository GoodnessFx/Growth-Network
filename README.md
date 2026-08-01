# Growth Network — The African Business Command Center

**Iyamah Goodness (Founder of Growth Network) · [GitHub](https://github.com/GoodnessFx) · IG @Youtube**

---

Most business software is built for San Francisco startups with $5M in seed funding — people who have dedicated ops teams, Slack integrations, and a CFO who sends spreadsheets every Friday. This one is built for you: the operator in Lagos who manages 10 businesses from their phone, the agency owner in Accra running campaigns for 20 clients, the holding company in Nairobi tracking shipments from Mombasa to Kampala. You don't need another tool. You need one screen that shows you everything.

Growth Network is not a dashboard. It is an operating system for agencies, operators, and holding companies managing multiple African SMEs. It replaces the 14 browser tabs, the WhatsApp-forwarding chaos, the "send me a screenshot of the analytics" loops, and the Excel sheets held together by prayers.

---

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Recharts, Lucide React
- **Backend:** Hono (TypeScript), better-sqlite3 (SQLite, WAL mode), JWT auth
- **Infra notes:** SQLite is the database — `drizzle-orm` is deliberately **not** used; schema lives in `server/src/db/schema.ts` with in-place migrations in `server/src/db/index.ts`. Session tokens are stored in `localStorage` (7-day expiry, cleared on logout, restored via `/api/auth/me`); there is intentionally no password-reset UI — a reset flow is not exposed.

## Quick Start

```bash
# 1. Install everything
pnpm install

# 2. Start both frontend and backend
pnpm dev:all          # backend on :3001, frontend on :8443

# 3. Seed the owner account and demo businesses
pnpm db:seed

# 4. Open http://localhost:8443 and sign in as the owner
#    founder@growthnetwork.app / Founder123!  (owner account from the seed)
```

Separately: `pnpm dev` (frontend only) or `pnpm dev:server` (backend only). The Vite dev server proxies `/api/*` to `:3001`.

## Public Read-Only Model

Growth Network is a **public showcase** with a single owner. No public sign-up exists — there is no `POST /api/auth/register` route.

- **Anyone can view** the landing page's live portfolio and each business's public growth-snapshot poster (`/public/:id`). These read endpoints (`/api/public`, `/api/public/:id`) require no auth.
- **Only the owner can write.** Every write route (businesses, social publish, ads, automations, export-trade, audit, analytics simulate, tracking) is gated by the `requireOwner` middleware, which accepts the `owner` role.
- **Visibility control.** Each business has a `visible` flag. Hidden businesses disappear from the public listing, the public poster returns 404, and the tracking snippet refuses to emit events. The owner toggles this in the dashboard's "Public Showcase — Visibility" panel.
- **Tracking snippet is secret-gated.** `POST /api/tracking/event` requires a per-install `TRACKING_SECRET` (randomly generated at boot if not set) that is embedded in the generated snippet; events without the secret are rejected with 401.

To reset to a clean owner state at any time, run `pnpm db:seed` (idempotent — it removes demo/test users and their data, then upserts the owner account and three demo businesses).

## Configuration (Environment Variables)

Copy `.env.example` to `.env` and fill in what you need. The file is fully commented with developer-console links and scope lists for every platform. Nothing is required to run the app locally — integrations only activate when a platform is connected.

| What you want | What you need | Where to get it |
|---|---|---|
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
| CORS / tracking origins | `ALLOWED_ORIGINS`, `TRACKING_ALLOWED_ORIGINS` (comma-separated) + `TRACKING_SECRET` | Set in `.env`; see `.env.example` |
| Demo data | `ENABLE_DEMO_DATA=1` (default) | On by default; set `0` to require real connections |

### OAuth Model

Each platform is connected **per business**, not per account. The server stores tokens in the `social_connections` table (`access_token`, `refresh_token`, `account_id`, `account_name`, `expires_at`).

- **Production flow:** each platform has a registered OAuth app; the server would exchange the authorization code at `/api/oauth/callback/:platform` and persist the token server-side for the logged-in business.
- **Local/first-run flow (what the UI uses today):** paste a long-lived token (and account ID where relevant) into the Connections view, or set the `*_ACCESS_TOKEN` fallback variables in `.env`. The server uses the per-business row when present and falls back to the env var for single-tenant setups.
- Tokens are verified per platform with the "Verify" button, which calls the platform API with the stored credential.

### Demo Data

Until a platform is actually connected (or its env fallback is set), every credential-gated feature returns **labeled demo data** so the whole dashboard is explorable without any accounts:

- Ads, SEO, social publishing, per-post metrics, WhatsApp messaging, and connection verification fall back to believable sample numbers/campaigns/post-ids when no working credential exists — or when the live call fails (expired/limited token).
- Every fallback response is flagged `demo: true`; the UI shows a "demo" badge next to affected cards so you always know when you're looking at sample numbers.
- The moment a working connection is added, real data replaces the demo values automatically.
- Set `ENABLE_DEMO_DATA=0` in `.env` to turn this off and get the original "connect a platform" errors instead.

## Project Structure

```
src/
  main.tsx / App.tsx / index.css   React entry, routing, global styles
  pages/                           Landing, Auth, Operator, Business, PublicResults
  components/                      Analytics, Connections, Results, Charts, …
  lib/api.ts                       typed API client (all backend calls)
server/src/
  index.ts                         Hono app + auth/tenant middleware wiring
  routes/                          auth, businesses, whatsapp, social, ads,
                                   tracking, analytics, automations, export-trade,
                                   public, audit
  services/                        platform integrations: whatsapp, social (14
                                   platforms), ads (Meta/Google/TikTok/LinkedIn/
                                   Snapchat), searchConsole, connections,
                                   analytics, automations, tracking, reports
  middleware/                      auth (JWT), tenant isolation, audit logging
  db/                              schema.ts + index.ts (connection + migration)
```

## What It Does

- **Portfolio grid** — every business on one screen with revenue trend, pipeline value, social growth, campaign performance, and health status (growing / flat / declining).
- **Per-business dashboard** — CRM, sales pipeline (kanban), social calendar, finance, export/trade shipments, automation rules.
- **WhatsApp Cloud API** — send messages, broadcast to segments, automated follow-ups, response-time tracking (requires Meta Business Verification).
- **Unified social publishing** — 14 platforms including Facebook, Instagram, TikTok, X, YouTube, LinkedIn, Snapchat (Ads), Pinterest, Threads, Google Business Profile.
- **Ads monitoring** — live campaign sync for Meta, Google, TikTok, LinkedIn, and Snapchat Ads; Google Ads is surfaced as its own section in Analytics.
- **SEO monitoring** — Google Search Console performance (impressions, clicks, position, top queries) per business.
- **Website tracking pixel** — generated per business; paste into any site to stream pageviews, clicks, and form submissions into Analytics (no demo button required).
- **Export/Trade vertical** — shipments, customs documents, payment status, incoterms.
- **Automations** — real triggers (WhatsApp inbound, deal stage change, tracking event, scheduled time) with audit logging.
- **Growth snapshots** — shareable before/after posters, each labeled by data source.
- **Audit logging & tenant isolation** — every action logged; data strictly isolated per business.

## Real Data vs. Simulated Data (Honesty Policy)

- **Analytics:** the browser pixel ingests real events through `/api/tracking`. A "Simulate traffic" button exists for demoing the UI — every simulated event is stamped and the button is clearly labeled. Real visits, page views, and events flow through the exact same endpoint.
- **Ads & SEO:** numbers come **only** from connected platform APIs. If a platform is not connected, the dashboard says "Not connected" explicitly — it never fabricates campaign or search numbers.
- **Growth snapshots:** each report is labeled `Live data` (pulled from Analytics, CRM won-deals, and connected platforms via the "Auto-fill from live data" button) or `Self-reported` (numbers typed by the business owner). The label is shown on the public poster.

## Known Limitations

1. **No OAuth redirect flow yet.** The Connections UI accepts tokens manually; the server-side `/api/oauth/callback/:platform` flow is documented but not implemented. Per-business connection rows are fully supported.
2. **Snapchat organic and Google Business Profile have no public organic-posting APIs** — those integrations report an honest "no organic posting API" error. Snapchat Ads and Google search data are supported.
3. **YouTube uploads require an OAuth access token** (the legacy API key cannot upload). TikTok publishing requires a published video URL.
4. **Real API verification needs credentials.** WhatsApp requires Meta Business Verification; Meta/LinkedIn/Snapchat/Google Ads require their respective developer approvals. Until then the affected sections show explicit "not connected" states rather than fake data.
5. **Charts load as one bundle** — the app does not code-split yet (Vite warns the main chunk exceeds 500 kB).
6. **localStorage tokens** — sessions live in localStorage; a httpOnly-cookie flow is a future hardening step (the backend has no CSRF middleware today, so cookies are not used).
7. **Search Console requires a verified property** in the Google Search Console account being queried.
8. **No server deploy target wired yet** — the frontend ships as static Vite output (`dist/`); the Hono API + SQLite backend needs a VPS/container target before the public showcase goes fully live.

## Branches

- **master** — production-ready baseline.
- **main** — active development (identical history to master, pushed in parallel).
- **staging** — pre-production testing (use as needed).

## Why Growth Network?

Because running 10 businesses should not require a 10-person ops team. Because your clients deserve response times under 2 minutes, not "between now and never." Because Nigerian, Ghanaian, Kenyan, South African, and Ugandan entrepreneurs deserve software that understands their markets instead of forcing them into foreign workflows.

We personally manage each company. We ensure they grow.

That is the deal.

**Iyamah Goodness**
Founder, Growth Network
[GitHub](https://github.com/GoodnessFx) · IG @Youtube
