import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, Mail, Phone, Globe, X, LayoutGrid, List, Check } from 'lucide-react'

const DEMO_LEADS = [
  { id: '1', name: 'Sarah Johnson',    email: 'sarah@example.com',   phone: '+1 555-0101', source: 'Website',       status: 'new',       notes: 'Interested in full branding package',           created_at: '2026-08-15T10:00:00Z' },
  { id: '2', name: 'Michael Chen',     email: 'mchen@startup.io',    phone: '+1 555-0202', source: 'Referral',      status: 'contacted', notes: 'Needs landing page + ad creatives',             created_at: '2026-08-12T09:00:00Z' },
  { id: '3', name: 'Amira Osei',       email: 'amira@retailbrand.com',phone: '+1 555-0303', source: 'Instagram DM', status: 'qualified', notes: 'E-commerce store, budget $5k–10k',              created_at: '2026-08-10T14:00:00Z' },
  { id: '4', name: 'David Park',       email: 'dpark@techco.dev',    phone: '+1 555-0404', source: 'LinkedIn',      status: 'converted', notes: 'Signed for monthly retainer',                   created_at: '2026-08-01T11:00:00Z' },
  { id: '5', name: 'Fatima Al-Rashid', email: 'fatima@agency.sa',    phone: '+966 55-1234', source: 'Cold Outreach',status: 'new',       notes: 'Agency looking for white-label services',       created_at: '2026-08-18T16:00:00Z' },
  { id: '6', name: 'James Wright',     email: 'james@localshop.com', phone: '+1 555-0606', source: 'Google Ads',   status: 'contacted', notes: 'Small business, needs social media management', created_at: '2026-08-14T08:00:00Z' },
  { id: '7', name: 'Priya Sharma',     email: 'priya@fintech.in',    phone: '+91 98765-43210', source: 'Website',   status: 'qualified', notes: 'Fintech startup, wants AI chatbot integration',  created_at: '2026-08-09T12:00:00Z' },
]

const STAGES = ['new', 'contacted', 'qualified', 'converted'] as const
type Stage = typeof STAGES[number]

const STAGE_CFG: Record<Stage, { label: string; bg: string; color: string; border: string }> = {
  new:       { label: 'New',       bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  contacted: { label: 'Contacted', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  qualified: { label: 'Qualified', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  converted: { label: 'Converted', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
}

function Initials({ name }: { name: string }) {
  const ini = name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f4ee, #c3e6cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
      {ini}
    </div>
  )
}

export default function LeadsPipeline({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading]     = useState(true)
  const [leads, setLeads]         = useState<any[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [viewMode, setViewMode]   = useState<'pipeline' | 'list'>('pipeline')
  const [formName, setFormName]   = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSource, setFormSource] = useState('Website')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    setLoading(true)
    if (isSupabaseConfigured) {
      let q = supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (business) q = q.eq('business_id', business.id)
      q.then(({ data }) => setLeads(data?.length ? data : DEMO_LEADS)).catch(() => setLeads(DEMO_LEADS)).finally(() => setLoading(false))
    } else { setLeads(DEMO_LEADS); setLoading(false) }
  }, [business?.id])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName) return
    setLeads(p => [{ id: `local-${Date.now()}`, business_id: business?.id ?? 'dummy', name: formName, email: formEmail, phone: formPhone, source: formSource, status: 'new', notes: formNotes, created_at: new Date().toISOString() }, ...p])
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormNotes(''); setShowForm(false)
  }

  const move = (id: string, status: string) => setLeads(p => p.map(l => l.id === id ? { ...l, status } : l))
  const counts = STAGES.reduce((a, s) => ({ ...a, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>)

  const card: React.CSSProperties = { background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12 }

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>CRM</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>Leads Pipeline</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
            {[{ mode: 'pipeline', Icon: LayoutGrid, label: 'Board' }, { mode: 'list', Icon: List, label: 'List' }].map(({ mode, Icon, label }) => (
              <button key={mode} onClick={() => setViewMode(mode as any)} style={{ padding: '7px 14px', fontSize: 12, cursor: 'pointer', background: viewMode === mode ? '#0f0f0e' : 'transparent', color: viewMode === mode ? '#fff' : '#6b7280', border: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Plus size={13} /> Add Lead
          </button>
        </div>
      </div>

      {/* Stage summary */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {STAGES.map(s => {
          const cfg = STAGE_CFG[s]
          return (
            <div key={s} style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 9, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: cfg.color, lineHeight: 1 }}>{counts[s]}</span>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Add New Lead</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Name *', formName, setFormName, 'Full name', 'text'], ['Email', formEmail, setFormEmail, 'email@example.com', 'email'], ['Phone', formPhone, setFormPhone, '+234 800 000 0000', 'text']].map(([lbl, val, set, ph, type]) => (
              <div key={lbl as string}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{lbl}</label>
                <input value={val as string} onChange={e => (set as any)(e.target.value)} type={type as string} className="gn-input" placeholder={ph as string} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Source</label>
              <select value={formSource} onChange={e => setFormSource(e.target.value)} className="gn-input">
                {['Website','Referral','Instagram DM','LinkedIn','Cold Outreach','Google Ads','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Notes</label>
              <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} className="gn-input" style={{ height: 64, resize: 'vertical' }} placeholder="Any context about this lead…" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: 6 }}><Check size={12} /> Add Lead</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading leads…</div>
      ) : viewMode === 'pipeline' ? (
        /* ── Board ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, overflowX: 'auto' }}>
          {STAGES.map(stage => {
            const cfg = STAGE_CFG[stage]
            const stageLeads = leads.filter(l => l.status === stage)
            return (
              <div key={stage} style={{ background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden', minWidth: 200 }}>
                <div style={{ padding: '11px 14px', background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: cfg.color }}>{stageLeads.length}</span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 7, minHeight: 120 }}>
                  {stageLeads.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#d1d5db' }}>Empty</div>
                  ) : stageLeads.map(lead => (
                    <div key={lead.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 9, padding: '10px 12px', transition: 'box-shadow 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Initials name={lead.name} />
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#0f0f0e', lineHeight: 1.2 }}>{lead.name}</div>
                      </div>
                      {lead.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280', marginBottom: 2 }}><Mail size={9} /> {lead.email}</div>}
                      {lead.source && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280', marginBottom: 6 }}><Globe size={9} /> {lead.source}</div>}
                      {lead.notes && <p style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lead.notes}</p>}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {STAGES.filter(s => s !== stage).map(s => (
                          <button key={s} onClick={() => move(lead.id, s)} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer', background: STAGE_CFG[s].bg, color: STAGE_CFG[s].color, border: `1px solid ${STAGE_CFG[s].border}`, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                            → {STAGE_CFG[s].label}
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
        /* ── List ── */
        <div style={{ ...card, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #e8e8e4' }}>
                  {['Lead', 'Contact', 'Source', 'Notes', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f1f0ed' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Initials name={lead.name} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>{lead.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {lead.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280', marginBottom: 2 }}><Mail size={10} /> {lead.email}</div>}
                      {lead.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}><Phone size={10} /> {lead.phone}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{lead.source}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.notes}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={lead.status} onChange={e => move(lead.id, e.target.value)} style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: STAGE_CFG[lead.status as Stage]?.bg ?? '#f8f8f6', color: STAGE_CFG[lead.status as Stage]?.color ?? '#374151', border: `1px solid ${STAGE_CFG[lead.status as Stage]?.border ?? '#e8e8e4'}`, fontFamily: "'Inter', sans-serif" }}>
                        {STAGES.map(s => <option key={s} value={s}>{STAGE_CFG[s].label}</option>)}
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
