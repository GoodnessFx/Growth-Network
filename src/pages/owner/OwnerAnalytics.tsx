/**
 * Owner Analytics — revenue, growth trend, channel performance.
 * Scoped strictly to this business. DEMO DATA labeled.
 */
import { TrendingUp, ArrowUpRight, ArrowDownRight, Users, DollarSign, BarChart2, Activity } from 'lucide-react'
import { getVertical } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

const MONTHLY = [
  { m: 'Jan', revenue: 180, clients: 8,  leads: 14 },
  { m: 'Feb', revenue: 210, clients: 9,  leads: 16 },
  { m: 'Mar', revenue: 280, clients: 11, leads: 20 },
  { m: 'Apr', revenue: 310, clients: 12, leads: 19 },
  { m: 'May', revenue: 295, clients: 11, leads: 18 },
  { m: 'Jun', revenue: 420, clients: 15, leads: 28 },
  { m: 'Jul', revenue: 390, clients: 14, leads: 24 },
  { m: 'Aug', revenue: 510, clients: 18, leads: 31 },
]

const CHANNELS = [
  { name: 'WhatsApp',  pct: 44, color: '#16a34a' },
  { name: 'Referral',  pct: 28, color: '#2563eb' },
  { name: 'Instagram', pct: 16, color: '#d97706' },
  { name: 'Direct',    pct: 12, color: '#7c3aed' },
]

function MiniStat({ label, value, delta, icon: Icon, accent }: {
  label: string; value: string | number; delta: number; icon: React.ElementType; accent: string
}) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={accent} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? '#16a34a' : '#dc2626', background: delta >= 0 ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
          {delta >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(delta)}%
        </span>
      </div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: '#0f0f0e', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

export default function OwnerAnalytics({ business }: Props) {
  const v = getVertical(business.type)
  const maxRev = Math.max(...MONTHLY.map(m => m.revenue))
  const latest = MONTHLY.at(-1)!
  const prev = MONTHLY.at(-2)!
  const revDelta = Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 100)
  const clientDelta = Math.round(((latest.clients - prev.clients) / prev.clients) * 100)
  const leadDelta = Math.round(((latest.leads - prev.leads) / prev.leads) * 100)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Analytics</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Growth Dashboard
        </h1>
        <p style={{ fontSize: 12, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '3px 10px', display: 'inline-block', marginTop: 6 }}>
          Demo data — connect your payment and social accounts for real analytics
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MiniStat label="Revenue MTD"                          value="₦510k"       delta={revDelta}    icon={DollarSign}  accent="#16a34a" />
        <MiniStat label={`Active ${v.contactsNoun}`}           value={latest.clients} delta={clientDelta} icon={Users}       accent="#2563eb" />
        <MiniStat label={`New ${v.leadNoun}s MTD`}             value={latest.leads} delta={leadDelta}   icon={TrendingUp}  accent="#d97706" />
        <MiniStat label="Avg Deal Value"                       value="₦28k"        delta={5}            icon={BarChart2}   accent="#7c3aed" />
        <MiniStat label="Conversion Rate"                      value="42%"         delta={3}            icon={Activity}    accent="#0891b2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Revenue bar chart */}
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Monthly Revenue (₦k)</h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 9px', borderRadius: 99 }}>
              +{revDelta}% MoM
            </span>
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
            {MONTHLY.map((m, i) => {
              const h = Math.round((m.revenue / maxRev) * 100)
              const isLast = i === MONTHLY.length - 1
              return (
                <div key={m.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  {isLast && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>₦{m.revenue}k</span>}
                  <div title={`₦${m.revenue}k`} style={{ width: '100%', height: `${h}%`, minHeight: 8, background: isLast ? 'linear-gradient(to top, #15803d, #22c55e)' : '#f1f0ed', border: isLast ? 'none' : '1px solid #e8e8e4', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} />
                  <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 500 }}>{m.m}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Channel breakdown */}
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 20 }}>Lead Sources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CHANNELS.map(ch => (
              <div key={ch.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{ch.name}</span>
                  <span style={{ fontWeight: 700, color: '#0f0f0e' }}>{ch.pct}%</span>
                </div>
                <div style={{ height: 8, background: '#f1f0ed', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ch.pct}%`, background: ch.color, borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth table */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Month-by-Month Growth</h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #e8e8e4' }}>
                {['Month', 'Revenue', `${v.contactNoun}s`, `${v.leadNoun}s`, 'Rev Growth'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY.map((m, i) => {
                const prevRev = i > 0 ? MONTHLY[i - 1].revenue : m.revenue
                const delta = i > 0 ? Math.round(((m.revenue - prevRev) / prevRev) * 100) : 0
                return (
                  <tr key={m.m} style={{ borderBottom: '1px solid #f1f0ed', background: i === MONTHLY.length - 1 ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontWeight: i === MONTHLY.length - 1 ? 700 : 400, fontSize: 13, color: '#0f0f0e' }}>{m.m}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>₦{m.revenue}k</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{m.clients}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{m.leads}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {i > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? '#16a34a' : '#dc2626', background: delta >= 0 ? '#f0fdf4' : '#fef2f2', padding: '2px 7px', borderRadius: 99 }}>
                          {delta >= 0 ? '+' : ''}{delta}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
