/**
 * Proposal & Contract Auto-Generator.
 * Short form → client-ready proposal + contract in under a minute.
 * Pre-filled with standard terms + GTBank account details.
 * Status tracking: sent → viewed → signed → paid.
 * Documents shareable via public link (no login required to view).
 */
import { useState } from 'react'
import { Plus, Download, Send, Check, Eye, Clock, DollarSign, FileText, X, ArrowRight } from 'lucide-react'

// ── Bank details (pre-filled per spec) ───────────────────────────────────
const BANK_DETAILS = {
  name: 'Goodness Iyamah',
  bank: 'GTBank',
  accountEnding: '7763',
}

// ── Deal type templates ───────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'website',
    label: 'Website Build',
    scopeDefault: 'Design and development of a professional business website including: homepage, about, services, contact, and a lead capture form. Mobile-responsive, fast-loading, and SEO-ready.',
    termsDefault: 'Payment: 50% upfront to begin work, 50% on delivery. Timeline: 10–14 working days from first payment. Revisions: 2 rounds included. Hosting and domain fees are additional unless agreed.',
    deliverables: ['Homepage + 4 inner pages', 'Mobile-responsive design', 'Contact/enquiry form', 'Basic SEO setup', 'Source files on handover'],
  },
  {
    id: 'pos',
    label: 'POS / Software System',
    scopeDefault: 'Supply, installation, and configuration of a point-of-sale system including hardware setup, software training, and 30 days of post-installation support.',
    termsDefault: 'Payment: 60% upfront on order confirmation, 40% on installation. Timeline: 5–7 working days from payment. Hardware warranty: 12 months. Software support: 30 days included.',
    deliverables: ['POS hardware (as specified)', 'Software installation & config', 'Staff training session (2hrs)', '30-day support window', 'User manual'],
  },
  {
    id: 'retainer',
    label: 'Monthly Retainer',
    scopeDefault: 'Ongoing digital marketing and growth support including: monthly content creation, social media management, analytics reporting, and strategy calls.',
    termsDefault: 'Billing: Monthly, invoiced on the 1st of each month. Notice period: 30 days written notice to cancel. Scope adjustments: reviewed quarterly. Payment due within 7 days of invoice.',
    deliverables: ['Monthly strategy call (1hr)', '8–12 social posts/month', 'Monthly analytics report', 'Content calendar management', 'WhatsApp support line'],
  },
]

type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'paid'

interface Proposal {
  id: string
  clientName: string
  dealType: string
  scope: string
  price: number
  currency: string
  timeline: string
  status: ProposalStatus
  createdAt: string
  shareToken: string
}

const DEMO_PROPOSALS: Proposal[] = [
  { id: '1', clientName: 'Amira Hassan', dealType: 'Website Build', scope: 'E-commerce site + blog', price: 250000, currency: '₦', timeline: '14 days', status: 'signed', createdAt: '2026-08-01', shareToken: 'tok-abc123' },
  { id: '2', clientName: 'Emeka Okonkwo', dealType: 'Monthly Retainer', scope: 'Social media + content', price: 80000, currency: '₦', timeline: 'Ongoing', status: 'viewed', createdAt: '2026-08-10', shareToken: 'tok-def456' },
  { id: '3', clientName: 'Pinnacle Global', dealType: 'Website Build', scope: 'Corporate brochure site', price: 180000, currency: '₦', timeline: '10 days', status: 'sent', createdAt: '2026-08-15', shareToken: 'tok-ghi789' },
]

const STATUS_CFG: Record<ProposalStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft:  { label: 'Draft',  color: '#9ca3af', bg: '#f8f8f6',  icon: FileText },
  sent:   { label: 'Sent',   color: '#2563eb', bg: '#eff6ff',  icon: Send },
  viewed: { label: 'Viewed', color: '#7c3aed', bg: '#f5f3ff',  icon: Eye },
  signed: { label: 'Signed', color: '#16a34a', bg: '#f0fdf4',  icon: Check },
  paid:   { label: 'Paid',   color: '#15803d', bg: '#dcfce7',  icon: DollarSign },
}

const PIPE_STEPS: ProposalStatus[] = ['draft', 'sent', 'viewed', 'signed', 'paid']

export default function ProposalGenerator() {
  const [proposals, setProposals] = useState<Proposal[]>(DEMO_PROPOSALS)
  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState<Proposal | null>(null)

  // Form state
  const [clientName, setClientName] = useState('')
  const [templateId, setTemplateId]   = useState('website')
  const [price, setPrice]             = useState('')
  const [currency, setCurrency]       = useState('₦')
  const [timeline, setTimeline]       = useState('')
  const [scope, setScope]             = useState(TEMPLATES[0].scopeDefault)

  const tpl = TEMPLATES.find(t => t.id === templateId) ?? TEMPLATES[0]

  const generate = () => {
    if (!clientName || !price) return
    const p: Proposal = {
      id: `local-${Date.now()}`,
      clientName, dealType: tpl.label,
      scope, price: Number(price.replace(/,/g, '')),
      currency, timeline: timeline || 'TBD',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      shareToken: `tok-${Math.random().toString(36).slice(2, 9)}`,
    }
    setProposals(prev => [p, ...prev])
    setPreview(p)
    setShowForm(false)
    setClientName(''); setPrice(''); setTimeline('')
  }

  const advance = (id: string) =>
    setProposals(p => p.map(x => {
      if (x.id !== id) return x
      const idx = PIPE_STEPS.indexOf(x.status)
      return idx < PIPE_STEPS.length - 1 ? { ...x, status: PIPE_STEPS[idx + 1] } : x
    }))

  const shareUrl = (token: string) => `https://growthnet.io/proposal/${token}`

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Proposal Generator
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520 }}>
              Fill a short form — get a client-ready proposal and contract in under a minute, pre-filled with your terms and GTBank details.
            </p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary" style={{ gap: 7 }}>
            <Plus size={14} /> New Proposal
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New Proposal</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
          </div>

          {/* Template picker */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Deal type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTemplateId(t.id); setScope(t.scopeDefault) }}
                  style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: templateId === t.id ? '#f0fdf4' : '#f8f8f6', border: `1.5px solid ${templateId === t.id ? '#16a34a' : '#e8e8e4'}`, color: templateId === t.id ? '#15803d' : '#374151', transition: 'all 0.15s' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Client name *</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} className="gn-input" placeholder="e.g. Amira Hassan" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 72 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="gn-input">
                  {['₦', '₵', 'KSh', 'R', '$'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Price *</label>
                <input value={price} onChange={e => setPrice(e.target.value)} className="gn-input" placeholder="250,000" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Timeline</label>
              <input value={timeline} onChange={e => setTimeline(e.target.value)} className="gn-input" placeholder="e.g. 14 days" />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Scope of work</label>
            <textarea value={scope} onChange={e => setScope(e.target.value)} className="gn-input" rows={4} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={generate} className="btn btn-primary" style={{ gap: 7 }} disabled={!clientName || !price}>
              <FileText size={13} /> Generate proposal &amp; contract
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Document preview panel */}
      {preview && (
        <div style={{ background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f0f0e', margin: '0 0 4px' }}>
                Proposal for {preview.clientName}
              </h3>
              <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>✓ Generated — ready to share</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ gap: 5 }}><Download size={12} /> PDF</button>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl(preview.shareToken)).catch(() => {}) }}
                className="btn btn-accent btn-sm" style={{ gap: 5 }}
              >
                <Send size={12} /> Copy share link
              </button>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
            </div>
          </div>

          {/* Rendered document */}
          <div style={{ background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: 28, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ borderBottom: '2px solid #0f0f0e', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e' }}>GrowthNet</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Service Proposal + Contract</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: 13 }}>
              <div><span style={{ fontWeight: 700, color: '#0f0f0e' }}>Prepared for:</span><br />{preview.clientName}</div>
              <div><span style={{ fontWeight: 700, color: '#0f0f0e' }}>Date:</span><br />{new Date(preview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div><span style={{ fontWeight: 700, color: '#0f0f0e' }}>Service:</span><br />{preview.dealType}</div>
              <div><span style={{ fontWeight: 700, color: '#0f0f0e' }}>Timeline:</span><br />{preview.timeline}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e', marginBottom: 6 }}>Scope of Work</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{preview.scope}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e', marginBottom: 6 }}>Deliverables</div>
              <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {tpl.deliverables.map(d => <li key={d} style={{ fontSize: 13, color: '#374151' }}>{d}</li>)}
              </ul>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e', marginBottom: 4 }}>Investment</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#16a34a' }}>{preview.currency}{preview.price.toLocaleString()}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e', marginBottom: 6 }}>Terms &amp; Conditions</div>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{tpl.termsDefault}</p>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e', marginBottom: 6 }}>Payment Details</div>
              <div style={{ fontSize: 13, color: '#374151' }}>
                Bank: <strong>{BANK_DETAILS.bank}</strong> · Account Name: <strong>{BANK_DETAILS.name}</strong> · Account ending: <strong>****{BANK_DETAILS.accountEnding}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposals table */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>All Proposals</h2>
        </div>
        {proposals.map((p, idx) => {
          const cfg = STATUS_CFG[p.status]
          const Icon = cfg.icon
          const stepIdx = PIPE_STEPS.indexOf(p.status)
          return (
            <div key={p.id} style={{ padding: '14px 20px', borderBottom: idx < proposals.length - 1 ? '1px solid #f1f0ed' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e' }}>{p.clientName}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.dealType} · {p.currency}{p.price.toLocaleString()} · {p.createdAt}</div>
                </div>

                {/* Pipeline dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-xs">
                  {PIPE_STEPS.map((step, i) => {
                    const done = i <= stepIdx
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? STATUS_CFG[step].bg : '#f1f0ed', border: `2px solid ${done ? STATUS_CFG[step].color : '#e8e8e4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={STATUS_CFG[step].label}>
                          {done && <Check size={9} color={STATUS_CFG[step].color} />}
                        </div>
                        {i < PIPE_STEPS.length - 1 && <div style={{ width: 14, height: 1, background: done && i < stepIdx ? cfg.color : '#e8e8e4' }} />}
                      </div>
                    )
                  })}
                </div>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                  <Icon size={10} />{cfg.label}
                </span>

                {p.status !== 'paid' && (
                  <button onClick={() => advance(p.id)} className="btn btn-ghost btn-sm" style={{ gap: 5, flexShrink: 0 }}>
                    Advance <ArrowRight size={11} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
