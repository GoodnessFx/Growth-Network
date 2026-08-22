/**
 * Owner CRM — contacts, pipeline, last contact, notes, tags.
 * Vertical-aware terminology throughout.
 * DEMO DATA pattern: clearly labeled, real API can replace.
 */
import { useState } from 'react'
import { Plus, Search, Phone, Mail, Tag, Clock, ChevronRight, X, Check } from 'lucide-react'
import { getVertical } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  stage: string
  value: number
  lastContact: string
  tags: string[]
  notes: string
}

function makeDemo(stages: string[]): Contact[] {
  return [
    { id: '1', name: 'Amira Hassan',     phone: '+234 802 000 1111', email: 'amira@example.com',  stage: stages[2] ?? stages[0], value: 150000, lastContact: '2 days ago',  tags: ['VIP', 'Referral'],    notes: 'Interested in the premium package. Follow up after the holiday.' },
    { id: '2', name: 'Emeka Okonkwo',    phone: '+234 703 000 2222', email: 'emeka@corp.ng',      stage: stages[0],               value:  45000, lastContact: '8 days ago',  tags: ['Cold'],               notes: 'Called once, no response. Try WhatsApp next.' },
    { id: '3', name: 'Fatima Al-Rashid', phone: '+234 805 000 3333', email: 'fatima@retail.com',  stage: stages[3] ?? stages[0], value: 280000, lastContact: 'Yesterday',   tags: ['Active', 'Upsell'],   notes: 'Ready to expand to the second package. Schedule call.' },
    { id: '4', name: 'David Mensah',     phone: '+233 244 000 4444', email: 'david@agency.gh',    stage: stages[1] ?? stages[0], value:  90000, lastContact: '3 days ago',  tags: ['Agency'],             notes: 'Managing 3 small businesses. Good upsell potential.' },
    { id: '5', name: 'Sarah Osei',       phone: '+234 811 000 5555', email: 'sarah@logistics.ng', stage: stages[4] ?? stages[0], value: 340000, lastContact: 'Today',       tags: ['VIP', 'Long-term'],   notes: 'Best client. Never misses payment. Ask for referral.' },
  ]
}

const STAGE_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: '#eff6ff', color: '#2563eb' },
  1: { bg: '#f0fdf4', color: '#16a34a' },
  2: { bg: '#fffbeb', color: '#d97706' },
  3: { bg: '#f5f3ff', color: '#7c3aed' },
  4: { bg: '#f0fdf4', color: '#15803d' },
  5: { bg: '#f1f0ed', color: '#6b7280' },
}

export default function OwnerCRM({ business }: Props) {
  const v = getVertical(business.type)
  const [contacts, setContacts] = useState<Contact[]>(makeDemo(v.stages))
  const [selected, setSelected] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newStage, setNewStage] = useState(v.stages[0])
  const [noteText, setNoteText] = useState('')

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all' || c.stage === stageFilter
    return matchSearch && matchStage
  })

  const addContact = () => {
    if (!newName) return
    setContacts(p => [...p, {
      id: `local-${Date.now()}`, name: newName, phone: newPhone, email: newEmail,
      stage: newStage, value: 0, lastContact: 'Just now', tags: [], notes: '',
    }])
    setNewName(''); setNewPhone(''); setNewEmail(''); setShowAdd(false)
  }

  const stageIdx = (stage: string) => v.stages.indexOf(stage)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>CRM</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {v.contactsNoun} &amp; {v.leadNoun}s
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
            Demo data — add real {v.contactsNoun.toLowerCase()} to see live CRM
          </p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} className="btn btn-primary" style={{ gap: 7 }}>
          <Plus size={14} /> Add {v.contactNoun}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New {v.contactNoun}</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="gn-input" placeholder="Full name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Phone</label>
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="gn-input" placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="gn-input" placeholder="email@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Stage</label>
              <select value={newStage} onChange={e => setNewStage(e.target.value)} className="gn-input">
                {v.stages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={addContact} className="btn btn-accent" style={{ gap: 6 }}><Check size={13} /> Save</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${v.contactsNoun.toLowerCase()}…`} className="gn-input" style={{ paddingLeft: 34 }} />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="gn-input" style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All stages</option>
          {v.stages.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Main two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
        {/* Table */}
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #e8e8e4' }}>
                  {v.crmColumns.map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                  <th style={{ padding: '11px 16px', width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const si = stageIdx(c.stage)
                  const sc = STAGE_COLORS[si] ?? STAGE_COLORS[0]
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      style={{
                        borderBottom: '1px solid #f1f0ed', cursor: 'pointer',
                        background: selected?.id === c.id ? '#f0fdf4' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = '#fafaf8' }}
                      onMouseLeave={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, #e8f4ee, #c3e6cb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                            {c.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e' }}>{c.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                              <Clock size={9} /> {c.lastContact}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>
                        <div>{c.phone}</div>
                        <div style={{ color: '#9ca3af' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                          {c.stage}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>
                        {c.value > 0 ? `₦${c.value.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <ChevronRight size={14} color="#9ca3af" />
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No {v.contactsNoun.toLowerCase()} match this filter.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile panel */}
        {selected && (
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f4ee, #c3e6cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                  {selected.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#0f0f0e' }}>{selected.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{selected.stage}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {[{ icon: Phone, label: selected.phone }, { icon: Mail, label: selected.email }].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '9px 12px' }}>
                  <f.icon size={13} color="#9ca3af" />
                  {f.label || '—'}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Tag size={10} /> Tags
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selected.tags.map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 99 }}>{t}</span>)}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Notes</div>
              <textarea
                value={selected.notes}
                onChange={e => { const n = { ...selected, notes: e.target.value }; setSelected(n); setContacts(p => p.map(c => c.id === n.id ? n : c)) }}
                className="gn-input" rows={4} style={{ resize: 'vertical', fontSize: '13px !important' }}
                placeholder="Add a note about this contact…"
              />
            </div>

            {/* Stage mover */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Move stage</div>
              <select
                value={selected.stage}
                onChange={e => { const n = { ...selected, stage: e.target.value }; setSelected(n); setContacts(p => p.map(c => c.id === n.id ? n : c)) }}
                className="gn-input"
              >
                {v.stages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
