/**
 * Owner Overview — the business's health at a glance.
 * Shows revenue trend, active clients/leads, top action item, quick links.
 * Vertical-aware: terminology adapts via getVertical().
 */
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, AlertCircle, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { getVertical } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
  onNavigate: (tab: string) => void
}

// ── Demo data (clearly labeled) ──────────────────────────────────────────────
// DEMO DATA: replace with real API calls once backend snapshots are wired in
const DEMO_SNAPSHOTS = [
  { month: 'Mar', revenue: 280 },
  { month: 'Apr', revenue: 310 },
  { month: 'May', revenue: 295 },
  { month: 'Jun', revenue: 420 },
  { month: 'Jul', revenue: 390 },
  { month: 'Aug', revenue: 510 },
]

const DEMO_ACTION_ITEMS = [
  { id: '1', text: '3 leads have not been contacted in 7+ days', urgency: 'high', tab: 'owner-crm' },
  { id: '2', text: 'You have 2 invoices overdue by 14+ days', urgency: 'high', tab: 'owner-invoices' },
  { id: '3', text: 'Content calendar is empty for next week', urgency: 'medium', tab: 'client-calendar' },
]

function StatCard({ label, value, delta, icon: Icon, accent, onClick }: {
  label: string; value: string | number; delta?: number; icon: React.ElementType; accent: string; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={accent} strokeWidth={2} />
        </div>
        {delta != null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? '#16a34a' : '#dc2626', background: delta >= 0 ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
            {delta >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#0f0f0e', lineHeight: 1, marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

export default function OwnerOverview({ business, onNavigate }: Props) {
  const v = getVertical(business.type)
  const maxRev = Math.max(...DEMO_SNAPSHOTS.map(s => s.revenue), 1)
  const current = DEMO_SNAPSHOTS.at(-1)!.revenue
  const prev = DEMO_SNAPSHOTS.at(-2)!.revenue
  const revDelta = Math.round(((current - prev) / prev) * 100)

  const QUICK_LINKS = [
    { label: v.crmColumns[0] + 's & Leads', tab: 'owner-crm',      color: '#2563eb', bg: '#eff6ff' },
    { label: 'Analytics',                   tab: 'owner-analytics', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Content Calendar',            tab: 'client-calendar', color: '#d97706', bg: '#fffbeb' },
    { label: 'Invoices',                    tab: 'owner-invoices',  color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Growth Tools',                tab: 'growth-tools',    color: '#0891b2', bg: '#ecfeff' },
    { label: 'Automations',                 tab: 'automations',     color: '#dc2626', bg: '#fef2f2' },
  ]

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Business Overview
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {business.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{v.label}</span>
          <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>● Live</span>
          <span style={{ fontSize: 11, color: '#9ca3af', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 4 }}>
            Demo data — connect your accounts to see real numbers
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Revenue MTD"            value="₦510k"  delta={revDelta} icon={DollarSign}  accent="#16a34a" onClick={() => onNavigate('owner-analytics')} />
        <StatCard label={`Active ${v.contactsNoun}`} value={14}  delta={3}        icon={Users}        accent="#2563eb" onClick={() => onNavigate('owner-crm')} />
        <StatCard label={`Open ${v.leadNoun}s`}   value={8}     delta={-1}       icon={TrendingUp}   accent="#d97706" onClick={() => onNavigate('owner-crm')} />
        <StatCard label="Outstanding"             value="₦82k"  delta={undefined} icon={AlertCircle}  accent="#dc2626" onClick={() => onNavigate('owner-invoices')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Revenue Trend</h2>
            <button onClick={() => onNavigate('owner-analytics')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Full analytics <ArrowRight size={11} />
            </button>
          </div>
          <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 8 }}>
            {DEMO_SNAPSHOTS.map((s, i) => {
              const h = Math.round((s.revenue / maxRev) * 100)
              const isLast = i === DEMO_SNAPSHOTS.length - 1
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  {isLast && <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>₦{s.revenue}k</span>}
                  <div style={{ width: '100%', height: `${h}%`, minHeight: 8, background: isLast ? 'linear-gradient(to top, #15803d, #22c55e)' : '#f1f0ed', border: isLast ? 'none' : '1px solid #e8e8e4', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} title={`₦${s.revenue}k`} />
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{s.month}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>Demo data — connect your payment account to see real revenue</p>
        </div>

        {/* Top action items */}
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={12} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Action Items</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACTION_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.tab)}
                style={{
                  background: item.urgency === 'high' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${item.urgency === 'high' ? '#fecaca' : '#fde68a'}`,
                  borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'flex-start', gap: 8, transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <AlertCircle size={13} color={item.urgency === 'high' ? '#dc2626' : '#d97706'} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={14} color="#16a34a" />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Quick Access</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {QUICK_LINKS.map(link => (
            <button
              key={link.tab}
              onClick={() => onNavigate(link.tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 14px', borderRadius: 9,
                background: link.bg, border: `1.5px solid ${link.color}22`,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
            >
              <ArrowRight size={13} color={link.color} />
              <span style={{ fontSize: 12, fontWeight: 600, color: link.color }}>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
