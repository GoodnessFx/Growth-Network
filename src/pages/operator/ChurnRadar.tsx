/**
 * Client Health & Churn Radar — read-only early-warning system.
 * Surfaces at-risk clients with explicit reasons, not just a red dot.
 * Operator sees the signal; decides on outreach personally.
 * Displayed prominently in Operator nav — not buried.
 */
import { useState } from 'react'
import { AlertTriangle, TrendingDown, Clock, CreditCard, Activity, CheckCircle, Eye } from 'lucide-react'

type RiskLevel = 'critical' | 'high' | 'medium' | 'healthy'

interface RiskSignal {
  type: string
  detail: string
  icon: React.ElementType
}

interface ClientRisk {
  id: string
  name: string
  bizType: string
  risk: RiskLevel
  signals: RiskSignal[]
  lastLogin: string
  invoiceDaysOverdue: number
  featureUsageDrop: number  // % drop in feature usage vs 30 days ago
  score: number             // 0-100, lower = more at risk
}

// DEMO DATA — in production, computed server-side from real engagement logs
const DEMO_CLIENTS: ClientRisk[] = [
  {
    id: '1', name: 'Emeka Okonkwo', bizType: 'Trading', risk: 'critical', score: 18,
    lastLogin: '21 days ago', invoiceDaysOverdue: 12, featureUsageDrop: 80,
    signals: [
      { type: 'Login drop-off', detail: 'No login in 21 days (was logging in 4x/week)', icon: Activity },
      { type: 'Invoice overdue', detail: 'Last invoice 12 days past due — ₦45,000 outstanding', icon: CreditCard },
      { type: 'Feature abandonment', detail: 'Stopped using CRM and content calendar (80% usage drop)', icon: TrendingDown },
    ],
  },
  {
    id: '2', name: 'Pinnacle Global Supplies', bizType: 'Procurement', risk: 'high', score: 34,
    lastLogin: '9 days ago', invoiceDaysOverdue: 0, featureUsageDrop: 55,
    signals: [
      { type: 'Login slowdown', detail: 'Last login 9 days ago (was daily)', icon: Clock },
      { type: 'Feature drop', detail: 'Content calendar usage down 55% vs last month', icon: TrendingDown },
    ],
  },
  {
    id: '3', name: 'BuySmart Procurement', bizType: 'Procurement', risk: 'medium', score: 58,
    lastLogin: '4 days ago', invoiceDaysOverdue: 0, featureUsageDrop: 20,
    signals: [
      { type: 'Mild engagement drop', detail: 'Login frequency down slightly — 4 days since last session', icon: Activity },
    ],
  },
  {
    id: '4', name: 'Amira Hassan', bizType: 'E-commerce', risk: 'healthy', score: 87,
    lastLogin: 'Today', invoiceDaysOverdue: 0, featureUsageDrop: 0,
    signals: [],
  },
  {
    id: '5', name: 'Export Trade Ltd', bizType: 'Export/Import', risk: 'healthy', score: 79,
    lastLogin: 'Yesterday', invoiceDaysOverdue: 0, featureUsageDrop: 5,
    signals: [],
  },
]

const RISK_CFG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { label: 'Critical',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertTriangle },
  high:     { label: 'High risk',  color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle },
  medium:   { label: 'Watch',      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Eye },
  healthy:  { label: 'Healthy',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle },
}

export default function ChurnRadar() {
  const [filter, setFilter] = useState<'all' | RiskLevel>('all')
  const [expanded, setExpanded] = useState<string | null>('1') // open most critical by default

  const sorted = [...DEMO_CLIENTS].sort((a, b) => a.score - b.score)
  const filtered = filter === 'all' ? sorted : sorted.filter(c => c.risk === filter)

  const counts = (['critical', 'high', 'medium', 'healthy'] as RiskLevel[]).reduce(
    (acc, r) => ({ ...acc, [r]: DEMO_CLIENTS.filter(c => c.risk === r).length }),
    {} as Record<RiskLevel, number>,
  )
  const atRisk = counts.critical + counts.high

  return (
    <div style={{ padding: '28px 28px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Churn Radar
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520, lineHeight: 1.65 }}>
          Early warning system — every at-risk client with the specific reason they're flagged.
          This is read-only: it gives you the signal, you decide the outreach.
        </p>
        {atRisk > 0 && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px' }}>
            <AlertTriangle size={14} color="#dc2626" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
              {atRisk} client{atRisk > 1 ? 's' : ''} at high or critical risk right now
            </span>
          </div>
        )}
      </div>

      {/* Risk summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'critical', 'high', 'medium', 'healthy'] as const).map(r => {
          const cfg = r === 'all' ? { label: 'All clients', color: '#0f0f0e', bg: '#f1f0ed', border: '#e8e8e4' } : RISK_CFG[r]
          const count = r === 'all' ? DEMO_CLIENTS.length : counts[r]
          return (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${filter === r ? cfg.color + '40' : '#e8e8e4'}`, background: filter === r ? cfg.bg : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: cfg.color, lineHeight: 1 }}>{count}</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Client list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(client => {
          const cfg = RISK_CFG[client.risk]
          const RiskIcon = cfg.icon
          const isOpen = expanded === client.id
          return (
            <div
              key={client.id}
              style={{ background: '#fff', border: `1.5px solid ${client.risk === 'healthy' ? '#e8e8e4' : cfg.border}`, borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.15s' }}
            >
              {/* Summary row */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
                onClick={() => setExpanded(isOpen ? null : client.id)}
              >
                {/* Health score ring */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: cfg.bg, border: `2.5px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: cfg.color, lineHeight: 1 }}>{client.score}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{client.name}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color }}>
                      <RiskIcon size={9} />{cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {client.bizType} · Last login: {client.lastLogin}
                    {client.invoiceDaysOverdue > 0 && <span style={{ color: '#dc2626', marginLeft: 8 }}>· Invoice {client.invoiceDaysOverdue}d overdue</span>}
                  </div>
                </div>

                {client.signals.length > 0 && (
                  <div style={{ fontSize: 12, color: cfg.color, background: cfg.bg, padding: '4px 10px', borderRadius: 6, flexShrink: 0, fontWeight: 600 }}>
                    {client.signals.length} signal{client.signals.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Expanded signals */}
              {isOpen && client.signals.length > 0 && (
                <div style={{ padding: '0 20px 18px', borderTop: '1px solid #f1f0ed' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 14, marginBottom: 10 }}>
                    Why this client is flagged
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {client.signals.map((sig, i) => {
                      const SigIcon = sig.icon
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: '11px 14px' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <SigIcon size={13} color={cfg.color} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f0f0e', marginBottom: 2 }}>{sig.type}</div>
                            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{sig.detail}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
                      ↑ This is your signal. Your move — reach out personally, don't automate it.
                      A genuine message from you at this stage is 8× more likely to re-engage a client than an automated follow-up.
                    </p>
                  </div>
                </div>
              )}
              {isOpen && client.risk === 'healthy' && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f1f0ed' }}>
                  <div style={{ paddingTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a' }}>
                    <CheckCircle size={14} />
                    No risk signals detected. Logging in regularly, invoices current, using features consistently.
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>
        Demo data — connect client accounts to see real engagement signals
      </p>
    </div>
  )
}
