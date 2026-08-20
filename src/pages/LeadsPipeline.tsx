import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, Mail, Phone, Globe } from 'lucide-react'

const DEMO_LEADS = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555-0101', source: 'Website', status: 'new', notes: 'Interested in full branding package', created_at: '2026-08-15T10:00:00Z' },
  { id: '2', name: 'Michael Chen', email: 'mchen@startup.io', phone: '+1 555-0202', source: 'Referral', status: 'contacted', notes: 'Needs landing page + ad creatives', created_at: '2026-08-12T09:00:00Z' },
  { id: '3', name: 'Amira Osei', email: 'amira@retailbrand.com', phone: '+1 555-0303', source: 'Instagram DM', status: 'qualified', notes: 'E-commerce store, budget $5k-10k', created_at: '2026-08-10T14:00:00Z' },
  { id: '4', name: 'David Park', email: 'dpark@techco.dev', phone: '+1 555-0404', source: 'LinkedIn', status: 'converted', notes: 'Signed for monthly retainer', created_at: '2026-08-01T11:00:00Z' },
  { id: '5', name: 'Fatima Al-Rashid', email: 'fatima@agency.sa', phone: '+966 55-1234', source: 'Cold Outreach', status: 'new', notes: 'Agency looking for white-label services', created_at: '2026-08-18T16:00:00Z' },
  { id: '6', name: 'James Wright', email: 'james@localshop.com', phone: '+1 555-0606', source: 'Google Ads', status: 'contacted', notes: 'Small business, needs social media management', created_at: '2026-08-14T08:00:00Z' },
  { id: '7', name: 'Priya Sharma', email: 'priya@fintech.in', phone: '+91 98765-43210', source: 'Website', status: 'qualified', notes: 'Fintech startup, wants AI chatbot integration', created_at: '2026-08-09T12:00:00Z' },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'NEW', bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  contacted: { label: 'CONTACTED', bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
  qualified: { label: 'QUALIFIED', bg: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' },
  converted: { label: 'CONVERTED', bg: 'rgba(5, 150, 105, 0.1)', color: 'var(--accent)' },
  lost: { label: 'LOST', bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' },
}

const PIPELINE_STAGES = ['new', 'contacted', 'qualified', 'converted']

export default function LeadsPipeline({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSource, setFormSource] = useState('Website')
  const [formNotes, setFormNotes] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
        if (business) query = query.eq('business_id', business.id)
        const { data } = await query
        if (data && data.length > 0) {
          setLeads(data)
        } else {
          setLeads(DEMO_LEADS)
        }
      } else {
        setLeads(DEMO_LEADS)
      }
    } catch {
      setLeads(DEMO_LEADS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [business])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName) return
    const newLead = {
      id: `local-${Date.now()}`,
      business_id: business?.id || 'dummy-biz-1',
      name: formName,
      email: formEmail,
      phone: formPhone,
      source: formSource,
      status: 'new',
      notes: formNotes,
      created_at: new Date().toISOString(),
    }
    setLeads(prev => [newLead, ...prev])
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormNotes('')
    setShowForm(false)
  }

  const updateStatus = (leadId: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
  }

  const counts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>
          Leads Pipeline
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            {(['pipeline', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 0.5,
                  background: viewMode === mode ? 'var(--primary)' : 'transparent',
                  color: viewMode === mode ? '#111827' : 'var(--muted-foreground)',
                  border: 'none',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 18px',
              borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, letterSpacing: 0.5
            }}
          >
            <Plus size={16} /> ADD LEAD
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>
        Track and manage leads through your sales pipeline.
      </p>

      {/* Add lead form */}
      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add New Lead</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Name</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} required
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}
                placeholder="Lead name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Email</label>
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}
                placeholder="email@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Phone</label>
              <input value={formPhone} onChange={e => setFormPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}
                placeholder="+1 555-0000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Source</label>
              <select value={formSource} onChange={e => setFormSource(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}>
                {['Website', 'Referral', 'Instagram DM', 'LinkedIn', 'Cold Outreach', 'Google Ads', 'Other'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Notes</label>
              <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, minHeight: 60, color: 'var(--foreground)', resize: 'vertical' }}
                placeholder="Any notes about this lead..." />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
              <button type="submit" style={{
                background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 24px',
                borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed'
              }}>ADD LEAD</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', padding: '10px 24px',
                borderRadius: 3, fontWeight: 600, cursor: 'pointer'
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading leads...</div>
      ) : viewMode === 'pipeline' ? (
        /* ── Kanban / Pipeline View ── */
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`, gap: 16 }}>
          {PIPELINE_STAGES.map(stage => {
            const cfg = STATUS_CONFIG[stage]
            const stageLeads = leads.filter(l => l.status === stage)
            return (
              <div key={stage} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                {/* Column header */}
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: cfg.bg,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', color: cfg.color, letterSpacing: 1 }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono', color: cfg.color }}>
                    {counts[stage]}
                  </span>
                </div>
                {/* Cards */}
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                  {stageLeads.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>No leads</div>
                  ) : stageLeads.map(lead => (
                    <div key={lead.id} style={{
                      background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, padding: 12,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: 'var(--foreground)' }}>{lead.name}</div>
                      {lead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 2 }}>
                          <Mail size={10} /> {lead.email}
                        </div>
                      )}
                      {lead.source && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                          <Globe size={10} /> {lead.source}
                        </div>
                      )}
                      {lead.notes && (
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.4 }}>
                          {lead.notes}
                        </div>
                      )}
                      {/* Move buttons */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {PIPELINE_STAGES.filter(s => s !== stage).map(s => (
                          <button key={s} onClick={() => updateStatus(lead.id, s)}
                            style={{
                              fontSize: 9, padding: '2px 6px', borderRadius: 2, cursor: 'pointer',
                              background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color,
                              border: 'none', fontFamily: 'JetBrains Mono', fontWeight: 600,
                            }}
                          >
                            → {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── List / Table View ── */
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                {['Name', 'Contact', 'Source', 'Notes', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG['new']
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>{lead.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}><Mail size={11} color="var(--muted-foreground)" /> {lead.email}</div>
                      {lead.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} color="var(--muted-foreground)" /> {lead.phone}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>{lead.source}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--muted-foreground)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.notes}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        style={{
                          padding: '4px 8px', borderRadius: 2, fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono',
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`, cursor: 'pointer',
                        }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
