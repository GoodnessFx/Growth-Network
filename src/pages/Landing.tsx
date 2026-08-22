import { useState, useEffect } from 'react'
import {
  TrendingUp, CheckCircle2, ChevronRight, ArrowRight, BarChart3,
  Users, Globe, Zap, Menu, X, LayoutGrid, ExternalLink, Loader2,
  Sparkles, Shield, Calendar,
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { fetchPublicBusinesses } from '../lib/api'

interface LandingProps {
  onLogin: () => void
  onDashboard: () => void
}

const NAV_HEIGHT = 64

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onDashboard }: { onLogin: () => void; onDashboard: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useIsMobile(768)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        background: scrolled ? 'rgba(10,10,11,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e1e24' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 100,
        gap: 16,
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <img
          src="/gnlogo.jpg"
          alt="GrowthNet"
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', flexShrink: 0 }}
        />
        <span
          className="font-display"
          style={{ fontSize: 19, fontWeight: 900, letterSpacing: 1.5, color: '#f0f0f0', whiteSpace: 'nowrap' }}
        >
          GROWTH<span style={{ color: '#8b5cf6' }}>NET</span>
        </span>
      </div>

      <div className="hide-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {['Product', 'Industries', 'Pricing', 'About'].map((item) => (
          <a
            key={item}
            href="#"
            style={{ color: '#9090a0', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}
          >
            {item}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isMobile ? (
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44,
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        ) : (
          <>
            <button
              onClick={onLogin}
              style={{
                background: 'transparent', border: '1px solid #1e1e24', color: '#c0c0d0',
                padding: '8px 18px', minHeight: 38, borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontWeight: 500,
              }}
            >
              Sign in
            </button>
            <button
              onClick={onDashboard}
              style={{
                background: '#8b5cf6', border: 'none', color: '#fff',
                padding: '8px 20px', minHeight: 38, borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontWeight: 600, letterSpacing: 0.3,
              }}
            >
              Open Dashboard →
            </button>
          </>
        )}
      </div>

      {isMobile && mobileOpen && (
        <div
          style={{
            position: 'fixed', top: NAV_HEIGHT, left: 0, right: 0,
            background: '#0d0d10', borderBottom: '1px solid #1e1e24',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)', padding: '16px 24px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}
        >
          {['Product', 'Industries', 'Pricing', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: '#c0c0d0', fontSize: 15, textDecoration: 'none', fontWeight: 500,
                padding: '10px 0', display: 'flex', alignItems: 'center', minHeight: 44,
                borderBottom: '1px solid #1a1a20',
              }}
            >
              {item}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={onLogin}
              style={{
                flex: 1, background: 'transparent', border: '1px solid #1e1e24', color: '#f0f0f0',
                padding: '10px 18px', minHeight: 44, borderRadius: 6, fontSize: 13, cursor: 'pointer',
              }}
            >
              Sign in
            </button>
            <button
              onClick={onDashboard}
              style={{
                flex: 1, background: '#8b5cf6', border: 'none', color: '#fff',
                padding: '10px 18px', minHeight: 44, borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Dashboard →
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

// ── Stats row ─────────────────────────────────────────────────────────────────
function StatBar() {
  const stats = [
    { label: 'Businesses Managed', value: '1,240+' },
    { label: 'Pipeline Tracked', value: '₦48B+' },
    { label: 'Countries Active', value: '14' },
    { label: 'Avg Revenue Growth', value: '34%' },
  ]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid #1e1e24',
        borderBottom: '1px solid #1e1e24',
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: '32px 24px',
            borderRight: i < stats.length - 1 ? '1px solid #1e1e24' : 'none',
          }}
        >
          <div
            className="font-display stat-value"
            style={{ fontSize: 44, fontWeight: 900, color: '#8b5cf6', letterSpacing: -1, lineHeight: 1 }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 11, color: '#6b6b7b', marginTop: 6,
              fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1.5,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType
  title: string
  description: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: accent ? 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)' : '#111114',
        border: `1px solid ${accent ? 'transparent' : '#1e1e24'}`,
        borderRadius: 10,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!accent) (e.currentTarget as HTMLElement).style.borderColor = '#3a2a5a'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        if (!accent) (e.currentTarget as HTMLElement).style.borderColor = '#1e1e24'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          width: 42, height: 42,
          background: accent ? 'rgba(255,255,255,0.15)' : 'rgba(139,92,246,0.1)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={20} color={accent ? '#fff' : '#8b5cf6'} strokeWidth={2} />
      </div>
      <div>
        <h3
          className="font-display"
          style={{
            fontSize: 20, fontWeight: 800, color: accent ? '#fff' : '#f0f0f0',
            margin: 0, letterSpacing: 0.3, lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13, color: accent ? 'rgba(255,255,255,0.75)' : '#6b6b7b',
            margin: '10px 0 0', lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

// ── Pricing card ──────────────────────────────────────────────────────────────
function PricingCard({
  name, price, currency, period, description, features, highlight, cta, onCta,
}: {
  name: string; price: string; currency: string; period: string;
  description: string; features: string[]; highlight?: boolean; cta: string; onCta: () => void;
}) {
  return (
    <div
      style={{
        background: highlight ? '#111114' : 'transparent',
        border: `1px solid ${highlight ? '#8b5cf6' : '#1e1e24'}`,
        borderRadius: 10,
        padding: 32,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: highlight ? '0 0 40px rgba(139,92,246,0.15)' : 'none',
      }}
    >
      {highlight && (
        <div
          style={{
            position: 'absolute', top: -11, left: 32,
            background: '#8b5cf6', color: '#fff',
            fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700,
            letterSpacing: 2, padding: '3px 10px', borderRadius: 4,
          }}
        >
          MOST POPULAR
        </div>
      )}
      <div>
        <div
          style={{
            fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700,
            letterSpacing: 2, color: '#6b6b7b', textTransform: 'uppercase', marginBottom: 12,
          }}
        >
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 13, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{currency}</span>
          <span className="font-display" style={{ fontSize: 52, fontWeight: 900, color: '#f0f0f0', lineHeight: 1 }}>
            {price}
          </span>
          <span style={{ fontSize: 13, color: '#6b6b7b' }}>/{period}</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b6b7b', margin: '10px 0 0', lineHeight: 1.6 }}>{description}</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#c0c0d0' }}>
            <CheckCircle2 size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 1 }} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        style={{
          background: highlight ? '#8b5cf6' : 'transparent',
          border: `1px solid ${highlight ? '#8b5cf6' : '#1e1e24'}`,
          color: highlight ? '#fff' : '#c0c0d0',
          padding: '12px 24px', borderRadius: 6,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          if (highlight) {
            (e.currentTarget as HTMLElement).style.background = '#7c3aed'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(139,92,246,0.35)'
          } else {
            (e.currentTarget as HTMLElement).style.borderColor = '#3a2a5a'
          }
        }}
        onMouseLeave={(e) => {
          if (highlight) {
            (e.currentTarget as HTMLElement).style.background = '#8b5cf6'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          } else {
            (e.currentTarget as HTMLElement).style.borderColor = '#1e1e24'
          }
        }}
      >
        {cta}
      </button>
    </div>
  )
}

// ── Live portfolio ─────────────────────────────────────────────────────────────
function LivePortfolio() {
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string; type: string; status: string; domain: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicBusinesses()
      .then((res) => setBusinesses(res.businesses))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section style={{ background: '#0d0d10', padding: '80px 0', borderTop: '1px solid #1e1e24', borderBottom: '1px solid #1e1e24' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
          LIVE PORTFOLIO
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <h2 className="font-display section-title" style={{ margin: 0, color: '#f0f0f0', fontSize: 32 }}>
            GROWTH, PUBLICLY PROVEN.
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b6b7b', fontSize: 13, padding: '32px 0' }}>
            <Loader2 size={15} className="spin" /> Loading live portfolio...
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ border: '1px dashed #1e1e24', borderRadius: 8, padding: 48, textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
            No businesses published yet. The owner can publish results from the dashboard.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {businesses.map((b) => (
              <a
                key={b.id}
                href={`/public/${encodeURIComponent(b.id)}`}
                style={{
                  background: '#111114', border: '1px solid #1e1e24', borderRadius: 10,
                  padding: 24, textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8b5cf6'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e1e24'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: 9, fontFamily: 'JetBrains Mono', color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4,
                      padding: '2px 8px', letterSpacing: 1, textTransform: 'uppercase',
                    }}
                  >
                    {b.status}
                  </span>
                  <ExternalLink size={13} color="#6b6b7b" />
                </div>
                <div>
                  <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', lineHeight: 1.2 }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                    {b.type}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  View growth snapshot <ArrowRight size={12} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const industries = [
  'Logistics & Delivery', 'Fashion & Retail', 'Food & Catering',
  'Digital Agencies', 'Beauty & Wellness', 'Tech & Repair',
  'Events & Entertainment', 'Transport & Mobility', 'Construction',
  'Healthcare', 'Finance & Microfinance', 'Agriculture',
]

// ── Landing page ──────────────────────────────────────────────────────────────
export default function Landing({ onLogin, onDashboard }: LandingProps) {
  return (
    <div style={{ background: '#0a0a0b', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar onLogin={onLogin} onDashboard={onDashboard} />

      {/* ── Hero ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&q=70&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.18) saturate(0.6)',
          }}
        />
        {/* Purple radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(88,28,220,0.22) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            position: 'relative', zIndex: 1,
            maxWidth: 860,
            margin: '0 auto',
            padding: `${NAV_HEIGHT + 80}px 24px 120px`,
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 20, padding: '5px 14px 5px 8px', marginBottom: 36,
            }}
          >
            <span
              style={{
                background: '#8b5cf6', color: '#fff',
                fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700,
                padding: '2px 8px', borderRadius: 10, letterSpacing: 1,
              }}
            >
              NEW
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              Cross-business analytics now live
            </span>
          </div>

          <h1
            className="font-display hero-title"
            style={{
              fontSize: 92, fontWeight: 900, lineHeight: 0.9,
              margin: '0 0 28px', letterSpacing: -3, color: '#fff',
            }}
          >
            ONE SCREEN.
            <br />
            <span style={{ color: '#a78bfa' }}>EVERY</span>
            <br />
            BUSINESS.
          </h1>

          <p
            style={{
              fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)',
              margin: '0 auto 44px', maxWidth: 540,
            }}
          >
            The command center for operators and agencies managing African SMEs.
            CRM, social, pipeline, analytics — unified.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onDashboard}
              style={{
                background: '#8b5cf6', border: 'none', color: '#fff',
                padding: '15px 36px', borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 30px rgba(139,92,246,0.4)',
              }}
            >
              See the Dashboard <ArrowRight size={16} />
            </button>
            <button
              onClick={onLogin}
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                padding: '15px 36px', borderRadius: 8,
                fontSize: 15, cursor: 'pointer', fontWeight: 500,
              }}
            >
              Sign in as owner
            </button>
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              marginTop: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.25)',
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              letterSpacing: 2,
            }}
          >
            <span>SCROLL</span>
            <div
              style={{
                width: 1,
                height: 40,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatBar />

      {/* ── Live Portfolio ── */}
      <LivePortfolio />

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            PRODUCT
          </div>
          <h2 className="font-display" style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f0', margin: 0 }}>
            Everything your portfolio needs.
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b7b', marginTop: 10, maxWidth: 480 }}>
            Built for operators who manage multiple businesses — not just one.
          </p>
        </div>

        <div
          className="feature-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
        >
          <FeatureCard
            icon={LayoutGrid}
            title="Portfolio Command Center"
            description="Every business in one grid. Health status, revenue trends, pipeline value, and open tasks — visible at a glance."
          />
          <FeatureCard
            icon={BarChart3}
            title="Visual Growth Analytics"
            description="Real charts, real numbers. Track revenue, social following, campaign ROAS, and acquisition across any time range."
            accent
          />
          <FeatureCard
            icon={Globe}
            title="Unified Social & Campaigns"
            description="Schedule content and manage ad campaigns across Instagram, TikTok, Facebook, X, and LinkedIn — for all clients."
          />
          <FeatureCard
            icon={Users}
            title="CRM & Client Pipeline"
            description="Full contact management with a sales kanban that reflects how African B2B deals actually move."
          />
          <FeatureCard
            icon={Calendar}
            title="Content Calendar"
            description="AI-powered content suggestions per business with one-click scheduling and cross-platform publishing."
          />
          <FeatureCard
            icon={Sparkles}
            title="Bulk Actions"
            description="Apply updates, run campaigns, or post announcements across multiple businesses at once. Stop repeating yourself."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Finance & Invoicing"
            description="Track revenue, issue invoices, and monitor cash flow per business. Export clean reports for clients."
          />
          <FeatureCard
            icon={Shield}
            title="Role-Based Access"
            description="Clients see only their data. Operators see the full portfolio. Granular permissions built in from day one."
          />
          <FeatureCard
            icon={Zap}
            title="Automations & Webhooks"
            description="Auto-send reports, trigger alerts on milestone changes, and connect to your existing tools via webhooks."
          />
        </div>
      </section>

      {/* ── Industries ── */}
      <section style={{ background: '#0d0d10', borderTop: '1px solid #1e1e24', borderBottom: '1px solid #1e1e24', padding: '64px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            INDUSTRIES SERVED
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {industries.map((ind) => (
              <span
                key={ind}
                style={{
                  background: '#111114', border: '1px solid #1e1e24', borderRadius: 20,
                  padding: '7px 16px', fontSize: 13, color: '#c0c0d0', fontWeight: 500,
                }}
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            PRICING
          </div>
          <h2 className="font-display" style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f0', margin: '0 0 8px' }}>
            Straightforward. No surprises.
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b7b' }}>
            Pay in NGN, GHS, KES, ZAR, or USD. Cancel any time.
          </p>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <PricingCard
            name="Solo" price="12,000" currency="₦" period="mo"
            description="For solo operators managing up to 3 businesses."
            features={['Up to 3 businesses', 'CRM & pipeline', 'Social scheduler (3 platforms)', 'Basic analytics', 'Invoice management', 'Email support']}
            cta="Get started" onCta={onLogin}
          />
          <PricingCard
            name="Agency" price="45,000" currency="₦" period="mo"
            description="For agencies managing 5–20 client businesses with full analytics."
            features={['Up to 20 businesses', 'All Solo features', 'Cross-business analytics', 'Unified social inbox', 'Multi-platform ad campaigns', 'Bulk actions', 'Client onboarding pipeline', 'Priority support']}
            highlight cta="Get started" onCta={onLogin}
          />
          <PricingCard
            name="Enterprise" price="Custom" currency="" period="quote"
            description="For holding companies and large networks with 20+ businesses."
            features={['Unlimited businesses', 'All Agency features', 'Dedicated account manager', 'Custom onboarding', 'API access', 'White-label options', 'SLA guarantee']}
            cta="Contact us" onCta={onLogin}
          />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px 96px' }}>
        <h2 className="font-display" style={{ fontSize: 32, fontWeight: 900, margin: '0 0 32px', color: '#f0f0f0' }}>
          FAQ
        </h2>
        {[
          { q: 'Does it work for businesses that only operate in local currency?', a: 'Yes. GrowthNet supports NGN, GHS, KES, ZAR, XOF, and USD. You set the currency per business — your portfolio dashboard converts to your preferred reporting currency.' },
          { q: "Can my clients see their own data without seeing other clients' data?", a: "Yes. Each business gets its own limited-access view. They see their dashboard, pipeline, and social data — not your portfolio or other clients." },
          { q: 'How does the social scheduler handle platform rate limits?', a: 'We queue posts and auto-retry within safe limits per platform. TikTok, Instagram, Facebook, X, LinkedIn, and YouTube are all supported.' },
          { q: 'Is my data stored in Africa?', a: 'Data is stored in Lagos (primary) and Johannesburg (backup) with end-to-end encryption at rest and in transit.' },
        ].map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #1e1e24', padding: '24px 0' }}>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f0', marginBottom: 10 }}>
              {faq.q}
            </div>
            <p style={{ fontSize: 14, color: '#6b6b7b', margin: 0, lineHeight: 1.7 }}>{faq.a}</p>
          </div>
        ))}
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #8b5cf6 100%)',
          padding: '80px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=50&auto=format&fit=crop)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.07,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2
            className="font-display"
            style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: -1, lineHeight: 1 }}
          >
            YOUR BUSINESSES ARE WAITING.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 36px' }}>
            Explore the live portfolio, or sign in as the owner to manage the showcase.
          </p>
          <button
            onClick={onDashboard}
            style={{
              background: '#fff', border: 'none', color: '#6d28d9',
              padding: '16px 44px', borderRadius: 8,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            Open Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid #1e1e24',
          padding: '40px 32px',
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/gnlogo.jpg" alt="GrowthNet" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'contain' }} />
          <span className="font-display" style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: '#f0f0f0' }}>
            GROWTH<span style={{ color: '#8b5cf6' }}>NET</span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>
          © 2026 GrowthNet Technologies Ltd. · Lagos · Accra · Nairobi · Cape Town
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Status', 'Contact'].map((link) => (
            <a key={link} href="#" style={{ fontSize: 12, color: '#6b6b7b', textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
