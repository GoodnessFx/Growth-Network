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
