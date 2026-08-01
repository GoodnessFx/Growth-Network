import { useEffect, useState } from 'react'
import { TrendingUp, ArrowLeft, Printer, Loader2, Share2 } from 'lucide-react'
import { ApiError, ApiReport, ApiBusiness, fetchPublicResults } from '../lib/api'
import { formatCurrency } from '../data/mockData'

interface PublicResultsProps {
  businessId: string
  onBack: () => void
}

function StatBar({ label, before, after, color }: { label: string; before: number; after: number; color: string }) {
  const max = Math.max(before, after, 1)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'rgba(232,233,235,0.55)',
          }}
        >
          {label}
        </span>
        <span className="font-display" style={{ fontSize: 20, fontWeight: 700, color }}>
          {formatCurrency(after)}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(232,233,235,0.45)', fontFamily: 'JetBrains Mono', marginBottom: 3 }}>
            <span>Before</span>
            <span>{formatCurrency(before)}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(232,233,235,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(before / max) * 100}%`, height: '100%', background: 'rgba(232,233,235,0.35)', borderRadius: 2 }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(232,233,235,0.45)', fontFamily: 'JetBrains Mono', marginBottom: 3 }}>
            <span>After</span>
            <span>{formatCurrency(after)}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(232,233,235,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(after / max) * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Poster({ business, report, onBack }: { business: ApiBusiness; report: ApiReport | null; onBack: () => void }) {
  const metrics = report?.metrics
  const growthPct = metrics ? ((metrics.revenueAfter - metrics.revenueBefore) / Math.max(metrics.revenueBefore, 1)) * 100 : 0
  const clientGrowthPct = metrics ? ((metrics.clientsAfter - metrics.clientsBefore) / Math.max(metrics.clientsBefore, 1)) * 100 : 0
  const channelCount = metrics?.channels?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F0A', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar — hidden on print */}
      <div
        className="print-hide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1px solid rgba(232,233,235,0.08)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(232,233,235,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            minHeight: 44,
          }}
        >
          <ArrowLeft size={16} /> Back to Growth Network
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${business.name} — Growth Snapshot`, url: window.location.href }).catch(() => {})
              }
            }}
            style={{
              background: 'var(--secondary)',
              border: '1px solid rgba(232,233,235,0.12)',
              borderRadius: 3,
              padding: '10px 14px',
              minHeight: 44,
              cursor: 'pointer',
              color: 'rgba(232,233,235,0.85)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={() => window.print()}
            style={{
              background: 'var(--primary)',
              border: 'none',
              color: '#111827',
              padding: '10px 16px',
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              fontFamily: 'Barlow Condensed',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Printer size={13} /> Save as PDF
          </button>
        </div>
      </div>

      {/* Poster */}
      <div className="poster" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 760,
            background: '#11150E',
            border: '1px solid rgba(232,233,235,0.1)',
            borderRadius: 4,
            padding: '56px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* signature watermark */}
          <div
            className="font-display"
            style={{
              position: 'absolute',
              right: -6,
              top: -14,
              fontSize: 190,
              fontWeight: 900,
              lineHeight: 1,
              color: 'rgba(27,122,74,0.07)',
              letterSpacing: -6,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {metrics?.channels?.[0] ? metrics.channels[0].toUpperCase() : 'GN'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            <div style={{ width: 22, height: 22, background: 'var(--primary)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={12} color="#111827" strokeWidth={3} />
            </div>
            <span className="font-display" style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: 'rgba(232,233,235,0.9)' }}>
              GROWTH SNAPSHOT
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 10,
            }}
          >
            {business.type}
          </div>
          <h1 className="font-display" style={{ fontSize: 52, fontWeight: 900, margin: 0, color: '#E8E9EB', letterSpacing: -0.5, lineHeight: 1.05 }}>
            {business.name}
          </h1>

          <p
            style={{
              fontSize: 17,
              color: 'rgba(232,233,235,0.65)',
              margin: '16px 0 0',
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            {metrics?.headline || 'Measurable growth, delivered through Growth Network.'}
          </p>

          {metrics ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '40px 0 8px' }}>
                <span className="font-display" style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>
                  +{growthPct.toFixed(0)}%
                </span>
                <span style={{ fontSize: 12, color: 'rgba(232,233,235,0.5)', fontFamily: 'JetBrains Mono' }}>revenue growth</span>
              </div>

              <div style={{ height: 1, background: 'rgba(232,233,235,0.1)', margin: '28px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                <StatBar label="Revenue" before={metrics.revenueBefore} after={metrics.revenueAfter} color="var(--primary)" />
                <StatBar label="Clients" before={metrics.clientsBefore} after={metrics.clientsAfter} color="var(--accent)" />
              </div>

              {channelCount > 0 && (
                <>
                  <div style={{ height: 1, background: 'rgba(232,233,235,0.1)', margin: '28px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {metrics.channels.map((ch) => (
                      <span
                        key={ch}
                        style={{
                          border: '1px solid rgba(194,167,125,0.4)',
                          color: 'var(--accent)',
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          padding: '5px 12px',
                          borderRadius: 2,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                    {metrics.channels.length > 0 && (
                      <span style={{ fontSize: 11, color: 'rgba(232,233,235,0.4)', fontFamily: 'JetBrains Mono', alignSelf: 'center' }}>
                        +{clientGrowthPct.toFixed(0)}% client growth
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              style={{
                marginTop: 40,
                border: '1px dashed rgba(232,233,235,0.2)',
                borderRadius: 3,
                padding: '24px',
                color: 'rgba(232,233,235,0.55)',
                fontSize: 13,
              }}
            >
              No growth snapshot published yet. The operator can publish one from the Growth Network dashboard.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 44 }}>
            <span style={{ fontSize: 11, color: 'rgba(232,233,235,0.35)', fontFamily: 'JetBrains Mono' }}>
              {report?.generated_at ? `Snapshot · ${new Date(report.generated_at.replace(' ', 'T') + 'Z').toLocaleDateString()}` : `Snapshot · ${new Date().toLocaleDateString()}`}
            </span>
            <span className="font-display" style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: 'rgba(232,233,235,0.7)' }}>
              GROWTH<span style={{ color: 'var(--primary)' }}>NET</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublicResults({ businessId, onBack }: PublicResultsProps) {
  const [business, setBusiness] = useState<ApiBusiness | null>(null)
  const [report, setReport] = useState<ApiReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchPublicResults(businessId)
      .then((res) => {
        if (cancelled) return
        setBusiness(res.business)
        setReport(res.report)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Could not load this snapshot.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [businessId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(232,233,235,0.6)', fontSize: 13 }}>
        <Loader2 size={16} className="spin" /> Loading snapshot...
      </div>
    )
  }

  if (error || !business) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0F0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: 'rgba(232,233,235,0.3)' }}>404</span>
        <span style={{ color: 'rgba(232,233,235,0.6)', fontSize: 14 }}>{error || 'Snapshot not found.'}</span>
        <button
          onClick={onBack}
          className="print-hide"
          style={{
            background: 'var(--primary)',
            border: 'none',
            color: '#111827',
            padding: '12px 20px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'Barlow Condensed',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            minHeight: 44,
          }}
        >
          Back to home
        </button>
      </div>
    )
  }

  return <Poster business={business} report={report} onBack={onBack} />
}
