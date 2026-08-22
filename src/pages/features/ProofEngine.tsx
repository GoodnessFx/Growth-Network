/**
 * Proof Engine — auto-generates shareable case study pages from real growth data.
 * Extends the existing PublicResults poster pattern.
 * DEMO DATA labeled. Toggle in Settings controls sharing permission.
 */
import { useState } from 'react'
import { Share2, Download, Eye, EyeOff, TrendingUp, Users, DollarSign, BarChart2, Check, ArrowUp } from 'lucide-react'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

// DEMO DATA — replace with real snapshots from API
const SNAPSHOT_90 = { revenue: 380, clients: 11, followers: 2100, deals: 8 }
const SNAPSHOT_NOW = { revenue: 510, clients: 18, followers: 3200, deals: 14 }

function delta(before: number, after: number) {
  return Math.round(((after - before) / before) * 100)
}

function CaseStudyPreview({ business, visible }: { business: Props['business']; visible: boolean }) {
  const metrics = [
    { label: 'Revenue Growth',     before: `₦${SNAPSHOT_90.revenue}k`,  after: `₦${SNAPSHOT_NOW.revenue}k`,  delta: delta(SNAPSHOT_90.revenue, SNAPSHOT_NOW.revenue),   icon: DollarSign, color: '#16a34a' },
    { label: 'Active Clients',     before: String(SNAPSHOT_90.clients),  after: String(SNAPSHOT_NOW.clients),  delta: delta(SNAPSHOT_90.clients, SNAPSHOT_NOW.clients),   icon: Users,       color: '#2563eb' },
    { label: 'Social Followers',   before: SNAPSHOT_90.followers.toLocaleString(), after: SNAPSHOT_NOW.followers.toLocaleString(), delta: delta(SNAPSHOT_90.followers, SNAPSHOT_NOW.followers), icon: BarChart2, color: '#7c3aed' },
    { label: 'Deals Closed',       before: String(SNAPSHOT_90.deals),    after: String(SNAPSHOT_NOW.deals),    delta: delta(SNAPSHOT_90.deals, SNAPSHOT_NOW.deals),       icon: TrendingUp,  color: '#d97706' },
  ]

  return (
    <div style={{ background: '#0f0f0e', borderRadius: 14, overflow: 'hidden', border: '1.5px solid #1a1a1a', position: 'relative' }}>
      {!visible && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <EyeOff size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
            <p style={{ fontSize: 13, fontWeight: 600 }}>Sharing is disabled</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Turn on "Share growth story" to make this public</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '28px 32px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 14 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: -0.3 }}>GrowthNet</span>
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#fff', lineHeight: 1.05, marginBottom: 4 }}>
          {business.name}
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280' }}>90-day Growth Story · August 2026</p>
      </div>

      {/* Headline stat */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #1a1a1a', background: '#0a1a0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 56, color: '#22c55e', lineHeight: 1 }}>
            +{delta(SNAPSHOT_90.revenue, SNAPSHOT_NOW.revenue)}%
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Revenue growth</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>in the last 90 days</div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: '#1a1a1a' }}>
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} style={{ background: '#0f0f0e', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Icon size={13} color={m.color} />
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>{m.after}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: m.color }}>
                  <ArrowUp size={10} />{m.delta}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#4a4a45', marginTop: 3 }}>from {m.before}</div>
            </div>
          )
        })}
      </div>

      {/* Mini chart */}
      <div style={{ padding: '20px 32px' }}>
        <p style={{ fontSize: 11, color: '#4a4a45', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Revenue trend</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48 }}>
          {[280, 310, 295, 420, 390, 510].map((v, i) => {
            const h = Math.round((v / 510) * 100)
            const isLast = i === 5
            return (
              <div key={i} style={{ flex: 1, height: `${h}%`, minHeight: 4, background: isLast ? '#22c55e' : '#1a2a1a', borderRadius: '3px 3px 0 0' }} />
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 32px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#4a4a45' }}>Powered by GrowthNet · growthnetwork.io</span>
        <span style={{ fontSize: 11, color: '#4a4a45' }}>Demo data</span>
      </div>
    </div>
  )
}

export default function ProofEngine({ business }: Props) {
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://growthnet.io/proof/${business.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ padding: '28px 28px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Proof Engine</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Your results, always<br />
          <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>up to date.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520, lineHeight: 1.65 }}>
          GrowthNet auto-generates a clean, shareable case study from your real growth data — no manual writing required.
          Share it with prospects, post it on social media, or use it to win new clients.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Preview */}
        <CaseStudyPreview business={business} visible={sharing} />

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Sharing toggle */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Share growth story</h3>
              <button
                onClick={() => setSharing(s => !s)}
                style={{ width: 44, height: 24, borderRadius: 12, background: sharing ? '#16a34a' : '#e8e8e4', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, left: sharing ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
              {sharing
                ? 'Your case study is publicly visible at the link below.'
                : 'Enable sharing to make your growth story visible to anyone with the link.'}
            </p>
          </div>

          {/* Share link */}
          {sharing && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Share link</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={shareUrl} className="gn-input" style={{ fontSize: '12px !important', background: '#fff' }} onClick={e => (e.target as HTMLInputElement).select()} />
                <button onClick={copyLink} className="btn btn-accent btn-sm" style={{ gap: 5, flexShrink: 0 }}>
                  {copied ? <><Check size={12} /> Copied</> : <><Share2 size={12} /> Copy</>}
                </button>
              </div>
            </div>
          )}

          {/* What's included */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 12 }}>What's included</h3>
            {['90-day revenue growth %', 'Client count before & after', 'Social followers growth', 'Deals closed comparison', 'Revenue trend chart', 'Auto-updated as data changes'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#374151' }}>
                <Check size={11} color="#16a34a" />
                {item}
              </div>
            ))}
          </div>

          {/* Download */}
          <button className="btn btn-ghost" style={{ gap: 7, width: '100%', justifyContent: 'center' }}>
            <Download size={13} /> Download as PNG
          </button>

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
            The case study updates automatically every time your data changes — no manual work needed.
          </p>
        </div>
      </div>
    </div>
  )
}
