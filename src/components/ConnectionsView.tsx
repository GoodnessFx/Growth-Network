import { useEffect, useState } from 'react'
import { Link2, Link2Off, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react'
import {
  ApiError,
  ApiBusiness,
  ApiConnection,
  fetchBusinesses,
  fetchConnections,
  createConnection,
  deleteConnection,
  verifyConnection,
} from '../lib/api'

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  facebook: { label: 'Facebook', color: '#1877F2' },
  instagram: { label: 'Instagram', color: '#E1306C' },
  tiktok: { label: 'TikTok', color: '#25F4EE' },
  x: { label: 'X (Twitter)', color: '#e7e9ea' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  whatsapp: { label: 'WhatsApp', color: '#25D366' },
  meta: { label: 'Meta Ads', color: '#1877F2' },
  google: { label: 'Google Ads', color: '#4285F4' },
}

const PLATFORMS = Object.keys(PLATFORM_META)

function platformLabel(p: string): string {
  return PLATFORM_META[p]?.label ?? p
}
function platformColor(p: string): string {
  return PLATFORM_META[p]?.color ?? 'var(--muted-foreground)'
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          color: 'var(--muted-foreground)',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>{hint}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: 3,
  padding: '12px 14px',
  fontSize: 16,
  color: 'var(--foreground)',
  outline: 'none',
  fontFamily: 'Outfit',
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

export default function ConnectionsView() {
  const [businesses, setBusinesses] = useState<ApiBusiness[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [connections, setConnections] = useState<ApiConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [platform, setPlatform] = useState('facebook')
  const [accessToken, setAccessToken] = useState('')
  const [accountId, setAccountId] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [busyId, setBusyId] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<Record<string, { ok: boolean; detail: string }>>({})

  const loadBusinesses = async () => {
    try {
      const { businesses: list } = await fetchBusinesses()
      setBusinesses(list)
      if (list.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(list[0].id)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load businesses.')
    } finally {
      setLoading(false)
    }
  }

  const loadConnections = async (businessId: string) => {
    setError('')
    try {
      const { connections: list } = await fetchConnections(businessId)
      setConnections(list)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load connections.')
    }
  }

  useEffect(() => {
    loadBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedBusinessId) {
      loadConnections(selectedBusinessId)
    } else {
      setConnections([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessId])

  const handleConnect = async () => {
    setSaveError('')
    if (!selectedBusinessId || !accessToken.trim()) {
      setSaveError('Enter an access token to connect this platform.')
      return
    }
    setSaving(true)
    try {
      await createConnection({
        businessId: selectedBusinessId,
        platform,
        accessToken: accessToken.trim(),
        accountId: accountId.trim() || undefined,
        refreshToken: refreshToken.trim() || undefined,
      })
      setAccessToken('')
      setAccountId('')
      setRefreshToken('')
      await loadConnections(selectedBusinessId)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to connect platform.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    setBusyId(id)
    setError('')
    try {
      await deleteConnection(id)
      setConnections((prev) => prev.filter((c) => c.id !== id))
      setVerifyResult((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to disconnect platform.')
    } finally {
      setBusyId(null)
    }
  }

  const handleVerify = async (id: string) => {
    setBusyId(id)
    setError('')
    try {
      const res = await verifyConnection(id)
      setVerifyResult((prev) => ({ ...prev, [id]: res }))
    } catch (err) {
      setVerifyResult((prev) => ({
        ...prev,
        [id]: { ok: false, detail: err instanceof ApiError ? err.message : 'Verification failed' },
      }))
    } finally {
      setBusyId(null)
    }
  }

  const connectedForSelected = connections.filter((c) => c.business_id === selectedBusinessId)

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)' }}>
          Platform Connections
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-foreground)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
          Tokens stored per business
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 13, padding: '24px 0' }}>
          <Loader2 size={16} className="spin" /> Loading connections...
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
              No businesses yet. Create one from the portfolio view to connect platforms.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {/* Business selector */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="Business">
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      style={inputStyle}
                    >
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--muted-foreground)',
                    fontFamily: 'JetBrains Mono',
                    paddingBottom: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {connectedForSelected.length} / {PLATFORMS.length} connected
                </div>
              </div>

              {/* Connect form */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
                <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Connect a platform
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="field-grid">
                  <div>
                    <Field label="Platform">
                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {platformLabel(p)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div>
                    <Field label="Access token">
                      <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={inputStyle} placeholder="Paste token" />
                    </Field>
                  </div>
                  <div>
                    <Field label="Account / page ID" hint="Required for ads sync (ad account, customer ID)">
                      <input value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle} placeholder="Optional" />
                    </Field>
                  </div>
                  <div>
                    <Field label="Refresh token" hint="Optional — ads platforms">
                      <input value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} style={inputStyle} placeholder="Optional" />
                    </Field>
                  </div>
                </div>

                {saveError && (
                  <div style={{ marginTop: 14 }}>
                    <ErrorBanner message={saveError} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>
                    Manual token entry is a placeholder for the real OAuth flow — the callback would persist tokens server-side per business.
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={saving}
                    style={{
                      background: saving ? 'var(--muted)' : 'var(--primary)',
                      border: 'none',
                      color: '#111827',
                      padding: '13px 24px',
                      borderRadius: 3,
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontFamily: 'Barlow Condensed',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      minHeight: 44,
                    }}
                  >
                    {saving ? 'CONNECTING...' : 'CONNECT'}
                  </button>
                </div>
              </div>

              {/* Connection list */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Connected accounts
                </div>
                {connectedForSelected.length === 0 ? (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
                    No platforms connected for this business yet.
                  </div>
                ) : (
                  connectedForSelected.map((conn) => {
                    const result = verifyResult[conn.id]
                    const isBusy = busyId === conn.id
                    return (
                      <div
                        key={conn.id}
                        style={{
                          padding: '14px 20px',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: platformColor(conn.platform) + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Link2 size={15} color={platformColor(conn.platform)} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{platformLabel(conn.platform)}</span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontFamily: 'JetBrains Mono',
                                  letterSpacing: 0.5,
                                  color: 'var(--accent)',
                                  background: 'rgba(5,150,105,0.1)',
                                  padding: '2px 6px',
                                  borderRadius: 2,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {conn.status}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conn.account_id ? `Account ${conn.account_id} · ` : ''}
                              {conn.access_token ? `Token ${conn.access_token.slice(0, 8)}…` : 'No token'}
                              {conn.access_token && conn.account_id ? ' · ' : ''}
                              Connected {new Date(conn.created_at.replace(' ', 'T') + 'Z').toLocaleDateString()}
                            </div>
                            {result && (
                              <div
                                style={{
                                  fontSize: 11,
                                  marginTop: 4,
                                  color: result.ok ? 'var(--accent)' : 'var(--warning)',
                                  fontFamily: 'JetBrains Mono',
                                }}
                              >
                                {result.ok ? '✓ ' : '⚠ '}
                                {result.detail}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => handleVerify(conn.id)}
                            disabled={isBusy}
                            style={{
                              background: 'var(--secondary)',
                              border: '1px solid var(--border)',
                              borderRadius: 3,
                              padding: '10px 14px',
                              minHeight: 44,
                              cursor: isBusy ? 'not-allowed' : 'pointer',
                              color: 'var(--foreground)',
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {isBusy ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
                            Verify
                          </button>
                          <button
                            onClick={() => handleDisconnect(conn.id)}
                            disabled={isBusy}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: 3,
                              padding: '10px 14px',
                              minHeight: 44,
                              cursor: isBusy ? 'not-allowed' : 'pointer',
                              color: 'var(--danger)',
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Link2Off size={13} />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
