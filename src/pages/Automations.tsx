import { useState } from 'react'
import {
  Zap, Play, Pause, Plus, ChevronRight, Mail, MessageSquare,
  TrendingUp, Users, Calendar, BarChart3, Bell, ArrowRight,
  Check, Clock, AlertTriangle, Repeat, Globe, FileText,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
type AutoStatus = 'active' | 'paused' | 'draft'

interface Automation {
  id: string
  name: string
  desc: string
  trigger: string
  action: string
  status: AutoStatus
  runCount: number
  lastRun?: string
  category: string
}

interface Template {
  id: string
  name: string
  desc: string
  trigger: string
  action: string
  category: string
  icon: React.ElementType
  color: string
  popular?: boolean
}

// ── Demo data ─────────────────────────────────────────────────────────────
const ACTIVE_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Weekly Portfolio Report',
    desc: 'Sends a summary of all portfolio metrics every Monday at 8am',
    trigger: 'Every Monday at 08:00',
    action: 'Send email report',
    status: 'active',
    runCount: 24,
    lastRun: '2 days ago',
    category: 'Reporting',
  },
  {
    id: '2',
    name: 'New Lead Alert',
    desc: 'Notifies you when a new lead is added to any business pipeline',
    trigger: 'New lead created',
    action: 'Send WhatsApp + email notification',
    status: 'active',
    runCount: 87,
    lastRun: '3 hours ago',
    category: 'Leads',
  },
  {
    id: '3',
    name: 'Revenue Drop Alert',
    desc: 'Fires when a business revenue drops more than 20% month-on-month',
    trigger: 'Revenue drops > 20%',
    action: 'Create alert + email owner',
    status: 'active',
    runCount: 3,
    lastRun: '12 days ago',
    category: 'Alerts',
  },
  {
    id: '4',
    name: 'Content Schedule Reminder',
    desc: 'Reminds you 24h before a scheduled post goes live',
    trigger: '24h before scheduled post',
    action: 'Send push notification',
    status: 'paused',
    runCount: 45,
    lastRun: '5 days ago',
    category: 'Content',
  },
  {
    id: '5',
    name: 'Client Onboarding Sequence',
    desc: 'Sends 3 onboarding emails over 7 days when a client is added',
    trigger: 'New client added',
    action: 'Send email sequence (3 emails)',
    status: 'draft',
    runCount: 0,
    category: 'CRM',
  },
]

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Weekly Performance Report',
    desc: 'Auto-generate and send a portfolio summary every Monday morning.',
    trigger: 'Scheduled (weekly)',
    action: 'Generate + email report',
    category: 'Reporting',
    icon: BarChart3,
    color: '#3b82f6',
    popular: true,
  },
  {
    id: 't2',
    name: 'New Lead Notification',
    desc: 'Get instantly notified via WhatsApp and email when a lead enters the pipeline.',
    trigger: 'New lead created',
    action: 'WhatsApp + email',
    category: 'Leads',
    icon: Users,
    color: '#22c55e',
    popular: true,
  },
  {
    id: 't3',
    name: 'Revenue Milestone Alert',
    desc: 'Celebrate when a business crosses a revenue milestone you set.',
    trigger: 'Revenue threshold crossed',
    action: 'Alert + celebration post',
    category: 'Analytics',
    icon: TrendingUp,
    color: '#f59e0b',
  },
  {
    id: 't4',
    name: 'Content Post Reminder',
    desc: "Don't miss a scheduled post — get reminded 1 hour before.",
    trigger: '1h before scheduled post',
    action: 'Push notification',
    category: 'Content',
    icon: Calendar,
    color: '#ec4899',
  },
  {
    id: 't5',
    name: 'Client Onboarding Sequence',
    desc: 'Send a welcome series when a new client is added to a business.',
    trigger: 'New client created',
    action: 'Email sequence (3 emails)',
    category: 'CRM',
    icon: Mail,
    color: '#8b5cf6',
    popular: true,
  },
  {
    id: 't6',
    name: 'Inactive Lead Follow-up',
    desc: 'Auto-follow-up leads who have not moved stages in 7 days.',
    trigger: 'Lead stale for 7 days',
    action: 'Send follow-up email',
    category: 'Leads',
    icon: MessageSquare,
    color: '#06b6d4',
  },
  {
    id: 't7',
    name: 'Monthly Invoice Reminder',
    desc: 'Remind clients of unpaid invoices on a set schedule.',
    trigger: 'Invoice unpaid after 14 days',
    action: 'Send reminder email',
    category: 'Finance',
    icon: FileText,
    color: '#f97316',
  },
  {
    id: 't8',
    name: 'Social Engagement Alert',
    desc: 'Notifies you when a post exceeds your engagement threshold.',
    trigger: 'Post engagement > X',
    action: 'Alert + log to report',
    category: 'Social',
    icon: Globe,
    color: '#14b8a6',
  },
]

const CATEGORIES = ['All', 'Reporting', 'Leads', 'Analytics', 'Content', 'CRM', 'Finance', 'Social', 'Alerts']

// ── Status badge ──────────────────────────────────────────────────────────
function StatusPill({ status }: { status: AutoStatus }) {
  const map = {
    active: { label: 'Active', bg: 'var(--green-bg)', color: 'var(--green)', icon: Check },
    paused: { label: 'Paused', bg: 'var(--amber-bg)', color: 'var(--amber)', icon: Pause },
    draft:  { label: 'Draft',  bg: 'var(--bg-muted)', color: 'var(--text-muted)', icon: Clock },
  }
  const { label, bg, color, icon: Icon } = map[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={10} />
      {label}
    </span>
  )
}

// ── Builder panel ──────────────────────────────────────────────────────────
const TRIGGERS = [
  'New lead created',
  'Lead moves to stage',
  'Revenue drops > 20%',
  'Revenue crosses threshold',
  'Invoice unpaid after N days',
  'New client added',
  'Post scheduled (N hours before)',
  'Scheduled (daily/weekly/monthly)',
]

const ACTIONS = [
  'Send email notification',
  'Send WhatsApp message',
  'Send email sequence',
  'Create portfolio alert',
  'Generate and send report',
  'Send push notification',
  'Post to Slack / webhook',
  'Log to analytics',
]

function BuilderPanel({ onSave, onClose }: { onSave: (a: Partial<Automation>) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState(TRIGGERS[0])
  const [action, setAction] = useState(ACTIONS[0])
  const [desc, setDesc] = useState('')

  return (
    <div
      style={{
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        borderRadius: 12, padding: 24, marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Build custom automation
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Set a trigger, choose an action, give it a name.</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="field-grid">
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Name *
          </label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekly Report" className="gn-input" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Trigger *
          </label>
          <select value={trigger} onChange={e => setTrigger(e.target.value)} className="gn-input">
            {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Action *
          </label>
          <select value={action} onChange={e => setAction(e.target.value)} className="gn-input">
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Description
          </label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this do?" className="gn-input" />
        </div>
      </div>

      {/* Flow preview */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-muted)', borderRadius: 8, padding: '12px 16px',
          margin: '16px 0', flexWrap: 'wrap', gap: 8,
        }}
      >
        <div style={{ background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6 }}>
          When: {trigger}
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ background: 'var(--green-bg)', color: 'var(--green)', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6 }}>
          Then: {action}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { if (name) { onSave({ name, trigger, action, desc, status: 'draft', runCount: 0, category: 'Custom' }) } }}
          className="btn btn-accent"
          style={{ borderRadius: 8 }}
          disabled={!name}
        >
          <Plus size={13} /> Save automation
        </button>
        <button onClick={onClose} className="btn btn-ghost" style={{ borderRadius: 8 }}>Cancel</button>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>(ACTIVE_AUTOMATIONS)
  const [catFilter, setCatFilter] = useState('All')
  const [showBuilder, setShowBuilder] = useState(false)
  const [activeSection, setActiveSection] = useState<'active' | 'templates'>('active')

  const toggleStatus = (id: string) => {
    setAutomations(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
          : a,
      ),
    )
  }

  const saveCustom = (partial: Partial<Automation>) => {
    setAutomations(prev => [
      ...prev,
      { ...partial, id: `custom-${Date.now()}` } as Automation,
    ])
    setShowBuilder(false)
  }

  const activateTemplate = (t: Template) => {
    setAutomations(prev => [
      ...prev,
      {
        id: `tpl-${Date.now()}`,
        name: t.name,
        desc: t.desc,
        trigger: t.trigger,
        action: t.action,
        status: 'active',
        runCount: 0,
        category: t.category,
      },
    ])
  }

  const filteredTemplates = TEMPLATES.filter(
    t => catFilter === 'All' || t.category === catFilter,
  )

  const activeCount = automations.filter(a => a.status === 'active').length
  const totalRuns = automations.reduce((s, a) => s + a.runCount, 0)

  return (
    <div className="page-pad" style={{ padding: 28, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Tools &amp; Automations
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 400, color: 'var(--text-primary)',
                lineHeight: 1.1, letterSpacing: -0.02,
              }}
            >
              Automate your operations.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
              Set triggers, run actions, and let GrowthNet handle the repetitive work while you focus on growth.
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(s => !s)}
            className="btn btn-accent"
            style={{ borderRadius: 8, gap: 7 }}
          >
            <Plus size={14} /> Build automation
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Active', value: activeCount, icon: Check, color: 'var(--green)', bg: 'var(--green-bg)' },
            { label: 'Total runs', value: totalRuns, icon: Repeat, color: 'var(--blue)', bg: 'var(--blue-bg)' },
            { label: 'Templates', value: TEMPLATES.length, icon: Zap, color: 'var(--amber)', bg: 'var(--amber-bg)' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: s.bg, borderRadius: 8, padding: '10px 16px',
                }}
              >
                <Icon size={14} color={s.color} />
                <span style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Builder panel */}
      {showBuilder && (
        <BuilderPanel
          onSave={saveCustom}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-muted)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ id: 'active', label: `My Automations (${automations.length})` }, { id: 'templates', label: 'Templates' }].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            style={{
              padding: '7px 16px', borderRadius: 6,
              background: activeSection === s.id ? 'var(--surface)' : 'transparent',
              border: activeSection === s.id ? '1px solid var(--border)' : '1px solid transparent',
              color: activeSection === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── My Automations ── */}
      {activeSection === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {automations.length === 0 ? (
            <div
              style={{
                padding: '48px', textAlign: 'center',
                border: '1.5px dashed var(--border)', borderRadius: 12,
                color: 'var(--text-muted)',
              }}
            >
              <Zap size={28} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>No automations yet</p>
              <p style={{ fontSize: 13 }}>Build one above or activate a template below.</p>
            </div>
          ) : automations.map(a => (
            <div
              key={a.id}
              style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                transition: 'border-color 0.15s',
                borderLeft: `3px solid ${a.status === 'active' ? 'var(--green)' : a.status === 'paused' ? 'var(--amber)' : 'var(--border)'}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: a.status === 'active' ? 'var(--green-bg)' : 'var(--bg-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Zap size={15} color={a.status === 'active' ? 'var(--green)' : 'var(--text-muted)'} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.name}</span>
                  <StatusPill status={a.status} />
                  <span
                    style={{
                      fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                      background: 'var(--bg-muted)', padding: '2px 7px', borderRadius: 4,
                      textTransform: 'uppercase', letterSpacing: 0.4,
                    }}
                  >
                    {a.category}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>{a.desc}</p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <Bell size={10} /> Trigger: {a.trigger}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <ArrowRight size={10} /> Action: {a.action}
                  </span>
                </div>
              </div>

              {/* Stats + controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }} className="hide-xs">
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{a.runCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>runs</div>
                </div>
                {a.lastRun && (
                  <div style={{ textAlign: 'right' }} className="hide-mobile">
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} /> {a.lastRun}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toggleStatus(a.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: 6, gap: 5 }}
                  title={a.status === 'active' ? 'Pause' : 'Resume'}
                >
                  {a.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                  <span className="hide-xs">{a.status === 'active' ? 'Pause' : 'Resume'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Templates ── */}
      {activeSection === 'templates' && (
        <div>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                style={{
                  padding: '6px 14px', borderRadius: 99,
                  background: catFilter === cat ? 'var(--text-primary)' : 'var(--bg-muted)',
                  border: '1px solid transparent',
                  color: catFilter === cat ? 'var(--bg)' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            className="grid-mobile-1"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}
          >
            {filteredTemplates.map(t => {
              const Icon = t.icon
              const alreadyActive = automations.some(a => a.name === t.name)
              return (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                    borderRadius: 10, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  {t.popular && (
                    <span
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        fontSize: 9, fontWeight: 700, color: '#d97706',
                        background: '#fffbeb', border: '1px solid #fde68a',
                        padding: '2px 7px', borderRadius: 99, letterSpacing: 0.4, textTransform: 'uppercase',
                      }}
                    >
                      Popular
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: t.color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={t.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{t.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{t.category}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Bell size={10} color={t.color} />
                      <span style={{ color: 'var(--text-secondary)' }}>When:</span> {t.trigger}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <ArrowRight size={10} color={t.color} />
                      <span style={{ color: 'var(--text-secondary)' }}>Then:</span> {t.action}
                    </div>
                  </div>

                  <button
                    onClick={() => activateTemplate(t)}
                    disabled={alreadyActive}
                    className="btn btn-ghost btn-sm"
                    style={{ borderRadius: 6, width: '100%', justifyContent: 'center', marginTop: 'auto', fontWeight: 600 }}
                  >
                    {alreadyActive ? (
                      <><Check size={12} /> Activated</>
                    ) : (
                      <><Play size={12} /> Activate</>
                    )}
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
