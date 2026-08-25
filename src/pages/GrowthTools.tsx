import { useState } from 'react'
import {
  FileText, Mail, MessageSquare, TrendingUp, Search, DollarSign,
  Plus, Download, Send, Check, ArrowRight, Lightbulb,
  X, Eye, Target,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>{title}</h3>
      {action}
    </div>
  )
}

type ToolId = 'invoice' | 'email' | 'whatsapp' | 'competitor' | 'seo' | 'revenue'

// ─────────────────────────────────────────────────────────────────────────────
// Tool hub cards
// ─────────────────────────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'invoice'    as ToolId, icon: FileText,     label: 'Invoice Generator',     desc: 'Create professional invoices in seconds. Add line items, taxes, and send as PDF.',             color: '#2563eb', bg: '#eff6ff', badge: ''        },
  { id: 'email'      as ToolId, icon: Mail,          label: 'Email Campaigns',       desc: 'Write, schedule, and track email blasts to your contact list with open-rate analytics.',       color: '#7c3aed', bg: '#f5f3ff', badge: ''        },
  { id: 'whatsapp'   as ToolId, icon: MessageSquare, label: 'WhatsApp Broadcast',    desc: 'Send bulk personalised WhatsApp messages to leads or clients. Segment and schedule.',         color: '#16a34a', bg: '#f0fdf4', badge: 'Popular' },
  { id: 'competitor' as ToolId, icon: Target,        label: 'Competitor Intel',      desc: 'Track what competitors post, their pricing signals, and where you can win clients from them.', color: '#dc2626', bg: '#fef2f2', badge: 'New'     },
  { id: 'seo'        as ToolId, icon: Search,        label: 'SEO Insights',          desc: 'Get keyword ideas, page speed scores, and quick-win fixes to drive organic traffic.',          color: '#d97706', bg: '#fffbeb', badge: ''        },
  { id: 'revenue'    as ToolId, icon: TrendingUp,    label: 'Revenue Tracker',       desc: 'Log revenue by stream, set monthly targets, and visualise month-on-month growth.',             color: '#0891b2', bg: '#ecfeff', badge: ''        },
]

// ─────────────────────────────────────────────────────────────────────────────
// 1. Invoice Generator
// ─────────────────────────────────────────────────────────────────────────────
interface LineItem { desc: string; qty: number; rate: number }

function InvoiceTool() {
  const [bizName, setBizName]       = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dueDate, setDueDate]       = useState('')
  const [currency, setCurrency]     = useState('NGN')
  const [tax, setTax]               = useState(7.5)
  const [lines, setLines]           = useState<LineItem[]>([{ desc: '', qty: 1, rate: 0 }])
  const [sent, setSent]             = useState(false)

  const SYMBOLS: Record<string, string> = { NGN: '₦', GHS: '₵', KES: 'KSh', ZAR: 'R', USD: '$' }
  const sym = SYMBOLS[currency] ?? currency
  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0)
  const taxAmt   = (subtotal * tax) / 100
  const total    = subtotal + taxAmt

  const addLine = () => setLines(p => [...p, { desc: '', qty: 1, rate: 0 }])
  const upd = (i: number, f: keyof LineItem, v: string | number) =>
    setLines(p => p.map((l, idx) => idx === i ? { ...l, [f]: v } : l))
  const del = (i: number) => setLines(p => p.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="stack-mobile">
      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field-grid">
          <Field label="Your business">
            <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="GrowthNet Agency" className="gn-input" />
          </Field>
          <Field label="Currency">
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="gn-input">
              {['NGN', 'GHS', 'KES', 'ZAR', 'USD'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="field-grid">
          <Field label="Client name">
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Ltd" className="gn-input" />
          </Field>
          <Field label="Client email">
            <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@example.com" className="gn-input" />
          </Field>
        </div>
        <div className="field-grid">
          <Field label="Due date">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="gn-input" />
          </Field>
          <Field label="Tax %">
            <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} min={0} max={100} className="gn-input" />
          </Field>
        </div>

        {/* Line items */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Line items</label>
            <button onClick={addLine} className="btn btn-ghost btn-sm" style={{ gap: 4 }}><Plus size={11} /> Add row</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 28px', gap: 6, alignItems: 'center' }}>
                <input value={l.desc} onChange={e => upd(i, 'desc', e.target.value)} placeholder="Description" className="gn-input" style={{ fontSize: '13px !important' }} />
                <input type="number" value={l.qty} onChange={e => upd(i, 'qty', Number(e.target.value))} min={1} className="gn-input" style={{ textAlign: 'center', fontSize: '13px !important' }} />
                <input type="number" value={l.rate} onChange={e => upd(i, 'rate', Number(e.target.value))} min={0} placeholder="Rate" className="gn-input" style={{ fontSize: '13px !important' }} />
                <button onClick={() => del(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 2500) }} className="btn btn-accent" style={{ gap: 7 }}>
            {sent ? <><Check size={13} /> Sent!</> : <><Send size={13} /> Send invoice</>}
          </button>
          <button className="btn btn-ghost" style={{ gap: 7 }}><Download size={13} /> PDF</button>
        </div>
      </div>

      {/* Live preview */}
      <SectionCard style={{ padding: 24 }}>
        <div style={{ borderBottom: '2px solid #0f0f0e', paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e' }}>{bizName || 'Your Business'}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Bill to</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0e' }}>{clientName || '—'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{clientEmail || '—'}</div>
          </div>
          {dueDate && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Due</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0e' }}>
                {new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#f8f8f6', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', padding: '8px 12px', borderBottom: '1px solid #e8e8e4' }}>
            {['Item', 'Qty', 'Rate', 'Total'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', padding: '8px 12px', borderBottom: '1px solid #f1f0ed', fontSize: 13 }}>
              <div style={{ color: '#374151' }}>{l.desc || '—'}</div>
              <div style={{ color: '#6b7280' }}>{l.qty}</div>
              <div style={{ color: '#6b7280' }}>{sym}{l.rate.toLocaleString()}</div>
              <div style={{ fontWeight: 600, color: '#0f0f0e' }}>{sym}{(l.qty * l.rate).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          {[['Subtotal', `${sym}${subtotal.toLocaleString()}`], [`Tax (${tax}%)`, `${sym}${taxAmt.toLocaleString()}`]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', gap: 24, fontSize: 13, color: '#6b7280' }}>
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 24, fontWeight: 700, fontSize: 16, color: '#0f0f0e', borderTop: '1px solid #e8e8e4', paddingTop: 8, marginTop: 4 }}>
            <span>Total</span><span>{sym}{total.toLocaleString()}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Email Campaigns
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_CAMPAIGNS = [
  { id: '1', name: 'June Product Launch',    status: 'sent',      sent: 1240, opens: 482, clicks: 94,  date: '15 Jun 2026' },
  { id: '2', name: 'Q2 Performance Update',  status: 'sent',      sent: 880,  opens: 301, clicks: 48,  date: '30 Jun 2026' },
  { id: '3', name: 'August Promo Blast',     status: 'scheduled', sent: 0,    opens: 0,   clicks: 0,   date: '25 Aug 2026' },
  { id: '4', name: 'Client Onboarding Flow', status: 'draft',     sent: 0,    opens: 0,   clicks: 0,   date: '—' },
]

const EMAIL_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  sent:      { label: 'Sent',      bg: '#f0fdf4', color: '#16a34a' },
  scheduled: { label: 'Scheduled', bg: '#fffbeb', color: '#d97706' },
  draft:     { label: 'Draft',     bg: '#f8f8f6', color: '#6b7280' },
}

function EmailTool() {
  const [compose, setCompose] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [segment, setSegment] = useState('All contacts')
  const [flash, setFlash]     = useState('')

  const send = () => {
    setFlash('Campaign sent successfully.')
    setCompose(false)
    setSubject(''); setBody('')
    setTimeout(() => setFlash(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {flash && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
          ✓ {flash}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total sent',    value: '2,120', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Avg open rate', value: '39%',   color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Avg CTR',       value: '6.8%',  color: '#16a34a', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Compose */}
      {compose && (
        <SectionCard style={{ padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 16 }}>New campaign</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Subject">
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your June update is here 🎉" className="gn-input" />
            </Field>
            <Field label="Send to">
              <select value={segment} onChange={e => setSegment(e.target.value)} className="gn-input">
                {['All contacts', 'Active clients', 'Leads only', 'Past clients'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Body">
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="gn-input" style={{ resize: 'vertical' }} placeholder="Write your email here..." />
            </Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={send} className="btn btn-accent" style={{ gap: 7 }}><Send size={13} /> Send now</button>
              <button className="btn btn-ghost" style={{ gap: 7 }}><Eye size={13} /> Preview</button>
              <button onClick={() => setCompose(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Campaign list */}
      <SectionCard>
        <CardHeader
          title="Campaigns"
          action={
            <button onClick={() => setCompose(s => !s)} className="btn btn-accent btn-sm" style={{ gap: 6 }}>
              <Plus size={12} /> New
            </button>
          }
        />
        {EMAIL_CAMPAIGNS.map((c, i) => {
          const st = EMAIL_STATUS[c.status]
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < EMAIL_CAMPAIGNS.length - 1 ? '1px solid #f1f0ed' : 'none', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{c.date}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
              {c.status === 'sent' && (
                <div style={{ display: 'flex', gap: 20 }}>
                  {[['Sent', c.sent], ['Opens', c.opens], ['Clicks', c.clicks]].map(([l, v]) => (
                    <div key={l as string} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{(v as number).toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. WhatsApp Broadcast
// ─────────────────────────────────────────────────────────────────────────────
const WA_TEMPLATES = [
  { id: '1', name: 'New service announcement', body: "Hi {{name}}, we've just launched: {{service}}. Reply YES to learn more." },
  { id: '2', name: 'Payment reminder',         body: 'Hi {{name}}, your invoice of {{amount}} is due {{date}}. Reply for payment link.' },
  { id: '3', name: 'Referral ask',             body: "Hi {{name}}, refer a friend and earn {{reward}}. They get 10% off their first order too." },
  { id: '4', name: 'Flash offer',              body: 'Hi {{name}}, exclusive 24h offer: {{offer}}. Expires tonight at midnight. Reply CLAIM.' },
]

function WhatsAppTool() {
  const [message, setMessage] = useState('')
  const [segment, setSegment] = useState('All contacts')
  const [sent, setSent]       = useState(false)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="stack-mobile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sent && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
            ✓ Broadcast queued for delivery
          </div>
        )}
        <Field label="Send to">
          <select value={segment} onChange={e => setSegment(e.target.value)} className="gn-input">
            {['All contacts', 'Active clients', 'Leads only', 'Cold leads (30+ days)', 'Tagged: VIP'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Message</label>
            <span style={{ fontSize: 11, color: message.length > 160 ? '#d97706' : '#9ca3af' }}>{message.length}/160</span>
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="gn-input" style={{ resize: 'vertical' }} placeholder="Hi {{name}}, ..." />
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>Use {'{{name}}'} for personalisation</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000) }} className="btn btn-accent" style={{ gap: 7 }}>
            <Send size={13} /> Send now
          </button>
          <button className="btn btn-ghost" style={{ gap: 7 }}>Schedule</button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Templates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WA_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setMessage(t.body)}
              style={{ background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLElement).style.background = '#f0fdf4' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4'; (e.currentTarget as HTMLElement).style.background = '#f8f8f6' }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{t.body.slice(0, 72)}…</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Competitor Intel
// ─────────────────────────────────────────────────────────────────────────────
const COMPETITORS = [
  { name: 'BrandForge Agency',  ig: 12400, postsWk: 3, last: '2h ago',  keyword: 'branding Nigeria',          score: 72 },
  { name: 'GrowMark Digital',   ig: 8900,  postsWk: 5, last: '6h ago',  keyword: 'digital marketing Lagos',   score: 58 },
  { name: 'Pulse Creative Co.', ig: 21000, postsWk: 1, last: '1d ago',  keyword: 'creative agency Lagos',     score: 81 },
]

function CompetitorTool() {
  const [url, setUrl]       = useState('')
  const [busy, setBusy]     = useState(false)
  const [ok, setOk]         = useState(false)

  const add = () => {
    if (!url) return
    setBusy(true)
    setTimeout(() => { setBusy(false); setOk(true); setUrl(''); setTimeout(() => setOk(false), 3000) }, 1800)
  }

  const scoreColor = (s: number) => s > 75 ? '#dc2626' : s > 55 ? '#d97706' : '#16a34a'
  const scoreBg    = (s: number) => s > 75 ? '#fef2f2' : s > 55 ? '#fffbeb' : '#f0fdf4'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 12 }}>Track a competitor</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Instagram handle, website, or business name" className="gn-input" style={{ flex: 1, minWidth: 200 }} />
          <button onClick={add} disabled={!url || busy} className="btn btn-accent" style={{ gap: 7 }}>
            {busy ? 'Analysing…' : <><Plus size={13} /> Add</>}
          </button>
        </div>
        {ok && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>✓ Competitor added and queued for analysis.</p>}
      </SectionCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {COMPETITORS.map(c => (
          <SectionCard key={c.name} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f1f0ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#0f0f0e' }}>
                {c.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f0f0e' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Last active: {c.last}</div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[['IG Followers', c.ig.toLocaleString()], ['Posts/wk', c.postsWk], ['Top keyword', c.keyword]].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e' }}>{v}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: scoreBg(c.score), border: `2.5px solid ${scoreColor(c.score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px', fontFamily: "'DM Serif Display', serif", fontSize: 15, color: scoreColor(c.score) }}>
                  {c.score}
                </div>
                <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Threat</div>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SEO Insights
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORDS = [
  { kw: 'digital marketing Lagos',    vol: '8.1K/mo', diff: 'Medium', opp: 'high' },
  { kw: 'branding agency Nigeria',    vol: '4.6K/mo', diff: 'Low',    opp: 'high' },
  { kw: 'social media manager Abuja', vol: '2.3K/mo', diff: 'Low',    opp: 'high' },
  { kw: 'content creation service',   vol: '12K/mo',  diff: 'High',   opp: 'medium' },
  { kw: 'WhatsApp marketing Nigeria', vol: '3.8K/mo', diff: 'Low',    opp: 'high' },
]
const FIXES = [
  { fix: 'Add meta descriptions to 4 key pages',         impact: 'High',   effort: 'Low'    },
  { fix: 'Compress hero images — saves ~2.3s load time', impact: 'High',   effort: 'Low'    },
  { fix: 'Add H1 tag to the Services page',              impact: 'Medium', effort: 'Low'    },
  { fix: 'Create a Google Business Profile',             impact: 'High',   effort: 'Medium' },
  { fix: 'Add local business schema markup',             impact: 'Medium', effort: 'Medium' },
]

function SEOTool() {
  const [domain, setDomain] = useState('')
  const score = 64
  const ic = (v: string) => v === 'High' ? '#16a34a' : v === 'Medium' ? '#d97706' : '#6b7280'
  const icbg = (v: string) => v === 'High' ? '#f0fdf4' : v === 'Medium' ? '#fffbeb' : '#f8f8f6'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourbusiness.com" className="gn-input" style={{ flex: 1, minWidth: 200 }} />
        <button className="btn btn-accent" style={{ gap: 7 }}><Search size={13} /> Analyse</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }} className="stack-mobile">
        {/* Score */}
        <SectionCard style={{ padding: 22, textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>SEO Score</div>
          <div style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 12px', border: `6px solid ${score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'}`, background: score >= 70 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: '#0f0f0e' }}>{score}</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{score >= 70 ? 'Good — keep optimising' : 'Fair — quick wins available'}</p>
        </SectionCard>

        {/* Quick wins */}
        <SectionCard>
          <CardHeader title="Quick Wins" />
          {FIXES.map((f, i) => (
            <div key={f.fix} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < FIXES.length - 1 ? '1px solid #f1f0ed' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lightbulb size={12} color="#16a34a" />
              </div>
              <div style={{ flex: 1, fontSize: 13, color: '#374151' }}>{f.fix}</div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: icbg(f.impact), color: ic(f.impact) }}>{f.impact}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#f1f0ed', color: '#6b7280' }}>{f.effort} effort</span>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Keywords */}
      <SectionCard>
        <CardHeader title="Keyword Opportunities" action={<button className="btn btn-ghost btn-sm" style={{ gap: 5 }}><Download size={11} /> Export</button>} />
        {KEYWORDS.map((k, i) => (
          <div key={k.kw} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 90px', gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: i < KEYWORDS.length - 1 ? '1px solid #f1f0ed' : 'none', fontSize: 13 }}>
            <div style={{ fontWeight: 500, color: '#0f0f0e' }}>{k.kw}</div>
            <div style={{ color: '#6b7280' }}>{k.vol}</div>
            <div style={{ color: k.diff === 'Low' ? '#16a34a' : k.diff === 'High' ? '#dc2626' : '#d97706', fontWeight: 600, fontSize: 12 }}>{k.diff}</div>
            <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: k.opp === 'high' ? '#f0fdf4' : '#fffbeb', color: k.opp === 'high' ? '#16a34a' : '#d97706' }}>
              {k.opp === 'high' ? '↑ High' : '~ Med'}
            </span>
          </div>
        ))}
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Revenue Tracker
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const STREAMS = [
  { name: 'Retainer',      vals: [120, 120, 135, 135, 150, 150] },
  { name: 'Project work',  vals: [45,  80,  30,  90,  60,  110] },
  { name: 'Ad management', vals: [20,  25,  25,  30,  35,  40]  },
]

function RevenueTool() {
  const [target, setTarget]     = useState(500)
  const [currency, setCurrency] = useState('₦')

  const totals  = MONTHS.map((_, i) => STREAMS.reduce((s, r) => s + r.vals[i], 0))
  const maxVal  = Math.max(...totals, 1)
  const current = totals[totals.length - 1]
  const pct     = Math.min(100, Math.round((current / target) * 100))
  const mom     = totals.length >= 2 ? Math.round(((current - totals[totals.length - 2]) / totals[totals.length - 2]) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }} className="stack-mobile">
      {/* Goal card */}
      <SectionCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Monthly Target</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="gn-input" style={{ width: 72, flexShrink: 0 }}>
            {['₦', '₵', 'KSh', 'R', '$'].map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="gn-input" placeholder="500000" />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#6b7280' }}>
            <span>Progress this month</span>
            <span style={{ fontWeight: 700, color: pct >= 100 ? '#16a34a' : '#0f0f0e' }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: '#f1f0ed', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#16a34a' : pct >= 70 ? '#d97706' : '#2563eb', borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
            {currency}{current}k of {currency}{target}k target
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>By stream</div>
          {STREAMS.map(s => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f0ed', fontSize: 13 }}>
              <span style={{ color: '#374151' }}>{s.name}</span>
              <span style={{ fontWeight: 600, color: '#0f0f0e' }}>{currency}{s.vals.at(-1)}k</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bar chart */}
      <SectionCard style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Monthly Revenue</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: mom >= 0 ? '#16a34a' : '#dc2626', background: mom >= 0 ? '#f0fdf4' : '#fef2f2', padding: '3px 10px', borderRadius: 99 }}>
            {mom >= 0 ? '+' : ''}{mom}% MoM
          </span>
        </div>
        <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 10 }}>
          {totals.map((val, i) => {
            const h   = Math.round((val / maxVal) * 100)
            const last = i === totals.length - 1
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10, color: last ? '#0f0f0e' : '#9ca3af', fontWeight: last ? 700 : 400 }}>
                  {currency}{val}k
                </span>
                <div
                  title={`${currency}${val}k`}
                  style={{
                    width: '100%', height: `${h}%`, minHeight: 8,
                    background: last ? 'linear-gradient(to top, #15803d, #22c55e)' : '#f1f0ed',
                    border: last ? 'none' : '1px solid #e8e8e4',
                    borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease',
                  }}
                />
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{MONTHS[i]}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {STREAMS.map((s, i) => {
            const colors = ['#2563eb', '#16a34a', '#d97706']
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{s.name}</span>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — hub + drill-in
// ─────────────────────────────────────────────────────────────────────────────
export default function GrowthTools() {
  const [active, setActive] = useState<ToolId | null>(null)
  const tool = TOOLS.find(t => t.id === active)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1100 }}>
      {/* Back */}
      {active && (
        <button onClick={() => setActive(null)} className="btn btn-ghost btn-sm" style={{ marginBottom: 22, gap: 6 }}>
          ← All Tools
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: active ? 24 : 32 }}>
        {active ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {tool && (
              <div style={{ width: 36, height: 36, borderRadius: 9, background: tool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <tool.icon size={17} color={tool.color} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Growth Tools</p>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(22px, 3vw, 32px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {tool?.label}
              </h1>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Growth Tools
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Tools to get clients,<br />
              <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>make money, save time.</span>
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 520 }}>
              Six built-in tools any business can use today — no integrations needed.
            </p>
          </>
        )}
      </div>

      {/* Hub grid */}
      {!active && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {TOOLS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{
                  background: '#ffffff', border: '1.5px solid #e8e8e4',
                  borderRadius: 12, padding: '22px 22px',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#d0d0ca'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
              >
                {t.badge && (
                  <span style={{
                    position: 'absolute', top: 14, right: 14,
                    fontSize: 9, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                    background: t.badge === 'New' ? '#eff6ff' : t.badge === 'Popular' ? '#f0fdf4' : '#f8f8f6',
                    color: t.badge === 'New' ? '#2563eb' : t.badge === 'Popular' ? '#16a34a' : '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {t.badge}
                  </span>
                )}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={t.color} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0e', marginBottom: 6, lineHeight: 1.2 }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: t.color, marginTop: 'auto' }}>
                  Open tool <ArrowRight size={13} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Active tool */}
      {active === 'invoice'    && <InvoiceTool />}
      {active === 'email'      && <EmailTool />}
      {active === 'whatsapp'   && <WhatsAppTool />}
      {active === 'competitor' && <CompetitorTool />}
      {active === 'seo'        && <SEOTool />}
      {active === 'revenue'    && <RevenueTool />}
    </div>
  )
}
