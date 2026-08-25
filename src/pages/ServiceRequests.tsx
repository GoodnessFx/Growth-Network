import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, X, Clock, CheckCircle2, Circle, AlertCircle, Check } from 'lucide-react'

const DEMO = [
  { id: '1', title: 'New Landing Page',         category: 'software',   description: 'High-converting landing page for our summer campaign with lead capture form.', status: 'in-progress', created_at: '2026-08-01T10:00:00Z' },
  { id: '2', title: 'Logo Redesign',             category: 'design',     description: 'Modernize our logo to reflect the new brand direction.', status: 'scoping', created_at: '2026-08-05T14:30:00Z' },
  { id: '3', title: 'Email Drip Campaign',       category: 'automation', description: 'Automated welcome sequence for new subscribers — 5 emails over 14 days.', status: 'completed', created_at: '2026-07-15T09:00:00Z' },
  { id: '4', title: 'Instagram Content Package', category: 'marketing',  description: '30 branded posts with captions for next month, aligned with our tone.', status: 'in-progress', created_at: '2026-08-10T11:00:00Z' },
  { id: '5', title: 'Custom CRM Integration',    category: 'custom',     description: 'Custom tool to auto-fetch leads from our existing CRM.', status: 'scoping', created_at: '2026-08-18T10:00:00Z' },
]

const CATS: Record<string, string> = {
  software: 'Software & Web', design: 'Design & Branding',
  automation: 'Automation & AI', operations: 'Business Operations',
  marketing: 'Growth & Marketing', custom: 'Custom Integration',
}

type RStatus = 'scoping' | 'in-progress' | 'completed' | 'cancelled'

const STATUS: Record<RStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  scoping:      { label: 'Scoping',     bg: '#fffbeb', color: '#d97706', icon: Clock },
  'in-progress':{ label: 'In Progress', bg: '#eff6ff', color: '#2563eb', icon: Circle },
  completed:    { label: 'Done',        bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle2 },
  cancelled:    { label: 'Cancelled',   bg: '#fef2f2', color: '#dc2626', icon: AlertCircle },
}

const CAT_COLORS: Record<string, string> = {
  software: '#2563eb', design: '#ec4899', automation: '#7c3aed',
  operations: '#d97706', marketing: '#16a34a', custom: '#f97316',
}

export default function ServiceRequests({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading]   = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle]       = useState('')
  const [category, setCat]      = useState('custom')
  const [description, setDesc]  = useState('')
  const [filter, setFilter]     = useState<'all' | RStatus>('all')

  useEffect(() => {
    let active = true
    setLoading(true)
    const load = async () => {
      if (isSupabaseConfigured) {
        try {
          let q = supabase.from('projects').select('*').order('created_at', { ascending: false })
          if (business) q = q.eq('business_id', business.id)
          const { data } = await q
          if (!active) return
          setRequests(data?.length ? data : DEMO)
        } catch { if (active) setRequests(DEMO) }
      } else { setRequests(DEMO) }
      setLoading(false)
    }
    load()
    let sub: any = null
    if (isSupabaseConfigured && business) {
      sub = supabase.channel('svc-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `business_id=eq.${business.id}` }, load).subscribe()
    }
    return () => { active = false; if (sub) supabase.removeChannel(sub) }
  }, [business?.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const obj = { business_id: business?.id ?? 'dummy-biz-1', title, category, description, status: 'scoping' }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('projects').insert([obj]).select()
      if (data && !error) setRequests(p => [data[0], ...p])
    } else { setRequests(p => [{ id: `local-${Date.now()}`, ...obj, created_at: new Date().toISOString() }, ...p]) }
    setTitle(''); setDesc(''); setShowForm(false)
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const counts: Record<string, number> = {
    all: requests.length,
    scoping: requests.filter(r => r.status === 'scoping').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  const card: React.CSSProperties = { background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12 }

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Work Tracker</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>Service Requests</h1>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
          <Plus size={13} /> New Request
        </button>
      </div>

      {/* New form */}
      {showForm && (
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Submit New Request</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="gn-input" placeholder="e.g. Custom CRM Integration" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Category</label>
              <select value={category} onChange={e => setCat(e.target.value)} className="gn-input">
                {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Description</label>
              <textarea value={description} onChange={e => setDesc(e.target.value)} className="gn-input" style={{ height: 80, resize: 'vertical' }} placeholder="Describe what you need in detail…" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: 6 }}><Check size={12} /> Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'scoping', 'in-progress', 'completed'] as const).map(s => {
          const active = filter === s
          const cfg    = s !== 'all' ? STATUS[s] : null
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: active ? (cfg?.bg ?? '#f1f0ed') : '#fff', color: active ? (cfg?.color ?? '#374151') : '#6b7280', border: `1.5px solid ${active ? (cfg?.color ? cfg.color + '40' : '#e8e8e4') : '#e8e8e4'}`, transition: 'all 0.15s', fontFamily: "'Inter', sans-serif" }}>
              {s === 'all' ? 'All' : STATUS[s].label} ({counts[s]})
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13, background: '#fff', border: '1.5px dashed #e8e8e4', borderRadius: 12 }}>No requests match this filter.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(req => {
            const st     = STATUS[req.status as RStatus] ?? STATUS.scoping
            const SI     = st.icon
            const cc     = CAT_COLORS[req.category] ?? '#16a34a'
            return (
              <div key={req.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${cc}`, transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cc}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <SI size={14} color={cc} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 5, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0, lineHeight: 1.3 }}>{req.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: cc }}>{CATS[req.category] ?? req.category}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                  </div>
                  {req.description && <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.65 }}>{req.description}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
