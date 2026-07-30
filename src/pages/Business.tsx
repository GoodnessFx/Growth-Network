import { useState } from 'react'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  Phone,
  Mail,
  Clock,
  Plus,
  ChevronRight,
  Zap,
  CheckSquare,
  BarChart2,
} from 'lucide-react'
import { type Business, clients, formatCurrency } from '../data/mockData'
import { RevenueChart, SocialChart } from '../components/Charts'

type BizTab = 'overview' | 'crm' | 'pipeline' | 'social' | 'finance'

interface BusinessProps {
  business: Business
  onBack: () => void
}

const BIZ_TABS: { id: BizTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: Zap },
  { id: 'social', label: 'Social', icon: TrendingUp },
  { id: 'finance', label: 'Finance', icon: DollarSign },
]

function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ElementType
  accent?: string
}) {
  const isPositive = (change ?? 0) >= 0
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        padding: '20px 20px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </div>
        {Icon && <Icon size={16} color={accent ?? 'var(--muted-foreground)'} />}
      </div>
      <div
        className="font-display"
        style={{ fontSize: 32, fontWeight: 900, color: accent ?? 'var(--foreground)', lineHeight: 1, marginBottom: 6 }}
      >
        {value}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isPositive ? (
            <TrendingUp size={12} color="var(--accent)" />
          ) : (
            <TrendingDown size={12} color="var(--danger)" />
          )}
          <span
            style={{
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
              color: isPositive ? 'var(--accent)' : 'var(--danger)',
            }}
          >
            {isPositive ? '+' : ''}{change}% {changeLabel ?? 'vs last month'}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <MetricCard
          label="Revenue (MTD)"
          value={formatCurrency(business.revenue)}
          change={business.revenueChange}
          icon={DollarSign}
          accent="var(--primary)"
        />
        <MetricCard
          label="Total Clients"
          value={business.clients.toString()}
          change={business.clientsChange}
          icon={Users}
          accent="var(--accent)"
        />
        <MetricCard
          label="Pipeline Value"
          value={formatCurrency(business.pipeline)}
          icon={Zap}
          accent="var(--warning)"
        />
        <MetricCard
          label="Social Followers"
          value={business.socialFollowers >= 1000 ? `${(business.socialFollowers / 1000).toFixed(1)}K` : business.socialFollowers.toString()}
          change={business.socialGrowth}
          changeLabel="growth"
          icon={TrendingUp}
          accent={business.socialGrowth > 0 ? 'var(--accent)' : 'var(--danger)'}
        />
      </div>

      {/* Revenue chart + tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 2 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Revenue Over Time
          </div>
          <RevenueChart data={business.monthlyData} height={200} />
        </div>

        {/* Tasks */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Open Tasks ({business.openTasks})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Send Q3 report to owner', due: 'Today', priority: 'high' },
              { label: 'Review social content calendar', due: 'Tomorrow', priority: 'medium' },
              { label: 'Follow up on Atlas Freight quote', due: 'Aug 2', priority: 'high' },
              { label: 'Update invoice #INV-0048', due: 'Aug 3', priority: 'low' },
            ].slice(0, business.openTasks > 3 ? 4 : business.openTasks).map((task, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 10px',
                  background: 'var(--secondary)',
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                }}
              >
                <CheckSquare size={14} color={task.priority === 'high' ? 'var(--warning)' : 'var(--muted-foreground)'} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{task.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>Due {task.due}</div>
                </div>
              </div>
            ))}
            <button
              style={{
                background: 'transparent',
                border: '1px dashed var(--border)',
                borderRadius: 3,
                padding: '8px',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--muted-foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Plus size={13} /> Add task
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming meetings */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Upcoming Meetings
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { title: 'Monthly strategy review', with: 'Emeka Obi', date: 'Aug 1, 2026', time: '10:00 AM' },
            { title: 'Campaign performance debrief', with: 'CoLab Team', date: 'Aug 4, 2026', time: '2:00 PM' },
            { title: 'Onboarding call – Atlas Freight', with: 'Sipho Khumalo', date: 'Aug 6, 2026', time: '11:30 AM' },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>{m.title}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <Users size={11} color="var(--muted-foreground)" />
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{m.with}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Calendar size={11} color="var(--accent)" />
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>{m.date} · {m.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

function CRMTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = clients.find((c) => c.id === selectedId)

  const STATUS_COLORS = { active: 'var(--accent)', prospect: 'var(--warning)', churned: 'var(--muted-foreground)' }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)' }}>
          Client CRM
        </span>
        <button
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 3,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            color: '#111827',
            cursor: 'pointer',
            fontFamily: 'Barlow Condensed',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Plus size={13} /> ADD CLIENT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 2 }}>
        {/* Client list */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedId(client.id)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: selectedId === client.id ? 'var(--secondary)' : 'transparent',
                borderLeft: selectedId === client.id ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                    {client.company}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    color: STATUS_COLORS[client.status],
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {client.status}
                </div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 2,
                      padding: '1px 6px',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Client profile */}
        {selected ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: 'var(--foreground)' }}>
                  {selected.name}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 2 }}>{selected.company}</div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  color: STATUS_COLORS[selected.status],
                  background: 'var(--secondary)',
                  padding: '4px 10px',
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {selected.status}
              </div>
            </div>

            {/* Contact info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: Mail, label: 'Email', value: selected.email },
                { icon: Phone, label: 'Phone', value: selected.phone },
                { icon: DollarSign, label: 'Lifetime Value', value: selected.value > 0 ? formatCurrency(selected.value) : 'Churned' },
                { icon: Clock, label: 'Last Contact', value: selected.lastContact },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <field.icon size={13} color="var(--muted-foreground)" />
                    <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {field.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--foreground)' }}>{field.value}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={12} /> Tags
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 2,
                      padding: '4px 12px',
                      color: 'var(--foreground)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={12} /> Notes
              </div>
              <div
                style={{
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: '14px 16px',
                  fontSize: 13,
                  color: 'var(--foreground)',
                  lineHeight: 1.6,
                }}
              >
                {selected.notes}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <Users size={32} style={{ marginBottom: 12 }} />
              <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                Select a client
              </div>
              <p style={{ fontSize: 13, margin: 0 }}>Click any client to view their full profile.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pipeline (sales kanban) ──────────────────────────────────────────────────

const KANBAN_STAGES = [
  { id: 'lead', label: 'New Lead', color: '#6B7E99', cards: [{ title: 'Royale Hair Salon', value: 180_000, contact: 'Tola Ade', daysInStage: 2 }] },
  { id: 'qualified', label: 'Qualified', color: '#F5A623', cards: [{ title: 'Bright Minds Academy', value: 420_000, contact: 'Ngozi Eze', daysInStage: 5 }] },
  { id: 'proposal', label: 'Proposal', color: '#F2E20C', cards: [{ title: 'SwiftShip Ltd', value: 840_000, contact: 'Emeka Obi', daysInStage: 3 }] },
  { id: 'negotiation', label: 'Negotiating', color: '#7B8FFF', cards: [{ title: 'Zara Wholesale', value: 490_000, contact: 'Fatima Bello', daysInStage: 8 }] },
  { id: 'closed', label: 'Closed Won', color: '#1EFFA8', cards: [{ title: 'BuildRight Construction', value: 220_000, contact: 'Kofi Mensah', daysInStage: 1 }] },
]

function PipelineTab() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)' }}>
          Sales Pipeline
        </span>
        <button
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 3,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            color: '#111827',
            cursor: 'pointer',
            fontFamily: 'Barlow Condensed',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Plus size={13} /> ADD DEAL
        </button>
      </div>

      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 8 }}>
        {KANBAN_STAGES.map((stage) => (
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
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', borderTop: `3px solid ${stage.color}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'JetBrains Mono' }}>{stage.label}</span>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                {formatCurrency(stage.cards.reduce((s, c) => s + c.value, 0))}
              </span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stage.cards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    padding: '12px 14px',
                    cursor: 'grab',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 8 }}>{card.contact}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>
                      {formatCurrency(card.value)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                      {card.daysInStage}d here
                    </div>
                  </div>
                </div>
              ))}
              <button
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--border)',
                  borderRadius: 3,
                  padding: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--muted-foreground)',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Social ───────────────────────────────────────────────────────────────────

const CONTENT_CALENDAR = [
  { date: 'Mon Jul 28', posts: [{ platform: 'Instagram', caption: 'Client success spotlight — 40% growth in 90 days.', status: 'published' }] },
  { date: 'Tue Jul 29', posts: [{ platform: 'Facebook', caption: 'Behind the scenes: our process for launching a new business.', status: 'published' }] },
  { date: 'Wed Jul 30', posts: [{ platform: 'Instagram', caption: 'Tips for managing client relationships as an agency.', status: 'scheduled' }, { platform: 'TikTok', caption: '1-minute agency hack that saves 3 hours a week.', status: 'draft' }] },
  { date: 'Thu Jul 31', posts: [] },
  { date: 'Fri Aug 1', posts: [{ platform: 'LinkedIn', caption: 'Agency growth report: Q2 highlights.', status: 'scheduled' }] },
]

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  published: { color: 'var(--accent)', bg: 'rgba(5,150,105,0.1)' },
  scheduled: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  draft: { color: 'var(--muted-foreground)', bg: 'var(--secondary)' },
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  TikTok: '#69C9D0',
  X: '#1DA1F2',
}

function SocialTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Per-platform stats */}
      <div>
        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Platform Performance
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
          {business.socialData.map((s) => (
            <div
              key={s.platform}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '16px 18px',
                borderTop: `3px solid ${PLATFORM_COLORS[s.platform] ?? 'var(--primary)'}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', marginBottom: 10, fontFamily: 'JetBrains Mono' }}>
                {s.platform}
              </div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
                {s.followers >= 1000 ? `${(s.followers / 1000).toFixed(1)}K` : s.followers}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>followers</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: s.growth > 0 ? 'var(--accent)' : 'var(--danger)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    {s.growth > 0 ? '+' : ''}{s.growth}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>growth</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    {s.engagement}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>eng. rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Followers chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Followers by Platform
        </div>
        <SocialChart data={business.socialData} height={180} />
      </div>

      {/* Content calendar */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Content Calendar
          </span>
          <button
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: 3,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 700,
              color: '#111827',
              cursor: 'pointer',
              fontFamily: 'Barlow Condensed',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={12} /> SCHEDULE POST
          </button>
        </div>
        {CONTENT_CALENDAR.map((day) => (
          <div
            key={day.date}
            style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'flex-start' }}
          >
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', paddingTop: 2 }}>
              {day.date}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {day.posts.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No posts scheduled</div>
              ) : (
                day.posts.map((post, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        background: (PLATFORM_COLORS[post.platform] ?? '#999') + '20',
                        color: PLATFORM_COLORS[post.platform] ?? '#999',
                        padding: '2px 8px',
                        borderRadius: 2,
                        fontFamily: 'JetBrains Mono',
                        flexShrink: 0,
                      }}
                    >
                      {post.platform}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--foreground)', flex: 1 }}>{post.caption}</span>
                    <span
                      style={{
                        fontSize: 10,
                        background: STATUS_STYLES[post.status].bg,
                        color: STATUS_STYLES[post.status].color,
                        padding: '2px 8px',
                        borderRadius: 2,
                        fontFamily: 'JetBrains Mono',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      {post.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Finance ──────────────────────────────────────────────────────────────────

const invoices = [
  { id: 'INV-0051', client: 'SwiftShip Ltd', amount: 480_000, status: 'paid', issued: '2026-07-01', due: '2026-07-15' },
  { id: 'INV-0050', client: 'Zara Wholesale', amount: 240_000, status: 'paid', issued: '2026-07-01', due: '2026-07-15' },
  { id: 'INV-0049', client: 'BuildRight Construction', amount: 120_000, status: 'overdue', issued: '2026-06-20', due: '2026-07-05' },
  { id: 'INV-0048', client: 'Sahel Medics', amount: 180_000, status: 'draft', issued: '2026-07-28', due: '2026-08-12' },
  { id: 'INV-0047', client: 'Emeka Obi', amount: 84_000, status: 'pending', issued: '2026-07-15', due: '2026-07-30' },
]

const INV_STYLES: Record<string, { color: string; bg: string }> = {
  paid: { color: 'var(--accent)', bg: 'rgba(5,150,105,0.1)' },
  overdue: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
  pending: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  draft: { color: 'var(--muted-foreground)', bg: 'var(--secondary)' },
}

function FinanceTab({ business }: { business: Business }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Finance summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <MetricCard label="Revenue (MTD)" value={formatCurrency(business.revenue)} change={business.revenueChange} accent="var(--primary)" />
        <MetricCard label="Outstanding" value={formatCurrency(264_000)} accent="var(--warning)" />
        <MetricCard label="Overdue" value={formatCurrency(120_000)} accent="var(--danger)" />
      </div>

      {/* Revenue trend */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Revenue — Last 12 Months
        </div>
        <RevenueChart data={business.monthlyData} height={160} />
      </div>

      {/* Invoices table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Invoices
          </span>
          <button
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: 3,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 700,
              color: '#111827',
              cursor: 'pointer',
              fontFamily: 'Barlow Condensed',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={12} /> NEW INVOICE
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px', gap: 12 }}>
          {['Invoice', 'Client', 'Amount', 'Issued', 'Due', 'Status'].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
          ))}
        </div>
        {invoices.map((inv) => (
          <div
            key={inv.id}
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>{inv.id}</div>
            <div style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{inv.client}</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--foreground)', fontWeight: 600 }}>{formatCurrency(inv.amount)}</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>{inv.issued}</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: inv.status === 'overdue' ? 'var(--danger)' : 'var(--muted-foreground)' }}>{inv.due}</div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                color: INV_STYLES[inv.status].color,
                background: INV_STYLES[inv.status].bg,
                padding: '3px 8px',
                borderRadius: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'inline-block',
              }}
            >
              {inv.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BusinessView({ business, onBack }: BusinessProps) {
  const [tab, setTab] = useState<BizTab>('overview')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Business header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            padding: 0,
          }}
        >
          <ArrowLeft size={15} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
            {business.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
            {business.industry} · {business.city}, {business.country} · Owner: {business.owner}
          </div>
        </div>

        {/* Status + key metric */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>
              {formatCurrency(business.revenue)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>Revenue MTD</div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              color: business.status === 'growing' ? 'var(--accent)' : business.status === 'flat' ? 'var(--warning)' : 'var(--danger)',
              background: business.status === 'growing' ? 'rgba(5,150,105,0.1)' : business.status === 'flat' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '5px 12px',
              borderRadius: 2,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            {business.status}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          flexShrink: 0,
        }}
      >
        {BIZ_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              color: tab === t.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              marginBottom: -1,
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
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
