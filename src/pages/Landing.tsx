import { useState, useEffect } from 'react'
import {
  ArrowRight, Menu, X, BarChart3, Users, Zap, Globe,
  CheckCircle, TrendingUp, Calendar, Shield, ChevronDown,
  ExternalLink, Loader2, Star,
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { fetchPublicBusinesses } from '../lib/api'

interface LandingProps {
  onLogin: () => void
  onDashboard: () => void
}

// ── Real businesses managed by Growth Network ─────────────────────────────────
const REAL_BUSINESSES = [
  { id: 'buysmart',         name: 'BuySmart Procurement Limited', type: 'Procurement & Supply Chain',    country: 'Nigeria' },
  { id: 'goodman',          name: 'Goodman & Goldsmith',          type: 'Trading & Import/Export',        country: 'Nigeria' },
  { id: 'hamdan',           name: 'Hamdan Export',                type: 'Export Trade & Logistics',       country: 'Nigeria' },
  { id: 'export-africa',    name: 'Export Trade Africa',          type: 'Pan-African Trade',              country: 'Africa' },
  { id: 'vibe',             name: 'Vibe District',                type: 'Events & Entertainment',         country: 'Nigeria' },
  { id: 'opes',             name: 'OPES Energy Services',         type: 'Energy & Procurement',           country: 'Nigeria' },
  { id: 'professor',        name: 'Professor Ris Agbede',         type: 'Education & Consulting',         country: 'Nigeria' },
  { id: 'chaincode',        name: 'ChainCodeCamp',                type: 'Tech Education & Web3',          country: 'Nigeria' },
  { id: 'growth-agency',    name: 'Growth Network Agency',        type: 'Digital Growth Agency',          country: 'Nigeria' },
  { id: 'grind',            name: 'Grind',                        type: 'Lifestyle & Brand',              country: 'Nigeria' },
  { id: 'drip',             name: 'Drip Community',               type: 'Community & Fashion',            country: 'Nigeria' },
  { id: 'aura',             name: 'Aura by Temi',                 type: 'Beauty & Wellness',              country: 'Nigeria' },
  { id: 'mercy',            name: "Mercy's Kitchen",              type: 'Food & Catering',                country: 'Nigeria' },
]

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onDashboard }: { onLogin: () => void; onDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 60,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid #eaeae6' : '1px solid transparent',
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: '#0f0f0e', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 13 }}>G</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f0e', letterSpacing: -0.4 }}>
              Growth Network
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            {['Product', 'Businesses', 'Pricing', 'About'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ fontSize: 14, color: '#4a4a45', padding: '6px 12px', borderRadius: 6, fontWeight: 500, transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f2f1ee'; (e.currentTarget as HTMLAnchorElement).style.color = '#0f0f0e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#4a4a45' }}
              >{link}</a>
            ))}
          </nav>

          <div className="hide-mobile" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={onLogin} className="btn btn-ghost btn-sm">Sign in</button>
            <button onClick={onDashboard} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              Open dashboard <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="show-mobile" style={{ display: 'none', marginLeft: 'auto' }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#0f0f0e', display: 'flex', alignItems: 'center', minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: '#fff', borderBottom: '1px solid #eaeae6', padding: '8px 20px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {['Product', 'Businesses', 'Pricing', 'About'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', fontSize: 16, color: '#0f0f0e', fontWeight: 500, borderBottom: '1px solid #f2f1ee', minHeight: 44 }}>
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

// ── Hero — Nigerian city video background ─────────────────────────────────
function Hero({ onDashboard, onLogin }: { onDashboard: () => void; onLogin: () => void }) {
  const WA_LINK = 'https://wa.me/2348072027335?text=Hi%20Goodness%2C%20I%27d%20like%20to%20get%20a%20quote%20for%20Growth%20Network'

  return (
    <section
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/*
        Hero background: Nigerian building / Lagos cityscape video
        Source: Mixkit free stock footage (no CORS restrictions, no attribution required)
        Fallback: Lagos aerial photo via Unsplash if video cannot load
      */}

      {/* CSS image fallback — shows immediately while video loads */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1618023913578-b5fb12c7b2e3?w=1800&q=85&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />

      {/* Actual video — Nigerian/Lagos building exterior footage */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        {/* Mixkit — Lagos city aerial, royalty-free, no CORS block */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-shot-of-a-city-on-the-coast-1830-large.mp4" type="video/mp4" />
        {/* Second source: another Mixkit African city aerial */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-city-traffic-on-a-rainy-night-549-large.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay sits above video, below content */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.7) 100%)', zIndex: 2 }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: 820, padding: 'clamp(100px, 14vw, 160px) 20px clamp(60px, 8vw, 80px)' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '5px 16px', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', flexShrink: 0 }} className="pulse" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            Managing 13 businesses across Nigeria
          </span>
        </div>

        {/* Headline */}
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(42px, 9vw, 92px)',
            color: '#ffffff',
            marginBottom: 20,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          Every business.
          <br />
          <span className="serif-italic" style={{ color: '#d1fae5' }}>One screen.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)',
          color: 'rgba(255,255,255,0.82)',
          maxWidth: 500,
          margin: '0 auto 36px',
          lineHeight: 1.75,
          fontWeight: 400,
          padding: '0 8px',
        }}>
          Growth Network is the operating system for agencies managing African businesses.
          CRM, social, pipeline, analytics and automations. All in one place.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 8px' }}>
          <button
            onClick={onDashboard}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: '#ffffff', color: '#0f0f0e',
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              padding: '14px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)' }}
          >
            Open dashboard <ArrowRight size={16} />
          </button>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
              padding: '14px 28px', borderRadius: 10,
              border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)')}
          >
            Get a quote
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 6vw, 56px)', marginTop: 56, flexWrap: 'wrap', padding: '0 8px' }}>
          {[
            { value: '13', label: 'Businesses' },
            { value: '₦0→', label: 'Building from zero' },
            { value: 'NG', label: 'Lagos, Nigeria' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 'clamp(26px, 4vw, 34px)', color: '#ffffff', lineHeight: 1, textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)' }}>
        <ChevronDown size={16} className="pulse" />
      </div>
    </section>
  )
}

// ── Our Businesses ─────────────────────────────────────────────────────────
function OurBusinesses() {
  return (
    <section id="businesses" style={{ background: '#f9f9f7', borderTop: '1px solid #eaeae6', borderBottom: '1px solid #eaeae6' }}>
      <div className="container section">
        <div style={{ marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 10 }}>Portfolio</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#0f0f0e', marginBottom: 14 }}>
            Businesses we're
            <br />
            <span className="serif-italic">growing right now.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#4a4a45', lineHeight: 1.7, maxWidth: 480 }}>
            Every number starts at zero. These are the real businesses we're building with, from day one.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 10,
        }}>
          {REAL_BUSINESSES.map((biz, i) => (
            <div
              key={biz.id}
              style={{
                background: '#fff',
                border: '1.5px solid #eaeae6',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d4d4ce'; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eaeae6'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              {/* Number */}
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f2f1ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#1a5c42', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f0f0e', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name}</div>
                <div style={{ fontSize: 11, color: '#888880', fontWeight: 500 }}>{biz.type}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888880', marginTop: 32 }}>
          All metrics start at zero. We build in public. Numbers update as businesses grow.
        </p>
      </div>
    </section>
  )
}

// ── Features ───────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BarChart3, title: 'Portfolio Analytics',    desc: 'Revenue trends, social growth, campaign performance across every business. One view.' },
  { icon: Users,     title: 'CRM & Pipeline',          desc: 'Contact management and a sales kanban that reflects how African B2B deals actually close.' },
  { icon: Calendar,  title: 'Content Calendar',         desc: 'Plan and schedule content across Instagram, TikTok, Facebook, X and LinkedIn. AI suggestions per business.' },
  { icon: Zap,       title: 'Tools & Automations',      desc: 'Auto-reports, lead routing, follow-up sequences, webhook triggers. Build once, runs forever.' },
  { icon: TrendingUp,title: 'Ad Campaigns',             desc: 'Manage ad spend and track ROAS across all platforms and all clients from one table.' },
  { icon: Shield,    title: 'Role-Based Access',        desc: 'Clients see only their data. You see everything. Clean permissions, zero confusion.' },
  { icon: Globe,     title: 'Multi-Currency Finance',   desc: 'Issue invoices and report in NGN, GHS, KES, ZAR, or USD. Auto-conversion for portfolios.' },
  { icon: CheckCircle, title: 'Service Requests',       desc: 'Clients submit work requests, you track delivery. No email chains, no missed tasks.' },
]

function Features() {
  return (
    <section id="product" style={{ background: '#ffffff', borderTop: '1px solid #eaeae6' }}>
      <div className="container section">
        <div style={{ marginBottom: 52, maxWidth: 520 }}>
          <p className="label" style={{ marginBottom: 10 }}>Product</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#0f0f0e', marginBottom: 14 }}>
            Everything your
            <br />
            <span className="serif-italic">portfolio needs.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#4a4a45', lineHeight: 1.7 }}>
            Built for operators managing multiple businesses. Every tool connects to every other.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          border: '1.5px solid #eaeae6',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                style={{ padding: 'clamp(20px, 3vw, 28px)', background: '#fff', borderRight: '1px solid #eaeae6', borderBottom: '1px solid #eaeae6', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <div style={{ width: 38, height: 38, background: '#f2f1ee', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={17} color="#1a5c42" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 7, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6a6a62', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Live Portfolio (API) ────────────────────────────────────────────────────
function LivePortfolio() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicBusinesses().then(r => setBusinesses(r.businesses)).catch(() => setBusinesses([])).finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (businesses.length === 0) return null

  return (
    <section style={{ background: '#f9f9f7', borderTop: '1px solid #eaeae6' }}>
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <p className="label" style={{ marginBottom: 10 }}>Live portfolio</p>
            <h2 className="serif" style={{ fontSize: 'clamp(24px, 4vw, 40px)', color: '#0f0f0e' }}>
              Real businesses.
              <br /><span className="serif-italic">Real growth.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} className="pulse" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Live</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 10 }}>
          {businesses.map(b => (
            <a key={b.id} href={`/public/${encodeURIComponent(b.id)}`} className="card card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-green">{b.status}</span>
                <ExternalLink size={13} color="#888880" />
              </div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#0f0f0e', lineHeight: 1.2, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888880' }}>{b.type}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#1a5c42', fontWeight: 600 }}>
                View snapshot <ArrowRight size={12} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Author / Trust section ─────────────────────────────────────────────────
function AuthorSection() {
  return (
    <section id="about" style={{ background: '#ffffff', borderTop: '1px solid #eaeae6' }}>
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(32px, 6vw, 72px)', alignItems: 'center' }}>
          {/* Founder photo */}
          <div style={{ order: 0 }}>
            <div style={{ width: '100%', maxWidth: 360, borderRadius: 20, overflow: 'hidden', position: 'relative', border: '1.5px solid #eaeae6', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <img
                src="/ig.png"
                alt="Goodness Iyamah, Founder of Growth Network"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', objectPosition: 'top center', aspectRatio: '4/5' }}
              />
            </div>
          </div>

          {/* Copy */}
          <div>
            <p className="label" style={{ marginBottom: 14 }}>The founder</p>
            <h2 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#0f0f0e', marginBottom: 16 }}>
              Built by someone who
              <br />
              <span className="serif-italic">runs agencies.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#4a4a45', lineHeight: 1.75, marginBottom: 20 }}>
              Growth Network was built by Goodness Iyamah, a growth operator managing businesses across procurement, tech, food, fashion, and events in Nigeria.
              Every feature came from a real problem managing real clients.
            </p>
            <p style={{ fontSize: 15, color: '#4a4a45', lineHeight: 1.75, marginBottom: 28 }}>
              Not built by engineers guessing what agencies need. Built by the person doing the work, for people doing the same.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                '13 businesses actively managed on the platform',
                'Procurement, tech, food, fashion, events and more',
                'Based in Lagos. Built for Africa.',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <CheckCircle size={11} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: 14, color: '#4a4a45', lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/2348072027335?text=Hi%20Goodness%2C%20I%27d%20like%20to%20talk%20about%20Growth%20Network"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: '#0f0f0e', color: '#fff',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                padding: '12px 22px', borderRadius: 9, textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#2a2a28')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#0f0f0e')}
            >
              Message Goodness on WhatsApp <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Solo',
    price: 'Based on scope',
    desc: 'For solo operators managing up to 3 businesses.',
    features: ['Up to 3 businesses', 'CRM & pipeline', 'Social scheduler', 'Basic analytics', 'Invoice management', 'Email support'],
    highlight: false,
    cta: 'Get a quote',
  },
  {
    name: 'Agency',
    price: 'Based on scope',
    desc: 'For agencies managing 5–20 client businesses.',
    features: ['Up to 20 businesses', 'Everything in Solo', 'Cross-business analytics', 'Tools & Automations', 'Multi-platform ad campaigns', 'Bulk actions', 'Leads pipeline', 'Priority support'],
    highlight: true,
    cta: 'Get a quote',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For holding companies and large networks with 20+ businesses.',
    features: ['Unlimited businesses', 'Everything in Agency', 'Dedicated account manager', 'API access + webhooks', 'White-label options', 'SLA guarantee', 'Custom onboarding'],
    highlight: false,
    cta: 'Contact us',
  },
]

function Pricing({ onCta }: { onCta: () => void }) {
  const WA_QUOTE = 'https://wa.me/2348072027335?text=Hi%20Goodness%2C%20I%27d%20like%20to%20get%20a%20quote%20for%20Growth%20Network'

  return (
    <section id="pricing" style={{ background: '#f9f9f7', borderTop: '1px solid #eaeae6' }}>
      <div className="container section">
        <div style={{ marginBottom: 48, maxWidth: 480 }}>
          <p className="label" style={{ marginBottom: 10 }}>Pricing</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#0f0f0e', marginBottom: 10 }}>
            Priced by workload,
            <br />
            <span className="serif-italic">not by seat.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#6a6a62', lineHeight: 1.7 }}>
            Every engagement is scoped to your actual needs. No arbitrary monthly fees.
            Pay for what your businesses actually need.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12, alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? '#0f0f0e' : '#fff',
                border: plan.highlight ? 'none' : '1.5px solid #eaeae6',
                borderRadius: 16,
                padding: 'clamp(20px, 3vw, 28px)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -10, left: 20, background: '#1a5c42', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' }}>
                  Most popular
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: plan.highlight ? '#6a6a62' : '#888880', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div className="serif" style={{ fontSize: 'clamp(20px, 3vw, 26px)', color: plan.highlight ? '#fff' : '#0f0f0e', lineHeight: 1.2, marginBottom: 8 }}>
                  {plan.price}
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? '#6a6a62' : '#6a6a62', lineHeight: 1.6 }}>{plan.desc}</p>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: plan.highlight ? '#d0d0d0' : '#4a4a45' }}>
                    <CheckCircle size={13} color={plan.highlight ? '#bbf7d0' : '#16a34a'} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={WA_QUOTE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: plan.highlight ? '#fff' : '#0f0f0e', color: plan.highlight ? '#0f0f0e' : '#fff', borderRadius: 8, width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Industries ─────────────────────────────────────────────────────────────
const INDUSTRIES = [
  'Procurement & Supply', 'Export & Import Trade', 'Digital Agencies',
  'Food & Catering', 'Fashion & Retail', 'Beauty & Wellness',
  'Events & Entertainment', 'Tech Education', 'Energy Services',
  'Construction', 'Healthcare', 'Finance', 'Agriculture',
]

// ── FAQ ────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How is pricing determined?', a: 'Pricing is based on the scope of work, number of businesses, services needed, and level of support. We scope each engagement individually so you only pay for what your businesses actually need. No arbitrary seat fees.' },
  { q: 'Can my clients see their own data without seeing other clients?', a: "Yes. Each business has its own limited-access login. They see their dashboard, pipeline, and social data only. Never your full portfolio or other clients data." },
  { q: 'What businesses is this built for?', a: "Any business with clients, revenue, and growth to track. We currently manage procurement companies, trading businesses, food, fashion, tech, and events. If it has a CRM and a social presence, Growth Network handles it." },
  { q: 'Does it work for businesses operating only in Nigeria?', a: "100%. NGN is the primary currency, Nigerian phone numbers and WhatsApp patterns are built in. Everything works locally first." },
  { q: 'How do I get started?', a: "Click Get a quote or Open dashboard above. We scope your businesses together, set everything up, and you have a live dashboard within a week." },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ background: '#ffffff', borderTop: '1px solid #eaeae6' }}>
      <div className="container-sm section">
        <h2 className="serif" style={{ fontSize: 'clamp(26px, 4vw, 40px)', color: '#0f0f0e', marginBottom: 36 }}>
          Questions &amp; answers
        </h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #eaeae6' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', gap: 16, textAlign: 'left', minHeight: 44 }}
            >
              <span style={{ fontSize: 'clamp(14px, 2vw, 15px)', fontWeight: 600, color: '#0f0f0e', lineHeight: 1.4 }}>{faq.q}</span>
              <ChevronDown size={17} color="#888880" style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open === i && (
              <p style={{ fontSize: 14, color: '#6a6a62', lineHeight: 1.75, paddingBottom: 18 }}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── CTA Banner ─────────────────────────────────────────────────────────────
function CTABanner({ onDashboard, onLogin }: { onDashboard: () => void; onLogin: () => void }) {
  const WA = 'https://wa.me/2348072027335?text=Hi%20Goodness%2C%20I%27d%20like%20to%20get%20started%20with%20Growth%20Network'
  return (
    <section style={{ background: '#0f0f0e', padding: 'clamp(60px, 8vw, 96px) 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h2 className="serif" style={{ fontSize: 'clamp(30px, 6vw, 52px)', color: '#ffffff', marginBottom: 14 }}>
          Your businesses are
          <br />
          <span className="serif-italic" style={{ color: '#e2e8f0' }}>waiting.</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#6a6a62', marginBottom: 32, lineHeight: 1.7, padding: '0 8px' }}>
          Start managing your portfolio today. We scope, set up, and have you live within a week.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onDashboard} className="btn btn-lg" style={{ background: '#fff', color: '#0f0f0e', gap: 8 }}>
            Open dashboard <ArrowRight size={15} />
          </button>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg"
            style={{ background: '#25D366', color: '#fff', gap: 8, textDecoration: 'none' }}
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#0f0f0e', borderTop: '1px solid #1a1a18', padding: 'clamp(32px, 5vw, 48px) 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 11 }}>G</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: -0.3 }}>Growth Network</span>
          </div>
          <div style={{ fontSize: 12, color: '#4a4a45', fontWeight: 500 }}>
            © 2026 Growth Network · Lagos, Nigeria
          </div>
          <div style={{ display: 'flex', gap: 'clamp(14px, 3vw, 24px)', flexWrap: 'wrap' }}>
            {['Privacy', 'Terms'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#4a4a45', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#4a4a45')}
              >{l}</a>
            ))}
            <a
              href="https://wa.me/2348072027335?text=Hi%20Goodness%2C%20I%27d%20like%20to%20get%20in%20touch%20about%20Growth%20Network"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#4a4a45', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#4a4a45')}
            >Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function Landing({ onLogin, onDashboard }: LandingProps) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f0f0e', overflowX: 'hidden' }}>
      <Navbar onLogin={onLogin} onDashboard={onDashboard} />
      <Hero onDashboard={onDashboard} onLogin={onLogin} />
      <OurBusinesses />
      <Features />
      <LivePortfolio />
      <AuthorSection />
      <Pricing onCta={onLogin} />

      {/* Industries strip */}
      <section id="industries" style={{ background: '#f9f9f7', borderTop: '1px solid #eaeae6', borderBottom: '1px solid #eaeae6' }}>
        <div className="container section-sm">
          <p className="label" style={{ marginBottom: 16 }}>Industries served</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INDUSTRIES.map(ind => (
              <span key={ind} style={{ background: '#fff', border: '1px solid #eaeae6', borderRadius: 99, padding: '7px 16px', fontSize: 13, color: '#4a4a45', fontWeight: 500 }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
      <CTABanner onDashboard={onDashboard} onLogin={onLogin} />
      <Footer />
    </div>
  )
}
