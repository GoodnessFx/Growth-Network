/**
 * Compliance & Deadline Tracker — vertical-aware deadline management.
 * Owners add deadlines; the product provides a reliable single source of truth
 * with reminders. No auto-sourced regulatory data (see PRD note).
 */
import { useState } from 'react'
import { Plus, AlertTriangle, Clock, Check, X, Calendar, Bell } from 'lucide-react'
import { getVertical } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

type DeadlineStatus = 'upcoming' | 'due-soon' | 'overdue' | 'done'

interface Deadline {
  id: string
  title: string
  type: string
  dueDate: string
  notes: string
  status: DeadlineStatus
  reminderDays: number
}

function getDemoDeadlines(v: ReturnType<typeof getVertical>): Deadline[] {
  const base = [
    { id: '1', title: `${v.deadlineTypes[0] ?? 'Annual licence renewal'}`, type: v.deadlineTypes[0] ?? 'Compliance', dueDate: '2026-09-15', notes: 'Renew through CAC portal. Certificate number on file.', status: 'due-soon' as const, reminderDays: 30 },
    { id: '2', title: `${v.deadlineTypes[1] ?? 'Tax filing — Q3'}`, type: v.deadlineTypes[1] ?? 'Tax', dueDate: '2026-10-01', notes: 'Quarterly returns. Accountant contact: Tunde 080-XXX-XXXX.', status: 'upcoming' as const, reminderDays: 14 },
    { id: '3', title: `${v.deadlineTypes[2] ?? 'Insurance renewal'}`, type: v.deadlineTypes[2] ?? 'Insurance', dueDate: '2026-08-10', notes: 'Professional indemnity policy. Contact broker one month before.', status: 'overdue' as const, reminderDays: 30 },
    { id: '4', title: `${v.deadlineTypes[3] ?? 'Annual return'}`, type: v.deadlineTypes[3] ?? 'Compliance', dueDate: '2026-07-20', notes: 'Filed on time. Confirmation receipt saved.', status: 'done' as const, reminderDays: 30 },
  ]
  return base
}

const STATUS_CFG: Record<DeadlineStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  'due-soon': { label: 'Due soon',  bg: '#fffbeb', color: '#d97706', icon: Clock },
  overdue:    { label: 'Overdue',   bg: '#fef2f2', color: '#dc2626', icon: AlertTriangle },
  upcoming:   { label: 'Upcoming',  bg: '#eff6ff', color: '#2563eb', icon: Calendar },
  done:       { label: 'Done',      bg: '#f0fdf4', color: '#16a34a', icon: Check },
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export default function ComplianceTracker({ business }: Props) {
  const v = getVertical(business.type)
  const [deadlines, setDeadlines] = useState<Deadline[]>(getDemoDeadlines(v))
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'all' | DeadlineStatus>('all')

  const [title, setTitle]         = useState('')
  const [type, setType]           = useState(v.deadlineTypes[0] ?? 'Compliance')
  const [dueDate, setDueDate]     = useState('')
  const [notes, setNotes]         = useState('')
  const [remDays, setRemDays]     = useState(14)

  const addDeadline = () => {
    if (!title || !dueDate) return
    const days = daysUntil(dueDate)
    const status: DeadlineStatus = days < 0 ? 'overdue' : days <= 14 ? 'due-soon' : 'upcoming'
    setDeadlines(p => [{
      id: `local-${Date.now()}`, title, type, dueDate, notes,
      status, reminderDays: remDays,
    }, ...p])
    setTitle(''); setNotes(''); setDueDate(''); setShowAdd(false)
  }

  const markDone = (id: string) =>
    setDeadlines(p => p.map(d => d.id === id ? { ...d, status: 'done' } : d))

  const remove = (id: string) =>
    setDeadlines(p => p.filter(d => d.id !== id))

  const filtered = filter === 'all' ? deadlines : deadlines.filter(d => d.status === filter)
  const counts = (['overdue', 'due-soon', 'upcoming', 'done'] as DeadlineStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: deadlines.filter(d => d.status === s).length }),
    {} as Record<DeadlineStatus, number>,
  )

  return (
    <div style={{ padding: '28px 28px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {v.complianceLabel ?? 'Compliance Tracker'}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Never miss a<br />
          <span style={{ fontStyle: 'italic', color: '#dc2626' }}>critical deadline.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, maxWidth: 500 }}>
          One place for every regulatory, legal, and operational deadline — with reminders before they're due.
          {v.deadlineTypes.length > 0 && ` Pre-loaded with common ${v.label} deadlines.`}
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['overdue', 'due-soon', 'upcoming', 'done'] as DeadlineStatus[]).map(s => {
          const cfg = STATUS_CFG[s]
          const Icon = cfg.icon
          return (
            <button
              key={s}
              onClick={() => setFilter(f => f === s ? 'all' : s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 9,
                background: filter === s ? cfg.bg : '#fff',
                border: `1.5px solid ${filter === s ? cfg.color + '50' : '#e8e8e4'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Icon size={12} color={cfg.color} />
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: cfg.color, lineHeight: 1 }}>{counts[s]}</span>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{cfg.label}</span>
            </button>
          )
        })}
        <button onClick={() => setShowAdd(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6, marginLeft: 'auto' }}>
          <Plus size={12} /> Add deadline
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New Deadline</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="gn-input" placeholder="e.g. NAFDAC licence renewal" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="gn-input">
                {v.deadlineTypes.map(t => <option key={t}>{t}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Due date *</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="gn-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Remind me (days before)</label>
              <select value={remDays} onChange={e => setRemDays(Number(e.target.value))} className="gn-input">
                {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d} days before</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="gn-input" rows={2} style={{ resize: 'vertical' }} placeholder="Contact details, reference numbers, links to forms…" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={addDeadline} className="btn btn-accent" style={{ gap: 6 }}><Check size={13} /> Save</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Deadline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(d => {
          const cfg = STATUS_CFG[d.status]
          const Icon = cfg.icon
          const days = daysUntil(d.dueDate)
          return (
            <div
              key={d.id}
              style={{
                background: '#fff', border: `1.5px solid ${d.status === 'overdue' ? '#fecaca' : d.status === 'due-soon' ? '#fde68a' : '#e8e8e4'}`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: 10, padding: '16px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                opacity: d.status === 'done' ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={14} color={cfg.color} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0, lineHeight: 1.3, flex: 1 }}>{d.title}</h3>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: d.notes ? 8 : 0, flexWrap: 'wrap', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ color: d.status === 'overdue' ? '#dc2626' : d.status === 'due-soon' ? '#d97706' : '#9ca3af', fontWeight: d.status === 'overdue' ? 700 : 400 }}>
                    {d.status === 'done' ? 'Completed' : d.status === 'overdue' ? `${Math.abs(days)} days overdue` : `${days} days remaining`}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={10} /> Reminder: {d.reminderDays} days before</span>
                </div>
                {d.notes && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{d.notes}</p>}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {d.status !== 'done' && (
                  <button onClick={() => markDone(d.id)} style={{ fontSize: 10, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}>
                    ✓ Done
                  </button>
                )}
                <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={13} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: 13, background: '#fff', border: '1.5px dashed #e8e8e4', borderRadius: 12 }}>
            No deadlines in this category.{' '}
            <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 600, fontSize: 13, padding: 0 }}>Add one now.</button>
          </div>
        )}
      </div>
    </div>
  )
}
