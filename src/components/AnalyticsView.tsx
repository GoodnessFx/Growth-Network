import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Eye,
  MousePointerClick,
  Users,
  Timer,
  Percent,
  Zap,
  RefreshCw,
  Loader2,
  Megaphone,
  Search,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ApiError,
  ApiBusiness,
  AnalyticsOverview,
  AdPlatformOverview,
  SeoPerformance,
  fetchAnalytics,
  fetchBusinesses,
  fetchAdsOverview,
  fetchSeo,
  simulateTraffic,
} from '../lib/api'

const POLL_INTERVAL_MS = 10_000

const KPI_COLORS = {
  live: 'var(--accent)',
  todayPageviews: 'var(--primary)',
  todayVisitors: 'var(--warning)',
  sessions: '#7B8FFF',
}

const EVENT_LABELS: Record<string, string> = {
  pageview: 'Pageview',
  click: 'Click',
  button_click: 'Button click',
  form_submit: 'Form submit',
  pageleave: 'Page leave',
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 3,
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--danger)',
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  )
}

function KpiCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: color, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: color, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function MiniTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#14161A',
        border: '1px solid #2A2E35',
        borderRadius: 3,
        padding: '8px 12px',
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        color: 'var(--foreground)',
      }}
    >
      <div style={{ color: 'var(--muted-foreground)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ margin: '2px 0' }}>
          {p.dataKey}: {p.value}
        </div>
      ))}
    </div>
  )
}

function AdPlatformBlock({ platform, compact }: { platform: AdPlatformOverview | null; compact?: boolean }) {
  if (!platform) {
    return (
      <div style={{ border: '1px dashed var(--border)', borderRadius: 3, padding: compact ? '14px 16px' : '14px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>
        No data available.
      </div>
    )
  }
  if (!platform.connected) {
    return (
      <div style={{ border: '1px dashed var(--border)', borderRadius: 3, padding: compact ? '14px 16px' : '14px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>
        {platform.label} not connected.
      </div>
    )
  }
  const campaigns = platform.campaigns ?? []
  const total = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + (c.metrics?.impressions ?? 0),
      clicks: acc.clicks + (c.metrics?.clicks ?? 0),
      spent: acc.spent + (c.metrics?.spent ?? 0),
      conversions: acc.conversions + (c.metrics?.conversions ?? 0),
    }),
    { impressions: 0, clicks: 0, spent: 0, conversions: 0 },
  )
  const ctr = total.impressions > 0 ? ((total.clicks / total.impressions) * 100).toFixed(2) : '0.00'
  const cpc = total.clicks > 0 ? total.spent / total.clicks : 0
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{platform.label}</span>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--accent)', background: 'rgba(5,150,105,0.1)', padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase' }}>
          live
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SeoStat label="Impressions" value={total.impressions.toLocaleString()} />
        <SeoStat label="Clicks" value={total.clicks.toLocaleString()} />
        <SeoStat label="Spend" value={`$${total.spent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <SeoStat label="Conversions" value={total.conversions.toLocaleString()} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 8 }}>
        CTR {ctr}% · CPC ${cpc.toFixed(2)} · {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
      </div>
      {platform.error && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--warning)', fontFamily: 'JetBrains Mono', lineHeight: 1.4 }}>
          ⚠ {platform.error}
        </div>
      )}
    </div>
  )
}

function SeoStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: 'var(--foreground)', lineHeight: 1.1, marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

export default function AnalyticsView() {
  const [businesses, setBusinesses] = useState<ApiBusiness[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [lastSim, setLastSim] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [ads, setAds] = useState<AdPlatformOverview[] | null>(null)
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsError, setAdsError] = useState('')
  const [seo, setSeo] = useState<SeoPerformance | null>(null)
  const [seoConnected, setSeoConnected] = useState<boolean | null>(null)
  const [seoError, setSeoError] = useState('')
  const [seoLoading, setSeoLoading] = useState(false)

  const loadBusinesses = async () => {
    try {
      const { businesses: list } = await fetchBusinesses()
      setBusinesses(list)
      if (list.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(list[0].id)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load businesses.')
      setLoading(false)
    }
  }

  const refresh = async (businessId: string) => {
    setError('')
    try {
      const res = await fetchAnalytics(businessId)
      setData(res)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (!selectedBusinessId) {
      setData(null)
      setLoading(false)
      return
    }
    refresh(selectedBusinessId)
    loadAdsSeo(selectedBusinessId)
    pollRef.current = setInterval(() => refresh(selectedBusinessId), POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessId])

  const loadAdsSeo = async (businessId: string) => {
    setAdsLoading(true)
    setSeoLoading(true)
    setAdsError('')
    setSeoError('')
    try {
      const [adsRes, seoRes] = await Promise.all([fetchAdsOverview(businessId), fetchSeo(businessId)])
      setAds(adsRes.platforms)
      setSeo(seoRes.seo ?? null)
      setSeoConnected(seoRes.connected)
      if (seoRes.error) setSeoError(seoRes.error)
    } catch (err) {
      setAdsError(err instanceof ApiError ? err.message : 'Failed to load ads / SEO data.')
    } finally {
      setAdsLoading(false)
      setSeoLoading(false)
    }
  }

  const handleSimulate = async (count: number) => {
    if (!selectedBusinessId) return
    setSimulating(true)
    setError('')
    try {
      const res = await simulateTraffic(selectedBusinessId, count)
      setLastSim(`Simulated ${res.visitors} visitors / ${res.events} events`)
      await refresh(selectedBusinessId)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Simulation failed.')
    } finally {
      setSimulating(false)
    }
  }

  const o = data?.overview

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)' }}>
          Real-Time Analytics
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>
            {lastUpdated && `Updated ${lastUpdated} · polls every ${POLL_INTERVAL_MS / 1000}s`}
          </span>
          <button
            onClick={() => refresh(selectedBusinessId)}
            style={{
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: '10px 14px',
              minHeight: 44,
              cursor: 'pointer',
              color: 'var(--foreground)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 13, padding: '24px 0' }}>
          <Loader2 size={16} className="spin" /> Loading analytics...
        </div>
      ) : (
        <>
          {error && (
            <div style={{ marginBottom: 16 }}>
              <ErrorBanner message={error} />
            </div>
          )}

          {businesses.length === 0 ? (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: 13,
              }}
            >
              No businesses yet. Create one from the portfolio view to start tracking.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                      color: 'var(--muted-foreground)',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Business
                  </label>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '12px 14px',
                      fontSize: 16,
                      color: 'var(--foreground)',
                      outline: 'none',
                      fontFamily: 'Outfit',
                    }}
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleSimulate(15)}
                    disabled={simulating}
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '12px 16px',
                      minHeight: 44,
                      cursor: simulating ? 'not-allowed' : 'pointer',
                      color: 'var(--foreground)',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {simulating ? <Loader2 size={13} className="spin" /> : <Zap size={13} />}
                    Simulate traffic
                  </button>
                  <button
                    onClick={() => handleSimulate(100)}
                    disabled={simulating}
                    style={{
                      background: simulating ? 'var(--muted)' : 'var(--primary)',
                      border: 'none',
                      color: '#111827',
                      padding: '12px 16px',
                      borderRadius: 3,
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: simulating ? 'not-allowed' : 'pointer',
                      fontFamily: 'Barlow Condensed',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      minHeight: 44,
                    }}
                  >
                    Traffic burst (100)
                  </button>
                </div>
              </div>

              {lastSim && (
                <div
                  style={{
                    background: 'rgba(27,122,74,0.08)',
                    border: '1px solid rgba(27,122,74,0.3)',
                    borderRadius: 3,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: 'var(--primary)',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  {lastSim} — events flow through the same ingestion API as the browser pixel.
                </div>
              )}

              {/* KPI row */}
              {o && (
                <>
                  <div
                    className="summary-strip"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}
                  >
                    <KpiCard label="Live now" value={String(o.live)} color={KPI_COLORS.live} icon={<Activity size={14} />} />
                    <KpiCard label="Pageviews (today)" value={o.todayPageviews.toLocaleString()} color={KPI_COLORS.todayPageviews} icon={<Eye size={14} />} />
                    <KpiCard label="Visitors (today)" value={o.todayVisitors.toLocaleString()} color={KPI_COLORS.todayVisitors} icon={<Users size={14} />} />
                    <KpiCard label="Sessions (30d)" value={o.sessions.toLocaleString()} color={KPI_COLORS.sessions} icon={<Timer size={14} />} />
                    <KpiCard label="Clicks (today)" value={o.clicks.toLocaleString()} color="var(--primary)" icon={<MousePointerClick size={14} />} />
                    <KpiCard label="Engagement rate" value={`${o.conversionRate}%`} color="var(--accent)" icon={<Percent size={14} />} />
                  </div>

                  <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 2 }}>
                    {/* Hourly trend */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
                      <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Traffic · last 24 hours
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.hourlyTrend}>
                          <CartesianGrid stroke="#2A2E35" strokeDasharray="3 3" />
                          <XAxis dataKey="hour" tick={{ fill: '#8B8FA3', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v: string) => v.slice(11, 16)} stroke="#2A2E35" />
                          <YAxis tick={{ fill: '#8B8FA3', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#2A2E35" />
                          <Tooltip content={<MiniTooltip />} />
                          <Line type="monotone" dataKey="events" name="Events" stroke="#1B7A4A" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#C2A77D" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Recent activity */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: 1, textTransform: 'uppercase' }}>
                        Recent activity
                      </div>
                      <div style={{ maxHeight: 268, overflowY: 'auto' }}>
                        {data.recent.length === 0 ? (
                          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
                            No events yet — run a simulation.
                          </div>
                        ) : (
                          data.recent.slice(0, 15).map((e) => (
                            <div key={e.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: e.eventType === 'form_submit' ? 'var(--accent)' : e.eventType === 'pageview' ? 'var(--primary)' : 'var(--warning)',
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, color: 'var(--foreground)' }}>{EVENT_LABELS[e.eventType] ?? e.eventType}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {e.pageUrl} · {e.timestamp}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown columns */}
                  <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                    {[
                      {
                        title: 'Top pages',
                        rows: data.topPages.map((r) => ({ label: r.page || '/', value: r.count })),
                      },
                      {
                        title: 'Referrers',
                        rows: data.referrers.map((r) => ({ label: r.referrer, value: r.count })),
                      },
                      {
                        title: 'Devices',
                        rows: data.devices.length > 0 ? data.devices.map((r) => ({ label: r.device, value: r.count })) : [{ label: 'No data yet', value: 0 }],
                      },
                    ].map((col) => {
                      const total = col.rows.reduce((s, r) => s + r.value, 0)
                      return (
                        <div key={col.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
                          <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
                            {col.title}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {col.rows.map((r) => {
                              const pct = total > 0 ? Math.round((r.value / total) * 100) : 0
                              return (
                                <div key={r.label}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.label}</span>
                                    <span style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                                      {r.value}
                                      <span style={{ color: '#555B66' }}> · {pct}%</span>
                                    </span>
                                  </div>
                                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Ads & SEO monitoring */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: 20,
                  marginTop: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span className="font-display" style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Megaphone size={16} style={{ color: 'var(--warning)' }} />
                    Ads & SEO Monitoring
                  </span>
                  <button
                    onClick={() => selectedBusinessId && loadAdsSeo(selectedBusinessId)}
                    disabled={adsLoading || seoLoading}
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '9px 14px',
                      minHeight: 40,
                      cursor: adsLoading || seoLoading ? 'not-allowed' : 'pointer',
                      color: 'var(--foreground)',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {(adsLoading || seoLoading) && <Loader2 size={13} className="spin" />}
                    Refresh live data
                  </button>
                </div>

                {adsError && (
                  <div style={{ marginBottom: 14 }}>
                    <ErrorBanner message={adsError} />
                  </div>
                )}

                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Google Ads
                </div>
                {adsLoading ? (
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 12, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={13} className="spin" /> Fetching campaigns...
                  </div>
                ) : (
                  <AdPlatformBlock platform={ads?.find((p) => p.platform === 'google') ?? null} />
                )}

                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', margin: '16px 0 10px', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Other ad networks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }} className="stack-mobile">
                  {['meta', 'tiktok', 'linkedin', 'snapchat'].map((key) => (
                    <div key={key}>
                      {adsLoading ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: '14px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>
                          Loading…
                        </div>
                      ) : (
                        <AdPlatformBlock platform={ads?.find((p) => p.platform === key) ?? null} compact />
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', margin: '16px 0 10px', letterSpacing: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Search size={13} /> Google Search Console
                </div>
                {seoLoading ? (
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 12, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={13} className="spin" /> Fetching search performance...
                  </div>
                ) : seoConnected === false ? (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: 3, padding: '14px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>
                    Not connected. Add a Google Search Console token (and site URL) under <strong>Connections</strong> to see real search impressions,
                    clicks and top queries.
                  </div>
                ) : seo ? (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{seo.siteUrl}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                        {seo.dateFrom?.slice(0, 10) ?? ''} → {seo.dateTo?.slice(0, 10) ?? ''}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }} className="stack-mobile">
                      <SeoStat label="Impressions" value={seo.impressions.toLocaleString()} />
                      <SeoStat label="Clicks" value={seo.clicks.toLocaleString()} />
                      <SeoStat label="Avg position" value={seo.position.toFixed(1)} />
                      <SeoStat label="Queries" value={String(seo.queryCount)} />
                    </div>
                    {seo.queries.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
                          Top queries
                        </div>
                        {seo.queries.slice(0, 8).map((q) => (
                          <div key={q.query} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                            <span style={{ color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
                            <span style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{q.impressions} imp</span>
                              <span>{q.clicks} clk</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                {q.position <= 5 ? <TrendingUp size={12} style={{ color: 'var(--accent)' }} /> : <TrendingDown size={12} style={{ color: 'var(--warning)' }} />}
                                pos {q.position.toFixed(1)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: '14px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}>
                    No search data returned yet.
                  </div>
                )}
                {seoError && (
                  <div style={{ marginTop: 10 }}>
                    <ErrorBanner message={seoError} />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
