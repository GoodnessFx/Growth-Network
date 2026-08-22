import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Search,
  MoreHorizontal,
  Bell,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  LayoutList,
  LayoutGrid,
  Plus,
  X,
  Users,
  DollarSign,
} from 'lucide-react'
import {
  campaigns,
  alerts,
  pipelineStages,
  type Business,
  type HealthStatus,
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

// ── Design tokens ─────────────────────────────────────────────────────────────
const CARD_RADIUS = 10
const BTN_RADIUS = 8

// ── Shared ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<HealthStatus, { color: string; bgColor: string; icon: React.ElementType; label: string }> = {
  growing: { color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', icon: TrendingUp, label: 'Growing' },
  flat: { color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', icon: Minus, label: 'Flat' },
  declining: { color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', icon: TrendingDown, label: 'Declining' },
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  TikTok: '#a855f7',
  X: '#1DA1F2',
  YouTube: '#FF0000',
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bgColor, border: `1px solid ${cfg.color}40`, borderRadius: 6, padding: '3px 9px' }}>
      <cfg.icon size={11} color={cfg.color} />
      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: cfg.color, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {cfg.label}
      </span>
    </div>
  )
}

function PulseBar({ value, total, status }: { value: number; total: number; status: HealthStatus }) {
  const pct = Math.min(100, total > 0 ? (value / total) * 100 : 0)
  const color = STATUS_CONFIG[status].color
  return (
    <div style={{ height: 3, background: '#1e1e24', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  // deterministic gradient per initials
  const hue = (initials.charCodeAt(0) * 37 + (initials.charCodeAt(1) || 0) * 17) % 360
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `hsl(${hue},60%,40%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 700, color: '#fff',
        fontFamily: 'Barlow Condensed', flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <span className="font-display" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 0.2, color: '#f0f0f0' }}>
        {label}
      </span>
      {action}
    </div>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  background: '#8b5cf6',
  border: 'none',
  color: '#fff',
  borderRadius: BTN_RADIUS,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 18px',
  transition: 'background 0.15s, box-shadow 0.15s',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #1e1e24',
  color: '#9090a0',
  borderRadius: BTN_RADIUS,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 16px',
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
        background: hovered ? '#161619' : '#111114',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.4)' : '#1e1e24'}`,
        borderRadius: CARD_RADIUS,
        padding: 20,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={business.avatar} size={38} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.2 }}>{business.name}</div>
            <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>
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
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', fontFamily: 'JetBrains Mono' }}>
            {formatCurrency(business.revenue)}
          </div>
          <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>Revenue MTD</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: business.revenueChange >= 0 ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono' }}>
            {business.revenueChange > 0 ? '+' : ''}{business.revenueChange}%
          </div>
          <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>vs last month</div>
        </div>
      </div>

      <PulseBar value={business.revenue} total={maxRevenue} status={business.status} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>
          {business.clients} clients · {business.activeCampaigns} campaigns
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b6b7b', fontSize: 11 }}>
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
    setSaving(true)
    setError('')
    try {
      await createBusiness({ name: name.trim(), type: type.trim() || 'General', domain: domain.trim() || undefined })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create business.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-content"
        style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(139,92,246,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} color="#8b5cf6" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: '#f0f0f0' }}>Add Business</div>
            <div style={{ fontSize: 12, color: '#6b6b7b' }}>Appears in the public showcase when marked visible.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Business Name *', value: name, setter: setName, placeholder: 'e.g. My Company Ltd' },
            { label: 'Type', value: type, setter: setType, placeholder: 'e.g. E-commerce' },
            { label: 'Domain (optional)', value: domain, setter: setDomain, placeholder: 'e.g. buysmart.ng' },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>{f.label}</label>
              <input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} className="gn-input" />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
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
    try {
      await updateBusinessVisibility(b.id, b.visible !== 1)
      onRefresh()
    } catch (err) {
      console.error('visibility toggle failed', err)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div style={{ border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, background: '#111114', marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a20' }}>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 2 }}>
          Public Showcase — Visibility
        </span>
      </div>
      {businesses.length === 0 ? (
        <div style={{ padding: '24px 20px', fontSize: 13, color: '#6b6b7b' }}>
          No businesses yet. Add one with the &quot;Add Business&quot; button above.
        </div>
      ) : (
        businesses.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #1a1a20' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
              <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{b.type}</div>
            </div>
            {b.visible === 1 && (
              <a
                href={`/public/${encodeURIComponent(b.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
              >
                View <ExternalLink size={12} />
              </a>
            )}
            <button
              onClick={() => toggle(b)}
              disabled={toggling === b.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: b.visible === 1 ? 'rgba(16,185,129,0.08)' : 'transparent',
                border: `1px solid ${b.visible === 1 ? 'rgba(16,185,129,0.3)' : '#1e1e24'}`,
                borderRadius: 20, padding: '5px 12px', cursor: toggling === b.id ? 'wait' : 'pointer',
                fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: 0.5,
                color: b.visible === 1 ? '#10b981' : '#6b6b7b', whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.visible === 1 ? '#10b981' : '#6b6b7b', flexShrink: 0 }} className={b.visible === 1 ? 'pulse-dot' : ''} />
              {toggling === b.id ? '…' : b.visible === 1 ? 'VISIBLE' : 'HIDDEN'}
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
    if (autoOpenAddBusiness && user) {
      setShowAddModal(true)
      onAddBusinessHandled?.()
    }
  }, [autoOpenAddBusiness, user, onAddBusinessHandled])

  const allBiz: any[] = dbBusinesses.map((b) => ({
    ...b,
    revenue: 0, revenueChange: 0, clients: 0, activeCampaigns: 0,
    monthlyData: [], city: 'Global', industry: b.type,
    avatar: b.name.slice(0, 2).toUpperCase(),
    status: b.status === 'active' ? 'growing' : 'flat',
  }))

  const filtered = allBiz.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = allBiz.reduce((s, b) => s + b.revenue, 0)
  const growingCount = allBiz.filter((b) => b.status === 'growing').length
  const flatCount = allBiz.filter((b) => b.status === 'flat').length
  const decliningCount = allBiz.filter((b) => b.status === 'declining').length

  const handleAddBusiness = () => {
    if (!user) { onRequireAuth?.(); return }
    setShowAddModal(true)
  }

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      {showAddModal && <AddBusinessModal onClose={() => { setShowAddModal(false); setVersion((v) => v + 1) }} onCreated={refreshDbBusinesses} />}

      {/* Visibility panel — owner only */}
      {user && <PublicVisibilityPanel businesses={dbBusinesses} onRefresh={refreshDbBusinesses} />}

      {/* Guest notice */}
      {!user && (
        <div style={{ border: '1px dashed #1e1e24', borderRadius: CARD_RADIUS, background: '#111114', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Owner tools — read-only</div>
            <div style={{ fontSize: 13, color: '#c0c0d0', marginTop: 4 }}>Sign in as the owner to add businesses and manage visibility.</div>
          </div>
          <button onClick={onRequireAuth} style={primaryBtn}>Sign in as Owner</button>
        </div>
      )}

      {/* Summary strip */}
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 24, border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
        {[
          { label: 'Portfolio Revenue', value: formatCurrency(totalRevenue), color: '#8b5cf6' },
          { label: 'Growing', value: `${growingCount} businesses`, color: '#10b981' },
          { label: 'Flat', value: `${flatCount} businesses`, color: '#f59e0b' },
          { label: 'Needs Attention', value: `${decliningCount} declining`, color: '#ef4444' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '18px 20px', background: '#111114', borderRight: i < 3 ? '1px solid #1e1e24' : 'none' }}>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="filter-row" style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b6b7b', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search businesses..."
            className="gn-input"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Status filters */}
        {(['all', 'growing', 'flat', 'declining'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              background: statusFilter === s ? 'rgba(139,92,246,0.1)' : 'transparent',
              border: `1px solid ${statusFilter === s ? 'rgba(139,92,246,0.3)' : '#1e1e24'}`,
              borderRadius: BTN_RADIUS,
              padding: '8px 14px', minHeight: 38,
              fontSize: 12,
              color: statusFilter === s ? '#c4b5fd' : '#6b6b7b',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono', textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid #1e1e24', borderRadius: BTN_RADIUS, overflow: 'hidden' }}>
          {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: LayoutList }].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as 'grid' | 'list')}
              style={{ background: viewMode === mode ? 'rgba(139,92,246,0.12)' : 'transparent', border: 'none', padding: '8px 12px', minWidth: 40, minHeight: 38, cursor: 'pointer', color: viewMode === mode ? '#c4b5fd' : '#6b6b7b' }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button onClick={handleAddBusiness} style={primaryBtn}>
          <Plus size={14} /> Add Business
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ border: '1px dashed #1e1e24', borderRadius: CARD_RADIUS, padding: '60px 40px', textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: '#6b6b7b', marginBottom: 8 }}>
            {allBiz.length === 0 ? "No businesses yet." : "No matches found."}
          </div>
          <p style={{ fontSize: 13, color: '#6b6b7b', margin: 0 }}>
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
              <div
                key={b.id}
                onClick={() => onSelectBusiness(b)}
                style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e24')}
              >
                <Avatar initials={b.avatar} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{b.city ? `${b.city} · ` : ''}{b.industry}</div>
                </div>
                <StatusBadge status={b.status} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', fontFamily: 'JetBrains Mono' }}>{formatCurrency(b.revenue)}</div>
                  <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono' }}>
                    {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
                  </div>
                </div>
                <div style={{ width: 60, height: 28 }}>
                  <MiniSparkline data={b.monthlyData} color={STATUS_CONFIG[b.status as HealthStatus]?.color || '#9ca3af'} height={28} />
                </div>
                <ChevronRight size={16} color="#6b6b7b" />
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
    ...b,
    revenue: 0, revenueChange: 0, clients: 0, activeCampaigns: 0,
    monthlyData: [], city: 'Global', industry: b.type,
    avatar: b.name.slice(0, 2).toUpperCase(),
    status: b.status === 'active' ? 'growing' : 'flat',
    socialGrowth: 0,
  }))
  const sorted = [...allBiz].sort((a, b) => b.revenue - a.revenue)
  const chartData = sorted.map((b) => ({ name: b.name, revenue: b.revenue, clients: b.clients }))

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      <SectionHeader label="Cross-Business Comparison" />
      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: 24 }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase' }}>Revenue Ranking</div>
          <ComparisonChart businesses={chartData} height={300} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.slice(0, 4).map((b, i) => (
            <div key={b.id} style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="font-display" style={{ fontSize: 26, fontWeight: 900, color: i === 0 ? '#8b5cf6' : '#3a3a50', minWidth: 28 }}>{i + 1}</span>
              <Avatar initials={b.avatar} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{b.city || b.industry}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#f0f0f0' }}>{formatCurrency(b.revenue)}</div>
                <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono' }}>
                  {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
        <div className="table-scroll">
          <div className="table-grid" style={{ padding: '12px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
            {['Business', 'Revenue', 'Growth', 'Clients', 'Social', 'Status'].map((h) => (
              <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>{h}</div>
            ))}
          </div>
          {sorted.map((b) => (
            <div key={b.id} className="table-grid" style={{ padding: '13px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={b.avatar} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{b.city || b.industry}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: '#f0f0f0' }}>{formatCurrency(b.revenue)}</div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: b.revenueChange >= 0 ? '#10b981' : '#ef4444' }}>
                {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
              </div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: '#f0f0f0' }}>{b.clients}</div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: b.socialGrowth > 0 ? '#10b981' : '#ef4444' }}>
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
      <div className={isMobile ? 'stack-mobile' : ''} style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 12, height: isMobile ? 'auto' : 520 }}>
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, overflowY: isMobile ? 'visible' : 'auto' }}>
          {inboxMessages.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
              Awaiting data — connected conversations will appear here.
            </div>
          )}
          {inboxMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedId(msg.id)}
              style={{
                padding: '14px 16px', borderBottom: '1px solid #1a1a20', cursor: 'pointer',
                background: selectedId === msg.id ? '#161619' : msg.unread ? 'rgba(139,92,246,0.04)' : 'transparent',
                borderLeft: msg.unread ? '3px solid #8b5cf6' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: msg.unread ? 600 : 400, color: '#f0f0f0' }}>@{msg.from}</div>
                <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>{msg.time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', background: (PLATFORM_COLORS[msg.platform] || '#8b5cf6') + '20', color: PLATFORM_COLORS[msg.platform] || '#8b5cf6', padding: '1px 6px', borderRadius: 3, letterSpacing: 0.5 }}>
                  {msg.platform}
                </span>
                <span style={{ fontSize: 11, color: '#6b6b7b' }}>{msg.business}</span>
              </div>
              <div style={{ fontSize: 12, color: '#6b6b7b', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{msg.message}</div>
            </div>
          ))}
        </div>
        {selected ? (
          <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1a20', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>@{selected.from}</div>
                <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>via {selected.platform} · {selected.business}</div>
              </div>
              <ExternalLink size={15} color="#6b6b7b" />
            </div>
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ background: '#0f0f13', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#c0c0d0', lineHeight: 1.6, alignSelf: 'flex-start', maxWidth: '80%' }}>
                {selected.message}
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a20', display: 'flex', gap: 10 }}>
              <input placeholder="Type a reply..." className="gn-input" style={{ flex: 1 }} />
              <button style={primaryBtn}>Send</button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#6b6b7b' }}>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#f0f0f0' }}>Select a message</div>
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
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const avgROAS = campaigns.length === 0 ? '0.0' : (campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length).toFixed(1)

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      <SectionHeader label="Campaign Manager" />
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Ad Spend (MTD)', value: formatCurrency(totalSpend), color: '#f59e0b' },
          { label: 'Total Conversions', value: totalConversions.toLocaleString(), color: '#10b981' },
          { label: 'Portfolio Avg ROAS', value: `${avgROAS}×`, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: '18px 20px' }}>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12 }}>
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
          <div className="table-scroll">
            <div className="table-grid-narrow" style={{ padding: '12px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 12 }}>
              {['Campaign', 'Platform', 'Spend', 'Conv.', 'ROAS', 'Status'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>{h}</div>
              ))}
            </div>
            {campaigns.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
                Awaiting data — ad campaigns will appear here once connected.
              </div>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="table-grid-narrow" style={{ padding: '13px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{c.business}</div>
                </div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', background: (PLATFORM_COLORS[c.platform] || '#8b5cf6') + '20', color: PLATFORM_COLORS[c.platform] || '#8b5cf6', padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>
                  {c.platform}
                </div>
                <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: '#f0f0f0' }}>{formatCurrency(c.spend)}</div>
                <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: '#f0f0f0' }}>{c.conversions.toLocaleString()}</div>
                <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: c.roas >= 3 ? '#10b981' : '#ef4444' }}>{c.roas}×</div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', letterSpacing: 0.5, color: c.status === 'active' ? '#10b981' : c.status === 'paused' ? '#f59e0b' : '#6b6b7b', background: c.status === 'active' ? 'rgba(16,185,129,0.1)' : c.status === 'paused' ? 'rgba(245,158,11,0.1)' : '#1a1a20', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                  {c.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, padding: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Portfolio Funnel (MTD)</div>
          <AdFunnel spend={totalSpend} clicks={campaigns.reduce((s, c) => s + c.clicks, 0)} conversions={totalConversions} height={240} />
        </div>
      </div>
    </div>
  )
}

// ── Pipeline (onboarding kanban) ──────────────────────────────────────────────
function PipelineView() {
  return (
    <div className="page-pad" style={{ padding: 28 }}>
      <SectionHeader label="Client Onboarding Pipeline" />
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {pipelineStages.map((stage) => (
          <div key={stage.id} style={{ minWidth: 220, flex: 1, background: '#111114', border: '1px solid #1e1e24', borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a20', borderTop: `3px solid ${stage.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f0f0', fontFamily: 'JetBrains Mono', letterSpacing: 0.5 }}>{stage.label}</span>
              <span style={{ background: '#1a1a20', color: '#6b6b7b', fontSize: 11, fontFamily: 'JetBrains Mono', borderRadius: 10, padding: '1px 8px' }}>{stage.prospects.length}</span>
            </div>
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stage.prospects.map((p) => (
                <div key={p.name} style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 8, padding: '12px 14px', cursor: 'grab' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginBottom: 8 }}>{p.city}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', fontFamily: 'JetBrains Mono' }}>{formatCurrency(p.value)}</div>
                    <div style={{ fontSize: 11, color: '#6b6b7b' }}>{p.contact}</div>
                  </div>
                </div>
              ))}
              <button style={{ background: 'transparent', border: '1px dashed #1e1e24', borderRadius: 8, padding: 10, minHeight: 40, cursor: 'pointer', fontSize: 12, color: '#6b6b7b', textAlign: 'center', width: '100%' }}>
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
  danger: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle },
  success: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2 },
  info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', icon: Info },
}

function AlertsView() {
  const [items, setItems] = useState(alerts)

  const markRead = (id: string) => setItems((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      <SectionHeader
        label="Portfolio Alerts"
        action={
          <button onClick={() => setItems((prev) => prev.map((a) => ({ ...a, read: true })))} style={{ ...ghostBtn, fontSize: 12 }}>
            <Check size={13} /> Mark all read
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type]
          return (
            <div
              key={alert.id}
              style={{
                background: alert.read ? '#111114' : cfg.bg,
                border: `1px solid ${alert.read ? '#1e1e24' : cfg.color + '30'}`,
                borderLeft: `3px solid ${alert.read ? '#1e1e24' : cfg.color}`,
                borderRadius: CARD_RADIUS,
                padding: '16px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                opacity: alert.read ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <cfg.icon size={17} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f0f0' }}>{alert.business}</span>
                  <span style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{alert.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: alert.read ? '#6b6b7b' : '#c0c0d0', lineHeight: 1.6 }}>{alert.message}</p>
              </div>
              {!alert.read && (
                <button onClick={() => markRead(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36, padding: 4 }}>
                  <Check size={14} />
                </button>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>No alerts right now.</div>
        )}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Operator({ tab, onSelectBusiness, onRequireAuth, autoOpenAddBusiness, onAddBusinessHandled }: OperatorProps) {
  if (tab === 'portfolio') return <PortfolioView onSelectBusiness={onSelectBusiness} onRequireAuth={onRequireAuth} autoOpenAddBusiness={autoOpenAddBusiness} onAddBusinessHandled={onAddBusinessHandled} />
  if (tab === 'compare') return <CompareView />
  if (tab === 'inbox') return <InboxView />
  if (tab === 'campaigns') return <CampaignsView />
  if (tab === 'pipeline') return <PipelineView />
  if (tab === 'alerts') return <AlertsView />
  if (tab === 'connections') return <ConnectionsView />
  if (tab === 'analytics') return <AnalyticsView />
  if (tab === 'results') return <ResultsView />
  if (tab === 'content') return <ContentCalendarView />
}
