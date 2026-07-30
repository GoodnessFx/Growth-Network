# Growth Network — Product Requirements Document

---

## Step 0 — Interrogate the Premise

### What do SMEs in emerging markets actually struggle with?

| Problem | How it differs from US/EU enterprise |
|---|---|
| **Cash-heavy economy** — most transactions are cash-on-delivery, bank transfer, or mobile money (Paystack, Flutterwave, OPay, USSD). Credit cards are rare. | HubSpot/Salesforce assume credit-card billing and Stripe connectivity. |
| **WhatsApp-first communication** — the primary customer channel is WhatsApp, not email. A Lagos salon owner manages her entire client relationship through WhatsApp broadcast lists and broadcast statuses. | Every US CRM is email-inbox-first; WhatsApp integration is an afterthought or premium add-on. |
| **Low bandwidth / intermittent connectivity** — 3G in many areas, frequent power/internet outages. Mobile data is expensive relative to income. | US/EU tools assume always-on, high-bandwidth connections. |
| **Low trust in software** — many business owners have been burned by "digital transformation" promises that delivered nothing. They trust a person (like you, the operator) more than a dashboard. | Enterprise SaaS sells through PDF whitepapers and demo calls. |
| **Multi-business operators** — the actual SME services market in West Africa is run by agencies/operators who manage marketing, social media, and operations for multiple businesses simultaneously. This is not a "partner program" — it's the primary business model. | GoHighLevel has a white-label agency mode, but it's designed for US marketing agencies, not for operators who are also doing their clients' daily social posting, invoice chasing, and client communication. |
| **Industry-specific workflows** — e.g. logistics companies need to track delivery status, salons need booking + inventory, schools need fee payment tracking. A generic CRM doesn't fit. | Most SaaS products force-fit into horizontal categories. |
| **Local currency + inflation** — reporting in NGN that inflates 20%+/year means "revenue growth" needs to be shown in real (inflation-adjusted) terms, not just nominal. | US tools assume stable currency. |

### What's genuinely differentiating vs checkbox parity?

**Genuinely differentiating:**
- The Operator/Agency Command Center — cross-business portfolio view as a first-class feature, not a white-label add-on
- WhatsApp-native CRM — not "WhatsApp integration," but a CRM whose primary contact model is WhatsApp (email is secondary)
- Offline-first architecture for low-bandwidth markets
- Local payment rails as first-class (Paystack, Flutterwave, Mono, bank transfer, USSD — not just Stripe)
- Multi-currency with inflation-aware reporting
- Industry templates that actually fit: logistics delivery tracking, salon booking + inventory, school fee management

**Checkbox parity (only build these in v2/v3):**
- SEO tooling (nobody in a Lagos market is doing keyword gap analysis)
- Landing page builder (Canva + WhatsApp already solves this)
- Full automation/workflow builder (nobody has the patience to configure triggers and actions in v1)
- Employee management / HR (out of scope for an agency owner's tool)
- Marketplace (partner model comes much later)

### The wedge feature for week-one onboarding

**A single WhatsApp message that says: "Your growth report for this week is ready."**

The wedge is not a CRM feature or a marketing hub. It's the **WhatsApp Growth Report** — a weekly automated message sent to the business owner on WhatsApp showing:
- Revenue this week vs last week
- New clients this week
- Top-performing social post
- A single action item (e.g. "3 leads haven't been contacted")

The business owner doesn't need to log in to anything. The report arrives in their primary communication channel. This builds trust, shows immediate value, and creates the data pipeline that powers everything else.

You (the operator) get the data by connecting the business's payment account, social accounts, and WhatsApp Business API — once. Then the reports flow automatically.

### What NOT to build in v1

1. **Full self-serve signup** — every business should be onboarded by you (the operator). This is a feature, not a limitation: you collect their data, set up their accounts, and configure their reports.
2. **Automation builder / workflow engine** — too complex, too abstract. In v1, you do things manually on behalf of clients. Automation comes in v2 when patterns are proven.
3. **Marketplace / template store** — no third-party extensions until the core product is sticky.
4. **Employee management / attendance / payroll** — this is an HR tool, not a growth tool.
5. **Custom landing page builder** — Canva + link-in-bio tools already work fine.

---

## Step 1 — Product Vision

### One-sentence pitch

> "Growth Network is the command center that lets me run growth, marketing, and operations for all my client businesses from one place — and sends each of them a WhatsApp report every week showing their numbers went up."

### Why choose it over manual work?

| Alternative | Why Growth Network wins |
|---|---|
| **Manual (spreadsheets + WhatsApp + Canva)** | You're doing this now. It doesn't scale past 3-5 clients. Growth Network is your force multiplier — one dashboard for all clients, automated reports, growth history you can show prospects. |
| **WhatsApp Business** | No analytics, no portfolio view, no growth history, no multi-platform social management. Great for one business; useless for managing 10. |
| **Canva + Google Forms** | No data integration, no CRM, no pipeline, no cross-client reporting. You have to manually copy numbers between tools. |
| **GoHighLevel** | Too expensive in NGN terms ($397/mo = ~₦600K). Built for US agencies doing high-ticket sales funnels. Terrible offline support. No Paystack/Flutterwave. CRM assumes email-first. |
| **HubSpot / Salesforce** | Insanely expensive, over-featured, salesforce workflow. Don't even support NGN currency properly. Requires dedicated IT admin. |

### The actual moat

1. **Operator data network effect** — every business you onboard feeds data into your portfolio. The value of Growth Network compounds: more businesses = better cross-portfolio benchmarks = stronger growth proof for winning new clients. Your portfolio IS the moat.
2. **Offline-first infrastructure** — if the internet goes down in Lagos, your dashboard still works and queues changes for sync. No competitor does this.
3. **WhatsApp-native data model** — the primary customer identifier is a phone number, not an email. The primary communication channel is WhatsApp, not email. This is a fundamental architectural choice that incumbents can't retrofit.
4. **Local payments + multi-currency** — native Paystack, Flutterwave, bank transfer tracking, and USSD payment reminders. Stripe-only tools can't compete in markets where Stripe doesn't operate.

---

## Step 2 — Phased Roadmap

### Phase 0 — Foundation (you now, before any code)

The product roadmap is driven by your existing client work. Each real business you onboard as a "manual client" becomes a specification document:
- What data do you track for them?
- What reports do you send them?
- What actions do you take on their behalf?
- What would automate the most tedious parts?

**Do not code until you have 3-5 real client workflows documented.** The code should encode your workflow, not guess it.

---

### MVP (v1) — Operator Command Center for 3-5 existing clients

**Target user: You (the operator).** Client-facing features are read-only minimum.

**Time to ship: 8-12 weeks with one developer.**

#### Modules (3-5 only)

| Module | What it does | Who operates it |
|---|---|---|
| **1. Business Registry & Data Ingestion** | Onboard a business: name, industry, currency, connected accounts (Paystack/Flutterwave for payments, Instagram/Facebook/TikTok for social, WhatsApp Business API). Pull in existing data (clients, transactions, followers). | Operator sets up. Business owner provides access. |
| **2. Portfolio Dashboard** | Grid of all businesses with health status (growing/flat/declining), key metrics (revenue MTD, client count, social followers, pipeline value), mini sparklines for revenue trend. Search, filter by status. | Operator views and drills into any business. |
| **3. Per-Business Dashboard** | Drill into one business: key metrics, revenue chart, client list, social follower chart, content calendar, invoices, open tasks. | Operator manages. Business owner can view a restricted read-only version. |
| **4. WhatsApp Growth Reports** | Weekly automated WhatsApp message to each business owner: revenue vs last week, new clients, top social post, action item. Generated from ingested data. No login required. | System generates. Operator reviews before send (initially). |
| **5. Client CRM (Light)** | Contact list per business with phone, notes, tags, last contact. Add contacts manually or imported from WhatsApp. Basic activity log. | Operator maintains. |

**Client-facing in v1:** A single shareable link per business that shows their dashboard in read-only mode. No login, no self-serve signup.

**Explicitly NOT in v1:**
- Marketing hub / campaign manager
- Ad management
- Automation builder
- Invoicing/generate invoices (track existing invoices only)
- Self-serve signup
- Multi-platform social scheduling
- AI features beyond simple report generation
- Inventory management

v1 is a **read-and-report** tool for the operator. The only write operations are adding clients to the CRM and tagging data.

---

### v2 — Operator Workspace + Limited Client Access

**Trigger to build v2:** You have 10+ businesses onboarded and 3+ months of growth history showing real results. Clients are asking "can I log in and see this myself?"

**Time to ship: 4-6 weeks after v1 stabilizes.**

#### New modules

| Module | What it adds |
|---|---|
| **Unified Social Inbox** | View and reply to DMs from Instagram, Facebook, and WhatsApp for all businesses in one inbox. Reply on behalf of any business without switching accounts. |
| **Campaign Tracker** | Track ad campaigns per business: platform, spend, clicks, conversions, ROAS. Data entered manually or imported from Meta/TikTok ads manager. Not a campaign creator — a tracker. |
| **Basic Client Self-Serve** | Login for business owners. They see their own dashboard — CRM, metrics, growth charts. Cannot see other businesses or the operator portfolio. |
| **Invoice Tracking** | Mark invoices as paid/pending/overdue. Track outstanding and overdue totals. No invoice generation yet (that's v3). |
| **Growth History Timeline** | Store monthly snapshots: client count, revenue, social followers. Operator can annotate milestones. Used for before/after proof when selling to new clients. |
| **AI Alerts** | "Business X has 5 stale leads." "Business Y's ad spend ROAS dropped below 2×." "Business Z hasn't been updated in 7 days." |
| **Bulk Actions (Limited)** | Push the same message or campaign offer to multiple businesses. E.g. send "Eid promo template" to 5 restaurant clients. |

---

### v3+ — Full Operating System

**Trigger:** You have 20+ businesses, at least one person helping you, and clients are actively using their self-serve views.

#### Full ambition features (not exhaustive)
- **Marketing Hub**: multi-channel campaign builder, AI copywriter, segmentation
- **Sales Pipeline**: kanban with win/loss analysis, deal tracking per business
- **Social Media Management**: full scheduler with AI captions, content calendar across all platforms
- **Website/Landing Page Builder**: with WhatsApp-click-to-chat and Paystack payment integration
- **Booking & Scheduling**: with automated WhatsApp reminders
- **Invoicing, Payments & Finance**: generate invoices, send payment links, track cash flow, multi-currency
- **Inventory Management**: integrate with Olakanmbe POS for stock tracking
- **Automation/Workflow Builder**: visual trigger-action with WhatsApp, email, and social channels
- **AI Employees**: Marketing Manager, Sales Rep, Financial Analyst, Content Creator (see Step 4)
- **Marketplace**: templates, AI agent extensions, industry-specific plugins
- **Industry Templates**: pre-built for logistics, salons, restaurants, schools, churches, real estate, healthcare, construction
- **Full Self-Serve**: businesses can sign up, onboard themselves, and use Growth Network without an operator
- **Admin Panel**: subscription management, audit logs, role-based access, AI usage metering

---

### Step 2.5 — Operator / Agency Command Center (first-class, v1)

This is not an "admin panel" — it is the primary product interface from v1 onward.

#### Architecture

```
┌─────────────────────────────────────────────┐
│  OPERATOR PORTFOLIO  ───  (v1)             │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Business │ │ Business │ │ Business │      │
│  │  A       │ │  B       │ │  C       │      │
│  │ Growing  │ │ Flat     │ │ Declining│      │
│  │ ₦4.8M    │ │ ₦1.6M    │ │ ₦1.2M    │      │
│  │ ↑31%     │ │ ↑2%      │ │ ↓18%     │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │             │
│       ▼            ▼            ▼             │
│  ┌──────────────────────────────────────┐    │
│  │         DRILL INTO BUSINESS          │    │
│  │  [Overview] [CRM] [Social] [Finance] │    │
│  └──────────────────────────────────────┘    │
│                                             │
│  ┌──────────────────────────────────────┐    │
│  │       CROSS-PORTFOLIO VIEWS          │    │
│  │  Compare | Campaigns | Alerts        │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### Key design decisions

- **One login, many businesses:** The operator logs in once and sees every business. Switching between businesses is a click, not a re-login.
- **No business sees another:** Every client-facing view is scoped to that business only. The operator sees everything.
- **White-label by default:** Each business's client view shows their own brand (name, logo, colors). The operator sees a unified interface.
- **Onboarding pipeline is the sales CRM:** The operator's pipeline view doubles as their CRM for winning new clients — from cold prospect through onboarded-and-active.
- **Alerts are cross-portfolio:** AI-generated alerts aggregate across all businesses, so the operator can prioritize by urgency, not by which business they happened to check.

---

### Step 2.6 — Visual Growth & Analytics Layer

#### Charting library: Recharts (already in the stack)

Recharts is the right choice for v1-v2 because:
- Built on React components (no separate D3 learning curve)
- Good enough for line, bar, area, funnel, and sparkline charts
- Responsive containers work out of the box
- Custom tooltips and legends are straightforward React components
- Widely adopted = lots of examples and community support

**Upgrade path:** If/when performance becomes an issue with 50+ businesses and years of data, consider moving to a canvas-based library (CanvasJS, uPlot, or a WebGL solution). This is a v3 concern.

#### Analytics data model

The key to fast per-business AND cross-portfolio queries is a **time-series fact table**:

```sql
CREATE TABLE growth_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id),
  snapshot_date   DATE NOT NULL,
  
  -- Revenue & financial
  revenue_mtd     NUMERIC(14,2) NOT NULL DEFAULT 0,
  revenue_ytd     NUMERIC(14,2) NOT NULL DEFAULT 0,
  outstanding     NUMERIC(14,2) NOT NULL DEFAULT 0,
  overdue         NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  -- Clients
  total_clients   INTEGER NOT NULL DEFAULT 0,
  new_clients_mtd INTEGER NOT NULL DEFAULT 0,
  churned_clients INTEGER NOT NULL DEFAULT 0,
  
  -- Social (per platform stored in separate table)
  total_followers INTEGER NOT NULL DEFAULT 0,
  
  -- Pipeline
  pipeline_value  NUMERIC(14,2) NOT NULL DEFAULT 0,
  deal_count      INTEGER NOT NULL DEFAULT 0,
  
  -- Computed health
  health_score    DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for per-business time-series queries
CREATE INDEX idx_snapshots_business_date ON growth_snapshots(business_id, snapshot_date DESC);

-- Index for cross-portfolio queries
CREATE INDEX idx_snapshots_date ON growth_snapshots(snapshot_date DESC);

-- Index for health scans
CREATE INDEX idx_snapshots_health ON growth_snapshots(business_id, health_score DESC);
```

**Data flow:**
1. Daily cron job (or webhook trigger) captures snapshot per business
2. Charts query snapshots by date range (no recomputation needed)
3. Cross-portfolio views aggregate snapshots by date across business_ids
4. Before/after snapshots are just two date queries with a comparison function

**Chart types per requirement:**

| Requirement | Chart type | Data source |
|---|---|---|
| Revenue over time | Area/Line chart | `growth_snapshots` filtered by business_id + date range |
| Client growth (new vs returning) | Stacked bar chart | `growth_snapshots.new_clients_mtd` + `total_clients` |
| Pipeline value over time | Area chart | `growth_snapshots.pipeline_value` |
| Social followers per platform | Bar chart | `social_platform_snapshots` (sub-table of above) |
| Ad funnel | Funnel chart | Campaign spend → clicks → conversions |
| Cross-business comparison | Horizontal bar chart | `growth_snapshots` aggregated by business_id |
| Portfolio health grid | Color-coded cards | `health_score` with color threshold |
| Exportable before/after | PDF/image from chart capture | `html2canvas` + `jspdf` or Recharts refs |

---

## Step 3 — Full Feature Brainstorm

### Customer Acquisition (v3+)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Lead generation forms with WhatsApp-CTWA | "Lead quality score" based on how many WhatsApp messages they actually respond to | **Auto-follow-up scheduler** — if a lead doesn't reply on WhatsApp in 24h, auto-send a discount code or a voice note |
| Cold outreach (WhatsApp broadcast + email) | Smart sending window (don't send at 3 AM; send when target is usually active on WhatsApp) | **Referral network** — existing clients can refer other businesses and earn a month free (network effect) |
| Referral/affiliate tracking | Tiered affiliate: refer a business → get ₦ off; refer an agency → get revenue share | **WhatsApp-forward landing pages** — the entire LP is optimized to end with "Send us a message on WhatsApp" not "Enter your email" |
| Landing pages | A/B testing for WhatsApp vs email CTAs | **Local SEO auto-generation** — "Create a Google Business Profile + Bing Places listing for every client with one click" |

### CRM (v1 for contacts, v3 for full)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Contact profiles with phone, email, notes | Contact health score — based on recency of interaction, payment history, response rate | **WhatsApp conversation timeline** — full message history per contact pulled from WhatsApp Business API, searchable |
| Tags and segmentation | Auto-tag based on behavior: "opened promo", "referred friend", "didn't pay invoice" | **Relationship graph** — visual map of who-knows-who in a contact list (useful for referral-heavy businesses like salons and real estate) |
| Activity timeline | AI-generated "contact story" — summary of every interaction | **LTV prediction in local currency** — "This customer is worth ₦340K over 12 months. Spend up to ₦30K to retain them." |
| Notes with @mentions | Voice notes as CRM entries (Pidgin voice message → transcribed) | |
| Deal tracking | Win reasons with cultural context: "lost because competitor offered keke (motorbike) delivery and we didn't" | |

### Sales Pipeline (v2)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Kanban stages | WhatsApp-stage integration — move a deal when you send a proposal on WhatsApp | **Deal health forecast** — "This deal has been in negotiation for 14 days. Similar deals at this stage have a 40% chance of closing. Consider a follow-up call." |
| Win/loss analysis | Loss reasons categorized for emerging markets (price, trust, relationship, competitor, delivery) | **WhatsApp deal room** — a dedicated WhatsApp group for each deal with the prospect, operator, and relevant team members |
| Deal value + probability | Probability calibrated by industry (logistics deals close differently than salon deals) | |
| Activity logging per deal | Auto-log when you send a quote or schedule a meeting | |

### Marketing Hub (v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Multi-channel campaigns (WhatsApp + email + social) | **WhatsApp broadcast-first** — email and social are fallbacks, not the primary channel | **Pidgin/Yoruba/Hausa content generator** — AI writes the campaign copy in local languages with accurate cultural references |
| AI copywriter | Copy style tuned per industry ("salon copy" vs "logistics copy" vs "school copy") | **Campaign self-review** — "This campaign might underperform because your target audience usually engages at 7 PM, not 7 AM" |
| Audience segmentation | Segment by payment behavior (cash vs bank transfer vs card) | **WhatsApp broadcast analytics** — who opened, who clicked, who replied, who forwarded |
| | | **Offline campaign** — generate a USSD code + print flyer for businesses whose customers don't use smartphones |

### Social Media Management (v2-v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Post scheduling across platforms | **Local optimal posting times** — per city, per industry (not generic "best times to post") | **Growth guarantee tracking** — "Post 3×/week for 4 weeks and we guarantee +15% followers or we write your content for free" |
| AI caption generation | Captions in Pidgin, Yoruba, Hausa, Igbo — generated with local slang awareness | **Cross-business content recycling** — a post that performed well for one client → adapted for other clients in similar industries |
| Unified inbox (DMs from all platforms) | Auto-reply templates for common questions (pricing, hours, location, delivery) | **Competitor social monitoring** — "Your competitor just posted a promo. Consider responding." |
| Analytics per platform | Engagement rate vs local benchmark (not global average) | **Offline-first queue** — schedule posts while offline; they publish when connection returns |

### Website/Landing Page Builder (v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Drag-and-drop builder | **WhatsApp-as-landing-page** — the page loads as a WhatsApp chat interface, not a traditional webpage | **One-tap business card page** — generates a single link that shows business info, WhatsApp click-to-chat, catalog, and payment link — replaces printed business cards |
| Templates per industry | **Paystack/Flutterwave inline payment** — pay without leaving the page | **USSD page fallback** — if the user has a basic phone, the "page" is a USSD menu |
| SEO basics | | |

### Booking & Scheduling (v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Calendar with appointment slots | **WhatsApp booking** — "Book a slot" sends a WhatsApp message, bot handles the conversation | **Overbooking protection** — if a salon has 4 chairs and 6 bookings, auto-suggest rebooking |
| Automated reminders | **Voice note reminder** — the reminder is a recorded voice message in Pidgin or Yoruba, not an SMS | **Travel time buffer** — for Lagos traffic, auto-buffer 45 min between appointments |
| Payments on booking | **Partial deposit via Paystack** to reduce no-shows | |

### Invoicing, Payments & Finance (v2-v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Issue invoices | **Multi-currency per invoice** (e.g., invoice in USD but accept NGN at prevailing rate) | **WhatsApp invoice delivery** — invoice sends as a WhatsApp message with a Paystack payment link embedded |
| Track paid/pending/overdue | **Payment reminder sequence** — WhatsApp message → call → visit (escalating) | **Cash reconciliation** — "You recorded ₦500K in sales but deposited ₦420K. Explain the ₦80K difference." |
| Payment links (Paystack, Flutterwave) | **Partial payment tracking** — common in trade: pay 50% now, 50% on delivery | **Inflation-adjusted reporting** — show revenue in "real NGN" (adjusted for inflation) |
| Cash flow per business | **Expense tracking** with receipt photo via WhatsApp | **Portfolio cash flow** — total money in vs out across all managed businesses |

### Inventory (v3 — integration with Olakanmbe POS)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Stock levels per product | **WhatsApp stock check** — a customer can message "Do you have size 42?" and the system checks inventory | **Auto-order when stock drops below threshold** — generates a WhatsApp message to the supplier |
| Low stock alerts | **Inventory turnover rate per business** — how fast does each business sell through stock | **Bulk re-order for multiple businesses** — "5 restaurant clients all need palm oil. Order in bulk from the same supplier." |
| Supplier management | **Multi-location inventory** for businesses with multiple branches | |

### Projects/Tasks/Team Collaboration (v2)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Task list per business | **WhatsApp task creation** — forward a message to Growth Network and it becomes a task | **Portfolio task view** — see all overdue tasks across every business in one list |
| Assign to team member | **Voice note to task** — record a voice memo, it transcribes and creates a task | |
| Due dates + priorities | **Auto-task from alert** — "Client growth stalled. Create task to investigate?" | |

### Customer Support (v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Live chat (WhatsApp + web) | **AI triage** — "This is a pricing question → route to billing. This is a complaint → escalate." | **AI agent that knows the business** — not a generic chatbot, but one trained on the business's menu/pricing/FAQ |
| AI chatbot | **Fallback to human** with full context (not "type your question again") | **WhatsApp support ticket** — customer sends a message → auto-created ticket → reply goes back via WhatsApp |
| Ticketing system | Ticket → WhatsApp message (two-way) | |

### Automation/Workflow Builder (v3)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Trigger → action rules | **WhatsApp-triggered workflows** — when a customer sends "menu" → auto-reply with menu PDF | **Template workflows per industry** — "Salon onboarding" workflow: add to CRM → send welcome message → schedule first appointment → follow up after 24h |
| If-this-then-that builder | **Multi-step with human approval** — if automation requires spending money, pause and ask operator | **Portfolio-wide automations** — apply the same workflow to all clients in the same industry |
| Pre-built templates | | |

### Marketplace (v3+)

| Obvious | Hidden/Non-obvious | Doesn't commonly exist yet |
|---|---|---|
| Template store (industry forms, campaigns, automations) | **Operator-to-operator sharing** — operators can sell their custom templates to other operators | **Local developer API** — Nigerian/Egyptian/Kenyan devs can build extensions and earn revenue share |
| AI agent store | **Buy/sell growth reports** — share anonymized benchmarks | |
| Third-party integrations | | |

### Industry Templates (v3)

| Industry | Key workflow |
|---|---|
| **Logistics & Delivery** | Delivery tracking, driver management, proof of delivery photo, customer WhatsApp tracking |
| **Salons & Beauty** | Booking, inventory (products), staff schedule, client visit history |
| **Restaurants & Food** | Menu management, delivery orders, catering booking, inventory (ingredients) |
| **Schools & Education** | Fee payment tracking, student attendance, parent communication, exam schedule |
| **Churches & Religious** | Tithe/donation tracking, event scheduling, member directory, broadcast messaging |
| **Real Estate** | Property catalog, viewing scheduling, tenant payment tracking, maintenance requests |
| **Healthcare** | Appointment booking, patient records, prescription tracking, payment plans |
| **Construction & Trades** | Project milestones, material inventory, contractor payments, client communication |

### Admin Panel (v3)

- Subscription management (Stripe + Paystack billing)
- Audit logs (who did what in which business)
- Role-based access (operator, admin, client, team member)
- AI usage metering (how many AI-generated captions/reports per month)
- API key management for third-party access
- White-label configuration (custom domain, logo, brand colors per operator)

---

## Step 4 — AI Employee System

AI employees are not chatbots. Each has a role, responsibilities, inputs, outputs, and a human verification step.

### 1. Growth Report Analyst (v1)

| Aspect | Detail |
|---|---|
| **Role** | Generates the weekly WhatsApp growth report for each business |
| **Inputs** | Growth snapshots (revenue, clients, social followers, pipeline) for this week vs last week |
| **Outputs** | WhatsApp message with: revenue change, new clients, top post, action item. Format: text + optional chart image |
| **Automation level** | 90% — generates draft automatically. Human (operator) reviews before send. |
| **Verification** | Operator can edit the message or the numbers before it sends. In v1, operator must tap "Approve" for each report. In v2, auto-send unless flagged. |
| **Why NOT full auto in v1** | Bad data in = bad report out. Operator needs to validate data pipeline before trusting auto-send. |

### 2. Marketing Content Creator (v2)

| Aspect | Detail |
|---|---|
| **Role** | Writes social media captions, ad copy, and WhatsApp broadcast messages |
| **Inputs** | Business profile (industry, tone preference, past posts), campaign goal (awareness, sales, event), platform |
| **Outputs** | 3-5 caption options per post, with hashtags and CTA |
| **Automation level** | 80% — generates options. Human (operator or business owner) selects and may edit. |
| **Verification** | Each caption has a "quality score" (readability, engagement prediction). Human picks and can edit before posting. |
| **Critical for emerging markets** | AI must generate captions in Pidgin, Yoruba, Hausa, Igbo that don't sound like Google Translate. **This is a hard requirement for adoption.** |

### 3. Alerts & Monitoring Agent (v2)

| Aspect | Detail |
|---|---|
| **Role** | Monitors all businesses for anomalies and sends alerts to the operator |
| **Inputs** | Growth snapshots, campaign performance, social analytics, payment status |
| **Outputs** | Alert messages: "Revenue dropped 15% — investigate." "Client count flat for 30 days." "Lead hasn't been contacted in 7 days." |
| **Automation level** | 95% — alerts are auto-generated. Operator decides whether to act. |
| **Verification** | Alerts are read-only. Operator marks as "reviewed" or "action taken." |

### 4. Sales Assistant (v3)

| Aspect | Detail |
|---|---|
| **Role** | Helps qualify leads, schedule follow-ups, and draft proposals |
| **Inputs** | Lead info (source, industry, WhatsApp conversation history), business services/pricing |
| **Outputs** | "Lead scored 7/10 (high intent). Suggested next step: send pricing PDF." Draft proposal text. |
| **Automation level** | 60% — suggests, doesn't execute. Human sends the actual message. |
| **Verification** | Every suggested action requires human confirmation before any message goes to a lead. In low-trust markets, a cold AI message feels spammy; the human touch is critical. |

### 5. Financial Analyst (v3)

| Aspect | Detail |
|---|---|
| **Role** | Analyzes revenue, cash flow, and expenses per business and across portfolio |
| **Inputs** | Transaction data (from Paystack/Flutterwave/bank import), invoices, expenses |
| **Outputs** | "Cash flow positive this month. ₦120K overdue from 2 clients. Recommend sending payment reminders." |
| **Automation level** | 85% — numbers are auto-computed. Commentary is AI-generated. Human reviews. |
| **Verification** | Operator can override any financial figure. AI-generated commentary is clearly labeled. |

### Design principles for AI employees

1. **Every AI output is a suggestion, not a decision** — in low-trust markets, "AI did it" is not an acceptable answer. The human operator is accountable.
2. **AI is trained on YOUR data** — the more businesses you manage, the better the AI gets. It learns your industry mix, your communication style, your clients' preferences.
3. **No AI "personality"** — the AI doesn't pretend to be a person. All AI-generated content is labeled "AI-generated" unless the operator explicitly approves and removes the label.
4. **Offline-capable** — AI features should work with cached models (e.g., on-device inference for classification and summary). Cloud-only AI fails when the internet goes down.

---

## Step 5 — Nigeria/Emerging-Market Specific Design

### Offline-First Architecture

| Strategy | Implementation |
|---|---|
| **Local-first data** | IndexedDB in the browser caches all business data. Dashboard works fully offline. |
| **Sync queue** | Changes made offline are queued and synced when connectivity returns. Conflicts resolved by last-write-wins with operator notification. |
| **Graceful degradation** | Images and charts are cached. If a network request fails, show cached data with a "Data from [timestamp]" label. |
| **Lightweight payloads** | API responses are gzipped and stripped of unnecessary fields. Social graph data is compressed. |
| **PNG fallback for charts** | In v1, export charts as PNG for WhatsApp. In low-bandwidth areas, PNG is more reliable than interactive SVG. |

### WhatsApp as Primary Channel

| Design decision | Rationale |
|---|---|
| **Phone number is the primary ID** | Not email. The CRM key is a phone number. Email is optional metadata. |
| **WhatsApp Business API integration** | Send reports, invoices, appointment reminders, and campaign messages via WhatsApp. Email is backup. |
| **WhatsApp click-to-chat everywhere** | Every profile, every campaign, every landing page should have a WhatsApp CTA. Email CTA is secondary. |
| **WhatsApp conversation history** | Full message history per contact, synced from WhatsApp Business API. Searchable. |
| **Group support** | For logistics: delivery tracking group. For schools: parent group. |

### Local Payment Rails

| Payment method | Integration |
|---|---|
| Paystack | Primary online payment (cards, bank transfer, USSD) |
| Flutterwave | Backup/secondary online payment |
| Mono | Bank statement aggregation for financial analysis |
| OPay/M-Pesa | Mobile money (NGN/KES) |
| Direct bank transfer | Manual confirmation with receipt photo upload |
| USSD | Generate USSD payment codes for feature phones |
| Cash reconciliation | "I collected ₦50K in cash this week" entry — reconciled against expected revenue |

### Local Compliance

| Regulation | Implementation |
|---|---|
| **NDPR** (Nigeria Data Protection Regulation) | Data stored in Lagos/Africa. Explicit consent for data processing. Right to deletion. Data Protection Officer contact. |
| **GDPR** | Same protections, needed for any EU-based business or Stripe processing. |
| **CBN guidelines** | Payment processing follows Central Bank of Nigeria guidelines for fintech. |

### Local Language Support

| Language | Priority | Use case |
|---|---|---|
| **Pidgin** | High | AI captions, WhatsApp messages, chatbot responses. Most widely spoken informal language across West Africa. |
| **Yoruba** | Medium | Campaign copy for southwest Nigeria businesses. |
| **Hausa** | Medium | Campaign copy for northern Nigeria businesses. |
| **Igbo** | Medium | Campaign copy for southeast Nigeria businesses. |
| **Swahili** | Low (v3+) | For East Africa expansion (Kenya, Tanzania, Uganda). |

**Implementation approach:** Use a multilingual LLM (GPT-4, Claude, or local model) with few-shot prompts tuned per language. Each piece of AI-generated content in a local language must pass a "naturalness check" — a native speaker on your team (or a contracted reviewer) validates quality.

### Human-Assisted Onboarding

Many business owners will never self-serve. The onboarding path should be:

1. **Operator adds the business** (you do this for them)
2. **Initial data collection** — operator imports clients, connects payment/social accounts, configures profile
3. **Client receives "welcome" on WhatsApp** — "Hi, your business is now on Growth Network. Here's your dashboard link and your first growth report will arrive on [day]."
4. **Client never needs to log in** — all value is delivered via WhatsApp reports. Self-serve access is a bonus, not a requirement.

---

## Step 6 — CRM, Marketing, Sales, Finance (Deep Dive)

### CRM — Must outperform a dedicated CRM for an African SME

| Requirement | Design |
|---|---|
| **Phone-first profile** | The primary contact field is phone number. Email is optional. Click a phone number to open WhatsApp chat. |
| **WhatsApp timeline** | Every WhatsApp conversation with this contact is visible in the CRM timeline — including sent/received messages, media, and status. |
| **Tags with automation** | Tags can trigger actions: tag a contact "overdue" → auto-send WhatsApp payment reminder. |
| **Health score** | Computed daily: based on recency of interaction, payment regularity, referral activity. Color-coded (green/yellow/red). |
| **LTV prediction** | "This customer is on track to spend ₦X over 12 months based on their purchase frequency and average transaction value." |
| **Notes with voice** | Operator can record a voice note ("Emeka promised to pay next Tuesday") which is transcribed and saved as a note. |
| **Bulk actions** | Select 20 contacts → send WhatsApp broadcast. Select 5 overdue → send payment reminders. |
| **Import from WhatsApp** | Import contacts from a WhatsApp group or broadcast list. |

### Sales Pipeline — Must outperform a dedicated pipeline tool

| Requirement | Design |
|---|---|
| **Kanban adapted for African deals** | Stages: Lead → WhatsApp Intro → Discovery Call → Proposal → Negotiation → Closed Won/Lost. Deals move when you send a proposal or have a call — not just when you manually drag them. |
| **WhatsApp deal tracking** | When you send a proposal on WhatsApp, the deal automatically moves to "Proposal Sent" stage. |
| **Win/loss with local reasons** | "Lost to competitor with delivery," "Lost on price," "Won because of personal relationship," "Won because of faster response time." |
| **Deal health** | "This deal has been in negotiation for 21 days. Only 30% of similar deals close after 21 days. Send a follow-up." |
| **Pipeline value rollup** | Across portfolio: "You have ₦12.4M in pipeline across 8 deals. Expected close this month: ₦3.2M." |

### Marketing Hub — Must outperform a dedicated marketing tool for WhatsApp-first markets

| Requirement | Design |
|---|---|
| **WhatsApp broadcast-first** | Campaigns are created as WhatsApp broadcasts first. Email and social are secondary channels. |
| **AI copy with local language** | "Write a promo for my restaurant in Pidgin. Target: young professionals in Lagos. Offer: 20% off catering orders above ₦50K." |
| **Segmentation by behavior** | "Send this offer to customers who haven't ordered in 30 days." "Send this to customers who spent more than ₦20K last month." |
| **Campaign analytics per channel** | For WhatsApp: delivered, opened, replied, clicked link. For social: impressions, engagement, clicks. |
| **Scheduled sending** | Avoid 3 AM sends. Use optimal time based on industry and location. |
| **Compliance** | Must include opt-out instruction. WhatsApp requires opt-in for broadcasts. |

### Finance — Must outperform a dedicated bookkeeping tool for an agency

| Requirement | Design |
|---|---|
| **Multi-currency** | Set currency per business. Portfolio dashboard converts to operator's preferred currency at current rate. |
| **Invoice with payment link** | Invoice includes a Paystack/Flutterwave payment link. Send via WhatsApp. |
| **Payment tracking** | Mark as paid when webhook confirms. Manual confirmation for cash/bank transfer. |
| **Cash flow per business** | Money in (revenue, payments received) vs money out (expenses, supplier payments). |
| **Portfolio cash flow** | "Across all 12 businesses you manage, total cash in this month: ₦8.2M. Total out: ₦4.1M. Net: +₦4.1M." |
| **Inflation-adjusted reporting** | Toggle "nominal" vs "real" (adjusted for published inflation rate). Critical for showing actual growth in high-inflation economies. |
| **Overdue tracking** | Who owes how much and for how long. Auto-escalating reminders via WhatsApp. |

---

## Step 7 — Database & API Architecture

### Multi-Tenant Schema

```
organizations (tenants)
├── id UUID PK
├── name
├── slug
├── currency (default currency)
├── settings (JSONB — white-label config, feature flags)
├── created_at

businesses
├── id UUID PK
├── organization_id FK → organizations
├── name, industry, city, country
├── currency
├── status (active/suspended)
├── settings (JSONB — social accounts connected, etc.)
├── created_at

users
├── id UUID PK
├── email (unique per org)
├── phone (primary identifier)
├── role (operator/admin/client/team)
├── organization_id FK → organizations
├── settings (JSONB — preferences, notifications)
├── created_at

┌─────────────────────────────────────────┐
│  organizations (tenant)                  │
│  ┌─────────────┐  ┌─────────────┐       │
│  │   users     │  │  businesses │       │
│  │  (operator) │  │             │       │
│  └──────┬──────┘  └──────┬──────┘       │
│         │                │              │
│         ▼                ▼              │
│  ┌─────────────────────────────────┐    │
│  │      growth_snapshots           │    │
│  │  (time-series fact table)       │    │
│  └─────────────────────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ contacts │  │ deals    │  │social │  │
│  │ (CRM)    │  │(pipeline)│  │posts  │  │
│  └──────────┘  └──────────┘  └───────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ invoices │  │campaigns │  │tasks  │  │
│  └──────────┘  └──────────┘  └───────┘  │
└─────────────────────────────────────────┘
```

### Key Tables and Relationships

```sql
-- Core
organizations  1:N → businesses
organizations  1:N → users
users          N:M → businesses (via user_business_roles with role)

-- CRM
businesses     1:N → contacts
contacts       1:N → contact_interactions (WhatsApp messages, emails, calls)
contacts       N:N → tags (via contact_tags)

-- Pipeline
businesses     1:N → deals
deals          has stage_id → deal_stages
deals          has contact_id (who is the deal with)

-- Social
businesses     1:N → social_accounts
social_accounts 1:N → social_posts
social_accounts 1:N → social_inbox_messages

-- Finance
businesses     1:N → invoices
invoices       has contact_id (who to bill)
invoices       has payment_id → payment_transactions

-- Analytics (time-series)
businesses     1:N → growth_snapshots (daily)
businesses     1:N → social_snapshots (daily per platform)
businesses     1:N → campaign_snapshots (daily per campaign)

-- Automation
workflows (condition → action)
workflow_instances (per execution)
```

### Indexing Strategy

```sql
-- Every FK gets an index (standard)
CREATE INDEX idx_businesses_org ON businesses(organization_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_contacts_business ON contacts(business_id);
CREATE INDEX idx_deals_business ON deals(business_id);
CREATE INDEX idx_invoices_business ON invoices(business_id);

-- Time-series queries (most common query pattern)
CREATE INDEX idx_snapshots_business_date ON growth_snapshots(business_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_org_date ON growth_snapshots(business_id, snapshot_date DESC)
  WHERE organization_id = ?;  -- partial index per org for cross-portfolio

-- Search
CREATE INDEX idx_contacts_name ON contacts USING gin(name gin_trgm_ops);  -- fuzzy name search
CREATE INDEX idx_contacts_phone ON contacts(phone);  -- exact phone lookup

-- Auth
CREATE INDEX idx_sessions_user ON sessions(user_id, expires_at);
```

### API Design

**REST for CRUD, GraphQL for dashboards.**

Rationale:
- REST is simpler for write operations (create contact, create invoice, update deal stage)
- GraphQL enables dashboards to fetch exactly the data they need (metrics, snapshots, social data) in one request
- In v1, start with REST-only to reduce complexity. Add GraphQL in v2 when dashboard queries become complex.

**Webhooks:**
- Paystack webhook → update invoice status
- Flutterwave webhook → update payment
- WhatsApp Business API webhook → new message from contact
- Meta/TikTok webhook → social analytics update

**Background Jobs (BullMQ or similar):**
- `daily-snapshot` — capture growth snapshot for each active business (cron, midnight)
- `weekly-report` — generate WhatsApp growth report (cron, Monday 8 AM)
- `alert-check` — scan for anomalies and generate alerts (cron, every 4 hours)
- `social-analytics-sync` — pull latest follower counts from connected social accounts (cron, daily)
- `campaign-sync` — pull latest ad performance from Meta/TikTok (cron, daily)

### Auth Flow

```mermaid
Login → Email/Phone + Password → JWT (access + refresh)
         ↓
  2FA (TOTP) — optional, enabled per user
         ↓
  Role check → route to appropriate dashboard
```

- **JWT access token** — 30 min expiry
- **JWT refresh token** — 7 day expiry, stored in httpOnly cookie
- **Roles:** `super_admin` (you), `operator` (you + team), `client` (business owner, limited scope), `team_member` (read/write per business assignment)
- **Client access:** A client user can only see their own business's data. API returns 404 (not 403) for other businesses to avoid leaking existence.

---

## Step 8 — Tech Stack Recommendation

### Pragmatic Stack (v1)

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS v4 | Already set up. Fast dev loop. Tailwind v4 with Vite plugin is clean and minimal config. |
| **State management** | React context + hooks (no Redux) | For v1 with limited state, context is enough. Add Zustand or Jotai later if needed. |
| **Charts** | Recharts | Already in the stack. Good enough for line, bar, area, funnel. Upgrade to Canvas-based in v3. |
| **Backend** | **Next.js API routes** or **Hono** (lightweight) | Solo founder needs one language (TypeScript) everywhere. Next.js gives you frontend + backend in one project. Or use Hono for a lighter API layer. |
| **Database** | **Supabase (PostgreSQL)** | Managed Postgres, built-in auth, real-time subscriptions, storage for images. Generous free tier. Swiss knife for solo founders. |
| **ORM** | **Drizzle** | Type-safe, lightweight, better DX than Prisma for Postgres. Generates migrations from schema. |
| **Queue** | **Inngest** or **BullMQ** | Inngest is simpler for a solo founder (no Redis to manage). BullMQ gives more control. Start with Inngest. |
| **Auth** | **Supabase Auth** or **NextAuth v5** | Supabase Auth if using Supabase DB. NextAuth if you want more OAuth providers. |
| **File storage** | Supabase Storage or Cloudflare R2 | For invoice PDFs, campaign images, report exports. |
| **Hosting** | **Vercel** (frontend + API routes) | Best DX for Next.js + React. Free tier is generous. |
| **Offline** | **IndexedDB** via Dexie.js | Lightweight wrapper around IndexedDB. Cache business data for offline dashboard access. |
| **AI/LLM** | OpenAI GPT-4o / Claude API (v1), self-hosted smaller model later | For growth reports, alerts, and content generation. Use API initially; migrate to self-hosted Mistral/Phi when usage grows. |

### Ideal enterprise stack (for 100M users)

| Layer | Enterprise choice | Pragmatic v1 choice | Gap |
|---|---|---|---|
| Backend | Go/Rust microservices + PostgreSQL | TypeScript (Next.js/Hono) | Typescript is fine for 10K-100K users. Rewrite hot paths in Go at scale. |
| Queue | Kafka + BullMQ | Inngest | Kafka is overkill for v1. Inngest handles 10K+ jobs/day easily. |
| Caching | Redis cluster | In-memory + Supabase cache | Add Redis when API latency becomes an issue. |
| Search | Elasticsearch | PostgreSQL full-text search + pg_trgm | ES is another service to manage. Postgres full-text is good enough for v1. |
| CDN | CloudFront + Cloudflare | Vercel Edge | Vercel ISR + Edge functions cover most needs. |
| AI inference | Self-hosted GPU cluster | OpenAI/Claude API | API is cheaper for low volume. Self-host when monthly API cost > GPU cost. |

### Key principle

> **Build with services you could rewrite in a weekend.** Don't commit to infrastructure that locks you in. Supabase → can export raw Postgres. Vercel → can deploy anywhere. Inngest → can switch to BullMQ+Redis. API-first design means you can replace any layer.

---

## Step 9 — Monetization

### Pricing Tiers (NGN pricing shown; adjust for GHS, KES, ZAR, USD)

| Tier | Price | What's included |
|---|---|---|
| **Operator Solo** | ₦12,000/mo | Up to 5 businesses, CRM per business, WhatsApp reports, basic analytics, portfolio dashboard |
| **Operator Pro** | ₦35,000/mo | Up to 20 businesses, all Solo features, cross-portfolio analytics, unified social inbox, campaign tracker, bulk actions, AI alerts |
| **Operator Unlimited** | ₦85,000/mo | Unlimited businesses, all Pro features, white-label client portal, API access, priority support, dedicated onboarding |
| **Enterprise** | Custom | 20+ businesses, dedicated instance, SLA, custom integrations, multi-operator seats |

### What's gated by what

| Gate | What it controls |
|---|---|
| **Business count** | Number of businesses you can manage (Solo: 5, Pro: 20, Unlimited: ∞) |
| **AI credits** | Number of AI-generated captions/reports/alerts per month (Solo: 500, Pro: 2000, Unlimited: unlimited) |
| **Client access** | White-label client portal is Unlimited only |
| **Features** | Cross-portfolio analytics, bulk actions, unified inbox are Pro+ |
| **Seats** | Solo: 1 operator seat. Pro: 2 operator seats. Unlimited: 5+ operator seats |
| **API access** | Unlimited tier only |

### White-label / Reseller Model

Since your current model is "I run growth for client businesses," the partner channel should be:

- **Reseller** — someone who manages businesses on Growth Network (like you). They pay the Operator tier and get their own portfolio. Their clients see the white-label interface.
- **Take-rate** — 0%. There's no marketplace take-rate in v1-v2. Resellers pay their subscription and keep 100% of what they charge their clients. This builds the ecosystem.
- **Marketplace take-rate (v3+):** 15% on template sales, 20% on AI agent extensions.

### Affiliate Program (v2)

- Refer a new operator who subscribes → get 20% of their first 3 months
- Refer an agency that brings 5+ businesses → get 10% ongoing revenue share

---

## Step 10 — Competitive Teardown

### HubSpot

| Weakness for African SME | Growth Network advantage |
|---|---|
| $50+/month/user — prohibitive for a Lagos salon owner | ₦12K/month (~$8) for up to 5 businesses |
| Email-first CRM — phone/WhatsApp is an afterthought | WhatsApp-first by design. Phone is the primary ID. |
| No Paystack/Flutterwave/USSD — Stripe only | Native local payment rails |
| US-centric reporting — no NGN inflation adjustment | Inflation-aware reporting built in |
| No offline mode | Offline-first with sync queue |
| Too many features — the salon owner doesn't need SEO and marketing automation | Modular — use what you need; the WhatsApp growth report is the wedge |

### GoHighLevel

| Weakness for African SME | Growth Network advantage |
|---|---|
| $397/month for Agency plan — ₦600K+/mo | ₦35K/month (~$23) for Pro plan |
| Built for US sales funnels (high-ticket coaching, real estate, etc.) | Built for African SMEs — logistics, salons, schools, restaurants |
| WhatsApp integration requires third-party (Twilio, etc.) | Native WhatsApp Business API integration |
| US-only payment processing (Stripe) | Paystack, Flutterwave, bank transfer, USSD |
| No offline support | Offline-first |
| Steep learning curve — requires funnel building expertise | Operator manages everything; client gets a WhatsApp report |

### Salesforce

| Weakness for African SME | Growth Network advantage |
|---|---|
| $25+/user/month for lowest tier — no SME pricing | ₦12K/month for up to 5 businesses |
| Enterprise sales model — requires demos, procurement, IT setup | WhatsApp onboarding — no login required for clients |
| No local payment support | Full local payments |
| No African data residency | Data stored in Lagos |
| Insanely complex — needs admin to configure | Zero-config for clients; operator sets up once |

### Zoho

| Weakness for African SME | Growth Network advantage |
|---|---|
| Fragmented — CRM, Books, Social are separate products with separate logins | Unified — one platform for CRM, social, finance |
| No operator/agency mode — every business is a separate account | Portfolio dashboard — all businesses in one view |
| WhatsApp integration is email-like, not native | WhatsApp-first data model |
| US/EU-centric | Built for emerging markets from day one |

### Monday.com

| Weakness for African SME | Growth Network advantage |
|---|---|
| Generic project management — no CRM, no social, no finance | Purpose-built for business growth operations |
| $8+/seat/month — expensive for a team of 5-10 | ₦12K/month flat for up to 5 businesses (no per-seat cost) |
| No offline mode | Offline-first |
| No local payments | Full local payment integration |

### Odoo

| Weakness for African SME | Growth Network advantage |
|---|---|
| Self-hosted complexity — needs a server, admin, updates | SaaS — zero maintenance |
| Too many modules (HR, Manufacturing, Accounting, etc.) | Focused on growth operations — CRM, social, finance |
| No WhatsApp-native CRM | WhatsApp-first |
| Generic modules don't fit African SME workflows | Industry templates for logistics, salons, schools |

---

## Step 11 — What's Missing

### Gaps identified during this PRD

1. **Customer support for the operator** — when YOU have a problem with the platform, how do you get help? This needs a support channel (in-app chat, WhatsApp, email) before you have 10+ businesses depending on the system.

2. **Data import/export** — how does the operator get existing client data INTO Growth Network? CSV import, manual entry, API. And how do they get it OUT (data portability)? This needs to work before onboarding any real business.

3. **Error recovery for WhatsApp reports** — what happens if the WhatsApp API is down when a weekly report needs to send? Queue and retry. But what if it fails 3 times? Operator gets a notification and sends manually.

4. **Billing for the operator** — you're the customer. How do you pay? Paystack for NGN, Stripe for USD. Need a billing dashboard with invoice history.

5. **Audit trail for compliance** — NDPR/GDPR requires knowing who accessed what data and when. This is a v2 requirement but the schema should support it from v1.

6. **Data deletion workflow** — when a client leaves, their data must be deletable (and actually deleted, not just hidden). Need a "delete business" flow that wipes all associated records.

7. **Multi-language UI** — the operator interface is in English, but should client-facing views support Pidgin, Yoruba, Hausa? Yes — the client portal should be localizable from v2.

8. **Rate limiting for WhatsApp API** — WhatsApp Business API has strict rate limits (1 message per second per phone number for marketing). Need a queue system that respects limits across all businesses.

9. **Phone number verification** — before sending WhatsApp messages on behalf of a business, need to verify they own the phone number (standard WhatsApp Business API flow).

10. **Emergency contact** — if a business's Instagram account gets hacked or their payment processor goes down, how does the operator flag emergencies? Need a "red alert" button per business.

11. **Performance budget** — define: dashboard loads < 2s on 3G, chart renders < 1s, snapshot query < 500ms. If it's slower, it's a bug.

12. **Pricing elasticity** — ₦12K is ~$8. Is this affordable for a Lagos salon owner who might make ₦200-500K/month? Yes. But what about a Kumasi food stall owner making ₦50K/month? They might need a ₦3-5K tier. Consider a micro-tier for very small businesses.

---

## Appendix — Over-scope Flags

| Feature in the brief | Flag | Why it's premature |
|---|---|---|
| **Full CRM (v1 is just contacts + notes)** | Over-scoped | Full CRM with LTV, health scores, automation is v3. v1 just needs a contact list with phone, notes, and tags. |
| **Marketing hub with multi-channel campaigns** | Over-scoped | You don't need a campaign builder in v1. You need to track growth. Campaign tools come after you have data. |
| **Website/landing page builder** | v3, not v1 | Canva + WhatsApp already works. A landing page builder is a feature request from people who don't pay your bills. |
| **Employee management / payroll** | Out of scope entirely | This is an HR tool. Growth Network is a growth tool. Don't pivot to HR. |
| **Inventory management** | v3, only if POS integration is critical | Only relevant if Olakanmbe POS clients need it. Build it as an extension, not a core feature. |
| **Automation/workflow builder** | v3 | Nobody configures automations until they've outgrown doing things manually. That's v3 at earliest. |
| **Marketplace** | v3+ | No marketplace works before you have users. Get 100+ paying operators first. |
| **Full self-serve signup** | v2 at earliest | Every business should be onboarded by you (the operator) in v1. This gives you data quality control and a direct relationship with every client. |

---

## Summary

Growth Network is not "HubSpot for Africa." It is a fundamentally different product built for a fundamentally different market:

1. **The operator is the customer**, not the business owner.
2. **WhatsApp is the platform**, not email.
3. **Offline is the default**, not an edge case.
4. **Local payments are native**, not an integration.
5. **Cash and mobile money are first-class**, not afterthoughts.
6. **Growth proof is the product**, not the CRM.

v1 is small. v1 is focused. v1 is the tool that lets you run 10 businesses as easily as you now run 3. Everything else — the AI employees, the marketplace, the full self-serve — comes later, layer by layer, as your portfolio grows and the patterns emerge.

**Start with the WhatsApp growth report. That's the wedge. Everything else is expansion.**
