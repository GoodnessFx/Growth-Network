# Growth Network — Development Guide

Technical documentation for the Growth Network project: a React + Vite frontend and a
Hono + SQLite API backend, built for the African business growth market.

## Architecture

```
src/                      React frontend (Vite + Tailwind v4)
  main.tsx                entrypoint
  App.tsx                 routing (state-based), auth guard, /public/:id route
  pages/                  Landing, Auth, Operator, Business, PublicResults
  components/             AppLayout, Charts, ConnectionsView, AnalyticsView, ResultsView
  lib/                    api.ts (fetch client + token), AuthContext.tsx (JWT session)
  data/                   mockData.ts, store.ts (localStorage demo seed)
server/                   Hono API backend (port 3001)
  src/index.ts            app assembly + middleware mounting
  src/routes/             auth, businesses, social, ads, analytics, public, tracking,
                          automations, whatsapp, export-trade, audit
  src/services/           social, ads, searchConsole, connections, analytics, tracking, automations
  src/middleware/         auth (JWT), tenant (isolation), audit
  src/db/                 better-sqlite3 setup + schema + in-place migrations
```

Frontend dev server: `:8443`. Backend: `:3001`. Vite proxies `/api/*` → backend.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Vite frontend only |
| `pnpm dev:server` | Hono backend only |
| `pnpm dev:all` | Frontend + backend together |
| `pnpm build` | Production frontend build → `dist/` |
| `pnpm build:server` | Compile/run backend (starts server) |
| `pnpm db:init` | Initialize SQLite schema |
| `pnpm format` | oxfmt formatting |

## Environment variables

Read at backend startup (see each service for exact names). `.env.example` is the
canonical reference and documents the OAuth-app credential model per platform —
client IDs/secrets for the production OAuth flow, plus long-lived token fallbacks:

- `JWT_SECRET` — signing secret (default `dev-secret-change-in-production`)
- `PORT` — backend port (default `3001`)
- `API_PORT` — used by Vite proxy target (default `3001`)
- `DB_PATH` — SQLite file path (default `data/growth-network.db`)
- Platform credentials (used as fallback when no per-business connection exists):
  `META_CLIENT_ID`/`META_CLIENT_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`,
  `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN`,
  `TIKTOK_ADVERTISER_ID`, `X_CLIENT_ID`/`X_CLIENT_SECRET`, `X_BEARER_TOKEN`,
  `YOUTUBE_ACCESS_TOKEN`, `YOUTUBE_API_KEY`,
  `LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`,
  `SNAPCHAT_CLIENT_ID`/`SNAPCHAT_CLIENT_SECRET`, `SNAPCHAT_ACCESS_TOKEN`,
  `SNAPCHAT_ADVERTISER_ID`, `PINTEREST_CLIENT_ID`/`PINTEREST_CLIENT_SECRET`,
  `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_ID`, `THREADS_CLIENT_ID`/
  `THREADS_CLIENT_SECRET`, `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`,
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`,
  `GOOGLE_ADS_MANAGER_CUSTOMER_ID`, `GOOGLE_ADS_REFRESH_TOKEN`,
  `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`,
  `GOOGLE_BUSINESS_PROFILE_ACCESS_TOKEN`, `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID`,
  `WHATSAPP_ACCESS_TOKEN`

## API reference

### Auth (`/api/auth`)
- `POST /register` — `{ email, name, password }` → `{ token, user }` (JWT, 7 days)
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET /me` — protected, returns current user

Session handling: the JWT is stored in `localStorage` (`src/lib/AuthContext.tsx`) and sent as
`Authorization: Bearer <token>` on every request via `src/lib/api.ts`. An httpOnly cookie was
considered but not used: the backend has no CSRF middleware, the cookie path would add
SameSite/CSRF wiring for a single-origin Vite proxy with no third-party clients, and the token
already lives behind a 7-day expiry. The token is cleared from `localStorage` on logout, and
`GET /auth/me` restores the session on page reload. Password reset is deliberately not exposed in
the UI until a real email-token backend exists — the old "forgot password" screen was a dead end
and was removed.

### Businesses (`/api/businesses`) — auth + tenant
- `GET /` — list businesses for the tenant
- `GET /:id` — single business (owner-checked)
- `POST /` — `{ name, type, domain? }` → create
- `PUT /:id` — partial update
- `DELETE /:id` — delete
- `POST /:id/snapshot` — publish a growth snapshot; body `{ metrics, source? }` where `source` is `"live"` or `"self-reported"` (default) — owner-checked
- `GET /:id/snapshot-draft` — suggested snapshot values pulled from real data (CRM won-deals → `revenueAfter`, 30-day Analytics visitors or contacts → `clientsAfter`), returns `{ draft, dataSources, suggested }`

### Social / connections (`/api/social`) — auth + tenant
- `GET /connections?businessId=` — list stored platform connections
- `POST /connections` — `{ businessId, platform, accessToken?, accountId?, accountName?, refreshToken?, expiresAt? }` — upsert (simulates the OAuth callback persisting tokens per business)
- `DELETE /connections/:id` — disconnect
- `POST /connections/:id/verify` — best-effort connectivity probe
- `POST /publish` — `{ businessId, platform, content, mediaUrls?, scheduledFor? }` — publishes via the business's connection token. Real clients exist for TikTok, YouTube, X, LinkedIn, Pinterest, Threads, Facebook, Instagram, WhatsApp; Snapchat and Google Business Profile return honest "no organic posting API" errors
- `GET /seo?businessId=` — Google Search Console performance for the business: `{ connected: false, error }` when no Search Console connection, `{ connected: true, seo }` on success, `{ connected: true, error }` when the API call fails
- `GET /posts`, `GET /metrics/:platform/:postId`

Platforms supported in `social_connections` (14): facebook, instagram, tiktok, x,
youtube, linkedin, snapchat, pinterest, threads, whatsapp, meta, google,
google-search-console, google-business-profile.

### Ads (`/api/ads`) — auth + tenant (all routes owner-checked)
- `GET /campaigns/:platform?businessId=&sync=true` — live sync for meta, google, tiktok, linkedin, snapchat using per-business connection creds (falls back to env); without `sync=true` reads stored campaigns. Returns 400 when no connection, 403 across tenants
- `POST /campaigns` — create campaign (owner-checked)

### Analytics (`/api/analytics`) — auth + tenant
- `GET /overview?businessId=` — live visitors, today's pageviews/visitors, sessions, clicks, engagement rate, 24h hourly trend, top pages, referrers, devices, recent events
- `GET /ads?businessId=` — unified ad monitoring across meta/google/tiktok/linkedin/snapchat; each platform returns `{ platform, label, connected, campaigns?, error? }` (never fabricated when unconnected)
- `POST /simulate` — `{ businessId, count }` — demo traffic generator through the same ingestion API as the browser pixel

### Tracking (`/api/tracking`) — public (pixel)
- `POST /event` — ingestion used by the tracking snippet
- `GET /events?businessId=` — query stored events
- `GET /snippet/:businessId` — returns the embeddable tracking pixel
- `GET /health`

### Public (`/api/public`) — auth-free
- `GET /:businessId` — business + latest growth snapshot (used by `/public/:id` poster)

### Other modules
- `automations`, `whatsapp`, `export-trade`, `audit` — see `server/src/routes/`

## Database

SQLite via better-sqlite3, created on first run. Key tables:
`users`, `businesses`, `contacts`, `deals`, `whatsapp_messages`, `social_posts`,
`social_connections` (per-business platform tokens), `ad_campaigns`,
`tracking_events`, `automation_rules`, `audit_logs`, `export_shipments`,
`response_times`, `follow_ups`, `reports` (growth snapshots).

Tenant isolation is enforced in middleware: operators only ever see businesses
they own (`owner_id`).

## Real vs simulated

**Real** — JWT auth (register/login/me), tenant-isolated CRUD for businesses,
connection store (per-business tokens + env fallback), tracking ingestion,
analytics aggregation, unified ads monitoring and Google Search Console SEO,
social publishing where the platform has a real client and a token is present
(TikTok, YouTube, X, LinkedIn, Pinterest, Threads, Facebook, Instagram,
WhatsApp), growth snapshot publication (labeled `live` or `self-reported`),
audit logging.

**Simulated / demo** — the analytics traffic simulator and the frontend
dashboard seed data (`data/`) are demo fixtures and are labeled as such in the
UI. Ads/SEO sections show explicit "not connected" states instead of fabricating
numbers. Snapchat organic and Google Business Profile posting return an honest
"no organic posting API" error. YouTube upload requires an OAuth access token
(the API key is read-only).

## Known limitations

- No server-side OAuth redirect flow yet — the connect form persists tokens
  manually and `verify` performs a best-effort probe. The OAuth model (client
  ID/secret + callback per platform) is documented in `.env.example`.
- WhatsApp messaging is blocked until the sender number (08072027335) passes
  Meta Business Verification.
- Platform credentials are the operator's responsibility; store tokens in the
  per-business connection table or `.env`.
- Google Search Console requires a verified property in the account being
  queried; Google Ads API requires an approved developer token.

## Phase work log

1. **Mobile-first audit** — iOS input zoom fix (16px), 44px tap targets on coarse
   pointers, scrollable data tables, stackable grids, single-column auth.
2. **Design clarity** — documented single type scale, unified `.eyebrow` /
   `.section-title` on landing.
3. **Auth end-to-end** — JWT client + AuthContext, protected routes, logout, real
   error handling; fixed `/auth/me` (was unauthenticated) and Hono middleware
   401s. Removed the "forgot password" dead end — `AuthMode` is now login/register
   only, and the localStorage-JWT decision is documented.
4. **Multi-tenant social/ads** — `social_connections` table, connection APIs with
   tenant isolation, per-business credential resolution, Connections view.
   Expanded to 14 platforms (snapchat, pinterest, threads, google-search-console,
   google-business-profile added) with real TikTok/YouTube/pinterest/threads
   clients, honest no-posting-API errors for snapchat/GBP, LinkedIn/Snapchat ads
   fetchers, `account_name`/`expires_at` columns + migration, and owner-checked
   ads routes (was missing tenant checks).
5. **Real-time analytics** — tracking aggregation API, traffic simulator,
   polling Analytics view. Added unified ads monitoring (`GET /analytics/ads`)
   with a lead Google Ads section + Google Search Console SEO panel, both with
   explicit not-connected/error states. Tracking snippet generator added to
   Connections.
6. **Public results** — `/public/:id` before/after growth snapshot poster
   (print/PDF export), snapshot editor in Results view. Snapshots now carry a
   `source` (`live` vs `self-reported`) shown on the public poster; the editor
   can auto-fill from real CRM/analytics data (`GET /businesses/:id/snapshot-draft`).
7. **Documentation & security** — `docs/DEVELOPMENT.md`, `.env.example` rewritten
   to the OAuth-app credential model, `README.md` rewritten as UTF-8; Dependabot
   advisories remediated (removed unused drizzle-orm/drizzle-kit, Vite bumped
   8.0.3 → 8.2.0, `pnpm audit` clean).
