# Growth Network

**Iyamah Goodness (Founder of Growth Network) · [GitHub](https://github.com/GoodnessFx) · IG @Youtube**

Growth Network is a system for agencies, operators, and holding companies managing multiple African SMEs. One place to see every business you manage, track their growth, run campaigns, send WhatsApp messages, and generate reports.

## How It Works

### Portfolio — One Grid

See every business you manage on one screen. Revenue, pipeline value, social growth, campaign performance, health status (growing, flat, declining). Click any business to dive into its full dashboard.

### Adding a New Business

Click the "+ NEW BUSINESS" button at the top of your portfolio. Enter the business name, owner, industry, city, country, and starting revenue. It appears instantly in your portfolio. You can track its pipeline, social posts, ad campaigns, and growth from there.

### CRM

Contacts, deals, pipeline stages, activity timelines. The kanban board moves from prospect to discovery call to proposal to negotiation to closed. WhatsApp messages from leads create contact records automatically. When a deal moves stages, you get notified.

### Social & Campaign Management

Schedule content, manage inboxes, and run ad campaigns across Instagram, Facebook, TikTok, X (Twitter), LinkedIn, and YouTube for every client from one calendar.

### WhatsApp Integration

Real WhatsApp Cloud API. Send messages, broadcast to segments, set up automated follow-ups, track response times. Every outbound message is logged. To activate, complete Meta Business Verification for your WhatsApp number and set the credentials in `.env`.

### Ads Management

Connect Meta Ads, Google Ads, and TikTok Ads accounts. Sync campaign data (impressions, clicks, spend, conversions, ROAS) live from the APIs.

### Website Tracking Pixel

A JavaScript snippet you drop on your clients' websites. Tracks pageviews, clicks, form submissions, user sessions. Generated automatically from the API for each business.

### Export/Trade

For businesses that move goods across borders. Track shipments from origin to delivery (pending, in transit, cleared, delivered). Manage supplier and buyer contacts, customs documents, payment status, and incoterms.

### Automations

When a WhatsApp message comes in, send an auto-reply. When a deal stage changes, notify the team. When a tracking event fires, create a lead. On a schedule, run reports or send broadcasts. Every action is audit-logged.

### Before/After Reports

Shareable reports showing revenue, response times, ad performance, pipeline growth, new contacts, and follow-ups completed for a given period. Real numbers, computed from the data.

### Response Time Tracking

WhatsApp messages and emails are timed. Set a target (e.g., respond within 2 minutes). When you exceed it, it is logged as a breach. Follow-ups are scheduled automatically.

### Audit Logging & Tenant Isolation

Every action is recorded in the audit log. Data is isolated per business. A client can never see another client's data. You see everything across your portfolio. Your clients see only their business.

## What You Can Do Right Now

1. Run `pnpm dev:all` (frontend on :8443, backend on :3001)
2. Open the dashboard from the landing page
3. Click "+ NEW BUSINESS" to add a business
4. Fill in name, owner, industry, city, revenue
5. See it appear in your portfolio
6. Click into it to access CRM, pipeline, social, and finance tabs

To connect real integrations, copy `.env.example` to `.env` and fill in the credentials.

## Architecture

```
Frontend                       Backend
Vite + React 19                Hono + SQLite
Tailwind CSS v4                better-sqlite3
Recharts                       JWT auth
Lucide React                   axios (external APIs)

src/pages/Landing.tsx          server/src/index.ts
src/pages/Auth.tsx             server/src/routes/ (auth, businesses, whatsapp, social, ads, tracking, automations, export-trade, audit)
src/pages/Operator.tsx         server/src/services/ (whatsapp, social, ads, automations, tracking, reports)
src/pages/Business.tsx         server/src/db/ (schema, index)
src/data/store.ts              server/src/middleware/ (auth, tenant, audit)

/api proxy through Vite dev server → localhost:3001
```

## Quick Start

```bash
pnpm install
pnpm dev:all
```

Open http://localhost:8443, click "OPEN DASHBOARD", click "+ NEW BUSINESS".

## Prerequisites for Integrations

| Integration | What You Need | Where to Get It |
|-------------|---------------|-----------------|
| WhatsApp | Meta Business Verification + WABA | developers.facebook.com/docs/whatsapp/cloud-api/get-started |
| Meta Ads | Meta App + Access Token | developers.facebook.com |
| Google Ads | Developer Token + OAuth | developers.google.com/google-ads |
| TikTok Ads | Access Token + Advertiser ID | ads.tiktok.com |
| X (Twitter) | Bearer Token + API Keys | developer.twitter.com |
| YouTube | API Key | console.cloud.google.com |
| LinkedIn | OAuth Access Token | developer.linkedin.com |
| Website tracking | None (copy snippet) | /api/tracking/snippet/{businessId} |

## Branches

**master** — production
**staging** — pre-production for testing

**Iyamah Goodness**
Founder, Growth Network
[GitHub](https://github.com/GoodnessFx) · IG @Youtube
