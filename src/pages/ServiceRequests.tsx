import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, X, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const DEMO_REQUESTS = [
  { id: '1', title: 'New Landing Page', category: 'software', description: 'Need a high-converting landing page for our summer campaign with lead capture form.', status: 'in-progress', created_at: '2026-08-01T10:00:00Z' },
  { id: '2', title: 'Logo Redesign', category: 'design', description: 'Modernize our logo to better reflect the new brand direction we discussed.', status: 'scoping', created_at: '2026-08-05T14:30:00Z' },
  { id: '3', title: 'Email Drip Campaign', category: 'automation', description: 'Set up automated welcome sequence for new subscribers, 5 emails over 14 days.', status: 'completed', created_at: '2026-07-15T09:00:00Z' },
  { id: '4', title: 'Instagram Content Package', category: 'marketing', description: '30 branded posts with captions for the next month, aligned with our tone of voice.', status: 'in-progress', created_at: '2026-08-10T11:00:00Z' },
  { id: '5', title: 'Custom CRM Integration', category: 'custom', description: 'Need a custom tool integrated with our current CRM to auto-fetch leads.', status: 'scoping', created_at: '2026-08-18T10:00:00Z' },
]

const CATEGORIES: Record<string, string> = {
  software: 'Software & Web',
  design: 'Design & Branding',
  automation: 'Automation & AI',
  operations: 'Business Operations',
  marketing: 'Growth & Marketing',
  custom: 'Custom Integration',
}

type RequestStatus = 'scoping' | 'in-progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  scoping: { label: 'Scoping', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', icon: Clock },
  'in-progress': { label: 'In Progress', bg: 'rgba(139,92,246,0.08)', color: '#a78bfa', icon: Circle },
  completed: { label: 'Completed', bg: 'rgba(16,185,129,0.08)', color: '#10b981', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.08)', color: '#f87171', icon: AlertCircle },
}

const CATEGORY_COLORS: Record<string, string> = {
  software: '#3b82f6',
  design: '#ec4899',
  automation: '#8b5cf6',
  operations: '#f59e0b',
  marketing: '#10b981',
  custom: '#f97316',
}

export default function ServiceRequests({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('custom')
  const [description, setDescription] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all')

  useEffect(() => {
    let active = true
    const fetchRequests = async () => {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
          if (business) query = query.eq('business_id', business.id)
          const { data } = await query
          if (!active) return
          setRequests(data?.length ? data : DEMO_REQUESTS)
        } catch {
          if (active) setRequests(DEMO_REQUESTS)
        }
      } else {
        setRequests(DEMO_REQUESTS)
      }
      setLoading(false)
    }
    fetchRequests()
    let sub: any = null
    if (isSupabaseConfigured && business) {
      sub = supabase.channel('service-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `business_id=eq.${business.id}` }, () => fetchRequests())
        .subscribe()
    }
    return () => { active = false; if (sub) supabase.removeChannel(sub) }
  }, [business?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const newReq = { business_id: business?.id ?? 'dummy-biz-1', title, category, description, status: 'scoping' }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('projects').insert([newReq]).select()
      if (data && !error) setRequests((prev) => [data[0], ...prev])
    } else {
      setRequests((prev) => [{ id: `local-${Date.now()}`, ...newReq, created_at: new Date().toISOString() }, ...prev])
    }
    setTitle(''); setDescription(''); setShowForm(false)
  }

  const filtered = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter)
  const counts: Record<string, number> = {
    all: requests.length,
    scoping: requests.filter((r) => r.status === 'scoping').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            Work Tracker
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', margin: 0 }}>
            Service Requests
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#8b5cf6', color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: 8, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          }}
        >
          <Plus size={14} /> New Request
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Submit New Request</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="gn-input" placeholder="e.g. Custom CRM Integration" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="gn-input">
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="gn-input" style={{ height: 88, resize: 'vertical' }}
                placeholder="Describe what you need in detail..."
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                Submit Request
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#6b6b7b', border: '1px solid #1e1e24', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'scoping', 'in-progress', 'completed'] as const).map((s) => {
          const active = statusFilter === s
          const cfg = s !== 'all' ? STATUS_CONFIG[s] : null
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: active ? (cfg?.bg ?? 'rgba(139,92,246,0.1)') : 'transparent',
                color: active ? (cfg?.color ?? '#a78bfa') : '#6b6b7b',
                border: `1px solid ${active ? (cfg?.color ? cfg.color + '30' : 'rgba(139,92,246,0.3)') : '#1e1e24'}`,
                transition: 'all 0.15s',
              }}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          )
        })}
      </div>

      {/* Request list */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#6b6b7b', fontSize: 13, background: '#111114', border: '1px solid #1e1e24', borderRadius: 10 }}>
          No requests match this filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((req) => {
            const status = (STATUS_CONFIG[req.status as RequestStatus] ?? STATUS_CONFIG.scoping)
            const StatusIcon = status.icon
            const catColor = CATEGORY_COLORS[req.category] ?? '#8b5cf6'
            return (
              <div
                key={req.id}
                style={{
                  background: '#111114', border: '1px solid #1e1e24', borderRadius: 10,
                  padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  transition: 'border-color 0.15s',
                  borderLeft: `3px solid ${catColor}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2a34')}
                onMouseLeave={(e) => { (e.currentTarget.style.borderColor = '#1e1e24'); (e.currentTarget.style.borderLeftColor = catColor) }}
              >
                {/* Status icon */}
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <StatusIcon size={16} color={status.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', margin: 0, lineHeight: 1.3 }}>
                        {req.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: catColor, letterSpacing: 0.3 }}>
                          {CATEGORIES[req.category] ?? req.category}
                        </span>
                        <span style={{ fontSize: 11, color: '#3a3a50' }}>·</span>
                        <span style={{ fontSize: 11, color: '#6b6b7b' }}>
                          {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: status.bg, color: status.color, flexShrink: 0,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  {req.description && (
                    <p style={{ fontSize: 13, color: '#9090a0', margin: 0, lineHeight: 1.6 }}>
                      {req.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
