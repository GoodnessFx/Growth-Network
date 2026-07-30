# Growth Network — The African Business Command Center

**Iyamah Goodness (Founder of Growth Network) · [GitHub](https://github.com/GoodnessFx) · IG @Youtube**

---

Most business software is built for San Francisco startups with $5M in seed funding — people who have dedicated ops teams, Slack integrations, and a CFO who sends spreadsheets every Friday. This one is built for you: the operator in Lagos who manages 10 businesses from their phone, the agency owner in Accra running campaigns for 20 clients, the holding company in Nairobi tracking shipments from Mombasa to Kampala. You don't need another tool. You need one screen that shows you everything.

Growth Network is not a dashboard. It is an operating system for agencies, operators, and holding companies managing multiple African SMEs. It replaces the 14 browser tabs, the WhatsApp-forwarding chaos, the "send me a screenshot of the analytics" loops, and the Excel sheets held together by prayers.

---

## How It Works

### Your Portfolio — One Grid

Log in and see **every business you manage** on one screen. Revenue trends. Pipeline value. Social growth. Campaign performance. Health status (growing, flat, declining). Click any business to dive into its full dashboard — CRM, pipeline, social, finance.

No more clicking through 10 tabs. No more "let me check and get back to you."

### Adding a New Business

Click the **"+ NEW BUSINESS"** button at the top of your portfolio. A form opens where you enter:

- Business name (required)
- Owner name
- Industry (e.g., E-commerce, Logistics, Fashion)
- City & Country
- Starting monthly revenue

The business appears instantly in your portfolio with auto-generated growth data. From there you can track its pipeline, set up social posts, run ad campaigns, and monitor its growth — all from the same system.

### Real CRM That Matches How Africa Works

Contacts, deals, pipeline stages, activity timelines. The kanban board reflects how B2B deals actually move in African markets — from prospect to discovery call to proposal to negotiation to closed. Every interaction is logged, every follow-up is tracked. No Silicon Valley fiction.

WhatsApp messages from leads auto-create contact records. When a deal moves stages, you get notified. When a follow-up is overdue, the system flags it.

### Unified Social & Campaign Management

Schedule content, manage inboxes, and run ad campaigns across Instagram, Facebook, TikTok, X (Twitter), LinkedIn, and YouTube — for every client, from one calendar. No more logging into 7 accounts per client. No more "I forgot to post."

### WhatsApp Business Integration (Real Cloud API)

Real WhatsApp Cloud API integration connected to your verified Meta Business account. Send messages, broadcast to segments, set up automated follow-ups, and track response times. Every outbound message is logged. Every missed response is flagged. The days of "sorry, I didn't see your message" are over.

To activate: complete Meta Business Verification for your WhatsApp number. The `.env.example` file has every credential slot documented with links to where you get each one.

### Multi-Platform Ads Management

Connect your real ad accounts:
- **Meta Ads** (Facebook/Instagram) — campaign data, spend, impressions, clicks, conversions, ROAS
- **Google Ads** — Search, Display, Performance Max campaigns
- **TikTok Ads** — trending creative performance

Sync live from the APIs. No CSV exports. No manual updates.

### Website Tracking Pixel

Drop a JavaScript snippet on your clients' websites and track pageviews, clicks, form submissions, and user sessions. Know which campaigns drive real traffic — not just vanity metrics. The snippet is generated automatically from the API for each business.

### Export/Trade Vertical

For businesses that move goods across borders:
- Track shipments from origin to delivery (status: pending → in transit → cleared → delivered)
- Manage supplier and buyer contacts per shipment
- Log customs documents and compliance paperwork
- Monitor payment status per shipment (pending / partial / completed)
- Set incoterms (FOB, CIF, EXW, DDP — whatever your trade uses)
- From "order placed" to "cleared at port" in one place

### Automation That Actually Triggers

Not toasts about what "could" happen. Real automated actions:

- **WhatsApp inbound** → auto-reply with custom message
- **Deal stage changed** → notify team via WhatsApp or webhook
- **Tracking event fires** → create a lead automatically
- **Scheduled time** → run reports or send broadcasts every day/week/month

Every action is audit-logged: who did what, to which resource, when. Every rule is testable before going live.

### Before/After Growth Reports

Generate shareable reports that show exactly what changed during a period:
- Revenue before vs. after
- Response times before vs. after
- Ad performance before vs. after
- Pipeline growth before vs. after
- New contacts acquired
- Follow-ups completed

Real numbers your clients can trust. No fluff, no "we think we grew."

### Response Time Tracking & Follow-Up Automation

Every WhatsApp message and email is timed. You set a target (e.g., respond within 2 minutes). When you exceed it, it's logged as a breach. Follow-ups are scheduled automatically based on rules you define — never miss a lead again.

### Audit Logging & Tenant Isolation

Every action is recorded in the audit log. Data is strictly isolated per business. A client can never see another client's data. You see everything across your portfolio. Your clients see only their business.

---

## What You Can Do Right Now

1. **Start the app:** `pnpm dev:all` (runs frontend on :8443, backend on :3001)
2. **Open the dashboard** from the landing page
3. **Click "+ NEW BUSINESS"** to add the first business you want to manage
4. **Fill in the details** — name, owner, industry, city, revenue
5. **See it appear** in your portfolio grid with a sparkline and metrics
6. **Click into it** to access CRM, pipeline, social, and finance tabs
7. **Repeat for every business** you manage

To connect real integrations (WhatsApp, ads, social APIs), copy `.env.example` to `.env` and fill in your credentials. See the prerequisites section below.

---

## Architecture

```
Frontend (Vite + React 19 + Tailwind CSS v4)    Backend (Hono + SQLite)
┌─────────────────────────────────────┐        ┌──────────────────────┐
│  src/pages/Landing.tsx  — Marketing │        │  server/src/index.ts │
│  src/pages/Auth.tsx      — Login    │  /api  │  server/src/routes/  │
│  src/pages/Operator.tsx  — Portfolio│───────▶│  ├ auth.ts           │
│  src/pages/Business.tsx  — Per-biz  │        │  ├ businesses.ts     │
│  src/components/Charts.tsx — Charts │        │  ├ whatsapp.ts       │
│  src/data/store.ts       — Client   │        │  ├ social.ts         │
│    localStorage store              │        │  ├ ads.ts            │
└─────────────────────────────────────┘        │  ├ tracking.ts       │
                                               │  ├ automations.ts    │
                                               │  ├ export-trade.ts   │
                                               │  └ audit.ts          │
                                               │  server/src/services/│
                                               │  ├ whatsapp.ts       │
                                               │  ├ social.ts         │
                                               │  ├ ads.ts            │
                                               │  ├ automations.ts    │
                                               │  ├ tracking.ts       │
                                               │  └ reports.ts        │
                                               │  server/src/db/      │
                                               │  ├ schema.ts         │
                                               │  └ index.ts          │
                                               └──────────────────────┘
```

**Key Design Decisions**
- **SQLite** via better-sqlite3 — zero-config, file-based, WAL mode for concurrent reads. Perfect for a single-operator system that scales to hundreds of businesses.
- **localStorage** for the frontend store — businesses you add persist across page reloads without needing the backend. When the backend is running, the two sync.
- **Hono** — lightweight TypeScript web framework, faster than Express, first-class TypeScript support, easy middleware for auth/tenant/audit.

---

## Quick Start

```bash
# 1. Install everything
pnpm install

# 2. Start both frontend and backend
pnpm dev:all

# 3. Open http://localhost:8443 in your browser
# 4. Click "OPEN DASHBOARD" on the landing page
# 5. Click "+ NEW BUSINESS" to add your first business
```

## Prerequisites for Real Integrations

| What You Want | What You Need | Where to Get It |
|---------------|---------------|-----------------|
| WhatsApp messaging | Meta Business Verification + WABA | [developers.facebook.com](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| Meta Ads sync | Meta App + Access Token | [developers.facebook.com](https://developers.facebook.com) |
| Google Ads sync | Developer Token + OAuth credentials | [developers.google.com/google-ads](https://developers.google.com/google-ads) |
| TikTok Ads sync | Access Token + Advertiser ID | [ads.tiktok.com](https://ads.tiktok.com) |
| X (Twitter) posting | Bearer Token + API Keys | [developer.twitter.com](https://developer.twitter.com) |
| YouTube metrics | API Key | [console.cloud.google.com](https://console.cloud.google.com) |
| LinkedIn posting | OAuth Access Token | [developer.linkedin.com](https://developer.linkedin.com) |
| Website tracking | None — just copy the snippet | Generated from `/api/tracking/snippet/{businessId}` |

---

## Branches

- **master** — Production-ready. What your live system runs.
- **staging** — Pre-production for testing changes before they hit master.

Create a staging deploy from the staging branch, test everything, then merge to master.

---

## Why Growth Network?

Because running 10 businesses should not require a 10-person ops team. Because your clients deserve response times under 2 minutes, not "between now and never." Because Nigerian, Ghanaian, Kenyan, South African, and Ugandan entrepreneurs deserve software that understands their markets instead of forcing them into foreign workflows.

We personally manage each company. We ensure they grow.

That is the deal.

**Iyamah Goodness**
Founder, Growth Network
[GitHub](https://github.com/GoodnessFx) · IG @Youtube
