import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Minus, ChevronRight, Search,
  Bell, ExternalLink, Check, AlertTriangle, Info, CheckCircle2,
  LayoutList, LayoutGrid, Plus, X, Users, DollarSign,
} from 'lucide-react'
import {
  campaigns, alerts, pipelineStages,
  type Business, type HealthStatus,
} from '../data/mockData'
import { formatCurrency } from '../data/store'
import { useBusinesses } from '../hooks/useBusinesses'
import { MiniSparkline, ComparisonChart, RevenueChart, AdFunnel } from '../components/Charts'
import ConnectionsView from '../components/ConnectionsView'
import AnalyticsView from '../components/AnalyticsView'
import ResultsView from '../components/ResultsView'
import ContentCalendarView from '../components/ContentCalendarView'
import { useIsMobile } from '../hooks/useIsMobile'
import { type ApiBusiness, fetchBusinesses, createBusiness, updateBusinessVisibility } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

type OperatorTab =
  | 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline'
  | 'alerts' | 'connections' | 'analytics' | 'results' | 'content'

interface OperatorProps {
  tab: OperatorTab
  onSelectBusiness: (b: Business) => void
  onRequireAuth?: () => void
  autoOpenAddBusiness?: boolean
  onAddBusinessHandled?: () => void
}

// ── Design tokens — light theme ───────────────────────────────────────────────
const R = 10   // card border-radius
const BG      = '#ffffff'
const BG_SUBTLE = '#f8f8f6'
const BORDER  = '#e8e8e4'
const BORDER2 = '#f1f0ed'
const TEXT    = '#0f0f0e'
const TEXT2   = '#374151'
const MUTED   = '#6b7280'
const MUTED2  = '#9ca3af'

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<HealthStatus, { color: string; bgColor: string; icon: React.ElementType; label: string }> = {
  growing:  { color: '#16a34a', bgColor: '#f0fdf4', icon: TrendingUp,  label: 'Growing' },
  flat:     { color: '#d97706', bgColor: '#fffbeb', icon: Minus,       label: 'Flat' },
  declining:{ color: '#dc2626', bgColor: '#fef2f2', icon: TrendingDown,label: 'Declining' },
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  Facebook:  '#1877F2',
  LinkedIn:  '#0A66C2',
  TikTok:    '#a855f7',
  X:         '#374151',
  YouTube:   '#dc2626',
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: HealthStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bgColor, border: `1px solid ${cfg.color}40`, borderRadius: 99, padding: '3px 10px' }}>
      <cfg.icon size={10} color={cfg.color} />
      <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", color: cfg.color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {cfg.label}
      </span>
    </div>
  )
}

function PulseBar({ value, total, status }: { value: number; total: number; status: HealthStatus }) {
  const pct = Math.min(100, total > 0 ? (value / total) * 100 : 0)
  return (
    <div style={{ height: 3, background: BORDER2, borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: STATUS_CONFIG[status].color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  const hue = (initials.charCodeAt(0) * 37 + (initials.charCodeAt(1) || 0) * 17) % 360
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', color: TEXT, margin: 0 }}>
        {label}
      </h1>
      {action}
    </div>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  background: TEXT, border: 'none', color: '#fff',
  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 18px', fontFamily: "'Inter', sans-serif",
  transition: 'background 0.15s',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent', border: `1.5px solid ${BORDER}`, color: MUTED,
  borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '8px 16px', fontFamily: "'Inter', sans-serif",
  transition: 'background 0.15s, border-color 0.15s',
}

const card: React.CSSProperties = {
  background: BG, border: `1.5px solid ${BORDER}`, borderRadius: R,
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const { businesses: allBiz } = useBusinesses()
  const maxRevenue = allBiz.length > 0 ? Math.max(...allBiz.map((b: any) => b.revenue || 0), 1) : 1

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...card,
        padding: 20, cursor: 'pointer',
        borderColor: hovered ? '#d0d0ca' : BORDER,
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={business.avatar} size={38} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>{business.name}</div>
            <div style={{ fontSize: 11, color: MUTED2, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              {business.city ? `${business.city} · ` : ''}{business.industry}
            </div>
          </div>
        </div>
        <StatusBadge status={business.status} />
      </div>

      <div style={{ height: 40 }}>
        <MiniSparkline data={business.monthlyData} color={STATUS_CONFIG[business.status].color} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, fontFamily: "'Inter', sans-serif" }}>
            {formatCurrency(business.revenue)}
          </div>
          <div style={{ fontSize: 10, color: MUTED2, fontFamily: "'Inter', sans-serif", marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue MTD</div>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: business.revenueChange >= 0 ? '#16a34a' : '#dc2626', fontFamily: "'Inter', sans-serif" }}>
            {business.revenueChange > 0 ? '+' : ''}{business.revenueChange}%
          </div>
          <div style={{ fontSize: 10, color: MUTED2, fontFamily: "'Inter', sans-serif", marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>vs last month</div>
        </div>
      </div>

      <PulseBar value={business.revenue} total={maxRevenue} status={business.status} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: MUTED2, fontFamily: "'Inter', sans-serif" }}>
          {business.clients} clients · {business.activeCampaigns} campaigns
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: MUTED2, fontSize: 11 }}>
          <span>{business.lastActivity}</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  )
}

function AddBusinessModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('E-commerce')
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true); setError('')
    try {
      await createBusiness({ name: name.trim(), type: type.trim() || 'General', domain: domain.trim() || undefined })
      onCreated(); onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create business.')
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-content" style={{ ...card, padding: 28, width: '100%', maxWidth: 440, position: 'relative', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: MUTED2, padding: 4 }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 34, height: 34, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: TEXT }}>Add Business</div>
            <div style={{ fontSize: 12, color: MUTED2, marginTop: 2 }}>Appears in the public showcase when marked visible.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {[
            { label: 'Business Name *', value: name, setter: setName, placeholder: 'e.g. My Company Ltd' },
            { label: 'Type', value: type, setter: setType, placeholder: 'e.g. E-commerce' },
            { label: 'Domain (optional)', value: domain, setter: setDomain, placeholder: 'e.g. buysmart.ng' },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{f.label}</label>
              <input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} className="gn-input" />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Add Business'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PublicVisibilityPanel({ businesses, onRefresh }: { businesses: ApiBusiness[]; onRefresh: () => void }) {
  const [toggling, setToggling] = useState<string | null>(null)

  const toggle = async (b: ApiBusiness) => {
    setToggling(b.id)
    try { await updateBusinessVisibility(b.id, b.visible !== 1); onRefresh() }
    catch (err) { console.error('visibility toggle failed', err) }
    finally { setToggling(null) }
  }

  return (
    <div style={{ ...card, marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER2}`, background: BG_SUBTLE }}>
        <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 700, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Public Showcase — Visibility
        </span>
      </div>
      {businesses.length === 0 ? (
        <div style={{ padding: '20px', fontSize: 13, color: MUTED2 }}>
          No businesses yet. Add one with the &quot;Add Business&quot; button above.
        </div>
      ) : (
        businesses.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: `1px solid ${BORDER2}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
              <div style={{ fontSize: 11, color: MUTED2, marginTop: 1, fontFamily: "'Inter', sans-serif" }}>{b.type}</div>
            </div>
            {b.visible === 1 && (
              <a href={`/public/${encodeURIComponent(b.id)}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                View <ExternalLink size={11} />
              </a>
            )}
            <button
              onClick={() => toggle(b)}
              disabled={toggling === b.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: b.visible === 1 ? '#f0fdf4' : BG_SUBTLE,
                border: `1px solid ${b.visible === 1 ? '#bbf7d0' : BORDER}`,
                borderRadius: 99, padding: '4px 12px',
                cursor: toggling === b.id ? 'wait' : 'pointer',
                fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 600,
                color: b.visible === 1 ? '#16a34a' : MUTED2, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.visible === 1 ? '#16a34a' : '#d1d5db', flexShrink: 0 }}
                className={b.visible === 1 ? 'pulse' : ''} />
              {toggling === b.id ? '…' : b.visible === 1 ? 'Visible' : 'Hidden'}
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function PortfolioView({ onSelectBusiness, onRequireAuth, autoOpenAddBusiness, onAddBusinessHandled }: {
  onSelectBusiness: (b: Business) => void
  onRequireAuth?: () => void
  autoOpenAddBusiness?: boolean
  onAddBusinessHandled?: () => void
}) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [version, setVersion] = useState(0)
  const { businesses: dbBusinesses, refresh: refreshDbBusinesses } = useBusinesses()

  useEffect(() => {
    if (autoOpenAddBusiness && user) { setShowAddModal(true); onAddBusinessHandled?.() }
  }, [autoOpenAddBusiness, user, onAddBusinessHandled])

  const allBiz: any[] = dbBusinesses.map((b) => ({
    ...b, revenue: 0, revenueChange: 0, clients: 0, activeCampaigns: 0,
    monthlyData: [], city: 'Global', industry: b.type,
    avatar: b.name.slice(0, 2).toUpperCase(),
    status: b.status === 'active' ? 'growing' : 'flat',
  }))

  const filtered = allBiz.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue  = allBiz.reduce((s, b) => s + b.revenue, 0)
  const growingCount  = allBiz.filter((b) => b.status === 'growing').length
  const flatCount     = allBiz.filter((b) => b.status === 'flat').length
  const decliningCount = allBiz.filter((b) => b.status === 'declining').length

  const handleAddBusiness = () => { if (!user) { onRequireAuth?.(); return } setShowAddModal(true) }

  return (
    <div style={{ padding: 28 }}>
      {showAddModal && <AddBusinessModal onClose={() => { setShowAddModal(false); setVersion((v) => v + 1) }} onCreated={refreshDbBusinesses} />}

      {user && <PublicVisibilityPanel businesses={dbBusinesses} onRefresh={refreshDbBusinesses} />}

      {/* Guest notice */}
      {!user && (
        <div style={{ ...card, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Owner tools — read-only</div>
            <div style={{ fontSize: 13, color: TEXT2, marginTop: 3 }}>Sign in as the owner to add businesses and manage visibility.</div>
          </div>
          <button onClick={onRequireAuth} style={primaryBtn}>Sign in as Owner</button>
        </div>
      )}

      {/* Summary strip */}
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 22, border: `1.5px solid ${BORDER}`, borderRadius: R, overflow: 'hidden' }}>
        {[
          { label: 'Portfolio Revenue', value: formatCurrency(totalRevenue), color: '#0f0f0e' },
          { label: 'Growing',           value: `${growingCount}`,           color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Flat',              value: String(flatCount),            color: '#d97706', bg: '#fffbeb' },
          { label: 'Needs Attention',   value: String(decliningCount),       color: '#dc2626', bg: '#fef2f2' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '18px 20px', background: (s as any).bg ?? BG, borderRight: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: MUTED2, fontFamily: "'Inter', sans-serif", marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED2, pointerEvents: 'none' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses…" className="gn-input" style={{ paddingLeft: 34 }} />
        </div>

        {(['all', 'growing', 'flat', 'declining'] as const).map((s) => {
          const active = statusFilter === s
          const col = s === 'growing' ? '#16a34a' : s === 'flat' ? '#d97706' : s === 'declining' ? '#dc2626' : TEXT
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              background: active ? (s === 'all' ? '#f1f0ed' : STATUS_CONFIG[s as HealthStatus]?.bgColor ?? '#f1f0ed') : 'transparent',
              border: `1.5px solid ${active ? (s === 'all' ? BORDER : STATUS_CONFIG[s as HealthStatus]?.color + '50' ?? BORDER) : BORDER}`,
              borderRadius: 99, padding: '7px 14px', fontSize: 12,
              color: active ? (s === 'all' ? TEXT : STATUS_CONFIG[s as HealthStatus]?.color) : MUTED,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        })}

        <div style={{ display: 'flex', border: `1.5px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
          {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: LayoutList }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode as 'grid' | 'list')}
              style={{ background: viewMode === mode ? '#f1f0ed' : 'transparent', border: 'none', padding: '7px 11px', minWidth: 38, cursor: 'pointer', color: viewMode === mode ? TEXT : MUTED2, transition: 'background 0.15s' }}>
              <Icon size={14} />
            </button>
          ))}
        </div>

        <button onClick={handleAddBusiness} style={primaryBtn}>
          <Plus size={13} /> Add Business
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ border: `1.5px dashed ${BORDER}`, borderRadius: R, padding: '56px 40px', textAlign: 'center', background: BG_SUBTLE }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: MUTED2, marginBottom: 8 }}>
            {allBiz.length === 0 ? 'No businesses yet.' : 'No matches found.'}
          </div>
          <p style={{ fontSize: 13, color: MUTED2, margin: 0 }}>
            {allBiz.length === 0 ? 'Click "Add Business" to add your first.' : 'Try clearing the search or filter.'}
          </p>
        </div>
      )}

      {/* Cards */}
      <div key={version}>
        {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map((b) => <BusinessCard key={b.id} business={b} onClick={() => onSelectBusiness(b)} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((b) => (
              <div key={b.id} onClick={() => onSelectBusiness(b)} style={{ ...card, padding: '13px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.15s, border-color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#d0d0ca' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = BORDER }}
              >
                <Avatar initials={b.avatar} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: MUTED2, fontFamily: "'Inter', sans-serif" }}>{b.city ? `${b.city} · ` : ''}{b.industry}</div>
                </div>
                <StatusBadge status={b.status} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{formatCurrency(b.revenue)}</div>
                  <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? '#16a34a' : '#dc2626' }}>
                    {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
                  </div>
                </div>
                <div style={{ width: 56, height: 26 }}>
                  <MiniSparkline data={b.monthlyData} color={STATUS_CONFIG[b.status as HealthStatus]?.color || '#9ca3af'} height={26} />
                </div>
                <ChevronRight size={15} color={MUTED2} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Compare ───────────────────────────────────────────────────────────────────
function CompareView() {
  const { businesses: dbBusinesses } = useBusinesses()
  const allBiz: any[] = dbBusinesses.map((b) => ({
    ...b, revenue: 0, revenueChange: 0, clients: 0, activeCampaigns: 0,
    monthlyData: [], city: 'Global', industry: b.type,
    avatar: b.name.slice(0, 2).toUpperCase(),
    status: b.status === 'active' ? 'growing' : 'flat', socialGrowth: 0,
  }))
  const sorted = [...allBiz].sort((a, b) => b.revenue - a.revenue)
  const chartData = sorted.map((b) => ({ name: b.name, revenue: b.revenue, clients: b.clients }))

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader label="Cross-Business Comparison" />
      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ ...card, padding: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED2, marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Revenue Ranking</div>
          <ComparisonChart businesses={chartData} height={300} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.slice(0, 4).map((b, i) => (
            <div key={b.id} style={{ ...card, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: i === 0 ? '#16a34a' : MUTED2, minWidth: 26, lineHeight: 1 }}>{i + 1}</span>
              <Avatar initials={b.avatar} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{b.name}</div>
                <div style={{ fontSize: 11, color: MUTED2 }}>{b.city || b.industry}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{formatCurrency(b.revenue)}</div>
                <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? '#16a34a' : '#dc2626' }}>
                  {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div className="table-scroll">
          <div className="table-grid" style={{ padding: '11px 18px', borderBottom: `1px solid ${BORDER2}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, background: BG_SUBTLE }}>
            {['Business', 'Revenue', 'Growth', 'Clients', 'Social', 'Status'].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>
          {sorted.map((b) => (
            <div key={b.id} className="table-grid" style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER2}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar initials={b.avatar} size={26} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: MUTED2 }}>{b.city || b.industry}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{formatCurrency(b.revenue)}</div>
              <div style={{ fontSize: 13, color: b.revenueChange >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
              </div>
              <div style={{ fontSize: 13, color: TEXT2 }}>{b.clients}</div>
              <div style={{ fontSize: 13, color: b.socialGrowth > 0 ? '#16a34a' : '#dc2626' }}>
                {b.socialGrowth > 0 ? '+' : ''}{b.socialGrowth}%
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Inbox ─────────────────────────────────────────────────────────────────────
const inboxMessages: Array<{ id: number; from: string; platform: string; business: string; message: string; time: string; unread: boolean }> = []

function InboxView() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = inboxMessages.find((m) => m.id === selectedId)
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: isMobile ? 16 : 28 }}>
      <SectionHeader label="Unified Inbox" />
      <div className={isMobile ? 'stack-mobile' : ''} style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12, height: isMobile ? 'auto' : 520 }}>
        <div style={{ ...card, overflowY: isMobile ? 'visible' : 'auto' }}>
          {inboxMessages.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: MUTED2, fontSize: 13 }}>
              Awaiting data — connected conversations will appear here.
            </div>
          )}
          {inboxMessages.map((msg) => (
            <div key={msg.id} onClick={() => setSelectedId(msg.id)}
              style={{ padding: '13px 15px', borderBottom: `1px solid ${BORDER2}`, cursor: 'pointer', background: selectedId === msg.id ? '#f8f8f6' : 'transparent', borderLeft: msg.unread ? '3px solid #16a34a' : '3px solid transparent', transition: 'background 0.1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: msg.unread ? 600 : 400, color: TEXT }}>@{msg.from}</div>
                <div style={{ fontSize: 10, color: MUTED2, whiteSpace: 'nowrap' }}>{msg.time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, background: (PLATFORM_COLORS[msg.platform] || '#374151') + '15', color: PLATFORM_COLORS[msg.platform] || '#374151', padding: '1px 6px', borderRadius: 3 }}>
                  {msg.platform}
                </span>
                <span style={{ fontSize: 11, color: MUTED2 }}>{msg.business}</span>
              </div>
              <div style={{ fontSize: 12, color: MUTED2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{msg.message}</div>
            </div>
          ))}
        </div>
        {selected ? (
          <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>@{selected.from}</div>
                <div style={{ fontSize: 11, color: MUTED2 }}>via {selected.platform} · {selected.business}</div>
              </div>
              <ExternalLink size={14} color={MUTED2} />
            </div>
            <div style={{ flex: 1, padding: 18 }}>
              <div style={{ background: BG_SUBTLE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 15px', fontSize: 13, color: TEXT2, lineHeight: 1.65, maxWidth: '80%' }}>
                {selected.message}
              </div>
            </div>
            <div style={{ padding: '11px 15px', borderTop: `1px solid ${BORDER2}`, display: 'flex', gap: 10 }}>
              <input placeholder="Type a reply…" className="gn-input" style={{ flex: 1 }} />
              <button style={primaryBtn}>Send</button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: MUTED2 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: TEXT, marginBottom: 6 }}>Select a message</div>
              <p style={{ fontSize: 13, margin: 0 }}>Click any conversation to open it here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
function CampaignsView() {
  const totalSpend       = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const avgROAS          = campaigns.length === 0 ? '0.0' : (campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length).toFixed(1)

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader label="Campaign Manager" />
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Ad Spend (MTD)', value: formatCurrency(totalSpend), color: '#d97706', bg: '#fffbeb' },
          { label: 'Total Conversions',    value: totalConversions.toLocaleString(), color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Portfolio Avg ROAS',   value: `${avgROAS}×`, color: '#2563eb', bg: '#eff6ff' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: R, padding: '18px 20px', border: `1.5px solid ${s.color}20` }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED2, fontFamily: "'Inter', sans-serif", marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12 }}>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div className="table-scroll">
            <div className="table-grid-narrow" style={{ padding: '11px 18px', borderBottom: `1px solid ${BORDER2}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 12, background: BG_SUBTLE }}>
              {['Campaign', 'Platform', 'Spend', 'Conv.', 'ROAS', 'Status'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
              ))}
            </div>
            {campaigns.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: MUTED2, fontSize: 13 }}>
                Awaiting data — ad campaigns will appear here once connected.
              </div>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="table-grid-narrow" style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER2}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: MUTED2 }}>{c.business}</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, background: (PLATFORM_COLORS[c.platform] || '#374151') + '14', color: PLATFORM_COLORS[c.platform] || '#374151', padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>
                  {c.platform}
                </div>
                <div style={{ fontSize: 13, color: TEXT2, fontWeight: 500 }}>{formatCurrency(c.spend)}</div>
                <div style={{ fontSize: 13, color: TEXT2 }}>{c.conversions.toLocaleString()}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.roas >= 3 ? '#16a34a' : '#dc2626' }}>{c.roas}×</div>
                <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', color: c.status === 'active' ? '#16a34a' : c.status === 'paused' ? '#d97706' : MUTED2, background: c.status === 'active' ? '#f0fdf4' : c.status === 'paused' ? '#fffbeb' : BG_SUBTLE }}>
                  {c.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED2, marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Portfolio Funnel (MTD)</div>
          <AdFunnel spend={totalSpend} clicks={campaigns.reduce((s, c) => s + c.clicks, 0)} conversions={totalConversions} height={240} />
        </div>
      </div>
    </div>
  )
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
function PipelineView() {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader label="Client Onboarding Pipeline" />
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {pipelineStages.map((stage) => (
          <div key={stage.id} style={{ minWidth: 210, flex: 1, ...card, overflow: 'hidden' }}>
            <div style={{ padding: '11px 14px', borderBottom: `1px solid ${BORDER2}`, borderTop: `3px solid ${stage.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: BG }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, fontFamily: "'Inter', sans-serif", letterSpacing: '0.04em' }}>{stage.label}</span>
              <span style={{ background: BG_SUBTLE, border: `1px solid ${BORDER}`, color: MUTED2, fontSize: 11, borderRadius: 10, padding: '1px 8px' }}>{stage.prospects.length}</span>
            </div>
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, background: BG }}>
              {stage.prospects.map((p) => (
                <div key={p.name} style={{ background: BG_SUBTLE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '11px 13px', cursor: 'grab', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: MUTED2, marginBottom: 8 }}>{p.city}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{formatCurrency(p.value)}</div>
                    <div style={{ fontSize: 11, color: MUTED2 }}>{p.contact}</div>
                  </div>
                </div>
              ))}
              <button style={{ background: 'transparent', border: `1.5px dashed ${BORDER}`, borderRadius: 8, padding: 9, cursor: 'pointer', fontSize: 12, color: MUTED2, textAlign: 'center', width: '100%', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#d0d0ca')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
              >
                + Add prospect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Alerts ────────────────────────────────────────────────────────────────────
const ALERT_CONFIG = {
  danger:  { color: '#dc2626', bg: '#fef2f2', icon: AlertTriangle },
  warning: { color: '#d97706', bg: '#fffbeb', icon: AlertTriangle },
  success: { color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
  info:    { color: '#2563eb', bg: '#eff6ff', icon: Info },
}

function AlertsView() {
  const [items, setItems] = useState(alerts)
  const markRead = (id: string) => setItems((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        label="Portfolio Alerts"
        action={
          <button onClick={() => setItems((prev) => prev.map((a) => ({ ...a, read: true })))} style={ghostBtn}>
            <Check size={12} /> Mark all read
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type]
          return (
            <div key={alert.id} style={{
              background: alert.read ? BG_SUBTLE : cfg.bg,
              border: `1.5px solid ${alert.read ? BORDER : cfg.color + '35'}`,
              borderLeft: `3px solid ${alert.read ? BORDER : cfg.color}`,
              borderRadius: R, padding: '14px 18px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              opacity: alert.read ? 0.55 : 1, transition: 'opacity 0.2s',
            }}>
              <cfg.icon size={16} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{alert.business}</span>
                  <span style={{ fontSize: 10, color: MUTED2, fontFamily: "'Inter', sans-serif" }}>{alert.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: alert.read ? MUTED2 : TEXT2, lineHeight: 1.6 }}>{alert.message}</p>
              </div>
              {!alert.read && (
                <button onClick={() => markRead(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED2, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={13} />
                </button>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: MUTED2, fontSize: 13, background: BG_SUBTLE, borderRadius: R, border: `1.5px dashed ${BORDER}` }}>
            No alerts right now.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Operator({ tab, onSelectBusiness, onRequireAuth, autoOpenAddBusiness, onAddBusinessHandled }: OperatorProps) {
  if (tab === 'portfolio') return <PortfolioView onSelectBusiness={onSelectBusiness} onRequireAuth={onRequireAuth} autoOpenAddBusiness={autoOpenAddBusiness} onAddBusinessHandled={onAddBusinessHandled} />
  if (tab === 'compare')   return <CompareView />
  if (tab === 'inbox')     return <InboxView />
  if (tab === 'campaigns') return <CampaignsView />
  if (tab === 'pipeline')  return <PipelineView />
  if (tab === 'alerts')    return <AlertsView />
  if (tab === 'connections') return <ConnectionsView />
  if (tab === 'analytics') return <AnalyticsView />
  if (tab === 'results')   return <ResultsView />
  if (tab === 'content')   return <ContentCalendarView />
}
