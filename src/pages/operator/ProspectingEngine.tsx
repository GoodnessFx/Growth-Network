/**
 * Auto-Prospecting & Outreach Engine.
 * Input: target industry + location → ranked leads with pre-filled pitches.
 * Nothing sends automatically — every pitch goes through a review queue.
 * Logs outcomes: no response / replied / became a lead.
 */
import { useState } from 'react'
import { Search, Send, Check, X, ChevronDown, Globe, Phone, Star, Clock, MessageSquare, ArrowUpRight } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
type Outcome = 'pending' | 'sent' | 'no-response' | 'replied' | 'converted'

interface Prospect {
  id: string
  name: string
  industry: string
  location: string
  signal: string          // why they were flagged
  missingWeb: boolean
  score: number           // 0-100 conversion likelihood
  phone?: string
  pitch: string           // pre-filled personalised pitch
  status: Outcome
  sentAt?: string
}

// ── Demo prospects (generated from a "Procurement, Lagos" query) ──────────
const DEMO_PROSPECTS: Prospect[] = [
  {
    id: '1', name: 'Brightvale Procurement Ltd', industry: 'Procurement', location: 'Victoria Island, Lagos',
    signal: 'Google Maps listing with no website link', missingWeb: true, score: 91,
    phone: '+234 802 000 1001',
    pitch: "Hi, I came across Brightvale Procurement on Google Maps — you've built a solid reputation there. Quick thing I noticed: you don't have a website linked, which means you're likely losing enquiries to competitors who do. We've helped 3 similar procurement companies in Lagos get their first professional site up in under 2 weeks, and two of them reported new inbound leads within the first month. Worth a 10-minute call? I'll share exactly what we'd do for Brightvale.",
    status: 'pending',
  },
  {
    id: '2', name: 'StellarSource Trading', industry: 'Procurement', location: 'Ikeja, Lagos',
    signal: 'Instagram account active but no website', missingWeb: true, score: 83,
    phone: '+234 705 000 2002',
    pitch: "Hi, I noticed StellarSource has a great Instagram presence but no website to capture serious B2B buyers. Procurement clients often check a website before they call — if yours isn't there, they move on. We've set up simple, professional sites for trading companies in Lagos that have directly resulted in new contract enquiries. Happy to show you an example? Takes 10 minutes.",
    status: 'pending',
  },
  {
    id: '3', name: 'Pinnacle Global Supplies', industry: 'Procurement', location: 'Lekki, Lagos',
    signal: 'LinkedIn company page exists, website 404', missingWeb: true, score: 76,
    phone: '+234 810 000 3003',
    pitch: "Hi, I found Pinnacle Global Supplies on LinkedIn — impressive portfolio of clients listed there. One thing that caught my attention: your website appears to be down (404 error). That's likely costing you credibility with prospects who look you up. We can have a clean, fast site live within a week. Would it be useful to talk through what that could look like for Pinnacle?",
    status: 'sent', sentAt: '2 days ago',
  },
  {
    id: '4', name: 'Apex Procurement Services', industry: 'Procurement', location: 'Surulere, Lagos',
    signal: 'Business card shared on Facebook, no web presence', missingWeb: true, score: 68,
    phone: '+234 803 000 4004',
    pitch: "Hi, I saw Apex Procurement's contact shared on a Lagos business group. It's clear you're doing active outreach — but without a website, every person you hand a card to has nowhere to go to learn more about you. A clean one-page site can do the follow-up work for you 24/7. We've done this for other procurement businesses in Lagos — happy to send a quick example?",
    status: 'no-response', sentAt: '8 days ago',
  },
  {
    id: '5', name: 'BluePeak Sourcing Co.', industry: 'Procurement', location: 'Yaba, Lagos',
    signal: 'CAC-registered but zero online presence found', missingWeb: true, score: 61,
    phone: '+234 812 000 5005',
    pitch: "Hi, I found BluePeak Sourcing through business registrations in Lagos. It looks like you're operating without any online presence right now — no website, no social pages I could find. In procurement especially, buyers are researching suppliers online before reaching out. Getting even a basic professional site live could open up a new inbound channel for you. I'd love to show you what that could look like.",
    status: 'converted',
  },
]

const SCORE_COLOR = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#9ca3af'
const SCORE_BG    = (s: number) => s >= 80 ? '#f0fdf4' : s >= 60 ? '#fffbeb' : '#f8f8f6'

const OUTCOME_CFG: Record<Outcome, { label: string; color: string; bg: string }> = {
  pending:     { label: 'In queue',    color: '#6b7280', bg: '#f8f8f6' },
  sent:        { label: 'Sent',        color: '#2563eb', bg: '#eff6ff' },
  'no-response': { label: 'No reply', color: '#d97706', bg: '#fffbeb' },
  replied:     { label: 'Replied',     color: '#7c3aed', bg: '#f5f3ff' },
  converted:   { label: 'Converted ✓',color: '#16a34a', bg: '#f0fdf4' },
}

export default function ProspectingEngine() {
  const [prospects, setProspects] = useState<Prospect[]>(DEMO_PROSPECTS)
  const [industry, setIndustry]   = useState('Procurement')
  const [location, setLocation]   = useState('Lagos')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched]   = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [editing, setEditing]     = useState<string | null>(null)
  const [editText, setEditText]   = useState('')
  const [filter, setFilter]       = useState<'all' | Outcome>('all')

  const runSearch = () => {
    setSearching(true)
    setTimeout(() => { setSearching(false); setSearched(true) }, 1500)
  }

  const markOutcome = (id: string, outcome: Outcome) =>
    setProspects(p => p.map(x => x.id === id ? { ...x, status: outcome, sentAt: outcome === 'sent' ? 'Just now' : x.sentAt } : x))

  const startEdit = (p: Prospect) => { setEditing(p.id); setEditText(p.pitch) }
  const saveEdit = (id: string) => {
    setProspects(p => p.map(x => x.id === id ? { ...x, pitch: editText } : x))
    setEditing(null)
  }

  const waLink = (p: Prospect) =>
    `https://wa.me/${(p.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(p.pitch)}`

  const filtered = filter === 'all' ? prospects : prospects.filter(p => p.status === filter)
  const counts = Object.fromEntries(
    (['pending', 'sent', 'no-response', 'replied', 'converted'] as Outcome[]).map(s => [s, prospects.filter(p => p.status === s).length])
  ) as Record<Outcome, number>

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Prospecting Engine
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 560, lineHeight: 1.65 }}>
          Find businesses that need your help, score them by conversion likelihood, and review personalised pitches before anything goes out.
          Nothing sends automatically — every pitch is yours to approve or edit first.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginBottom: 14 }}>Find prospects</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} className="gn-input" placeholder="e.g. Procurement" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="gn-input" placeholder="e.g. Lagos" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={runSearch} disabled={searching} className="btn btn-primary" style={{ gap: 7, height: 44 }}>
              {searching ? <><div style={{ width: 14, height: 14, border: '2px solid #e8e8e4', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" /> Searching…</> : <><Search size={13} /> Find prospects</>}
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['all', 'pending', 'sent', 'replied', 'converted'] as const).map(s => {
              const cfg = s === 'all' ? { label: 'All', color: '#0f0f0e', bg: '#f1f0ed' } : OUTCOME_CFG[s]
              const count = s === 'all' ? prospects.length : counts[s]
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === s ? cfg.color + '40' : '#e8e8e4'}`, background: filter === s ? cfg.bg : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: cfg.color, lineHeight: 1 }}>{count}</span>
                  <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{cfg.label}</span>
                </button>
              )
            })}
          </div>

          {/* Prospect cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(p => {
              const isOpen = expanded === p.id
              const isEditing = editing === p.id
              const oc = OUTCOME_CFG[p.status]
              return (
                <div key={p.id} style={{ background: '#fff', border: `1.5px solid ${p.status === 'converted' ? '#bbf7d0' : '#e8e8e4'}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Summary row */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                  >
                    {/* Score badge */}
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: SCORE_BG(p.score), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: SCORE_COLOR(p.score), lineHeight: 1 }}>{p.score}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{p.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: oc.bg, color: oc.color }}>{oc.label}</span>
                        {p.missingWeb && <span style={{ fontSize: 10, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>No website</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.location} · {p.signal}</div>
                    </div>

                    {p.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }} className="hide-xs">
                        <Phone size={11} />{p.phone}
                      </div>
                    )}

                    <ChevronDown size={16} color="#9ca3af" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>

                  {/* Expanded: pitch + actions */}
                  {isOpen && (
                    <div style={{ padding: '0 18px 18px', borderTop: '1px solid #f1f0ed' }}>
                      <div style={{ paddingTop: 14, marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MessageSquare size={11} /> Pre-filled pitch
                          </label>
                          <button onClick={() => isEditing ? saveEdit(p.id) : startEdit(p)} style={{ fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}>
                            {isEditing ? <><Check size={10} style={{ marginRight: 3 }} />Save</> : 'Edit pitch'}
                          </button>
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editText} onChange={e => setEditText(e.target.value)}
                            className="gn-input" rows={6} style={{ resize: 'vertical', fontSize: '13px !important', lineHeight: 1.7 }}
                          />
                        ) : (
                          <div style={{ background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {p.pitch}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a
                          href={waLink(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markOutcome(p.id, 'sent')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          <Send size={12} /> Send via WhatsApp
                        </a>
                        <button onClick={() => markOutcome(p.id, 'replied')} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                          <Check size={11} /> Mark replied
                        </button>
                        <button onClick={() => markOutcome(p.id, 'converted')} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                          <Star size={11} /> Mark converted
                        </button>
                        <button onClick={() => markOutcome(p.id, 'no-response')} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                          <X size={11} /> No response
                        </button>
                      </div>

                      {p.sentAt && (
                        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} /> Last action: {p.sentAt}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
