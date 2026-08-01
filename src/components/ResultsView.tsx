import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, Pencil, RefreshCw, X } from 'lucide-react'
import {
  ApiError,
  ApiBusiness,
  ApiReport,
  fetchBusinesses,
  fetchPublicResults,
  saveSnapshot,
  SnapshotMetrics,
} from '../lib/api'

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

interface Row {
  business: ApiBusiness
  report: ApiReport | null
}

export default function ResultsView() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState<Row | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SnapshotMetrics>({
    revenueBefore: 0,
    revenueAfter: 0,
    clientsBefore: 0,
    clientsAfter: 0,
    headline: '',
    channels: [],
  })
  const [saveError, setSaveError] = useState('')
  const [savedLink, setSavedLink] = useState('')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      const { businesses } = await fetchBusinesses()
      const withReports = await Promise.all(
        businesses.map(async (business) => {
          try {
            const res = await fetchPublicResults(business.id)
            return { business, report: res.report }
          } catch {
            return { business, report: null }
          }
        }),
      )
      setRows(withReports)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load businesses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openEdit = (row: Row) => {
    const m = row.report?.metrics
    setForm({
      revenueBefore: m?.revenueBefore ?? 0,
      revenueAfter: m?.revenueAfter ?? 0,
      clientsBefore: m?.clientsBefore ?? 0,
      clientsAfter: m?.clientsAfter ?? 0,
      headline: m?.headline ?? '',
      channels: m?.channels ?? [],
    })
    setEditing(row)
    setSaveError('')
    setSavedLink('')
  }

  const handleSave = async () => {
    setSaveError('')
    if (!editing) return
    if (form.revenueBefore <= 0 || form.revenueAfter <= 0) {
      setSaveError('Revenue before and after must be greater than zero.')
      return
    }
    setSaving(true)
    try {
      await saveSnapshot(editing.business.id, form)
      setSavedLink(`${window.location.origin}/public/${editing.business.id}`)
      await load()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save snapshot.')
    } finally {
      setSaving(false)
    }
  }

  const publicUrl = (id: string) => `${window.location.origin}/public/${id}`

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)' }}>
          Public Growth Snapshots
        </span>
        <button
          onClick={load}
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
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 13, padding: '24px 0' }}>
          <Loader2 size={16} className="spin" /> Loading businesses...
        </div>
      ) : rows.length === 0 ? (
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
          No businesses yet. Create one from the portfolio view to publish a snapshot.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            className="table-grid"
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.4fr auto',
              gap: 12,
              minWidth: 640,
            }}
          >
            {['Business', 'Snapshot', 'Public link', ''].map((h) => (
              <div key={h} style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {h}
              </div>
            ))}
          </div>
          {rows.map((row) => {
            const published = row.report !== null
            const growth = row.report?.metrics
              ? ((row.report.metrics.revenueAfter - row.report.metrics.revenueBefore) / Math.max(row.report.metrics.revenueBefore, 1)) * 100
              : 0
            return (
              <div
                key={row.business.id}
                className="table-grid"
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.4fr auto',
                  gap: 12,
                  minWidth: 640,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{row.business.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{row.business.type}</div>
                </div>
                <div>
                  {published ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono',
                        color: 'var(--accent)',
                        background: 'rgba(5,150,105,0.1)',
                        padding: '3px 8px',
                        borderRadius: 2,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      Published · +{growth.toFixed(0)}%
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>Not published</span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  /public/{row.business.id.slice(0, 8)}…
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEdit(row)}
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
                    <Pencil size={13} /> Edit
                  </button>
                  <a
                    href={`/public/${row.business.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: published ? 'var(--primary)' : 'var(--secondary)',
                      border: published ? 'none' : '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '10px 14px',
                      minHeight: 44,
                      cursor: 'pointer',
                      color: published ? '#111827' : 'var(--muted-foreground)',
                      fontSize: 12,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit snapshot modal */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setEditing(null)}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              width: '100%',
              maxWidth: 560,
              padding: 28,
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
                {editing.business.name}
              </span>
              <button
                onClick={() => setEditing(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 44,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Headline (shown on the poster)">
                <input value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} style={inputStyle} placeholder="e.g. From local shop to national brand in 9 months" />
              </Field>

              <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Revenue before (₦)">
                  <input type="number" value={form.revenueBefore} onChange={(e) => setForm((f) => ({ ...f, revenueBefore: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </Field>
                <Field label="Revenue after (₦)">
                  <input type="number" value={form.revenueAfter} onChange={(e) => setForm((f) => ({ ...f, revenueAfter: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </Field>
                <Field label="Clients before">
                  <input type="number" value={form.clientsBefore} onChange={(e) => setForm((f) => ({ ...f, clientsBefore: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </Field>
                <Field label="Clients after">
                  <input type="number" value={form.clientsAfter} onChange={(e) => setForm((f) => ({ ...f, clientsAfter: parseFloat(e.target.value) || 0 }))} style={inputStyle} />
                </Field>
              </div>

              <Field label="Channels (comma separated)">
                <input
                  value={form.channels.join(', ')}
                  onChange={(e) => setForm((f) => ({ ...f, channels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                  style={inputStyle}
                  placeholder="WhatsApp, Meta Ads, SEO"
                />
              </Field>

              {saveError && <ErrorBanner message={saveError} />}

              {savedLink && (
                <div
                  style={{
                    background: 'rgba(27,122,74,0.08)',
                    border: '1px solid rgba(27,122,74,0.3)',
                    borderRadius: 3,
                    padding: '12px 14px',
                    fontSize: 12,
                    color: 'var(--primary)',
                    fontFamily: 'JetBrains Mono',
                    wordBreak: 'break-all',
                  }}
                >
                  Published — {savedLink}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => setEditing(null)}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    padding: '12px 20px',
                    minHeight: 44,
                    cursor: 'pointer',
                    color: 'var(--foreground)',
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: saving ? 'var(--muted)' : 'var(--primary)',
                    border: 'none',
                    color: '#111827',
                    padding: '12px 22px',
                    borderRadius: 3,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'Barlow Condensed',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    minHeight: 44,
                  }}
                >
                  {saving ? 'PUBLISHING...' : 'PUBLISH SNAPSHOT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
