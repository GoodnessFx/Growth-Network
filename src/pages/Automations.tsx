import { useState } from 'react'
import {
  Zap, Play, Pause, Plus, Mail, MessageSquare,
  TrendingUp, Users, Calendar, BarChart3, Bell, ArrowRight,
  Check, Clock, AlertTriangle, Repeat, Globe, FileText, X,
} from 'lucide-react'

type AutoStatus = 'active' | 'paused' | 'draft'

interface Automation {
  id: string; name: string; desc: string; trigger: string; action: string;
  status: AutoStatus; runCount: number; lastRun?: string; category: string;
}

interface Template {
  id: string; name: string; desc: string; trigger: string; action: string;
  category: string; icon: React.ElementType; color: string; popular?: boolean;
}

const ACTIVE_AUTOMATIONS: Automation[] = [
  { id: '1', name: 'Weekly Portfolio Report',   desc: 'Sends a summary of all portfolio metrics every Monday at 8am',            trigger: 'Every Monday at 08:00', action: 'Send email report',                   status: 'active', runCount: 24, lastRun: '2 days ago',  category: 'Reporting' },
  { id: '2', name: 'New Lead Alert',             desc: 'Notifies you when a new lead is added to any business pipeline',          trigger: 'New lead created',      action: 'Send WhatsApp + email notification', status: 'active', runCount: 87, lastRun: '3 hours ago', category: 'Leads' },
  { id: '3', name: 'Revenue Drop Alert',         desc: 'Fires when a business revenue drops more than 20% month-on-month',       trigger: 'Revenue drops > 20%',   action: 'Create alert + email owner',          status: 'active', runCount: 3,  lastRun: '12 days ago', category: 'Alerts' },
  { id: '4', name: 'Content Schedule Reminder',  desc: 'Reminds you 24h before a scheduled post goes live',                      trigger: '24h before scheduled post', action: 'Send push notification',          status: 'paused', runCount: 45, lastRun: '5 days ago',  category: 'Content' },
  { id: '5', name: 'Client Onboarding Sequence', desc: 'Sends 3 onboarding emails over 7 days when a client is added',          trigger: 'New client added',      action: 'Send email sequence (3 emails)',      status: 'draft',  runCount: 0,                          category: 'CRM' },
]

const TEMPLATES: Template[] = [
  { id: 't1', name: 'Weekly Performance Report',   desc: 'Auto-generate and send a portfolio summary every Monday morning.',               trigger: 'Scheduled (weekly)',          action: 'Generate + email report',   category: 'Reporting', icon: BarChart3,     color: '#2563eb', popular: true },
  { id: 't2', name: 'New Lead Notification',       desc: 'Get instantly notified via WhatsApp and email when a lead enters the pipeline.', trigger: 'New lead created',            action: 'WhatsApp + email',          category: 'Leads',     icon: Users,        color: '#16a34a', popular: true },
  { id: 't3', name: 'Revenue Milestone Alert',     desc: 'Celebrate when a business crosses a revenue milestone you set.',                trigger: 'Revenue threshold crossed',   action: 'Alert + celebration post',  category: 'Analytics', icon: TrendingUp,   color: '#d97706' },
  { id: 't4', name: 'Content Post Reminder',       desc: "Don't miss a scheduled post — get reminded 1 hour before.",                    trigger: '1h before scheduled post',   action: 'Push notification',         category: 'Content',   icon: Calendar,     color: '#ec4899' },
  { id: 't5', name: 'Client Onboarding Sequence',  desc: 'Send a welcome series when a new client is added to a business.',               trigger: 'New client created',          action: 'Email sequence (3 emails)', category: 'CRM',       icon: Mail,         color: '#7c3aed', popular: true },
  { id: 't6', name: 'Inactive Lead Follow-up',     desc: 'Auto-follow-up leads who have not moved stages in 7 days.',                    trigger: 'Lead stale for 7 days',      action: 'Send follow-up email',      category: 'Leads',     icon: MessageSquare,color: '#0891b2' },
  { id: 't7', name: 'Monthly Invoice Reminder',    desc: 'Remind clients of unpaid invoices on a set schedule.',                         trigger: 'Invoice unpaid after 14 days',action: 'Send reminder email',      category: 'Finance',   icon: FileText,     color: '#f97316' },
  { id: 't8', name: 'Social Engagement Alert',     desc: 'Notifies you when a post exceeds your engagement threshold.',                  trigger: 'Post engagement > X',        action: 'Alert + log to report',     category: 'Social',    icon: Globe,        color: '#14b8a6' },
]

const CATS = ['All', 'Reporting', 'Leads', 'Analytics', 'Content', 'CRM', 'Finance', 'Social', 'Alerts']
const TRIGGERS = ['New lead created','Lead moves to stage','Revenue drops > 20%','Revenue crosses threshold','Invoice unpaid after N days','New client added','Post scheduled (N hours before)','Scheduled (daily/weekly/monthly)']
const ACTIONS  = ['Send email notification','Send WhatsApp message','Send email sequence','Create portfolio alert','Generate and send report','Send push notification','Post to Slack / webhook','Log to analytics']

const STATUS_CFG = {
  active: { label: 'Active', bg: '#f0fdf4', color: '#16a34a', icon: Check },
  paused: { label: 'Paused', bg: '#fffbeb', color: '#d97706', icon: Pause },
  draft:  { label: 'Draft',  bg: '#f8f8f6', color: '#9ca3af', icon: Clock },
}

function StatusPill({ status }: { status: AutoStatus }) {
  const { label, bg, color, icon: Icon } = STATUS_CFG[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={10} />{label}
    </span>
  )
}

function BuilderPanel({ onSave, onClose }: { onSave: (a: Partial<Automation>) => void; onClose: () => void }) {
  const [name, setName]       = useState('')
  const [trigger, setTrigger] = useState(TRIGGERS[0])
  const [action, setAction]   = useState(ACTIONS[0])
  const [desc, setDesc]       = useState('')

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: '0 0 3px' }}>Build custom automation</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Set a trigger, choose an action, give it a name.</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={15} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {[
          ['Name *', name, setName, 'text', 'e.g. Weekly Report'],
          ['Description', desc, setDesc, 'text', 'What does this do?'],
        ].map(([lbl, val, set, , ph]) => (
          <div key={lbl as string}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{lbl}</label>
            <input value={val as string} onChange={e => (set as any)(e.target.value)} className="gn-input" placeholder={ph as string} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Trigger *</label>
          <select value={trigger} onChange={e => setTrigger(e.target.value)} className="gn-input">
            {TRIGGERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Action *</label>
          <select value={action} onChange={e => setAction(e.target.value)} className="gn-input">
            {ACTIONS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Flow preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6 }}>When: {trigger}</div>
        <ArrowRight size={14} color="#9ca3af" />
        <div style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6 }}>Then: {action}</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { if (name) onSave({ name, trigger, action, desc, status: 'draft', runCount: 0, category: 'Custom' }) }} className="btn btn-primary btn-sm" style={{ gap: 6 }} disabled={!name}>
          <Plus size={12} /> Save automation
        </button>
        <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>(ACTIVE_AUTOMATIONS)
  const [catFilter, setCatFilter]     = useState('All')
  const [showBuilder, setShowBuilder] = useState(false)
  const [section, setSection]         = useState<'active' | 'templates'>('active')

  const toggleStatus = (id: string) => setAutomations(p => p.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a))
  const saveCustom   = (partial: Partial<Automation>) => { setAutomations(p => [...p, { ...partial, id: `custom-${Date.now()}` } as Automation]); setShowBuilder(false) }
  const activate     = (t: Template) => setAutomations(p => [...p, { id: `tpl-${Date.now()}`, name: t.name, desc: t.desc, trigger: t.trigger, action: t.action, status: 'active', runCount: 0, category: t.category }])

  const filtered     = TEMPLATES.filter(t => catFilter === 'All' || t.category === catFilter)
  const activeCount  = automations.filter(a => a.status === 'active').length
  const totalRuns    = automations.reduce((s, a) => s + a.runCount, 0)

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={13} color="#16a34a" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tools & Automations</span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Automate your operations.
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>
              Set triggers, run actions, and let GrowthNet handle the repetitive work.
            </p>
          </div>
          <button onClick={() => setShowBuilder(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Plus size={13} /> Build automation
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Active',    value: activeCount, icon: Check,  color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Total runs',value: totalRuns,   icon: Repeat, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Templates', value: TEMPLATES.length, icon: Zap, color: '#d97706', bg: '#fffbeb' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 9, background: s.bg, borderRadius: 9, padding: '9px 16px' }}>
                <Icon size={13} color={s.color} />
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {showBuilder && <BuilderPanel onSave={saveCustom} onClose={() => setShowBuilder(false)} />}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f0ed', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ id: 'active', label: `My Automations (${automations.length})` }, { id: 'templates', label: 'Templates' }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id as any)} style={{ padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: section === s.id ? 600 : 400, cursor: 'pointer', background: section === s.id ? '#fff' : 'transparent', color: section === s.id ? '#0f0f0e' : '#9ca3af', border: section === s.id ? '1.5px solid #e8e8e4' : '1.5px solid transparent', transition: 'all 0.15s', fontFamily: "'Inter', sans-serif" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* My Automations */}
      {section === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {automations.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', border: '1.5px dashed #e8e8e4', borderRadius: 12, color: '#9ca3af' }}>
              <Zap size={28} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>No automations yet</p>
              <p style={{ fontSize: 13 }}>Build one above or activate a template below.</p>
            </div>
          ) : automations.map(a => (
            <div key={a.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 10, padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderLeft: `3px solid ${a.status === 'active' ? '#16a34a' : a.status === 'paused' ? '#d97706' : '#e8e8e4'}`, transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: a.status === 'active' ? '#f0fdf4' : '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={14} color={a.status === 'active' ? '#16a34a' : '#9ca3af'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e' }}>{a.name}</span>
                  <StatusPill status={a.status} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', background: '#f1f0ed', padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.category}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, marginBottom: 5 }}>{a.desc}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}><Bell size={9} /> {a.trigger}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}><ArrowRight size={9} /> {a.action}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div className="hide-xs" style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#0f0f0e', lineHeight: 1 }}>{a.runCount}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>runs</div>
                </div>
                {a.lastRun && <div className="hide-mobile" style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {a.lastRun}</div>}
                <button onClick={() => toggleStatus(a.id)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                  {a.status === 'active' ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {section === 'templates' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {CATS.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)} style={{ padding: '6px 14px', borderRadius: 99, background: catFilter === cat ? '#0f0f0e' : '#f1f0ed', color: catFilter === cat ? '#fff' : '#6b7280', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Inter', sans-serif" }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
            {filtered.map(t => {
              const Icon = t.icon
              const done = automations.some(a => a.name === t.name)
              return (
                <div key={t.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 13, position: 'relative', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#d0d0ca' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4' }}
                >
                  {t.popular && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Popular</span>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: t.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={t.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', lineHeight: 1.2 }}>{t.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{t.category}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.65 }}>{t.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}><Bell size={9} color={t.color} /> <span style={{ color: '#374151' }}>When:</span> {t.trigger}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}><ArrowRight size={9} color={t.color} /> <span style={{ color: '#374151' }}>Then:</span> {t.action}</div>
                  </div>
                  <button onClick={() => activate(t)} disabled={done} className="btn btn-ghost btn-sm" style={{ borderRadius: 7, justifyContent: 'center', marginTop: 'auto', fontWeight: 600 }}>
                    {done ? <><Check size={11} /> Activated</> : <><Play size={11} /> Activate</>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
