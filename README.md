# Growth Network

**Business Growth Operating System** — the command center for operators and agencies managing African SMEs.

CRM, social media management, pipeline tracking, finance, and cross-business analytics — unified in one platform. Built for the realities of emerging markets: WhatsApp-first, offline-capable, local payments (Paystack, Flutterwave, bank transfer, USSD), and multi-currency with inflation-adjusted reporting.

## Quick Start

```bash
pnpm install
pnpm run dev
```

The dev server starts at `http://localhost:8443`.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Packaging:** pnpm

## Project Structure

```
src/
├── main.tsx           # Entrypoint
├── App.tsx            # Root component with page routing
├── index.css          # Global styles + Tailwind import
├── components/
│   ├── AppLayout.tsx  # Sidebar + topbar shell
│   └── Charts.tsx     # Recharts wrappers (line, bar, area, funnel)
├── pages/
│   ├── Landing.tsx    # Marketing site
│   ├── Auth.tsx       # Login / signup / verification
│   ├── Operator.tsx   # Operator command center (portfolio, compare, inbox, campaigns, pipeline, alerts)
│   └── Business.tsx   # Per-business dashboard (overview, CRM, pipeline, social, finance)
└── data/
    └── mockData.ts    # Mock businesses, clients, campaigns, alerts
```

## Development

The project runs inside Figma Make with hot reload. Edits to source files reflect immediately.

```bash
pnpm run build   # Production build to dist/
pnpm run format  # Format with oxfmt
```

## License

Private — Growth Network Technologies Ltd.
