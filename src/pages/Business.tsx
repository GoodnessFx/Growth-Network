import { useState } from 'react'
import {
  ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign,
  FileText, Tag, Phone, Mail, Clock, Plus, ChevronRight,
  Zap, CheckSquare, BarChart2,
} from 'lucide-react'
import { type Business, clients, formatCurrency } from '../data/mockData'
import { RevenueChart, SocialChart } from '../components/Charts'

type BizTab = 'overview' | 'crm' | 'pipeline' | 'social' | 'finance'

interface BusinessProps {
  business: Business
  onBack: () => void
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const R = 10  // card radius
const primaryBtn: React.CSSProperties = {
  background: '#8b5cf6', border: 'none', color: '#fff',
  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 18px',
}

const BIZ_TABS: { id: BizTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: Zap },
  { id: 'social', label: 'Social', icon: TrendingUp },
  { id: 'finance', label: 'Finance', icon: DollarSign },
]

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({ label, value, change, changeLabel, icon: Icon, accent }: {
  label: string; value: string; change?: number; changeLabel?: string;
  icon?: React.ElementType; accent?: string;
}) {
  const isPositive = (change ?? 0) >= 0
  return (
    <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</div>
        {Icon && <Icon size={15} color={accent ?? '#6b6b7b'} />}
      </div>
      <div className="font-display" style={{ fontSize: 30, fontWeight: 900, color: accent ?? '#f0f0f0', lineHeight: 1, marginBottom: 8 }}>
        {value}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isPositive ? <TrendingUp size={11} color="#10b981" /> : <TrendingDown size={11} color="#ef4444" />}
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: isPositive ? '#10b981' : '#ef4444' }}>
            {isPositive ? '+' : ''}{change}% {changeLabel ?? 'vs last month'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <MetricCard label="Revenue (MTD)" value={formatCurrency(business.revenue)} change={business.revenueChange} icon={DollarSign} accent="#8b5cf6" />
        <MetricCard label="Total Clients" value={business.clients.toString()} change={business.clientsChange} icon={Users} accent="#10b981" />
        <MetricCard label="Pipeline Value" value={formatCurrency(business.pipeline)} icon={Zap} accent="#f59e0b" />
        <MetricCard
          label="Social Followers"
          value={business.socialFollowers >= 1000 ? `${(business.socialFollowers / 1000).toFixed(1)}K` : business.socialFollowers.toString()}
          change={business.socialGrowth} changeLabel="growth" icon={TrendingUp}
          accent={business.socialGrowth > 0 ? '#10b981' : '#ef4444'}
        />
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12 }}>
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Revenue Over Time</div>
          <RevenueChart data={business.monthlyData} height={200} />
        </div>

        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Open Tasks ({business.openTasks})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {business.openTasks === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>No open tasks.</div>
            )}
            <button style={{ background: 'transparent', border: '1px dashed #1e1e24', borderRadius: 8, padding: 10, cursor: 'pointer', fontSize: 12, color: '#6b6b7b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
              <Plus size={13} /> Add task
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 20 }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Upcoming Meetings</div>
        <div style={{ background: '#0f0f13', border: '1px dashed #1e1e24', borderRadius: 8, padding: '32px 20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
          Awaiting data — meetings will appear here once scheduled.
        </div>
      </div>
    </div>
  )
}

// ── CRM ───────────────────────────────────────────────────────────────────────
function CRMTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = clients.find((c) => c.id === selectedId)

  const STATUS_COLORS: Record<string, string> = {
    active: '#10b981',
    prospect: '#f59e0b',
    churned: '#6b6b7b',
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="font-display" style={{ fontSize: 24, fontWeight: 900, color: '#f0f0f0' }}>Client CRM</span>
        <button style={primaryBtn}><Plus size={13} /> Add Client</button>
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
        {/* List */}
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, overflow: 'hidden' }}>
          {clients.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
              No clients yet.
            </div>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedId(client.id)}
              style={{
                padding: '13px 16px', borderBottom: '1px solid #1a1a20', cursor: 'pointer',
                background: selectedId === client.id ? '#161619' : 'transparent',
                borderLeft: selectedId === client.id ? '3px solid #8b5cf6' : '3px solid transparent',
                transition: 'background 0.12s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{client.company}</div>
                </div>
                <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: STATUS_COLORS[client.status] || '#6b6b7b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {client.status}
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {client.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 10, background: '#1a1a20', border: '1px solid #1e1e24', borderRadius: 4, padding: '1px 6px', color: '#6b6b7b' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Profile */}
        {selected ? (
          <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: '#f0f0f0' }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#6b6b7b', marginTop: 2 }}>{selected.company}</div>
              </div>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: STATUS_COLORS[selected.status] || '#6b6b7b', background: STATUS_COLORS[selected.status] ? `${STATUS_COLORS[selected.status]}15` : '#1a1a20', padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                {selected.status}
              </span>
            </div>

            <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { icon: Mail, label: 'Email', value: selected.email },
                { icon: Phone, label: 'Phone', value: selected.phone },
                { icon: DollarSign, label: 'Lifetime Value', value: selected.value > 0 ? formatCurrency(selected.value) : 'Churned' },
                { icon: Clock, label: 'Last Contact', value: selected.lastContact },
              ].map((field) => (
                <div key={field.label} style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 5 }}>
                    <field.icon size={12} color="#6b6b7b" />
                    <span style={{ fontSize: 9, color: '#6b6b7b', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1.5 }}>{field.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#f0f0f0' }}>{field.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Tag size={11} /> Tags
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 12, background: '#1a1a20', border: '1px solid #1e1e24', borderRadius: 20, padding: '4px 12px', color: '#c0c0d0' }}>{tag}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={11} /> Notes
              </div>
              <div style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#c0c0d0', lineHeight: 1.7 }}>
                {selected.notes}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
            <div style={{ textAlign: 'center', color: '#6b6b7b' }}>
              <Users size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#f0f0f0' }}>Select a client</div>
              <p style={{ fontSize: 13, margin: 0 }}>Click any client to view their full profile.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Pipeline (sales kanban) ───────────────────────────────────────────────────
interface KanbanStage {
  id: string; label: string; color: string;
  cards: Array<{ title: string; contact: string; value: number; daysInStage: number }>
}

const KANBAN_STAGES: KanbanStage[] = [
  { id: 'lead', label: 'New Lead', color: '#60a5fa', cards: [] },
  { id: 'qualified', label: 'Qualified', color: '#f59e0b', cards: [] },
  { id: 'proposal', label: 'Proposal', color: '#a78bfa', cards: [] },
  { id: 'negotiation', label: 'Negotiating', color: '#ec4899', cards: [] },
  { id: 'closed', label: 'Closed Won', color: '#10b981', cards: [] },
]

function PipelineTab() {
  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="font-display" style={{ fontSize: 24, fontWeight: 900, color: '#f0f0f0' }}>Sales Pipeline</span>
        <button style={primaryBtn}><Plus size={13} /> Add Deal</button>
      </div>

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {KANBAN_STAGES.map((stage) => (
          <div key={stage.id} style={{ minWidth: 200, flex: 1, background: '#111114', border: '1px solid #1e1e24', borderRadius: R, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a20', borderTop: `3px solid ${stage.color}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f0f0', fontFamily: 'JetBrains Mono' }}>{stage.label}</span>
              <span style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>
                {formatCurrency(stage.cards.reduce((s, c) => s + c.value, 0))}
              </span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stage.cards.map((card, i) => (
                <div key={i} style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 8, padding: '12px 14px', cursor: 'grab' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: '#6b6b7b', marginBottom: 8 }}>{card.contact}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', fontFamily: 'JetBrains Mono' }}>{formatCurrency(card.value)}</div>
                    <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>{card.daysInStage}d here</div>
                  </div>
                </div>
              ))}
              <button style={{ background: 'transparent', border: '1px dashed #1e1e24', borderRadius: 8, padding: 10, minHeight: 40, cursor: 'pointer', fontSize: 12, color: '#6b6b7b', textAlign: 'center', width: '100%' }}>
                + Add deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Social ────────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', LinkedIn: '#0A66C2', TikTok: '#a855f7', X: '#1DA1F2',
}

function SocialTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Platform Performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {business.socialData.map((s) => (
            <div key={s.platform} style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: '16px 18px', borderTop: `3px solid ${PLATFORM_COLORS[s.platform] ?? '#8b5cf6'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f0f0', marginBottom: 10, fontFamily: 'JetBrains Mono' }}>{s.platform}</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', lineHeight: 1 }}>
                {s.followers >= 1000 ? `${(s.followers / 1000).toFixed(1)}K` : s.followers}
              </div>
              <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 4 }}>followers</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: s.growth > 0 ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    {s.growth > 0 ? '+' : ''}{s.growth}%
                  </div>
                  <div style={{ fontSize: 10, color: '#6b6b7b' }}>growth</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#f0f0f0', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{s.engagement}%</div>
                  <div style={{ fontSize: 10, color: '#6b6b7b' }}>eng.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 20 }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Followers by Platform</div>
        <SocialChart data={business.socialData} height={180} />
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a20', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Content Calendar</span>
          <button style={primaryBtn}><Plus size={12} /> Schedule Post</button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
          No posts scheduled. Use the Scheduling tab to create content.
        </div>
      </div>
    </div>
  )
}

// ── Finance ───────────────────────────────────────────────────────────────────
const invoices: any[] = []

const INV_STYLES: Record<string, { color: string; bg: string }> = {
  paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  draft: { color: '#6b6b7b', bg: '#1a1a20' },
}

function FinanceTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <MetricCard label="Revenue (MTD)" value={formatCurrency(business.revenue)} change={business.revenueChange} accent="#8b5cf6" />
        <MetricCard label="Outstanding" value={formatCurrency(0)} accent="#f59e0b" />
        <MetricCard label="Overdue" value={formatCurrency(0)} accent="#ef4444" />
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, padding: 20 }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Revenue — Last 12 Months</div>
        <RevenueChart data={business.monthlyData} height={160} />
      </div>

      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: R, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a20', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>Invoices</span>
          <button style={primaryBtn}><Plus size={12} /> New Invoice</button>
        </div>
        <div className="table-scroll">
          <div style={{ padding: '11px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 90px', gap: 12, minWidth: 640 }}>
            {['Invoice', 'Client', 'Amount', 'Issued', 'Due', 'Status'].map((h) => (
              <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5 }}>{h}</div>
            ))}
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>
              Awaiting data — invoices will appear here once issued.
            </div>
          ) : invoices.map((inv) => (
            <div key={inv.id} style={{ padding: '13px 20px', borderBottom: '1px solid #1a1a20', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 90px', gap: 12, alignItems: 'center', minWidth: 640 }}>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6b6b7b' }}>{inv.id}</div>
              <div style={{ fontSize: 13, color: '#f0f0f0', fontWeight: 500 }}>{inv.client}</div>
              <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: '#f0f0f0', fontWeight: 600 }}>{formatCurrency(inv.amount)}</div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6b6b7b' }}>{inv.issued}</div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: inv.status === 'overdue' ? '#ef4444' : '#6b6b7b' }}>{inv.due}</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: INV_STYLES[inv.status]?.color ?? '#6b6b7b', background: INV_STYLES[inv.status]?.bg ?? '#1a1a20', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5, display: 'inline-block' }}>
                {inv.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function BusinessView({ business, onBack }: BusinessProps) {
  const [tab, setTab] = useState<BizTab>('overview')

  const statusColors: Record<string, string> = { growing: '#10b981', flat: '#f59e0b', declining: '#ef4444' }
  const statusColor = statusColors[business.status] ?? '#6b6b7b'
  const statusBg = business.status === 'growing' ? 'rgba(16,185,129,0.1)' : business.status === 'flat' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Business header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1a1a20', background: '#0d0d10', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '0 8px', minHeight: 40, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f0f0f0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#6b6b7b')}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: '#f0f0f0', lineHeight: 1 }}>{business.name}</div>
          <div className="hide-mobile" style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
            {business.industry}
            {business.city || business.country ? ` · ${[business.city, business.country].filter(Boolean).join(', ')}` : ''}
            {business.owner ? ` · ${business.owner}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div className="hide-xs" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#8b5cf6' }}>{formatCurrency(business.revenue)}</div>
            <div style={{ fontSize: 9, color: '#6b6b7b', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>Revenue MTD</div>
          </div>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: statusColor, background: statusBg, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {business.status}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a20', background: '#0d0d10', flexShrink: 0, overflowX: 'auto' }}>
        {BIZ_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 16px', minHeight: 44,
              background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid #8b5cf6' : '2px solid transparent',
              cursor: 'pointer',
              color: tab === t.id ? '#c4b5fd' : '#6b6b7b',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              marginBottom: -1, whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            <t.icon size={14} />
            <span className="hide-xs">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'overview' && <OverviewTab business={business} />}
        {tab === 'crm' && <CRMTab />}
        {tab === 'pipeline' && <PipelineTab />}
        {tab === 'social' && <SocialTab business={business} />}
        {tab === 'finance' && <FinanceTab business={business} />}
      </div>
    </div>
  )
}
