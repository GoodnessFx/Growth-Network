import { useState, useEffect, useCallback } from 'react'
import {
  CalendarDays,
  Sparkles,
  Check,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../lib/AuthContext'
import {
  fetchBusinesses,
  fetchCalendarEntries,
  fetchCalendarCoverage,
  generateCalendar,
  updateCalendarEntry,
  approveCalendarEntry,
  deleteCalendarEntry,
  type ApiBusiness,
  type CalendarEntry,
  type CalendarCoverage,
} from '../lib/api'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X',
  threads: 'Threads',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  x: '#1DA1F2',
  threads: '#333333',
  tiktok: '#69C9D0',
  youtube: '#FF0000',
  pinterest: '#E60023',
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
      <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.3, color: 'var(--foreground)' }}>
        {label}
      </span>
      {action}
    </div>
  )
}

function fmtDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function EntryModal({
  entry,
  businessName,
  onClose,
  onSaved,
}: {
  entry: CalendarEntry
  businessName: string
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(entry.title ?? '')
  const [body, setBody] = useState(entry.body)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!body.trim()) {
      setError('Content cannot be empty.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateCalendarEntry(entry.id, { title: title.trim() || undefined, body })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this entry.')
    } finally {
      setSaving(false)
    }
  }

  const approve = async () => {
    setSaving(true)
    setError('')
    try {
      await updateCalendarEntry(entry.id, {
        ...(title.trim() ? { title: title.trim() } : {}),
        body,
        status: 'approved',
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not approve this entry.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    fontSize: 13,
    color: 'var(--foreground)',
    outline: 'none',
    fontFamily: 'Outfit',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: 32,
          width: '100%', maxWidth: 560,
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: 20 }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
            {entry.status === 'approved' ? 'Review entry' : 'Edit draft'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
            {businessName} · {fmtDate(entry.scheduled_date)} · slot {entry.slot} ·{' '}
            {PLATFORM_LABELS[entry.platform] ?? entry.platform}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>Headline (optional)</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short, factual hook" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>Content *</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Post body — keep to facts you can verify."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '10px 20px', borderRadius: 3, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '10px 20px', borderRadius: 3, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button onClick={approve} disabled={saving} style={{ background: 'var(--primary)', border: 'none', color: '#FFFFFF', padding: '10px 24px', borderRadius: 3, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Barlow Condensed', letterSpacing: 0.5 }}>
            {saving ? '…' : 'SAVE & APPROVE'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentCalendarView() {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const [businesses, setBusinesses] = useState<ApiBusiness[]>([])
  const [coverage, setCoverage] = useState<CalendarCoverage[]>([])
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [bizId, setBizId] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'approved'>('all')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [editing, setEditing] = useState<CalendarEntry | null>(null)

  const isOwner = user?.role === 'owner' || user?.role === 'admin'

  const refresh = useCallback(async () => {
    try {
      const [bizRes, covRes, entriesRes] = await Promise.all([
        fetchBusinesses(),
        fetchCalendarCoverage(),
        fetchCalendarEntries({
          businessId: bizId || undefined,
          status: status === 'all' ? undefined : status,
        }),
      ])
      setBusinesses(bizRes.businesses)
      setCoverage(covRes.coverage)
      setEntries(entriesRes.entries)
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Could not load the calendar.' })
    } finally {
      setLoading(false)
    }
  }, [bizId, status])

  useEffect(() => {
    refresh()
  }, [refresh])

  const runGenerate = async (businessId: string) => {
    setGenerating(true)
    setMessage(null)
    try {
      const res = await generateCalendar(businessId, 365)
      setMessage({
        kind: 'ok',
        text: `Generated ${res.created} new posts${res.failed > 0 ? ` (${res.failed} skipped)` : ''}. ${res.skippedExisting} slots already filled.`,
      })
      await refresh()
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Generation failed.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this calendar entry?')) return
    try {
      await deleteCalendarEntry(id)
      await refresh()
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Could not delete this entry.' })
    }
  }

  const businessName = (id: string) => businesses.find((b) => b.id === id)?.name ?? 'Business'

  const coverageTotal = coverage.reduce((s, c) => s + c.filledSlots, 0)

  if (!isOwner) {
    return (
      <div className="page-pad" style={{ padding: 24 }}>
        <SectionHeader label="Content Calendar" />
        <div style={{ border: '1px dashed var(--border)', borderRadius: 3, padding: '40px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
          The content calendar is an owner-only tool.
        </div>
      </div>
    )
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <SectionHeader label="Content Calendar" />

      {message && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 3,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: message.kind === 'ok' ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${message.kind === 'ok' ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.kind === 'ok' ? 'var(--accent)' : 'var(--danger)',
          }}
        >
          {message.kind === 'ok' ? <Check size={15} /> : <AlertTriangle size={15} />}
          {message.text}
        </div>
      )}

      {/* Coverage strip */}
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 24 }}>
        {[
          { label: 'Total Planned Posts', value: coverageTotal.toLocaleString(), color: 'var(--primary)' },
          { label: 'Businesses Covered', value: coverage.filter((c) => c.filledSlots > 0).length, color: 'var(--accent)' },
          { label: 'Generation Target', value: `${365} days × 3/day`, color: 'var(--warning)' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 20px' }}>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-business coverage */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 3, background: 'var(--card)', marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Coverage per business (365-day target)
          </span>
        </div>
        {coverage.length === 0 ? (
          <div style={{ padding: '20px', fontSize: 13, color: 'var(--muted-foreground)' }}>No businesses yet.</div>
        ) : (
          coverage.map((c) => {
            const pct = Math.min(100, Math.round((c.filledDays / c.totalDays) * 100))
            return (
              <div key={c.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                      {c.filledDays} of {c.totalDays} days · {c.filledSlots} posts
                    </div>
                  </div>
                  <div style={{ width: 140, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--accent)' : 'var(--primary)', borderRadius: 3 }} />
                  </div>
                  <button
                    onClick={() => runGenerate(c.id)}
                    disabled={generating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--primary)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      minHeight: 44,
                      borderRadius: 3,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: generating ? 'wait' : 'pointer',
                      fontFamily: 'Barlow Condensed',
                      letterSpacing: 0.5,
                    }}
                  >
                    <Sparkles size={13} />
                    {generating ? 'GENERATING…' : c.filledDays >= c.totalDays ? 'REGENERATE' : 'GENERATE'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={bizId}
          onChange={(e) => setBizId(e.target.value)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            padding: '10px 12px',
            fontSize: 13,
            color: 'var(--foreground)',
            outline: 'none',
            fontFamily: 'Outfit',
          }}
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {(['all', 'draft', 'approved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              background: status === s ? 'var(--secondary)' : 'transparent',
              border: `1px solid ${status === s ? 'var(--primary)40' : 'var(--border)'}`,
              borderRadius: 3,
              padding: '8px 14px',
              minHeight: 44,
              fontSize: 12,
              color: status === s ? 'var(--foreground)' : 'var(--muted-foreground)',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono',
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <button
          onClick={() => refresh()}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 3,
            padding: '8px 14px',
            minHeight: 44,
            fontSize: 12,
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono',
          }}
        >
          <RefreshCw size={13} /> REFRESH
        </button>
      </div>

      {/* Entries */}
      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>Loading calendar…</div>
      ) : entries.length === 0 ? (
        <div style={{ border: '1px dashed var(--border)', borderRadius: 3, padding: '60px 40px', textAlign: 'center' }}>
          <CalendarDays size={28} color="var(--muted-foreground)" style={{ marginBottom: 12 }} />
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 8 }}>
            No calendar entries yet.
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 auto', maxWidth: 420 }}>
            Generate a 365-day, 3-posts-per-day plan per business above. Every post is written from the
            business&apos;s real profile — no invented details — and checked against stored posts so nothing repeats.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {entries.map((entry) => {
            const plColor = PLATFORM_COLORS[entry.platform] ?? 'var(--muted-foreground)'
            return (
              <div
                key={entry.id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${entry.status === 'approved' ? 'var(--accent)' : 'var(--primary)'}`,
                  borderRadius: 3,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                        {fmtDate(entry.scheduled_date)}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'JetBrains Mono',
                          background: plColor + '20',
                          color: plColor,
                          padding: '1px 6px',
                          borderRadius: 2,
                          letterSpacing: 0.5,
                        }}
                      >
                        {PLATFORM_LABELS[entry.platform] ?? entry.platform}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {businessName(entry.business_id)}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'JetBrains Mono',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          color: entry.status === 'approved' ? 'var(--accent)' : 'var(--warning)',
                          background: entry.status === 'approved' ? 'rgba(5,150,105,0.1)' : 'rgba(245,158,11,0.1)',
                          padding: '1px 6px',
                          borderRadius: 2,
                        }}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {entry.body}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {entry.status !== 'approved' && (
                      <button
                        onClick={async () => { await approveCalendarEntry(entry.id); refresh() }}
                        title="Approve"
                        style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, width: 44, height: 44, cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(entry)}
                      title="Edit"
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, width: 44, height: 44, cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      title="Delete"
                      style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, width: 44, height: 44, cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <EntryModal
          entry={editing}
          businessName={businessName(editing.business_id)}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
