import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, Mail, Phone, Globe, X, LayoutGrid, List } from 'lucide-react'

const DEMO_LEADS = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555-0101', source: 'Website', status: 'new', notes: 'Interested in full branding package', created_at: '2026-08-15T10:00:00Z' },
  { id: '2', name: 'Michael Chen', email: 'mchen@startup.io', phone: '+1 555-0202', source: 'Referral', status: 'contacted', notes: 'Needs landing page + ad creatives', created_at: '2026-08-12T09:00:00Z' },
  { id: '3', name: 'Amira Osei', email: 'amira@retailbrand.com', phone: '+1 555-0303', source: 'Instagram DM', status: 'qualified', notes: 'E-commerce store, budget $5k-10k', created_at: '2026-08-10T14:00:00Z' },
  { id: '4', name: 'David Park', email: 'dpark@techco.dev', phone: '+1 555-0404', source: 'LinkedIn', status: 'converted', notes: 'Signed for monthly retainer', created_at: '2026-08-01T11:00:00Z' },
  { id: '5', name: 'Fatima Al-Rashid', email: 'fatima@agency.sa', phone: '+966 55-1234', source: 'Cold Outreach', status: 'new', notes: 'Agency looking for white-label services', created_at: '2026-08-18T16:00:00Z' },
  { id: '6', name: 'James Wright', email: 'james@localshop.com', phone: '+1 555-0606', source: 'Google Ads', status: 'contacted', notes: 'Small business, needs social media management', created_at: '2026-08-14T08:00:00Z' },
  { id: '7', name: 'Priya Sharma', email: 'priya@fintech.in', phone: '+91 98765-43210', source: 'Website', status: 'qualified', notes: 'Fintech startup, wants AI chatbot integration', created_at: '2026-08-09T12:00:00Z' },
]

const STAGES = ['new', 'contacted', 'qualified', 'converted'] as const
type Stage = typeof STAGES[number]

const STAGE_CONFIG: Record<Stage, { label: string; bg: string; color: string; border: string }> = {
  new: { label: 'New', bg: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  contacted: { label: 'Contacted', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  qualified: { label: 'Qualified', bg: 'rgba(168,85,247,0.08)', color: '#a855f7', border: 'rgba(168,85,247,0.2)' },
  converted: { label: 'Converted', bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STAGE_CONFIG[status as Stage] ?? STAGE_CONFIG.new
  return (
    <span
      style={{
        padding: '3px 8px', borderRadius: 4,
        fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono',
        letterSpacing: 0.5, background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label.toUpperCase()}
    </span>
  )
}

function LeadInitials({ name }: { name: string }) {
  const parts = name.split(' ').filter(Boolean).slice(0, 2)
  const initials = parts.map((p) => p[0].toUpperCase()).join('')
  return (
    <div
      style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export default function LeadsPipeline({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')

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
        setLeads(data?.length ? data : DEMO_LEADS)
      } else {
        setLeads(DEMO_LEADS)
      }
    } catch {
      setLeads(DEMO_LEADS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [business?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName) return
    const newLead = {
      id: `local-${Date.now()}`,
      business_id: business?.id ?? 'dummy',
      name: formName, email: formEmail, phone: formPhone,
      source: formSource, status: 'new', notes: formNotes,
      created_at: new Date().toISOString(),
    }
    setLeads((prev) => [newLead, ...prev])
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormNotes('')
    setShowForm(false)
  }

  const updateStatus = (id: string, status: string) =>
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))

  const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s).length }), {} as Record<string, number>)

  return (
    <div className="page-pad" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            CRM
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', margin: 0 }}>
            Leads Pipeline
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#111114', border: '1px solid #1e1e24', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                background: viewMode === 'pipeline' ? '#8b5cf6' : 'transparent',
                color: viewMode === 'pipeline' ? '#fff' : '#6b6b7b',
                border: 'none', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'background 0.15s',
              }}
            >
              <LayoutGrid size={13} /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                background: viewMode === 'list' ? '#8b5cf6' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#6b6b7b',
                border: 'none', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'background 0.15s',
              }}
            >
              <List size={13} /> List
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#8b5cf6', color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 8, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            }}
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {STAGES.map((s) => {
          const cfg = STAGE_CONFIG[s]
          return (
            <div
              key={s}
              style={{
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 8, padding: '8px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Barlow Condensed', color: cfg.color, lineHeight: 1 }}>
                {counts[s]}
              </span>
              <span style={{ fontSize: 11, color: '#6b6b7b', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Add lead form */}
      {showForm && (
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Add New Lead</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Name *</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} required className="gn-input" placeholder="Full name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Email</label>
              <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="gn-input" placeholder="email@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Phone</label>
              <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="gn-input" placeholder="+1 555-0000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Source</label>
              <select value={formSource} onChange={(e) => setFormSource(e.target.value)} className="gn-input">
                {['Website', 'Referral', 'Instagram DM', 'LinkedIn', 'Cold Outreach', 'Google Ads', 'Other'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Notes</label>
              <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="gn-input" style={{ height: 64, resize: 'vertical' }} placeholder="Any context about this lead..." />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button
                type="submit"
                style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                Add Lead
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'transparent', color: '#6b6b7b', border: '1px solid #1e1e24', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>Loading leads...</div>
      ) : viewMode === 'pipeline' ? (
        /* ── Board view ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, overflowX: 'auto' }}>
          {STAGES.map((stage) => {
            const cfg = STAGE_CONFIG[stage]
            const stageLeads = leads.filter((l) => l.status === stage)
            return (
              <div
                key={stage}
                style={{ background: '#0d0d10', border: '1px solid #1a1a20', borderRadius: 10, overflow: 'hidden', minWidth: 200 }}
              >
                <div style={{ padding: '12px 14px', background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', color: cfg.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono', color: cfg.color }}>
                    {stageLeads.length}
                  </span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120 }}>
                  {stageLeads.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#3a3a50' }}>Empty</div>
                  ) : stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        background: '#111114', border: '1px solid #1e1e24', borderRadius: 8, padding: '10px 12px',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2a34')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e24')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <LeadInitials name={lead.name} />
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#f0f0f0', lineHeight: 1.2 }}>{lead.name}</div>
                      </div>
                      {lead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b6b7b', marginBottom: 2 }}>
                          <Mail size={9} /> {lead.email}
                        </div>
                      )}
                      {lead.source && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b6b7b', marginBottom: 6 }}>
                          <Globe size={9} /> {lead.source}
                        </div>
                      )}
                      {lead.notes && (
                        <p style={{ fontSize: 10, color: '#6b6b7b', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {lead.notes}
                        </p>
                      )}
                      {/* Move buttons */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {STAGES.filter((s) => s !== stage).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(lead.id, s)}
                            style={{
                              fontSize: 9, padding: '2px 7px', borderRadius: 3, cursor: 'pointer',
                              background: STAGE_CONFIG[s].bg, color: STAGE_CONFIG[s].color,
                              border: `1px solid ${STAGE_CONFIG[s].border}`, fontFamily: 'JetBrains Mono', fontWeight: 600,
                            }}
                          >
                            → {STAGE_CONFIG[s].label}
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
        /* ── List view ── */
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a20', background: '#0d0d10' }}>
                  {['Lead', 'Contact', 'Source', 'Notes', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: '1px solid #1a1a20' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0f0f13')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LeadInitials name={lead.name} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{lead.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {lead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9090a0', marginBottom: 2 }}>
                          <Mail size={11} /> {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9090a0' }}>
                          <Phone size={11} /> {lead.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b6b7b' }}>{lead.source}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b6b7b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.notes}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        style={{
                          padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          fontFamily: 'JetBrains Mono', cursor: 'pointer',
                          background: STAGE_CONFIG[lead.status as Stage]?.bg ?? 'transparent',
                          color: STAGE_CONFIG[lead.status as Stage]?.color ?? '#f0f0f0',
                          border: `1px solid ${STAGE_CONFIG[lead.status as Stage]?.border ?? '#1e1e24'}`,
                        }}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
