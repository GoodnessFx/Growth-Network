# Growth Network — Frontend / Figma Design Prompt (No AI Slop)

Copy this into Figma AI, v0, or hand it to a designer/Claude for UI-only work. This prompt intentionally excludes backend, AI logic, and copy strategy — frontend and visual design only.

---

## THE PROMPT

You are the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. I am rejecting anything that looks like generic AI-generated SaaS design. Before you design anything, read the calibration note below and design against it, not toward it.

### Do NOT default to these (the three AI-slop looks)
1. Warm cream background (#F4F1EA-ish) + high-contrast serif + terracotta/clay accent (#D97757-ish)
2. Near-black background + single acid-green or vermilion accent
3. Broadsheet layout — hairline rules, zero border-radius, dense newspaper columns

If you catch yourself reaching for any of these, stop and pick a direction that's actually derived from what this specific product is — a real, gritty, fast-moving business-growth tool for African SMEs, not a generic Silicon Valley SaaS landing page. Lean into a visual identity that feels energetic, trustworthy, and built for people running real shops/agencies/logistics businesses — not a fintech-startup cliché.

### Step 1 — Design Tokens (commit to this before any screen)
Produce, and justify against the brief:
- **Color**: 4–6 named hex values (primary, secondary, 1-2 accents, neutral scale, semantic success/warning/danger). No default palette — pick something specific to a growth/energy feeling.
- **Type**: a characterful display face used with restraint + a complementary body face + a utility/data face for charts, tables, numbers. Name the pairing and why.
- **Layout**: describe the grid/spacing system and one signature layout device (not numbered 01/02/03 unless something is a genuine sequence).
- **Signature element**: the one thing this product will be visually remembered by (e.g. a specific chart style, a distinctive way growth is visualized, a card treatment for business health status).

Do this planning pass first, critique it against the "does this look like anyone else's SaaS" test, revise, and only then move to screens.

### Step 2 — Full Site/App Map (design every page/screen listed — nothing skipped)

**Marketing site**
- Landing page (hero, product walkthrough, industries served, testimonials, pricing, FAQ, footer)
- Pricing page
- About / brand story page

**Auth**
- Login, Register, Forgot Password, Email verification, 2FA screen

**Operator / Agency Command Center** (this is the primary product surface — design it with the most care)
- Portfolio overview: grid/list of every business I manage, each with a health snapshot card (mini growth chart, status color, last activity)
- Single-business drill-in view: full CRM/pipeline/socials/finance for that one business, as if logged in as them
- Cross-business comparison view: side-by-side growth charts and rankings across all managed businesses
- Unified social inbox/calendar across all managed businesses' accounts
- Ad campaign manager view spanning multiple businesses
- Client onboarding pipeline (prospect → onboarded, my own sales funnel)
- Bulk-action interface (apply one action across multiple businesses)
- Alerts/notifications feed (portfolio-wide flags)

**Visual Growth & Analytics Layer** (design every chart type as a real component, not a placeholder)
- Growth-over-time line/bar chart component (revenue, clients, pipeline value) with time-range selector
- Per-platform social growth chart set (Instagram, Facebook, TikTok, X, LinkedIn, YouTube, Threads) — followers, engagement, reach
- Ad performance funnel visual (spend → clicks → conversions)
- Side-by-side multi-business comparison chart (ranked bar chart)
- Before/after shareable growth snapshot (designed for export as image/PDF — this is a sales asset, treat it like a mini poster, not a dashboard screenshot)
- Color-coded health-status indicator system (growing/flat/declining) usable at both a glance (icon/badge) and in detail (expanded card)

**Per-business dashboard** (what an individual client would see, if given limited access)
- Overview with key widgets: revenue, client growth, upcoming meetings, social snapshot, tasks
- Client CRM: list view, single client profile, notes/timeline/documents/tags
- Sales pipeline (kanban)
- Social media scheduler + content calendar
- Invoices/finance view
- Simple settings/branding page

**Shared components** (design as a real component library, with states)
- Navigation (sidebar + topbar, with operator-mode vs. single-business-mode switching)
- Card components (business summary card, client card, metric card)
- Table component (sortable, filterable, with empty/loading/error states)
- Chart component set (from Step 2's analytics layer)
- Modal/dialog patterns
- Form components (inputs, selects, date pickers) with validation states
- Empty states (per section — treat each as "an invitation to act," not decoration)
- Loading states
- Notification/toast system
- Status badges/tags

### Step 3 — States & Responsiveness (non-negotiable, don't skip for "polish later")
For every screen above, design: default, loading, empty, error, and populated-with-real-looking-data states. Design mobile and desktop layouts — many of my end clients will only ever check this on a phone.

### Step 4 — Accessibility floor
Visible keyboard focus states, sufficient color contrast, reduced-motion variant for any animation. Build to this floor without calling it out as a feature.

### Step 5 — Self-critique pass
Before finalizing, review the whole system against: does any part of this look like a template? Is there one signature moment, with everything else quiet and disciplined around it? Cut anything decorative that doesn't serve a real function. Note what you changed and why.

### What this prompt explicitly excludes
No AI copywriting logic, no backend/API design, no automation/workflow logic, no pricing/business-model design — pure UI/UX and visual system only. If asked to explain a feature's function, describe it in plain, active-voice UI copy (what the user controls, not how the system works) — but do not design the underlying AI behavior.

**Output format**: Figma-ready frames/components per screen, organized by the site map above, with the token system documented as a shared style guide page first.