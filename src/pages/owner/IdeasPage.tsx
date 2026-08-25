/**
 * Ideas & Automation Suggestions — concrete numbered suggestions tied to
 * the business's actual data (demo data pattern, clearly labeled).
 */
import { useState } from 'react'
import { Lightbulb, Zap, TrendingUp, DollarSign, Users, ArrowRight, Check, Clock } from 'lucide-react'
import { getVertical } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
  onNavigate: (tab: string) => void
}

type IdeaCategory = 'all' | 'revenue' | 'automation' | 'clients' | 'savings'

interface Idea {
  id: string
  title: string
  why: string
  category: IdeaCategory
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  action?: string
  actionTab?: string
  dataSignal: string
}

function getIdeas(bizType: string | null | undefined): Idea[] {
  const v = getVertical(bizType)
  return [
    {
      id: '1',
      title: `Follow up ${v.leadNoun.toLowerCase()}s who went quiet after 3 days`,
      why: `You have 3 ${v.leadNoun.toLowerCase()}s who haven't heard from you in 7+ days. Businesses that follow up within 72 hours close 40% more deals.`,
      category: 'automation',
      effort: 'low',
      impact: 'high',
      action: 'Set up auto follow-up',
      actionTab: 'automations',
      dataSignal: '3 leads inactive 7+ days (demo)',
    },
    {
      id: '2',
      title: 'Turn your top 3 clients into referral sources',
      why: `Your three longest-running ${v.clientNoun.toLowerCase()}s have been with you 6+ months. A simple referral ask (with a ₦5k thank-you) typically generates 1.5 referrals per client asked.`,
      category: 'revenue',
      effort: 'low',
      impact: 'high',
      action: 'View CRM contacts',
      actionTab: 'owner-crm',
      dataSignal: 'Long-tenure clients detected (demo)',
    },
    {
      id: '3',
      title: 'Send a WhatsApp broadcast this Friday',
      why: "Your last broadcast was 18 days ago. Businesses that message their list weekly see 23% higher repeat purchase rates. Friday afternoon is your audience's highest engagement window.",
      category: 'revenue',
      effort: 'low',
      impact: 'medium',
      action: 'Open WhatsApp tool',
      actionTab: 'growth-tools',
      dataSignal: 'No broadcast in 18 days (demo)',
    },
    {
      id: '4',
      title: 'Create an invoice for your 2 outstanding payments',
      why: 'You have ₦82,000 in uninvoiced revenue from last month. The longer you wait to send an invoice, the lower the chance of getting paid on time.',
      category: 'savings',
      effort: 'low',
      impact: 'high',
      action: 'Create invoice',
      actionTab: 'owner-invoices',
      dataSignal: '₦82k outstanding (demo)',
    },
    {
      id: '5',
      title: 'Post on your best-performing platform 3x this week',
      why: 'Instagram is your highest-engagement platform. Accounts that post 3x/week grow followers 3.4x faster than those posting once. You posted once last week.',
      category: 'clients',
      effort: 'medium',
      impact: 'medium',
      action: 'Open content calendar',
      actionTab: 'client-calendar',
      dataSignal: '1 post last week (demo)',
    },
    {
      id: '6',
      title: 'Automate your weekly progress report to yourself',
      why: 'Operators who review their numbers weekly grow 22% faster than those who check monthly. A 5-minute WhatsApp report every Monday keeps you on track without opening a laptop.',
      category: 'automation',
      effort: 'low',
      impact: 'medium',
      action: 'Set up automation',
      actionTab: 'automations',
      dataSignal: 'No recurring report configured',
    },
    {
      id: '7',
      title: 'Bundle your top 2 services into a package deal',
      why: "Your most requested services are often bought together by the same clients, but priced separately. Bundling increases average order value by 28% without any new marketing spend.",
      category: 'revenue',
      effort: 'medium',
      impact: 'high',
      dataSignal: 'Service co-purchase pattern (demo)',
    },
    {
      id: '8',
      title: `Add ${v.leadNoun.toLowerCase()} capture to your WhatsApp profile`,
      why: 'Your WhatsApp bio currently has no CTA to collect contact info. Every person who messages you is a potential lead — set up a simple intake question to auto-capture their details.',
      category: 'clients',
      effort: 'low',
      impact: 'medium',
      action: 'Configure AI Front Desk',
      actionTab: 'ai-front-desk',
      dataSignal: 'No lead capture configured',
    },
  ]
}

const CATS: Array<{ id: IdeaCategory; label: string }> = [
  { id: 'all',        label: 'All Ideas' },
  { id: 'revenue',    label: 'Make Money' },
  { id: 'automation', label: 'Save Time' },
  { id: 'clients',    label: 'Get Clients' },
  { id: 'savings',    label: 'Save Money' },
]

const EFFORT_COLOR: Record<string, string> = { low: '#16a34a', medium: '#d97706', high: '#dc2626' }
const IMPACT_COLOR: Record<string, string> = { high: '#16a34a', medium: '#d97706', low: '#9ca3af' }

export default function IdeasPage({ business, onNavigate }: Props) {
  const [cat, setCat] = useState<IdeaCategory>('all')
  const [done, setDone] = useState<Set<string>>(new Set())

  const ideas = getIdeas(business.type)
  const filtered = cat === 'all' ? ideas : ideas.filter(i => i.category === cat)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Ideas & Suggestions</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          What to do <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>right now.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          {ideas.length} ideas based on your business data — each with a clear reason and a direct action.{' '}
          <span style={{ background: '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>
            Demo data — connect your accounts for personalised suggestions
          </span>
        </p>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            style={{
              padding: '7px 16px', borderRadius: 99,
              background: cat === c.id ? '#0f0f0e' : '#f1f0ed',
              color: cat === c.id ? '#fff' : '#6b7280',
              border: 'none', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Ideas list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((idea, idx) => {
          const isDone = done.has(idea.id)
          return (
            <div
              key={idea.id}
              style={{
                background: isDone ? '#f8f8f6' : '#fff',
                border: '1.5px solid #e8e8e4',
                borderRadius: 12, padding: '20px 22px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                opacity: isDone ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {/* Number */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isDone ? '#f0fdf4' : '#f8f8f6',
                border: `2px solid ${isDone ? '#16a34a' : '#e8e8e4'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontFamily: "'DM Serif Display', serif",
                fontSize: 15, color: isDone ? '#16a34a' : '#0f0f0e',
              }}>
                {isDone ? <Check size={13} color="#16a34a" /> : idx + 1}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 7, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0, lineHeight: 1.3, flex: 1 }}>{idea.title}</h3>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: `${IMPACT_COLOR[idea.impact]}14`, color: IMPACT_COLOR[idea.impact] }}>
                      {idea.impact} impact
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#f1f0ed', color: EFFORT_COLOR[idea.effort] }}>
                      {idea.effort} effort
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 12 }}>{idea.why}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', background: '#f1f0ed', padding: '3px 8px', borderRadius: 4 }}>
                    📊 {idea.dataSignal}
                  </span>
                  {idea.action && idea.actionTab && (
                    <button
                      onClick={() => onNavigate(idea.actionTab!)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, color: '#16a34a',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(22,163,74,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {idea.action} <ArrowRight size={10} />
                    </button>
                  )}
                  <button
                    onClick={() => setDone(p => { const n = new Set(p); isDone ? n.delete(idea.id) : n.add(idea.id); return n })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
                  >
                    <Clock size={10} /> {isDone ? 'Undo' : 'Mark done'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
