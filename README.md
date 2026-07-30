# Growth Network — The African Business Command Center

**Iyamah Goodness (Founder of Growth Network) · Grow with IG @Youtube**

---

Most business software is built for San Francisco startups with $5M in seed funding. This one is built for Lagos, Accra, Nairobi, and Cape Town — where a single operator manages 10 businesses, WhatsApp is your CRM, and real growth means tracking shipments, running Meta ads, and answering client messages before your competitor does.

Growth Network is not a dashboard. It is an **operating system for agencies, operators, and holding companies** that manage multiple African SMEs. It replaces the 14 tabs, the WhatsApp-forwarding chaos, the "send me a screenshot of the analytics" loops, and the Excel sheets that hold your business together.

---

## What It Does

### One Screen. Every Business.

Log in and see every business you manage — their revenue, pipeline value, social growth, campaign performance, and health status — all on one grid. No clicking through ten tabs. No "let me check and get back to you."

### Real CRM That Matches How Africa Works

Contacts, deals, pipeline stages, and activity timelines. The kanban reflects how B2B deals actually move in African markets — not Silicon Valley fiction. Every interaction is logged, every follow-up is tracked.

### Unified Social & Campaign Management

Schedule content, manage inboxes, and run ad campaigns across Instagram, TikTok, Facebook, X (Twitter), LinkedIn, and YouTube — for every client, from one calendar. No more logging into 7 accounts per client.

### WhatsApp Business Integration

Real WhatsApp Cloud API integration. Send messages, broadcast to segments, set up automated follow-ups, and track response times. Every outbound message is logged. Every missed response is flagged. The days of "sorry, I didn't see your message" are over.

### Multi-Platform Ads Management

Connect your Meta Ads (Facebook/Instagram), Google Ads, and TikTok Ads accounts. Pull real campaign data — impressions, clicks, spend, conversions — for every client, in one view. Sync live from the APIs, not from CSV exports.

### Website Tracking Pixel

Drop a JavaScript snippet on your clients' websites and track pageviews, clicks, form submissions, and user journeys. Know which campaigns are driving real traffic — not just vanity metrics.

### Export/Trade Vertical

For businesses that move goods across borders: track shipments from origin to delivery, manage supplier and buyer contacts, log customs documents, monitor payment status (pending/partial/completed), and set incoterms. From "order placed" to "cleared at port" in one place.

### Before/After Growth Reports

Generate shareable reports that show exactly what changed during a period. Revenue before vs. after. Response times before vs. after. Ad performance before vs. after. Pipeline growth before vs. after. No fluff, no "we think we grew" — real numbers your clients can trust.

### Automation That Actually Triggers

Not "toast notifications about what could happen." Real automations:

- When a WhatsApp message comes in → send an auto-reply
- When a deal stage changes → notify the team
- When a tracking event fires → create a lead
- On a schedule → run reports or send broadcasts

Every action is audit-logged. Every trigger is testable.

### Audit Logging & Tenant Isolation

Every action — who did what, to which resource, when — is recorded in the audit log. Data is strictly isolated per business. A client can never see another client's data. You can.

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React 19     │────▶│  Hono API    │────▶│  SQLite/Better   │
│  + Tailwind   │     │  Server      │     │  SQLite3         │
│  + Recharts   │     │  (TypeScript)│     │                  │
└──────────────┘     └──────┬───────┘     └─────────────────┘
                            │
                     ┌──────┴───────┐
                     │  External    │
                     │  APIs        │
                     ├──────────────┤
                     │ WhatsApp     │
                     │ Meta/Google  │
                     │  Ads         │
                     │ Social APIs  │
                     │ Payment      │
                     └──────────────┘
```

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 + Recharts + Lucide React
- **Backend**: Hono (lightweight TypeScript web framework) on Node.js
- **Database**: SQLite via better-sqlite3 with WAL mode
- **Integrations**: WhatsApp Cloud API, Meta Graph API, Google Ads API, TikTok Ads API, Twitter API v2, YouTube Data API, LinkedIn API

---

## Quick Start

```bash
# Install everything
pnpm install

# Start frontend (port 8443)
pnpm dev

# Start backend (port 3001)
pnpm dev:server

# Or start both together
pnpm dev:all
```

## Env Setup

Copy `.env.example` to `.env` and fill in the credentials for the integrations you need. For WhatsApp to work, you need to complete Meta Business Verification first — see the `.env.example` comments for the walkthrough link.

---

## Prerequisites

You need real API credentials for each integration you want to use:

| Integration | What You Need | Where to Get It |
|-------------|---------------|-----------------|
| WhatsApp Cloud API | Meta Business Account + WABA + Phone Number ID | developers.facebook.com |
| Meta Ads | Meta App + Access Token + Ad Account ID | developers.facebook.com |
| Google Ads | Developer Token + OAuth 2.0 Credentials | developers.google.com/google-ads |
| TikTok Ads | Access Token + Advertiser ID | ads.tiktok.com |
| X (Twitter) API | Bearer Token + API Keys | developer.twitter.com |
| YouTube Data | API Key | console.cloud.google.com |
| LinkedIn API | OAuth Access Token | developer.linkedin.com |

---

## Branches

- `master` — Production-ready, deployed
- `staging` — Pre-production, integration testing

---

## Why Growth Network?

Because running 10 businesses shouldn't require a 10-person ops team. Because your clients deserve response times under 2 minutes, not "between now and never." Because Nigerian, Ghanaian, Kenyan, and South African entrepreneurs deserve software that understands their markets instead of forcing them into foreign workflows.

We manage each company personally. We ensure they grow. That is the deal.

**Iyamah Goodness**
Founder, Growth Network
IG @Youtube
