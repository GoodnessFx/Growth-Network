/**
 * Financial Health Score — explainable score from revenue trend,
 * consistency, and receivables health.
 *
 * NOTE: Lender integration is a future phase. This pass builds the score,
 * its explanation, and history. No lender APIs are called or stubbed.
 *
 * DEMO DATA labeled throughout.
 */
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Info, DollarSign, Clock, BarChart2 } from 'lucide-react'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

// DEMO DATA — replace with real API snapshots
const SCORE_HISTORY = [
  { month: 'Mar', score: 52 },
  { month: 'Apr', score: 55 },
  { month: 'May', score: 54 },
  { month: 'Jun', score: 63 },
  { month: 'Jul', score: 61 },
  { month: 'Aug', score: 71 },
]

interface ScoreFactor {
  label: string
  score: number       // 0–100 for this factor
  weight: number      // 0–1, sums to 1 across all factors
  description: string
  verdict: 'good' | 'ok' | 'risk'
  icon: React.ElementType
}

// Compute from demo data — each factor explained plainly
const FACTORS: ScoreFactor[] = [
  {
    label: 'Revenue Trend',
    score: 80,
    weight: 0.35,
    description: 'Revenue has grown 34% over the last 6 months. Consistent upward trend with no multi-month drops.',
    verdict: 'good',
    icon: TrendingUp,
  },
  {
    label: 'Revenue Consistency',
    score: 68,
    weight: 0.25,
    description: 'One dip in May (−5%). Month-on-month variance is 12% — moderate. Lenders prefer <10% variance.',
    verdict: 'ok',
    icon: BarChart2,
  },
  {
    label: 'Receivables Health',
    score: 55,
    weight: 0.25,
    description: '₦82,000 outstanding, of which ₦45,000 is overdue by 14+ days. Overdue rate of 8.8% is above the 5% benchmark.',
    verdict: 'risk',
    icon: DollarSign,
  },
  {
    label: 'Operating Duration',
    score: 70,
    weight: 0.15,
    description: 'Business has 6+ months of tracked data on GrowthNet. Score improves as longer history builds confidence.',
    verdict: 'ok',
    icon: Clock,
  },
]

const VERDICT_CFG = {
  good: { color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle, label: 'Strong' },
  ok:   { color: '#d97706', bg: '#fffbeb', icon: Minus,        label: 'Moderate' },
  risk: { color: '#dc2626', bg: '#fef2f2', icon: AlertCircle,  label: 'Needs attention' },
}

function FactorBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ height: 8, background: '#f1f0ed', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
    </div>
  )
}

function overallScore() {
  return Math.round(FACTORS.reduce((sum, f) => sum + f.score * f.weight, 0))
}

function scoreLabel(s: number): { label: string; color: string; bg: string; desc: string } {
  if (s >= 75) return { label: 'Strong',    color: '#16a34a', bg: '#f0fdf4', desc: 'Your business shows healthy financials. This score supports access to growth financing in a future phase.' }
  if (s >= 55) return { label: 'Fair',      color: '#d97706', bg: '#fffbeb', desc: 'Solid foundation with a few areas to improve. Addressing receivables and smoothing revenue variance will push this into the Strong range.' }
  return       { label: 'Developing', color: '#dc2626', bg: '#fef2f2', desc: 'Building financial history takes time. Keep tracking consistently — the score improves as more data is added.' }
}

export default function FinancialHealthScore({ business }: Props) {
  const score = overallScore()
  const label = scoreLabel(score)
  const maxHistory = Math.max(...SCORE_HISTORY.map(s => s.score), 100)

  // Circumference for the score ring
  const r = 52
  const circ = 2 * Math.PI * r
  const fill = circ - (circ * score) / 100

  return (
    <div style={{ padding: '28px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Financial Health</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Your Financial<br />
          <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>Health Score.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520, lineHeight: 1.65 }}>
          A single, explainable score built from your revenue trend, consistency, and receivables —
          the kind of thing a lender or investor looks at first.
        </p>
        <div style={{ marginTop: 8, display: 'inline-block', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '4px 10px', fontSize: 11, color: '#d97706', fontWeight: 600 }}>
          Demo data — connect your accounts for a real score
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Score card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 14, padding: 28, textAlign: 'center' }}>
            {/* Score ring */}
            <svg width={140} height={140} style={{ display: 'block', margin: '0 auto 16px' }}>
              <circle cx={70} cy={70} r={r} fill="none" stroke="#f1f0ed" strokeWidth={12} />
              <circle
                cx={70} cy={70} r={r}
                fill="none"
                stroke={label.color}
                strokeWidth={12}
                strokeDasharray={circ}
                strokeDashoffset={fill}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <text x={70} y={65} textAnchor="middle" fontFamily="'DM Serif Display', serif" fontSize={36} fill="#0f0f0e">{score}</text>
              <text x={70} y={85} textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize={11} fill="#9ca3af" fontWeight="600">OUT OF 100</text>
            </svg>

            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: label.color, marginBottom: 6 }}>{label.label}</div>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{label.desc}</p>
          </div>

          {/* Score history chart */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 12 }}>Score history</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {SCORE_HISTORY.map((s, i) => {
                const h = Math.round((s.score / maxHistory) * 100)
                const isLast = i === SCORE_HISTORY.length - 1
                return (
                  <div key={s.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${h}%`, minHeight: 4, background: isLast ? 'linear-gradient(to top, #15803d, #22c55e)' : '#f1f0ed', border: isLast ? 'none' : '1px solid #e8e8e4', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} title={`${s.score}`} />
                    <span style={{ fontSize: 9, color: '#9ca3af' }}>{s.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Future phase note */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Info size={13} color="#2563eb" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>Coming in a future phase</span>
            </div>
            <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
              Businesses with a Strong score (75+) will be able to access growth financing directly through GrowthNet — no bank visits, no lengthy forms.
              {/* NOTE: Lender integration is deliberately not built here. This note is the designed hook. */}
            </p>
          </div>
        </div>

        {/* Factor breakdown */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 16 }}>What drives your score</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FACTORS.map(f => {
              const vc = VERDICT_CFG[f.verdict]
              const VIcon = vc.icon
              const FIcon = f.icon
              return (
                <div key={f.label} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: vc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FIcon size={14} color={vc.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e' }}>{f.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: vc.color, lineHeight: 1 }}>{f.score}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>/ 100</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: vc.bg, color: vc.color }}>{vc.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <FactorBar score={f.score} color={vc.color} />
                    <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>Weight: {Math.round(f.weight * 100)}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.65 }}>{f.description}</p>
                </div>
              )
            })}
          </div>

          {/* How it's calculated */}
          <div style={{ marginTop: 16, background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Info size={13} color="#9ca3af" />
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', margin: 0 }}>How this score is calculated</h3>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
              The score is a weighted average of four factors: Revenue Trend (35%), Revenue Consistency (25%), Receivables Health (25%), and Operating Duration (15%).
              Every factor is explained in plain language above — there are no hidden inputs or black-box algorithms.
              The score updates monthly as new data is recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
