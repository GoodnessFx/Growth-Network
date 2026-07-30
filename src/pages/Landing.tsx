import { useState } from 'react'
import { TrendingUp, CheckCircle2, ChevronRight, ArrowRight, BarChart3, Users, Globe, Zap, Star, Menu, X, LayoutGrid } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

interface LandingProps {
  onLogin: () => void
  onRegister: () => void
  onDashboard: () => void
}

const NAV_HEIGHT = 64

function Navbar({ onLogin, onDashboard }: { onLogin: () => void; onDashboard: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile(640)
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 100,
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div
          style={{
            width: 30,
            height: 30,
            background: 'var(--primary)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TrendingUp size={16} color="#111827" strokeWidth={2.5} />
        </div>
        <span
          className="font-display"
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: 'var(--foreground)', whiteSpace: 'nowrap' }}
        >
          GROWTH<span style={{ color: 'var(--primary)' }}>NET</span>
        </span>
      </div>

      <div className="hide-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {['Product', 'Industries', 'Pricing', 'About'].map((item) => (
          <a
            key={item}
            href="#"
            style={{ color: 'var(--muted-foreground)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}
          >
            {item}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isMobile ? (
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        ) : (
          <>
            <button
              onClick={onLogin}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                padding: '8px 18px',
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Sign in
            </button>
            <button
              onClick={onDashboard}
              style={{
                background: 'var(--primary)',
                border: 'none',
                color: 'var(--primary-foreground)',
                padding: '8px 18px',
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'Barlow Condensed',
                letterSpacing: 0.5,
              }}
            >
              OPEN DASHBOARD →
            </button>
          </>
        )}
      </div>

      {/* Mobile menu panel */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: NAV_HEIGHT,
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {['Product', 'Industries', 'Pricing', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              style={{ color: 'var(--foreground)', fontSize: 15, textDecoration: 'none', fontWeight: 500, padding: '4px 0' }}
            >
              {item}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={onLogin}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                padding: '10px 18px',
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Sign in
            </button>
            <button
              onClick={onDashboard}
              style={{
                flex: 1,
                background: 'var(--primary)',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'Barlow Condensed',
                letterSpacing: 0.5,
              }}
            >
              OPEN DASHBOARD →
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function StatBar() {
  const stats = [
    { label: 'Businesses Managed', value: '1,240+' },
    { label: 'Pipeline Tracked', value: '₦48B+' },
    { label: 'Countries', value: '14' },
    { label: 'Avg Revenue Growth', value: '34%' },
  ]
  return (
    <div
      className="stat-grid"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: '28px 16px',
            borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            borderBottom: 'none',
          }}
        >
          <div
            className="font-display stat-value"
            style={{ fontSize: 42, fontWeight: 900, color: 'var(--primary)', letterSpacing: -1, lineHeight: 1 }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--muted-foreground)',
              marginTop: 4,
              fontFamily: 'JetBrains Mono',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

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
        background: accent ? 'var(--primary)' : 'var(--card)',
        border: `1px solid ${accent ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 3,
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: accent ? 'rgba(17,24,39,0.1)' : 'var(--secondary)',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={accent ? '#FFFFFF' : 'var(--primary)'} strokeWidth={2} />
      </div>
      <div>
        <h3
          className="font-display"
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: accent ? '#FFFFFF' : 'var(--foreground)',
            margin: 0,
            letterSpacing: 0.3,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 14,
            color: accent ? 'rgba(255,255,255,0.75)' : 'var(--muted-foreground)',
            margin: '10px 0 0',
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

function PricingCard({
  name,
  price,
  currency,
  period,
  description,
  features,
  highlight,
  cta,
  onCta,
}: {
  name: string
  price: string
  currency: string
  period: string
  description: string
  features: string[]
  highlight?: boolean
  cta: string
  onCta: () => void
}) {
  return (
    <div
      style={{
        background: highlight ? 'var(--card)' : 'transparent',
        border: `1px solid ${highlight ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 3,
        padding: 32,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {highlight && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: 32,
            background: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            letterSpacing: 2,
            padding: '3px 10px',
            borderRadius: 2,
          }}
        >
          MOST POPULAR
        </div>
      )}
      <div>
        <div
          className="font-display"
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}
        >
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{currency}</span>
          <span className="font-display" style={{ fontSize: 52, fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
            {price}
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>/{period}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '8px 0 0', lineHeight: 1.5 }}>{description}</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--foreground)' }}>
            <CheckCircle2 size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        style={{
          background: highlight ? 'var(--primary)' : 'transparent',
          border: `1px solid ${highlight ? 'var(--primary)' : 'var(--border)'}`,
          color: highlight ? '#111827' : 'var(--foreground)',
          padding: '12px 24px',
          borderRadius: 3,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Barlow Condensed',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {cta}
      </button>
    </div>
  )
}

const testimonials = [
  {
    name: 'Oluwakemi Adeyemi',
    role: "Owner, Kemi's Logistics",
    city: 'Lagos, Nigeria',
    avatar: 'KA',
    quote:
      "Before GrowthNet I was running 6 WhatsApp groups to manage my drivers, clients and finances. Now it's one screen. Revenue up 31% in 8 months.",
  },
  {
    name: 'Abena Asante',
    role: 'Founder, Abena Fashion House',
    city: 'Accra, Ghana',
    avatar: 'AA',
    quote:
      "My social following doubled in a quarter. The campaign tools actually understand what sells in Ghana — not some generic US playbook.",
  },
  {
    name: 'Sipho Ndlovu',
    role: 'Director, CoLab Digital Agency',
    city: 'Cape Town, South Africa',
    avatar: 'SN',
    quote:
      "Managing 7 client businesses used to need a 4-person ops team. GrowthNet cut that to me and one assistant. The portfolio dashboard alone is worth it.",
  },
]

const industries = [
  'Logistics & Delivery',
  'Fashion & Retail',
  'Food & Catering',
  'Digital Agencies',
  'Beauty & Wellness',
  'Tech & Repair',
  'Events & Entertainment',
  'Transport & Mobility',
  'Construction',
  'Healthcare',
  'Finance & Microfinance',
  'Agriculture & Agro-processing',
]

export default function Landing({ onLogin, onRegister, onDashboard }: LandingProps) {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <Navbar onLogin={onLogin} onDashboard={onDashboard} />

      {/* Hero — full-bleed background image */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1649502913092-fb7f0e8fc632?w=1600&h=900&fit=crop&auto=format)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.35) saturate(0.8)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(27,122,74,0.25) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 900,
            margin: '0 auto',
            padding: `${NAV_HEIGHT + 60}px 16px 100px`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '5px 14px 5px 8px',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                background: 'var(--accent)',
                color: '#111827',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 10,
                letterSpacing: 1,
              }}
            >
              NEW
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Cross-business analytics now live
            </span>
          </div>

          <h1
            className="font-display hero-title"
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.92,
              margin: '0 0 28px',
              letterSpacing: -2,
              color: '#FFFFFF',
            }}
          >
            ONE SCREEN.
            <br />
            <span style={{ color: '#C2A77D' }}>EVERY</span>
            <br />
            BUSINESS.
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              margin: '0 auto 40px',
              maxWidth: 580,
            }}
          >
            GrowthNet is the command center for operators and agencies managing African SMEs. CRM, social, pipeline, finance, and analytics — unified.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onDashboard}
              style={{
                background: '#1B7A4A',
                border: 'none',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: 3,
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                fontFamily: 'Barlow Condensed',
                letterSpacing: 1,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              SEE THE DASHBOARD <ArrowRight size={16} />
            </button>
            <button
              onClick={onLogin}
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: 3,
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Start free trial
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex' }}>
              {['KA', 'AA', 'DM', 'AO', 'GN'].map((av, i) => (
                <div
                  key={av}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: ['#C2A77D', '#1B7A4A', '#F5A623', '#7B8FFF', '#FF8FD4'][i],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    fontFamily: 'Barlow Condensed',
                    marginLeft: i > 0 ? -8 : 0,
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {av}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} fill="#C2A77D" color="#C2A77D" />
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
                Trusted by 1,240+ businesses across Africa
              </p>
            </div>
          </div>
        </div>

        {/* Floating metric chip */}
        <div
          className="hide-mobile"
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 3,
            padding: '14px 20px',
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }}>REVENUE MTD</div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF' }}>
            ₦16.3M
          </div>
          <div style={{ fontSize: 12, color: '#1B7A4A', fontWeight: 600 }}>↑ 28% vs last month</div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <StatBar />
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              letterSpacing: 3,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            PRODUCT
          </div>
          <h2
            className="font-display"
            style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -0.5, lineHeight: 1.05 }}
          >
            EVERYTHING YOUR PORTFOLIO NEEDS.
            <br />
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>NOTHING IT DOESN&apos;T.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <FeatureCard
            icon={LayoutGrid}
            title="Portfolio Command Center"
            description="Every business you manage in one grid. Health status, revenue trends, pipeline value, and open tasks — visible at a glance without clicking through ten tabs."
          />
          <FeatureCard
            icon={BarChart3}
            title="Visual Growth Analytics"
            description="Real charts, real numbers. Track revenue growth, social following, campaign ROAS, and client acquisition across any time range. Export shareable before/after snapshots."
            accent
          />
          <FeatureCard
            icon={Globe}
            title="Unified Social & Campaigns"
            description="Schedule content, manage inboxes, and run ad campaigns across Instagram, TikTok, Facebook, X, LinkedIn, and YouTube — for all your clients from one calendar."
          />
          <FeatureCard
            icon={Users}
            title="CRM & Client Pipeline"
            description="Full contact management with notes, documents, and activity timelines. A sales kanban that actually reflects how African B2B deals move — not Silicon Valley fiction."
          />
          <FeatureCard
            icon={Zap}
            title="Bulk Actions"
            description="Apply a pricing update, post an announcement, or run a campaign across multiple businesses at once. Stop repeating yourself."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Finance & Invoicing"
            description="Track revenue, issue invoices, and monitor cash flow per business. Simple enough for a shop owner, complete enough for your agency's reporting."
          />
        </div>
      </section>

      {/* Industries */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '64px 32px',
          background: 'var(--card)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              letterSpacing: 3,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            INDUSTRIES SERVED
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {industries.map((ind) => (
              <span
                key={ind}
                style={{
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                  padding: '6px 14px',
                  fontSize: 13,
                  color: 'var(--foreground)',
                  fontWeight: 500,
                }}
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            letterSpacing: 3,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          FROM THE FIELD
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 28, fontWeight: 900, margin: '0 0 24px', letterSpacing: -0.5 }}
        >
          REAL OPERATORS. REAL RESULTS.
        </h2>
        <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill="#C2A77D" color="#C2A77D" />
                ))}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--foreground)', margin: 0, fontStyle: 'italic' }}>
                &quot;{t.quote}&quot;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#111827',
                    fontFamily: 'Barlow Condensed',
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{t.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '80px 32px',
          background: 'var(--card)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              letterSpacing: 3,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            PRICING
          </div>
          <h2
            className="font-display"
            style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', letterSpacing: -0.5 }}
          >
            STRAIGHTFORWARD. NO SURPRISES.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: '0 0 48px' }}>
            Pay in NGN, GHS, KES, ZAR, or USD. Cancel any time.
          </p>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <PricingCard
              name="Solo"
              price="12,000"
              currency="₦"
              period="mo"
              description="For solo operators managing up to 3 businesses."
              features={[
                'Up to 3 businesses',
                'CRM & pipeline',
                'Social scheduler (3 platforms)',
                'Basic analytics',
                'Invoice management',
                'Email support',
              ]}
              cta="Start free trial"
              onCta={onRegister}
            />
            <PricingCard
              name="Agency"
              price="45,000"
              currency="₦"
              period="mo"
              description="For agencies managing 5–20 client businesses with full analytics."
              features={[
                'Up to 20 businesses',
                'All Solo features',
                'Cross-business analytics',
                'Unified social inbox',
                'Multi-platform ad campaigns',
                'Bulk actions',
                'Client onboarding pipeline',
                'Priority support',
              ]}
              highlight
              cta="Start free trial"
              onCta={onRegister}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              currency=""
              period="quote"
              description="For holding companies and large networks with 20+ businesses."
              features={[
                'Unlimited businesses',
                'All Agency features',
                'Dedicated account manager',
                'Custom onboarding',
                'API access',
                'White-label options',
                'SLA guarantee',
              ]}
              cta="Contact us"
              onCta={onLogin}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px' }}>
        <h2
          className="font-display"
          style={{ fontSize: 28, fontWeight: 900, margin: '0 0 24px', letterSpacing: -0.5 }}
        >
          FAQ
        </h2>
        {[
          {
            q: 'Does it work for businesses that only operate in local currency?',
            a: "Yes. GrowthNet supports NGN, GHS, KES, ZAR, XOF, and USD. You set the currency per business — your portfolio dashboard converts to your preferred reporting currency.",
          },
          {
            q: "Can my clients see their own data without seeing other clients' data?",
            a: "Yes. Each business gets its own limited-access view. They see their dashboard, pipeline, and social data — not your portfolio or other clients.",
          },
          {
            q: 'How does the social scheduler handle platform rate limits?',
            a: "We queue posts and auto-retry within safe limits per platform. TikTok, Instagram, Facebook, X, LinkedIn, and YouTube are all supported. Threads and YouTube Shorts are in beta.",
          },
          {
            q: 'Is my data stored in Africa?',
            a: 'Data is stored in Lagos (primary) and Johannesburg (backup) with end-to-end encryption at rest and in transit.',
          },
        ].map((faq, i) => (
          <div
            key={i}
            style={{
              borderBottom: '1px solid var(--border)',
              padding: '24px 0',
            }}
          >
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 10 }}>
              {faq.q}
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.65 }}>{faq.a}</p>
          </div>
        ))}
      </section>

      {/* CTA Banner */}
      <section
        style={{
          background: 'var(--primary)',
          padding: '64px 32px',
          textAlign: 'center',
        }}
      >
          <h2
            className="font-display"
            style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px', letterSpacing: -1, lineHeight: 1 }}
          >
            YOUR BUSINESSES ARE WAITING.
          </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px' }}>
          Start your free 14-day trial. No credit card required.
        </p>
        <button
          onClick={onDashboard}
          style={{
            background: '#111827',
            border: 'none',
            color: '#FFFFFF',
            padding: '16px 40px',
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'Barlow Condensed',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          OPEN DASHBOARD <ChevronRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '40px 32px',
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              background: 'var(--primary)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={12} color="#111827" strokeWidth={2.5} />
          </div>
          <span
            className="font-display"
            style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, color: 'var(--foreground)' }}
          >
            GROWTHNET
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
          © 2026 GrowthNet Technologies Ltd. Lagos · Accra · Nairobi · Cape Town
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Status', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              style={{ fontSize: 12, color: 'var(--muted-foreground)', textDecoration: 'none' }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
