import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus } from 'lucide-react'

const DEMO_REQUESTS = [
  { id: '1', title: 'New Landing Page', category: 'software', description: 'Need a high-converting landing page for our summer campaign with lead capture form.', status: 'in-progress', created_at: '2026-08-01T10:00:00Z' },
  { id: '2', title: 'Logo Redesign', category: 'design', description: 'Modernize our logo to better reflect the new brand direction we discussed.', status: 'scoping', created_at: '2026-08-05T14:30:00Z' },
  { id: '3', title: 'Email Drip Campaign', category: 'automation', description: 'Set up automated welcome sequence for new subscribers, 5 emails over 14 days.', status: 'completed', created_at: '2026-07-15T09:00:00Z' },
  { id: '4', title: 'Instagram Content Package', category: 'marketing', description: '30 branded posts with captions for the next month, aligned with our tone of voice.', status: 'in-progress', created_at: '2026-08-10T11:00:00Z' },
  { id: '5', title: 'Custom CRM Integration', category: 'custom', description: 'Need a custom tool integrated with our current CRM to auto-fetch leads.', status: 'scoping', created_at: '2026-08-18T10:00:00Z' }
]

const CATEGORY_LABELS: Record<string, string> = {
  software: 'Software & Web',
  design: 'Design & Branding',
  automation: 'Automation & AI',
  operations: 'Business Operations',
  marketing: 'Growth & Marketing',
  custom: 'Custom Tool Integration',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'scoping': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
  'in-progress': { bg: 'rgba(5, 150, 105, 0.1)', color: 'var(--accent)' },
  'completed': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  'cancelled': { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' },
}

export default function ServiceRequests({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('custom')
  const [description, setDescription] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
          if (data && data.length > 0) setRequests(data)
          else setRequests(DEMO_REQUESTS)
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

    return () => {
      active = false
      if (sub) supabase.removeChannel(sub)
    }
  }, [business])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const newReq = {
      business_id: business?.id || 'dummy-biz-1',
      title,
      category,
      description,
      status: 'scoping',
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('projects').insert([newReq]).select()
      if (data && !error) setRequests(prev => [data[0], ...prev])
    } else {
      setRequests(prev => [{ id: `local-${Date.now()}`, ...newReq, created_at: new Date().toISOString() }, ...prev])
    }
    
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter)
  const counts = {
    all: requests.length,
    scoping: requests.filter(r => r.status === 'scoping').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>
          Service Requests
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 18px',
            borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, letterSpacing: 0.5
          }}
        >
          <Plus size={16} /> NEW REQUEST
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>
        Submit and track service requests, including custom integrations and tools.
      </p>

      {/* New request form */}
      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Submit New Request</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Title</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}
                placeholder="e.g. Custom CRM Integration" required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Description</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, minHeight: 80, color: 'var(--foreground)', resize: 'vertical' }}
                placeholder="Describe what you need..."
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
              <button type="submit" style={{
                background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 24px',
                borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed'
              }}>
                SUBMIT REQUEST
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', padding: '10px 24px',
                borderRadius: 3, fontWeight: 600, cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'scoping', 'in-progress', 'completed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'JetBrains Mono', letterSpacing: 0.5,
              background: statusFilter === s ? 'var(--primary)' : 'var(--secondary)',
              color: statusFilter === s ? '#111827' : 'var(--muted-foreground)',
              border: statusFilter === s ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            {s === 'all' ? 'ALL' : s.toUpperCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Request list */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>No requests match your filter.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(req => {
              const style = STATUS_STYLES[req.status] || STATUS_STYLES['scoping']
              return (
                <div key={req.id} style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--foreground)' }}>{req.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8, lineHeight: 1.5 }}>{req.description}</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {CATEGORY_LABELS[req.category] || req.category}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 2, fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono',
                    background: style.bg, color: style.color, letterSpacing: 0.5, flexShrink: 0,
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
