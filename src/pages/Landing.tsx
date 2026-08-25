import { useState, useEffect } from 'react'
import {
  ArrowRight, Menu, X, BarChart3, Users, Zap, Globe,
  CheckCircle, TrendingUp, Calendar, Shield, ChevronDown,
  ExternalLink, Loader2,
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { fetchPublicBusinesses } from '../lib/api'

interface LandingProps {
  onLogin: () => void
  onDashboard: () => void
}

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onDashboard }: { onLogin: () => void; onDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useIsMobile(768)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 60,
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #e8e8e4' : '1px solid transparent',
          transition: 'background 0.2s, border-color 0.2s, backdrop-filter 0.2s',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: '#0f0f0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 13, fontWeight: 400, letterSpacing: -0.5 }}>G</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f0e', letterSpacing: -0.3 }}>
              GrowthNet
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
            {['Product', 'Pricing', 'Industries', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                style={{ fontSize: 14, color: '#4a4a45', padding: '6px 12px', borderRadius: 6, fontWeight: 500, transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f0ed'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f0f0e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#4a4a45' }}
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hide-mobile" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={onLogin} className="btn btn-ghost btn-sm">Sign in</button>
            <button onClick={onDashboard} className="btn btn-primary btn-sm">
              Open dashboard <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="show-mobile" style={{ display: 'none', marginLeft: 'auto' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#0f0f0e', display: 'flex', alignItems: 'center' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
            background: '#fff', borderBottom: '1px solid #e8e8e4',
            padding: '12px 24px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {['Product', 'Pricing', 'Industries', 'About'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 4px', fontSize: 16, color: '#0f0f0e', fontWeight: 500, borderBottom: '1px solid #f1f0ed' }}
            >
              {link}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => { setMenuOpen(false); onLogin() }} className="btn btn-ghost" style={{ flex: 1 }}>Sign in</button>
            <button onClick={() => { setMenuOpen(false); onDashboard() }} className="btn btn-primary" style={{ flex: 1 }}>Dashboard</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero({ onDashboard, onLogin }: { onDashboard: () => void; onLogin: () => void }) {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: 'linear-gradient(#e8e8e4 1px, transparent 1px), linear-gradient(90deg, #e8e8e4 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, textAlign: 'center' }}>
        {/* Pill label */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f1f0ed', border: '1px solid #e8e8e4',
            borderRadius: 99, padding: '5px 14px',
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#16a34a',
              flexShrink: 0,
            }}
            className="pulse"
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4a4a45', letterSpacing: 0.2 }}>
            Built for African operators &amp; growth agencies
          </span>
        </div>

        {/* Headline */}
        <h1
          className="hero-title serif"
          style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            color: '#0f0f0e',
            marginBottom: 24,
            lineHeight: 0.95,
          }}
        >
          Every business.<br />
          <span className="serif-italic" style={{ color: '#2d6a4f' }}>One screen.</span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: '#4a4a45',
            maxWidth: 540,
            margin: '0 auto 40px',
            lineHeight: 1.65,
            fontWeight: 400,
          }}
        >
          GrowthNet is the command center for agencies and operators managing African SMEs.
          CRM, social, pipeline, analytics, and automations — unified.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onDashboard}
            className="btn btn-primary btn-lg"
            style={{ gap: 10, minWidth: 180 }}
          >
            Open dashboard <ArrowRight size={16} />
          </button>
          <button
            onClick={onLogin}
            className="btn btn-ghost btn-lg"
          >
            Sign in as owner
          </button>
        </div>

        {/* Social proof */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 24, marginTop: 56, flexWrap: 'wrap',
          }}
        >
          {[
            { value: '10+', label: 'Businesses managed' },
            { value: '1', label: 'Country (Nigeria)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                className="serif"
                style={{ fontSize: 28, color: '#0f0f0e', lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 3, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: '#b4b4ad',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.1, textTransform: 'uppercase' }}>Scroll</span>
        <ChevronDown size={14} className="pulse" />
      </div>
    </section>
  )
}

// ── Features ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    desc: 'Track every business in your portfolio. Revenue trends, social growth, campaign performance — one view, no context switching.',
  },
  {
    icon: Users,
    title: 'CRM & Pipeline',
    desc: 'Full client management with notes, timelines, and a sales kanban that reflects how African B2B deals actually close.',
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    desc: 'Plan and schedule content across Instagram, TikTok, Facebook, X, and LinkedIn. AI-powered suggestions tailored per business.',
  },
  {
    icon: Zap,
    title: 'Tools & Automations',
    desc: 'Build automations that run your operations: auto-reports, lead routing, follow-up sequences, webhook triggers, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Ad Campaigns',
    desc: 'Manage ad spend and track ROAS across all platforms and all clients from one campaign table. No more tab switching.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Clients see only their data. You see everything. Granular permissions with a clean client-facing dashboard.',
  },
  {
    icon: Globe,
    title: 'Multi-Currency Finance',
    desc: 'Issue invoices, track revenue, and report in NGN, GHS, KES, ZAR, or USD. Auto-conversion for portfolio reporting.',
  },
  {
    icon: CheckCircle,
    title: 'Service Requests',
    desc: 'A clean work tracker for every deliverable. Clients submit requests, you manage status — no email chains.',
  },
]

function Features() {
  return (
    <section id="product" style={{ background: '#f8f8f6', padding: '96px 24px', borderTop: '1px solid #e8e8e4' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 560 }}>
          <p className="label" style={{ marginBottom: 12 }}>Product</p>
          <h2 className="serif" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#0f0f0e', marginBottom: 16 }}>
            Everything your<br />
            <span className="serif-italic">portfolio needs.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#4a4a45', lineHeight: 1.7 }}>
            Built for operators who manage multiple businesses — not just one.
            Every tool talks to every other tool.
          </p>
        </div>

        <div
          className="grid-mobile-1"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1, border: '1px solid #e8e8e4', borderRadius: 16, overflow: 'hidden' }}
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                style={{
                  padding: '28px 28px',
                  background: '#ffffff',
                  borderRight: '1px solid #e8e8e4',
                  borderBottom: '1px solid #e8e8e4',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
              >
                <div
                  style={{
                    width: 40, height: 40, background: '#f1f0ed',
                    borderRadius: 10, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: 16,
                  }}
                >
                  <Icon size={18} color="#2d6a4f" strokeWidth={2} />
                </div>
                <h3
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: '#0f0f0e', marginBottom: 8, lineHeight: 1.3 }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: '#6a6a62', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Live Portfolio ─────────────────────────────────────────────────────────
function LivePortfolio() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicBusinesses()
      .then(r => setBusinesses(r.businesses))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section style={{ background: '#ffffff', padding: '96px 24px', borderTop: '1px solid #e8e8e4' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <p className="label" style={{ marginBottom: 12 }}>Live portfolio</p>
            <h2 className="serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#0f0f0e' }}>
              Real businesses.<br />
              <span className="serif-italic">Real growth.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} className="pulse" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Live data</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8a8a82', fontSize: 14, padding: '40px 0' }}>
            <Loader2 size={16} className="spin" /> Loading...
          </div>
        ) : businesses.length === 0 ? (
          <div
            style={{
              padding: '56px 40px', textAlign: 'center',
              border: '1.5px dashed #e8e8e4', borderRadius: 16,
              color: '#8a8a82', fontSize: 14,
            }}
          >
            No businesses published yet. The owner publishes results from the dashboard.
          </div>
        ) : (
          <div
            className="grid-mobile-1"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}
          >
            {businesses.map(b => (
              <a
                key={b.id}
                href={`/public/${encodeURIComponent(b.id)}`}
                className="card card-hover"
                style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-green">{b.status}</span>
                  <ExternalLink size={13} color="#8a8a82" />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f0f0e', lineHeight: 1.2, marginBottom: 4 }}>{b.name}</div>
                  <div className="label" style={{ color: '#8a8a82' }}>{b.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#2d6a4f', fontWeight: 600 }}>
                  View snapshot <ArrowRight size={12} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Solo',
    price: '₦12,000',
    period: '/mo',
    desc: 'For solo operators managing up to 3 businesses.',
    features: ['Up to 3 businesses', 'CRM & pipeline', 'Social scheduler (3 platforms)', 'Basic analytics', 'Invoice management', 'Email support'],
    highlight: false,
    cta: 'Get started',
  },
  {
    name: 'Agency',
    price: '₦45,000',
    period: '/mo',
    desc: 'For agencies managing 5–20 client businesses with full analytics.',
    features: ['Up to 20 businesses', 'Everything in Solo', 'Cross-business analytics', 'Tools & Automations', 'Multi-platform ad campaigns', 'Bulk actions', 'Leads pipeline', 'Priority support'],
    highlight: true,
    cta: 'Get started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For holding companies and large networks with 20+ businesses.',
    features: ['Unlimited businesses', 'Everything in Agency', 'Dedicated account manager', 'API access + webhooks', 'White-label options', 'SLA guarantee', 'Custom onboarding'],
    highlight: false,
    cta: 'Contact us',
  },
]

function Pricing({ onCta }: { onCta: () => void }) {
  return (
    <section id="pricing" style={{ background: '#f8f8f6', padding: '96px 24px', borderTop: '1px solid #e8e8e4' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ marginBottom: 52, maxWidth: 480 }}>
          <p className="label" style={{ marginBottom: 12 }}>Pricing</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#0f0f0e', marginBottom: 12 }}>
            Straightforward.<br />
            <span className="serif-italic">No surprises.</span>
          </h2>
          <p style={{ fontSize: 14, color: '#6a6a62' }}>Pay in NGN, GHS, KES, ZAR, or USD. Cancel any time.</p>
        </div>

        <div
          className="grid-mobile-1"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}
        >
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? '#0f0f0e' : '#ffffff',
                border: plan.highlight ? 'none' : '1.5px solid #e8e8e4',
                borderRadius: 16,
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: 'absolute', top: -11, left: 20,
                    background: '#2d6a4f', color: '#fff',
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                    padding: '3px 10px', borderRadius: 99,
                    textTransform: 'uppercase',
                  }}
                >
                  Most popular
                </div>
              )}

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: plan.highlight ? '#6a6a62' : '#8a8a82', marginBottom: 10 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span className="serif" style={{ fontSize: 40, color: plan.highlight ? '#fff' : '#0f0f0e', lineHeight: 1 }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 14, color: plan.highlight ? '#6a6a62' : '#8a8a82' }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? '#8a8a82' : '#6a6a62', lineHeight: 1.6 }}>{plan.desc}</p>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: plan.highlight ? '#d0d0d0' : '#4a4a45' }}>
                    <CheckCircle size={13} color={plan.highlight ? '#4ade80' : '#16a34a'} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={onCta}
                className="btn"
                style={{
                  background: plan.highlight ? '#fff' : '#0f0f0e',
                  color: plan.highlight ? '#0f0f0e' : '#fff',
                  borderRadius: 8,
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Industries ─────────────────────────────────────────────────────────────
const INDUSTRIES = [
  'Logistics & Delivery', 'Fashion & Retail', 'Food & Catering',
  'Digital Agencies', 'Beauty & Wellness', 'Tech & Repair',
  'Events & Entertainment', 'Transport', 'Construction',
  'Healthcare', 'Finance & Microfinance', 'Agriculture',
]

// ── FAQ ────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Does it work for businesses that only operate in local currency?', a: 'Yes. Set the currency per business — NGN, GHS, KES, ZAR, XOF, or USD. The portfolio dashboard converts everything to your preferred reporting currency.' },
  { q: "Can my clients see their own data without seeing other clients' data?", a: "Yes. Each business has its own limited-access view. Clients see their dashboard, pipeline, and social data only — never your full portfolio." },
  { q: 'What tools and automations are available?', a: 'Pre-built automations include weekly report delivery, lead routing, follow-up sequences, milestone alerts, and content suggestions. You can also build custom automations with triggers, conditions, and actions.' },
  { q: 'Is my data stored in Africa?', a: 'Primary storage is in Lagos, backup in Johannesburg. Everything is encrypted in transit and at rest.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ background: '#ffffff', padding: '96px 24px', borderTop: '1px solid #e8e8e4' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 className="serif" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#0f0f0e', marginBottom: 40 }}>
          Questions &amp; answers
        </h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e8e8e4' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 0', gap: 16, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0e', lineHeight: 1.4 }}>{faq.q}</span>
              <ChevronDown
                size={18}
                color="#8a8a82"
                style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>
            {open === i && (
              <p style={{ fontSize: 14, color: '#6a6a62', lineHeight: 1.75, paddingBottom: 20 }}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── CTA Banner ─────────────────────────────────────────────────────────────
function CTABanner({ onDashboard }: { onDashboard: () => void }) {
  return (
    <section
      style={{
        background: '#0f0f0e',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 className="serif" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#ffffff', marginBottom: 16 }}>
          Your businesses are<br />
          <span className="serif-italic" style={{ color: '#4ade80' }}>waiting.</span>
        </h2>
        <p style={{ fontSize: 16, color: '#8a8a82', marginBottom: 32, lineHeight: 1.65 }}>
          Sign in as the owner to manage your portfolio, or explore the live showcase.
        </p>
        <button
          onClick={onDashboard}
          className="btn btn-lg"
          style={{
            background: '#ffffff', color: '#0f0f0e',
            borderRadius: 10, gap: 10,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
          }}
        >
          Open dashboard <ArrowRight size={16} />
        </button>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#0f0f0e', borderTop: '1px solid #1a1a18', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 11 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: -0.3 }}>GrowthNet</span>
        </div>
        <div style={{ fontSize: 12, color: '#4a4a45', fontWeight: 500 }}>
          © 2026 GrowthNet Technologies Ltd · Lagos · Accra · Nairobi · Cape Town
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Status', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: '#4a4a45', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#4a4a45')}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function Landing({ onLogin, onDashboard }: LandingProps) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f0f0e' }}>
      <Navbar onLogin={onLogin} onDashboard={onDashboard} />
      <Hero onDashboard={onDashboard} onLogin={onLogin} />

      {/* Stats strip */}
      <div style={{ background: '#f8f8f6', borderTop: '1px solid #e8e8e4', borderBottom: '1px solid #e8e8e4' }}>
        <div
            className="stat-grid grid-mobile-2"
            style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {[
              { v: '10+', l: 'Businesses managed' },
              { v: '1', l: 'Country (Nigeria)' },
              { v: '34%', l: 'Avg revenue growth' },
            ].map((s, i) => (
              <div
                key={s.l}
                style={{
                  padding: '28px 24px',
                  borderRight: i < 2 ? '1px solid #e8e8e4' : 'none',
                }}
              >
                <div className="serif" style={{ fontSize: 36, color: '#0f0f0e', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 5, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
      </div>

      <Features />
      <LivePortfolio />

      {/* Industries */}
      <section id="industries" style={{ background: '#f8f8f6', padding: '80px 24px', borderTop: '1px solid #e8e8e4' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <p className="label" style={{ marginBottom: 16 }}>Industries served</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INDUSTRIES.map(ind => (
              <span
                key={ind}
                style={{
                  background: '#fff', border: '1px solid #e8e8e4',
                  borderRadius: 99, padding: '7px 16px',
                  fontSize: 13, color: '#4a4a45', fontWeight: 500,
                }}
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Pricing onCta={onLogin} />
      <FAQ />
      <CTABanner onDashboard={onDashboard} />
      <Footer />
    </div>
  )
}
