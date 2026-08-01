import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Search,
  Filter,
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
  Building2,
  Globe,
  Hash,
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
import {
  getBusinesses,
  addBusiness,
  removeBusiness,
  updateBusiness,
  getNextId,
  generateMonthlyData,
  formatCurrency,
} from '../data/store'
import { MiniSparkline, ComparisonChart, RevenueChart, AdFunnel } from '../components/Charts'
import ConnectionsView from '../components/ConnectionsView'
import AnalyticsView from '../components/AnalyticsView'
import { useIsMobile } from '../hooks/useIsMobile'

type OperatorTab = 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline' | 'alerts' | 'connections' | 'analytics'

interface OperatorProps {
  tab: OperatorTab
  onSelectBusiness: (b: Business) => void
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  HealthStatus,
  { color: string; bgColor: string; icon: React.ElementType; label: string }
> = {
  growing: { color: 'var(--accent)', bgColor: 'rgba(5,150,105,0.1)', icon: TrendingUp, label: 'Growing' },
  flat: { color: 'var(--warning)', bgColor: 'rgba(245,158,11,0.1)', icon: Minus, label: 'Flat' },
  declining: { color: 'var(--danger)', bgColor: 'rgba(239,68,68,0.1)', icon: TrendingDown, label: 'Declining' },
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bgColor,
        border: `1px solid ${cfg.color}30`,
        borderRadius: 2,
        padding: '3px 8px',
      }}
    >
      <cfg.icon size={11} color={cfg.color} />
      <span
        style={{
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          color: cfg.color,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {cfg.label}
      </span>
    </div>
  )
}

function PulseBar({ value, total, status }: { value: number; total: number; status: HealthStatus }) {
  const pct = Math.min(100, (value / total) * 100)
  const color = STATUS_CONFIG[status].color
  return (
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  const colors: Record<string, string> = {
    KA: '#C2A77D', AA: '#1B7A4A', DM: '#F5A623', AO: '#7B8FFF',
    GN: '#FF8FD4', AD: '#FF3B3B', SN: '#2AB4FF', YM: '#A8FF78',
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[initials] ?? '#C2A77D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        color: '#111827',
        fontFamily: 'Barlow Condensed',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span
        className="font-display"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)' }}
      >
        {label}
      </span>
      {action}
    </div>
  )
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const maxRevenue = Math.max(...getBusinesses().map((b) => b.revenue))

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--secondary)' : 'var(--card)',
        border: `1px solid ${hovered ? 'var(--primary)30' : 'var(--border)'}`,
        borderRadius: 3,
        padding: '20px',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={business.avatar} size={38} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.2 }}>
              {business.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
              {business.city} · {business.industry}
            </div>
          </div>
        </div>
        <StatusBadge status={business.status} />
      </div>

      {/* Mini sparkline */}
      <div style={{ height: 40 }}>
        <MiniSparkline
          data={business.monthlyData}
          color={STATUS_CONFIG[business.status].color}
        />
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'JetBrains Mono' }}
          >
            {formatCurrency(business.revenue)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
            Revenue MTD
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: business.revenueChange >= 0 ? 'var(--accent)' : 'var(--danger)',
              fontFamily: 'JetBrains Mono',
            }}
          >
            {business.revenueChange > 0 ? '+' : ''}{business.revenueChange}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
            vs last month
          </div>
        </div>
      </div>

      {/* Pulse bar */}
      <PulseBar value={business.revenue} total={maxRevenue} status={business.status} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
          {business.clients} clients · {business.activeCampaigns} campaigns
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted-foreground)', fontSize: 11 }}>
          <span>{business.lastActivity}</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  )
}

function AddBusinessModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [owner, setOwner] = useState("")
  const [industry, setIndustry] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Nigeria")
  const [revenue, setRevenue] = useState("")

  const handleSubmit = () => {
    if (!name.trim()) return
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    const baseRevenue = parseInt(revenue) || 500_000
    addBusiness({
      id: getNextId(),
      name: name.trim(),
      owner: owner.trim() || "You",
      industry: industry.trim() || "General",
      city: city.trim() || "Lagos",
      country,
      status: "growing",
      revenue: baseRevenue,
      revenueChange: 0,
      clients: 0,
      clientsChange: 0,
      pipeline: 0,
      lastActivity: "Just added",
      avatar: initials,
      socialFollowers: 0,
      socialGrowth: 0,
      activeCampaigns: 0,
      openTasks: 0,
      monthlyData: generateMonthlyData(baseRevenue),
      socialData: [],
    })
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 3,
    fontSize: 13,
    color: "var(--foreground)",
    outline: "none",
    fontFamily: "Outfit",
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-content"
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          padding: 32,
          width: "100%", maxWidth: 480,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} color="#FFFFFF" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>Add Business</div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Enter your business details below</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Business Name *</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BuySmart Nigeria" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Owner Name</div>
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. John Doe" style={inputStyle} />
          </div>
          <div className="field-grid">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Industry</div>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. E-commerce" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>City</div>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" style={inputStyle} />
            </div>
          </div>
          <div className="field-grid">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Country</div>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>South Africa</option>
                <option>Uganda</option>
                <option>Tanzania</option>
                <option>Rwanda</option>
                <option>Ethiopia</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Monthly Revenue (₦)</div>
              <input value={revenue} onChange={(e) => setRevenue(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 500000" style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--foreground)", padding: "10px 20px", borderRadius: 3, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ background: "var(--primary)", border: "none", color: "#FFFFFF", padding: "10px 24px", borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Barlow Condensed", letterSpacing: 0.5 }}>
            ADD BUSINESS
          </button>
        </div>
      </div>
    </div>
  )
}

function PortfolioView({ onSelectBusiness }: { onSelectBusiness: (b: Business) => void }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | HealthStatus>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddModal, setShowAddModal] = useState(false)
  const [version, setVersion] = useState(0)

  const allBiz = getBusinesses()
  const filtered = allBiz.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = allBiz.reduce((s, b) => s + b.revenue, 0)
  const growingCount = allBiz.filter((b) => b.status === "growing").length
  const flatCount = allBiz.filter((b) => b.status === "flat").length
  const decliningCount = allBiz.filter((b) => b.status === "declining").length

  const handleAddBusiness = () => {
    setShowAddModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setVersion((v) => v + 1)
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      {showAddModal && <AddBusinessModal onClose={handleModalClose} />}

      {/* Portfolio summary strip */}
      <div
        className="summary-strip"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          marginBottom: 24,
          border: "1px solid var(--border)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {[
          { label: "Total Portfolio Revenue", value: formatCurrency(totalRevenue), color: "var(--primary)" },
          { label: "Growing", value: `${growingCount} businesses`, color: "var(--accent)" },
          { label: "Flat", value: `${flatCount} businesses`, color: "var(--warning)" },
          { label: "Needs Attention", value: `${decliningCount} declining`, color: "var(--danger)" },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "18px 20px",
              background: "var(--card)",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}
          >
            <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters + add button */}
      <div className="filter-row" style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search businesses..."
            style={{
              width: "100%",
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              fontSize: 13,
              color: "var(--foreground)",
              outline: "none",
              fontFamily: "Outfit",
            }}
          />
        </div>

        {(["all", "growing", "flat", "declining"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              background: statusFilter === s ? "var(--secondary)" : "transparent",
              border: `1px solid ${statusFilter === s ? "var(--primary)40" : "var(--border)"}`,
              borderRadius: 3,
              padding: "8px 14px",
              minHeight: 44,
              fontSize: 12,
              color: statusFilter === s ? "var(--foreground)" : "var(--muted-foreground)",
              cursor: "pointer",
              fontFamily: "JetBrains Mono",
              textTransform: "capitalize",
            }}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{ background: viewMode === "grid" ? "var(--secondary)" : "transparent", border: "none", padding: "8px 10px", minWidth: 44, minHeight: 44, cursor: "pointer", color: "var(--muted-foreground)" }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{ background: viewMode === "list" ? "var(--secondary)" : "transparent", border: "none", padding: "8px 10px", minWidth: 44, minHeight: 44, cursor: "pointer", color: "var(--muted-foreground)" }}
          >
            <LayoutList size={15} />
          </button>
        </div>

        <button
          onClick={handleAddBusiness}
          style={{
            background: "var(--primary)",
            border: "none",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Barlow Condensed",
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={14} /> NEW BUSINESS
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 3,
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8 }}>
            {allBiz.length === 0 ? "You haven't added any businesses yet." : "No businesses match your filter."}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
            {allBiz.length === 0
              ? 'Click "NEW BUSINESS" above to add your first business.'
              : "Try clearing the search or changing the status filter."}
          </p>
        </div>
      )}

      {/* Grid / List */}
      <div key={version}>
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
            {filtered.map((b) => (
              <BusinessCard key={b.id} business={b} onClick={() => onSelectBusiness(b)} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBusiness(b)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  padding: "14px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Avatar initials={b.avatar} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }}>
                    {b.city} · {b.industry}
                  </div>
                </div>
                <StatusBadge status={b.status} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", fontFamily: "JetBrains Mono" }}>
                    {formatCurrency(b.revenue)}
                  </div>
                  <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? "var(--accent)" : "var(--danger)", fontFamily: "JetBrains Mono" }}>
                    {b.revenueChange > 0 ? "+" : ""}{b.revenueChange}%
                  </div>
                </div>
                <div style={{ width: 60, height: 28 }}>
                  <MiniSparkline data={b.monthlyData} color={STATUS_CONFIG[b.status].color} height={28} />
                </div>
                <ChevronRight size={16} color="var(--muted-foreground)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Compare ──────────────────────────────────────────────────────────────────

function CompareView() {
  const sorted = [...getBusinesses()].sort((a, b) => b.revenue - a.revenue)
  const chartData = sorted.map((b) => ({ name: b.name, revenue: b.revenue, clients: b.clients }))

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <SectionHeader label="Cross-Business Comparison" />

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 24 }}>
          <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>
            Revenue Ranking
          </div>
          <ComparisonChart businesses={chartData} height={300} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.slice(0, 4).map((b, i) => (
            <div
              key={b.id}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                className="font-display"
                style={{ fontSize: 28, fontWeight: 900, color: i === 0 ? 'var(--primary)' : 'var(--muted-foreground)', minWidth: 32 }}
              >
                {i + 1}
              </span>
              <Avatar initials={b.avatar} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{b.city}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>
                  {formatCurrency(b.revenue)}
                </div>
                <div style={{ fontSize: 11, color: b.revenueChange >= 0 ? 'var(--accent)' : 'var(--danger)', fontFamily: 'JetBrains Mono' }}>
                  {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth rate table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div className="table-scroll">
        <div className="table-grid" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
          {['Business', 'Revenue', 'Growth', 'Clients', 'Social', 'Status'].map((h) => (
            <div key={h} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
          ))}
        </div>
        {sorted.map((b) => (
          <div
            key={b.id}
            className="table-grid"
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={b.avatar} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{b.city}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>{formatCurrency(b.revenue)}</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: b.revenueChange >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              {b.revenueChange > 0 ? '+' : ''}{b.revenueChange}%
            </div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>{b.clients}</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: b.socialGrowth > 0 ? 'var(--accent)' : 'var(--danger)' }}>
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

// ─── Inbox ────────────────────────────────────────────────────────────────────

const inboxMessages = [
  { id: 1, business: "Kemi's Logistics", platform: 'Instagram', from: 'emeka_delivery_ng', message: 'Hi, do you deliver to Ogun State? What are your rates?', time: '10 min ago', unread: true },
  { id: 2, business: 'Abena Fashion House', platform: 'Facebook', from: 'abena_customer_2', message: "Love the new collection! When's the next restock?", time: '42 min ago', unread: true },
  { id: 3, business: 'CoLab Digital Agency', platform: 'LinkedIn', from: 'Kofi Mensah', message: "Saw your post on brand strategy. Would love to discuss a potential project.", time: '2 hours ago', unread: true },
  { id: 4, business: 'Amara Beauty Studio', platform: 'Instagram', from: 'glowup_lagos', message: 'How much is the full glam package? 🔥', time: '3 hours ago', unread: false },
  { id: 5, business: "Ade's Tech Repair", platform: 'Facebook', from: 'techfix_customer', message: 'My MacBook is making a clicking sound. Can you fix it?', time: '5 hours ago', unread: false },
  { id: 6, business: 'Mama Fresh Foods', platform: 'Instagram', from: 'foodie_kumasi', message: "Can you do catering for 200 people next weekend?", time: '1 day ago', unread: false },
]

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  TikTok: '#69C9D0',
  X: '#1DA1F2',
  YouTube: '#FF0000',
}

function InboxView() {
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const selected = inboxMessages.find((m) => m.id === selectedId)
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <SectionHeader label="Unified Inbox" />
      <div className={isMobile ? 'stack-mobile' : ''} style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 2, height: isMobile ? 'auto' : 520 }}>
        {/* Message list */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflowY: isMobile ? 'visible' : 'auto' }}>
          {inboxMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedId(msg.id)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: selectedId === msg.id ? 'var(--secondary)' : msg.unread ? 'rgba(242,226,12,0.04)' : 'transparent',
                borderLeft: msg.unread ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: msg.unread ? 600 : 400, color: 'var(--foreground)' }}>
                  @{msg.from}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                  {msg.time}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'JetBrains Mono',
                    background: PLATFORM_COLORS[msg.platform] + '20',
                    color: PLATFORM_COLORS[msg.platform],
                    padding: '1px 6px',
                    borderRadius: 2,
                    letterSpacing: 0.5,
                  }}
                >
                  {msg.platform}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{msg.business}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Message detail */}
        {selected ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>@{selected.from}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                  via {selected.platform} · {selected.business}
                </div>
              </div>
              <ExternalLink size={15} color="var(--muted-foreground)" />
            </div>
            <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  background: 'var(--secondary)',
                  borderRadius: 3,
                  padding: '12px 16px',
                  fontSize: 14,
                  color: 'var(--foreground)',
                  lineHeight: 1.6,
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {selected.message}
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input
                placeholder="Type a reply..."
                style={{
                  flex: 1,
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--foreground)',
                  outline: 'none',
                  fontFamily: 'Outfit',
                }}
              />
              <button
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: 3,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#111827',
                  cursor: 'pointer',
                  fontFamily: 'Barlow Condensed',
                  letterSpacing: 1,
                }}
              >
                SEND
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Select a message</div>
              <p style={{ fontSize: 13, margin: 0 }}>Click any conversation to open it here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

function CampaignsView() {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const avgROAS = (campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length).toFixed(1)

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <SectionHeader label="Campaign Manager" />

      {/* Summary */}
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 24 }}>
        {[
          { label: 'Total Ad Spend (MTD)', value: formatCurrency(totalSpend), color: 'var(--warning)' },
          { label: 'Total Conversions', value: totalConversions.toLocaleString(), color: 'var(--accent)' },
          { label: 'Portfolio Avg ROAS', value: `${avgROAS}×`, color: 'var(--primary)' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 20px' }}>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 2, marginBottom: 2 }}>
        {/* Campaign table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div className="table-scroll">
          <div className="table-grid-narrow" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: 12 }}>
            {['Campaign', 'Platform', 'Spend', 'Conversions', 'ROAS', 'Status'].map((h) => (
              <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="table-grid-narrow"
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{c.business}</div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  background: PLATFORM_COLORS[c.platform] + '20',
                  color: PLATFORM_COLORS[c.platform] ?? 'var(--muted-foreground)',
                  padding: '3px 8px',
                  borderRadius: 2,
                  display: 'inline-block',
                }}
              >
                {c.platform}
              </div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>{formatCurrency(c.spend)}</div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}>{c.conversions.toLocaleString()}</div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: c.roas >= 3 ? 'var(--accent)' : 'var(--danger)' }}>
                {c.roas}×
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  letterSpacing: 0.5,
                  color: c.status === 'active' ? 'var(--accent)' : c.status === 'paused' ? 'var(--warning)' : 'var(--muted-foreground)',
                  background: (c.status === 'active' ? 'rgba(5,150,105,0.1)' : c.status === 'paused' ? 'rgba(245,158,11,0.1)' : 'var(--secondary)'),
                  padding: '3px 8px',
                  borderRadius: 2,
                  textTransform: 'uppercase',
                }}
              >
                {c.status}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Ad funnel */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
            Portfolio Funnel (MTD)
          </div>
          <AdFunnel
            spend={totalSpend}
            clicks={campaigns.reduce((s, c) => s + c.clicks, 0)}
            conversions={totalConversions}
            height={240}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline (onboarding kanban) ─────────────────────────────────────────────

function PipelineView() {
  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <SectionHeader label="Client Onboarding Pipeline" />
      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 8 }}>
        {pipelineStages.map((stage) => (
          <div
            key={stage.id}
            style={{
              minWidth: 220,
              flex: 1,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Stage header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                borderTop: `3px solid ${stage.color}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'JetBrains Mono', letterSpacing: 0.5 }}>
                {stage.label}
              </span>
              <span
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  borderRadius: 10,
                  padding: '1px 8px',
                }}
              >
                {stage.prospects.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stage.prospects.map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    padding: '12px 14px',
                    cursor: 'grab',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginBottom: 8 }}>{p.city}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>
                      {formatCurrency(p.value)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.contact}</div>
                  </div>
                </div>
              ))}

              {/* Add card placeholder */}
              <button
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--border)',
                  borderRadius: 3,
                  padding: '10px',
                  minHeight: 44,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--muted-foreground)',
                  textAlign: 'center',
                  width: '100%',
                }}
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

// ─── Alerts ───────────────────────────────────────────────────────────────────

const ALERT_CONFIG = {
  danger: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
  warning: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle },
  success: { color: 'var(--accent)', bg: 'rgba(5,150,105,0.08)', icon: CheckCircle2 },
  info: { color: '#7B8FFF', bg: 'rgba(123,143,255,0.08)', icon: Info },
}

function AlertsView() {
  const [items, setItems] = useState(alerts)

  const markRead = (id: string) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <SectionHeader
        label="Portfolio Alerts"
        action={
          <button
            onClick={() => setItems((prev) => prev.map((a) => ({ ...a, read: true })))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={14} /> Mark all read
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type]
          return (
            <div
              key={alert.id}
              style={{
                background: alert.read ? 'var(--card)' : cfg.bg,
                border: `1px solid ${alert.read ? 'var(--border)' : cfg.color + '30'}`,
                borderLeft: `3px solid ${alert.read ? 'var(--border)' : cfg.color}`,
                borderRadius: 3,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                opacity: alert.read ? 0.6 : 1,
              }}
            >
              <cfg.icon size={18} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>{alert.business}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{alert.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: alert.read ? 'var(--muted-foreground)' : 'var(--foreground)', lineHeight: 1.5 }}>
                  {alert.message}
                </p>
              </div>
              {!alert.read && (
                <button
                  onClick={() => markRead(alert.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted-foreground)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <Check size={15} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Operator({ tab, onSelectBusiness }: OperatorProps) {
  if (tab === 'portfolio') return <PortfolioView onSelectBusiness={onSelectBusiness} />
  if (tab === 'compare') return <CompareView />
  if (tab === 'inbox') return <InboxView />
  if (tab === 'campaigns') return <CampaignsView />
  if (tab === 'pipeline') return <PipelineView />
  if (tab === 'alerts') return <AlertsView />
  if (tab === 'connections') return <ConnectionsView />
  if (tab === 'analytics') return <AnalyticsView />
}
