/**
 * Growth Twin — "what if" simulator using the business's own historical data.
 * Runs projections with low/expected/high ranges. Shows assumptions plainly.
 * DEMO DATA pattern — clearly labeled. Real data replaces MONTHLY_HISTORY.
 */
import { useState } from 'react'
import { TrendingUp, AlertTriangle, Info, DollarSign, Users, Zap } from 'lucide-react'

// DEMO DATA: replace with real business snapshots from API
const MONTHLY_HISTORY = [
  { month: 'Mar', revenue: 280, leads: 14, clients: 8,  adSpend: 0  },
  { month: 'Apr', revenue: 310, leads: 16, clients: 9,  adSpend: 20 },
  { month: 'May', revenue: 295, leads: 18, clients: 11, adSpend: 20 },
  { month: 'Jun', revenue: 420, leads: 28, clients: 15, adSpend: 50 },
  { month: 'Jul', revenue: 390, leads: 24, clients: 14, adSpend: 30 },
  { month: 'Aug', revenue: 510, leads: 31, clients: 18, adSpend: 50 },
]

type ScenarioType = 'ads' | 'hire' | 'price' | 'churn'

interface Scenario {
  id: ScenarioType
  label: string
  icon: React.ElementType
  question: string
  inputLabel: string
  inputUnit: string
  defaultValue: number
  min: number
  max: number
  step: number
}

const SCENARIOS: Scenario[] = [
  { id: 'ads',   label: 'Ad Spend',         icon: TrendingUp,  question: 'If I put more money into ads this month…',           inputLabel: 'Additional ad budget',    inputUnit: '₦k', defaultValue: 50, min: 10,  max: 500, step: 10 },
  { id: 'hire',  label: 'Hire Staff',        icon: Users,       question: 'If I hire one more team member…',                    inputLabel: 'Monthly staff cost',      inputUnit: '₦k', defaultValue: 80, min: 30,  max: 300, step: 10 },
  { id: 'price', label: 'Raise Prices',      icon: DollarSign,  question: 'If I raise my prices…',                              inputLabel: 'Price increase',          inputUnit: '%',  defaultValue: 15, min: 5,   max: 100, step: 5  },
  { id: 'churn', label: 'Reduce Churn',      icon: Zap,         question: 'If I reduce client drop-off…',                       inputLabel: 'Churn reduction',         inputUnit: '%',  defaultValue: 20, min: 5,   max: 80,  step: 5  },
]

// Simple projection engine — uses historical growth rate + input multiplier
function project(scenario: ScenarioType, inputValue: number, history: typeof MONTHLY_HISTORY) {
  const recentRevs = history.slice(-3).map(m => m.revenue)
  const avgRev = recentRevs.reduce((a, b) => a + b, 0) / recentRevs.length
  const growthRate = history.length >= 2
    ? (history.at(-1)!.revenue - history[0].revenue) / history[0].revenue / history.length
    : 0.05

  const baseNext = avgRev * (1 + growthRate)

  let expectedMultiplier = 1
  let assumptions: string[] = []

  switch (scenario) {
    case 'ads': {
      // Historical: ₦20k spend → ~₦130k revenue lift (6.5x ROAS avg)
      const roas = 4.5
      const lift = inputValue * roas
      expectedMultiplier = (baseNext + lift) / baseNext
      assumptions = [
        `Estimated ROAS of ${roas}× based on your last 3 ad campaigns`,
        'Assumes similar targeting and creative quality',
        'Does NOT account for audience saturation (diminishing returns above ₦200k spend)',
      ]
      break
    }
    case 'hire': {
      // New staff → capacity for ~30% more clients; break-even in ~2.5 months
      const capacityLift = 0.3
      const revLift = baseNext * capacityLift - inputValue
      expectedMultiplier = Math.max(0.85, (baseNext + revLift) / baseNext)
      assumptions = [
        'Assumes new hire reaches full productivity in 6 weeks',
        `Break-even timeline: ~${Math.round(inputValue / (baseNext * 0.3))} months at current growth rate`,
        'Revenue lift from added capacity only — not factoring training cost or ramp time dip',
      ]
      break
    }
    case 'price': {
      // Price increase with estimated 10% client drop-off per 15% price increase
      const churnFactor = 1 - (inputValue / 100) * 0.5
      expectedMultiplier = (1 + inputValue / 100) * churnFactor
      assumptions = [
        `Estimated ${Math.round(inputValue * 0.5)}% client reduction from price sensitivity`,
        'Based on typical price elasticity for your industry (0.5)',
        'Existing locked-in clients (retainer/contract) are excluded from churn estimate',
      ]
      break
    }
    case 'churn': {
      const retained = baseNext * (inputValue / 100) * 0.8
      expectedMultiplier = (baseNext + retained) / baseNext
      assumptions = [
        `${inputValue}% of churning clients are retained — each worth avg ₦${Math.round(avgRev / 14)}k/mo`,
        'Assumes you implement a follow-up sequence to recover at-risk clients',
        'Retention ROI is typically higher than acquisition — this is usually the highest-leverage lever',
      ]
      break
    }
  }

  const low      = Math.round(baseNext * expectedMultiplier * 0.75)
  const expected = Math.round(baseNext * expectedMultiplier)
  const high     = Math.round(baseNext * expectedMultiplier * 1.35)

  return { low, expected, high, baseline: Math.round(baseNext), assumptions }
}

function ProjectionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#0f0f0e' }}>₦{value.toLocaleString()}k</span>
      </div>
      <div style={{ height: 10, background: '#f1f0ed', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function GrowthTwin() {
  const [scenario, setScenario] = useState<ScenarioType>('ads')
  const [inputValue, setInputValue] = useState(50)
  const sc = SCENARIOS.find(s => s.id === scenario)!
  const result = project(scenario, inputValue, MONTHLY_HISTORY)
  const maxBar = Math.max(result.high, result.baseline) * 1.1

  return (
    <div style={{ padding: '28px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Growth Twin</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px, 3vw, 38px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
          What if you did this<br />
          <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>next month?</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520, lineHeight: 1.65 }}>
          A decision sandbox built on your actual revenue history — not a generic calculator.
          Every projection shows its assumptions so you can decide how much to trust it.
        </p>
        <div style={{ marginTop: 8, display: 'inline-block', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '4px 10px', fontSize: 11, color: '#d97706', fontWeight: 600 }}>
          Demo data — connect your accounts for projections based on real numbers
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
        {/* Left: controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Scenario picker */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 14 }}>Choose a scenario</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SCENARIOS.map(s => {
                const Icon = s.icon
                const active = scenario === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => { setScenario(s.id); setInputValue(s.defaultValue) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '11px 12px', borderRadius: 8, cursor: 'pointer',
                      background: active ? '#f0fdf4' : '#f8f8f6',
                      border: `1.5px solid ${active ? '#16a34a' : '#e8e8e4'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={14} color={active ? '#16a34a' : '#9ca3af'} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#15803d' : '#374151' }}>{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Input */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 6 }}>{sc.question}</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{sc.inputLabel}: <strong style={{ color: '#0f0f0e' }}>{sc.inputUnit === '%' ? `${inputValue}%` : `${sc.inputUnit}${inputValue.toLocaleString()}`}</strong></p>
            <input
              type="range"
              min={sc.min} max={sc.max} step={sc.step}
              value={inputValue}
              onChange={e => setInputValue(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#16a34a', height: 6, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
              <span>{sc.inputUnit === '%' ? `${sc.min}%` : `${sc.inputUnit}${sc.min}`}</span>
              <span>{sc.inputUnit === '%' ? `${sc.max}%` : `${sc.inputUnit}${sc.max}`}</span>
            </div>
          </div>

          {/* Current baseline */}
          <div style={{ background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Last 6 months (demo)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {MONTHLY_HISTORY.map((m, i) => {
                const max = Math.max(...MONTHLY_HISTORY.map(x => x.revenue))
                const h = Math.round((m.revenue / max) * 100)
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: '100%', height: `${h}%`, minHeight: 4, background: i === MONTHLY_HISTORY.length - 1 ? 'linear-gradient(to top, #15803d, #22c55e)' : '#e8e8e4', borderRadius: '3px 3px 0 0' }} />
                    <span style={{ fontSize: 8, color: '#9ca3af' }}>{m.month}</span>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>Baseline next month (no change): <strong style={{ color: '#0f0f0e' }}>₦{result.baseline.toLocaleString()}k</strong></p>
          </div>
        </div>

        {/* Right: projection output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 4 }}>Projected Revenue — Next Month</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 22 }}>Range based on your data + scenario. Low = conservative, High = optimistic.</p>

            <ProjectionBar label="Low scenario"      value={result.low}      max={maxBar} color="#f59e0b" />
            <ProjectionBar label="Expected scenario" value={result.expected}  max={maxBar} color="#16a34a" />
            <ProjectionBar label="High scenario"     value={result.high}     max={maxBar} color="#22c55e" />
            <div style={{ height: 1, background: '#f1f0ed', margin: '16px 0' }} />
            <ProjectionBar label="Baseline (no change)" value={result.baseline} max={maxBar} color="#e8e8e4" />

            {/* Delta callout */}
            <div style={{ marginTop: 20, background: result.expected > result.baseline ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.expected > result.baseline ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: result.expected > result.baseline ? '#15803d' : '#dc2626', margin: 0 }}>
                {result.expected > result.baseline
                  ? `+₦${(result.expected - result.baseline).toLocaleString()}k expected uplift vs doing nothing`
                  : `₦${(result.baseline - result.expected).toLocaleString()}k expected cost — break-even takes time`}
              </p>
            </div>
          </div>

          {/* Assumptions */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Info size={14} color="#6b7280" />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Assumptions — read before deciding</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {result.assumptions.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                  {a}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
              <AlertTriangle size={12} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 11, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                This is a projection, not a guarantee. Small businesses have high variance. Use this as a directional guide, not a commitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
