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
  src/services/           social, ads, connections, analytics, tracking, automations
  src/middleware/         auth (JWT), tenant (isolation), audit
  src/db/                 better-sqlite3 setup + schema
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

Read at backend startup (see each service for exact names):

- `JWT_SECRET` — signing secret (default `dev-secret-change-in-production`)
- `PORT` — backend port (default `3001`)
- `API_PORT` — used by Vite proxy target (default `3001`)
- `DB_PATH` — SQLite file path (default `data/growth-network.db`)
- Platform credentials (used as fallback when no per-business connection exists):
  `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `TIKTOK_ACCESS_TOKEN`,
  `TIKTOK_ADVERTISER_ID`, `X_BEARER_TOKEN`, `YOUTUBE_API_KEY`,
  `LINKEDIN_ACCESS_TOKEN`, `GOOGLE_ADS_REFRESH_TOKEN`,
  `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_MANAGER_CUSTOMER_ID`,
  `WHATSAPP_ACCESS_TOKEN`

## API reference

### Auth (`/api/auth`)
- `POST /register` — `{ email, name, password }` → `{ token, user }` (JWT, 7 days)
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET /me` — protected, returns current user

### Businesses (`/api/businesses`) — auth + tenant
- `GET /` — list businesses for the tenant
- `GET /:id` — single business (owner-checked)
- `POST /` — `{ name, type, domain? }` → create
- `PUT /:id` — partial update
- `DELETE /:id` — delete
- `POST /:id/snapshot` — publish a growth snapshot (report row) — owner-checked

### Social / connections (`/api/social`) — auth + tenant
- `GET /connections?businessId=` — list stored platform connections
- `POST /connections` — `{ businessId, platform, accessToken?, accountId?, refreshToken? }` — upsert (simulates the OAuth callback persisting tokens per business)
- `DELETE /connections/:id` — disconnect
- `POST /connections/:id/verify` — best-effort connectivity probe
- `POST /publish` — `{ businessId, platform, content, mediaUrls?, scheduledFor? }` — publishes via the business's connection token
- `GET /posts`, `GET /metrics/:platform/:postId`

### Ads (`/api/ads`) — auth
- `GET /campaigns/:platform?businessId=&sync=true` — sync from Meta/Google/TikTok using per-business connection creds (falls back to env), otherwise reads stored campaigns
- `POST /campaigns` — create campaign

### Analytics (`/api/analytics`) — auth + tenant
- `GET /overview?businessId=` — live visitors, today's pageviews/visitors, sessions, clicks, engagement rate, 24h hourly trend, top pages, referrers, devices, recent events
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
connection store, tracking ingestion, analytics aggregation, growth snapshot
publication, audit logging.

**Simulated / demo** — social posting and ad syncing return provider errors until
real platform tokens are attached (`.env` or per-business connections). The
analytics traffic simulator and the frontend dashboard seed data (`data/`) are
demo fixtures. Password reset shows an "email delivery pending" notice.

## Known limitations

- No real Meta/Google/TikTok OAuth flow — the connect form persists tokens
  manually and `verify` performs a best-effort probe.
- WhatsApp messaging is blocked until the sender number (08072027335) passes
  Meta Business Verification.
- Platform credentials are the operator's responsibility; store tokens in the
  per-business connection table or `.env`.

## Phase work log

1. **Mobile-first audit** — iOS input zoom fix (16px), 44px tap targets on coarse
   pointers, scrollable data tables, stackable grids, single-column auth.
2. **Design clarity** — documented single type scale, unified `.eyebrow` /
   `.section-title` on landing.
3. **Auth end-to-end** — JWT client + AuthContext, protected routes, logout, real
   error handling; fixed `/auth/me` (was unauthenticated) and Hono middleware
   401s.
4. **Multi-tenant social/ads** — `social_connections` table, connection APIs with
   tenant isolation, per-business credential resolution, Connections view.
5. **Real-time analytics** — tracking aggregation API, traffic simulator,
   polling Analytics view.
6. **Public results** — `/public/:id` before/after growth snapshot poster
   (print/PDF export), snapshot editor in Results view.
