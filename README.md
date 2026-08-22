# Growth Network

Growth Network is the operating system for small business growth. We combine software, automation, and a real execution team so growing businesses get what larger companies take for granted, technology, design, and operations that actually work together, without needing to hire and manage five separate vendors.

## The Problem

Small and growing businesses are underserved by the freelance and agency market. A business that needs a website, a social media presence, an inventory system, and basic automation today has to find, vet, and manage four or five separate freelancers who never talk to each other, work in different tools, and leave the business owner as the only person holding the full picture.

This is expensive in time, not just money. Business owners become project managers for their own growth instead of running their business.

## The Solution

Growth Network is a single platform and team that a business works with for everything it needs to grow and operate, software, design, automation, and operational tooling, coordinated through one dashboard instead of scattered across disconnected vendors.

Clients get a live dashboard showing their content calendar, growth metrics, active projects, and service requests in one place. Our team executes the work behind it, using the same platform to manage every client relationship consistently as we scale.

## How It Works

1. A business signs up and completes a short intake covering their goals, current tools, and immediate needs
2. They are matched to the relevant service categories, software, design, automation, or operations support
3. Work is scoped, tracked, and delivered through the platform, visible to the client in real time
4. Growth metrics, content performance, and project status are tracked continuously, not reported once and forgotten

## Service Categories

### Software and Web
Websites, web applications, mobile apps, and custom internal tools built around a specific business workflow, quote calculators, inventory trackers, booking systems, and similar tools.

### Design and Branding
Logo and brand identity, marketing materials, social media graphics, and visual assets built to a consistent standard.

### Automation and AI
Chatbots, automated customer service and quote handling, email automation, and AI content tools trained on a client's brand voice.

### Business Operations Support
Lightweight accounting and invoicing tools, inventory dashboards, CRM setup, and reporting automation for businesses still running on spreadsheets or notebooks.

### Growth and Marketing
Social media management, content scheduling, paid advertising across Google, Meta, and LinkedIn, SEO, and growth reporting.

### Custom Requests
Any need outside the categories above is scoped and delivered as a tracked project through the same platform, so the business always has one place to see everything happening across their engagement with us, regardless of what it is.

## Platform Features

### Client Dashboard
A single view per client showing active projects, scheduled content, growth metrics over time, and open service requests.

### Social Media Scheduling Calendar
A per business content calendar supporting draft, scheduled, and published posts across Instagram, LinkedIn, and Facebook, connected directly to each business's social accounts through OAuth.

### Growth Analytics
Follower growth, engagement, and website or lead traffic tracked over time and visualized as real progress charts, not static snapshots.

### Lead and CRM Tracking
Inquiries from client websites are captured and tracked from new to converted, visible to both the client and our team.

### Service Request and Project Management
Clients can submit new requests directly through the platform. Our internal team scopes, assigns, and tracks delivery, so every engagement, regardless of category, moves through the same visible process.

### Authentication and Data Security
Built on Supabase with row level security, so every client's data is fully isolated, and every team member has their own authenticated account with appropriate access.

## Why Now

AI and no code tooling have made it possible for a small, focused team to deliver what used to require a much larger agency. Growth Network is built to take advantage of that shift, offering businesses full stack growth support at a fraction of the traditional cost, while giving our own team the leverage to serve far more clients than a traditional agency structure would allow.

## Two-Role Model

As of August 2026, Growth Network operates a two-role, two-login system:

| Role | Who | What they see |
|------|-----|---------------|
| **Operator** | The agency founder (Goodness Iyamah) | Full portfolio view — all businesses, analytics, agency tools. Read-only over business-level content. |
| **Owner** | An individual client business | Their own business only — full read/write over their own data, never another business. |

Both roles are routed correctly after login. The Operator dashboard surfaces the full portfolio and all agency tools. The Owner dashboard is scoped to a single business with vertical-aware terminology (Generic SME, Law Firm, Clinic/Hospital, School/University).

---

## Agency Growth Tools

Six tools built exclusively for the Operator side to grow the agency itself:

| Feature | Description | Status |
|---------|-------------|--------|
| **Ask GrowthNet** | In-app data assistant scoped to one business's data — answers revenue, lead, and client questions with cited sources. Refuses cross-business queries by design. | ✅ Built |
| **Prospecting Engine** | Enter a target industry + location → ranked list of businesses with absent web presence, each with a pre-filled personalised pitch. Review-and-send queue via WhatsApp (`wa.me` links). Logs outcome per pitch. | ✅ Built |
| **Proposal Generator** | Short form → client-ready proposal + contract in under a minute, pre-filled with your GTBank details (Goodness Iyamah, ****7763) and standard terms per deal type. Status tracking: sent → viewed → signed → paid. Shareable public link. | ✅ Built |
| **Churn Radar** | Watches every managed client for early risk signals (login drop-off, invoice overdue, feature abandonment). Ranked at-risk list with explicit reasons. Read-only — flags risk, doesn't auto-message. | ✅ Built |
| **Referral Engine** | Each client gets a unique trackable referral link. System queues referral prompts at the right moment (post-milestone), stops at a review step before anything sends. Leaderboard of top-referring clients. | ✅ Built |
| **Reseller Mode** | White-label layer — other freelancers/agencies run GrowthNet under their own brand (logo, name, accent color). Platform owner earns a flat revenue share per reseller. Rollup view across all resellers. | ✅ Built |

---

## Owner Dashboard Pages

Six pages available to every Owner-role user, vertical-aware throughout:

| Page | Description | Status |
|------|-------------|--------|
| **Overview** | Business health at a glance — revenue trend, action items, quick links | ✅ Built |
| **Setup Wizard** | 4-step guided onboarding: profile, offering, channel, done | ✅ Built |
| **Ideas & Suggestions** | 8 data-signal suggestions categorised by revenue / automation / clients / savings | ✅ Built |
| **Clients & Leads** | Full CRM with vertical-aware terminology, pipeline stages, contact profiles | ✅ Built |
| **Analytics** | Revenue trend, KPIs, channel breakdown, month-on-month table | ✅ Built |
| **Invoices** | Create, track, and mark invoices paid — with outstanding/overdue summary | ✅ Built |

---

## Unique Features (all authenticated users)

| Feature | Description | Status |
|---------|-------------|--------|
| **Growth Twin** | "What if" simulator using real historical data — 4 scenarios (ads, hire, price, churn) with low/expected/high ranges and plain-English assumptions | ✅ Built |
| **Portfolio Exchange** | Internal marketplace for businesses in the same portfolio to refer overflow work to each other | ✅ Built |
| **Compliance Tracker** | Vertical-aware deadline tracker (court filings for law firms, NAFDAC for clinics, exam cycles for schools) | ✅ Built |
| **AI Front Desk** | Owner-configured WhatsApp FAQ bot — answers questions, takes bookings, escalates to human when out of scope | ✅ Built |
| **Proof Engine** | Auto-generated shareable case study from real growth data — "Revenue up 34% in 90 days" with chart, no manual writing | ✅ Built |
| **Financial Health Score** | Explainable score (not a black box) from revenue trend, consistency, and receivables health — foundation for future lender integration | ✅ Built |

---

## Vertical Configuration

Four starter verticals — each changes CRM terminology, pipeline stage names, KPI labels, and compliance deadline types:

| Vertical | Contacts | Leads | Deals | Compliance |
|----------|----------|-------|-------|------------|
| Generic SME | Customers | Leads | Deals | Tax / licence |
| Law Firm | Clients | Enquiries | Matters | Court deadlines |
| Clinic / Hospital | Patients | New Patients | Appointments | NAFDAC / board |
| School / University | Students | Applicants | Enrolments | Accreditation |

Adding a 5th vertical is a data change in `src/lib/verticals.ts` — no page rewrites.

---

## Current Status

- Frontend built and live
- WhatsApp Business API integration in place
- OAuth integrations connected for LinkedIn, X, Meta, and Google Ads
- **Backend migrated to Supabase** for persistent, secure client data, with RLS applied.
- **Social media scheduling calendar** developed and integrated into the dashboard.
- **Client dashboard** deployed with active project tracking and growth charts.
- **Service request tracking** and custom client needs pipeline is live.
- **Leads pipeline** implemented.

## Roadmap

- Complete Supabase migration for remaining edge cases (e.g., removing remaining synchronous local storage fallbacks across the entire app)
- Expand automation and AI tooling for client facing chat and quote systems
- Expand historical charting capabilities with real platform data syncs
