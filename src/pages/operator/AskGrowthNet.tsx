/**
 * Ask GrowthNet — in-app data assistant scoped to one business's data only.
 * Shows sources for every numbers answer. Refuses questions outside scope plainly.
 * DEMO DATA pattern — real API replaces BUSINESS_DATA below.
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Info, ChevronDown, Search } from 'lucide-react'
import { type ApiBusiness } from '../../lib/api'

interface Props {
  businesses: ApiBusiness[]
}

// ── Demo business data (server-side scoped by business_id in production) ──
const BUSINESS_DATA: Record<string, {
  revenue_30d: number; revenue_prev_30d: number
  leads_open: number; clients_active: number
  invoices_overdue: number; top_channel: string
  last_post: string; followers: number
}> = {
  default: {
    revenue_30d: 510000, revenue_prev_30d: 390000,
    leads_open: 8, clients_active: 18,
    invoices_overdue: 2, top_channel: 'WhatsApp',
    last_post: '3 days ago', followers: 3200,
  },
}

type Role = 'user' | 'assistant'
interface Message {
  id: string
  role: Role
  text: string
  sources?: string[]
  isTyping?: boolean
}

// ── Query engine (runs against one business's data only) ──────────────────
function answerQuery(q: string, data: typeof BUSINESS_DATA['default']): { text: string; sources: string[] } {
  const ql = q.toLowerCase()

  // Revenue questions
  if (ql.match(/revenue|made|earn|income|money/)) {
    const diff = data.revenue_30d - data.revenue_prev_30d
    const pct = Math.round((diff / data.revenue_prev_30d) * 100)
    return {
      text: `This month's revenue is ₦${data.revenue_30d.toLocaleString()} — that's ${pct > 0 ? '+' : ''}${pct}% compared to last month (₦${data.revenue_prev_30d.toLocaleString()}). ${pct > 0 ? 'Revenue is trending up — good signal.' : 'Revenue dipped this month. Worth checking if any invoices are still outstanding.'}`,
      sources: ['Invoice records — last 30 days', 'Invoice records — previous 30 days'],
    }
  }

  // Leads / pipeline
  if (ql.match(/lead|prospect|pipeline|enquir/)) {
    return {
      text: `There are currently ${data.leads_open} open leads in the pipeline. The top source has been ${data.top_channel}. ${data.leads_open > 5 ? 'You have a healthy number of leads — make sure none have gone quiet for more than 7 days.' : 'Leads are a bit thin — worth running a WhatsApp broadcast this week.'}`,
      sources: ['CRM pipeline — current open leads'],
    }
  }

  // Clients
  if (ql.match(/client|customer|patient|student/)) {
    return {
      text: `You currently have ${data.clients_active} active clients. ${data.invoices_overdue > 0 ? `⚠️ ${data.invoices_overdue} of them have an overdue invoice — follow up before the end of the week.` : 'All client invoices are up to date.'}`,
      sources: ['Client list — active status', 'Invoice records — overdue filter'],
    }
  }

  // Invoice / payment
  if (ql.match(/invoice|overdue|payment|owe|outstanding/)) {
    return {
      text: data.invoices_overdue > 0
        ? `There are ${data.invoices_overdue} overdue invoice${data.invoices_overdue > 1 ? 's' : ''}. Based on your average invoice value, that's roughly ₦${(data.invoices_overdue * 45000).toLocaleString()} outstanding. Best action: send a WhatsApp reminder today with the invoice number and your account details.`
        : "No overdue invoices right now. All outstanding payments are within their due window.",
      sources: ['Invoice records — overdue filter', 'Average invoice value — last 90 days'],
    }
  }

  // Social / followers
  if (ql.match(/social|follower|instagram|post|content|engag/)) {
    return {
      text: `Current social following is ${data.followers.toLocaleString()}. Last post was ${data.last_post}. ${data.top_channel === 'WhatsApp' ? 'WhatsApp is your strongest acquisition channel — keep posting there consistently.' : `${data.top_channel} is your top channel.`} Accounts posting 3x/week grow significantly faster than once a week.`,
      sources: ['Social connections — follower count', 'Content calendar — last published post'],
    }
  }

  // WhatsApp draft
  if (ql.match(/draft|write|reply|message|whatsapp/)) {
    return {
      text: `Here's a draft WhatsApp reply you can copy:\n\n---\nHi [Name], thanks for reaching out 🙏 I've seen your message and will get back to you with a full response shortly. In the meantime, feel free to send any details that would help me assist you better.\n---\n\nEdit the [Name] and any specifics before sending.`,
      sources: [],
    }
  }

  // Comparison month
  if (ql.match(/last month|previous|compar|month/)) {
    const diff = data.revenue_30d - data.revenue_prev_30d
    const pct = Math.round((diff / data.revenue_prev_30d) * 100)
    return {
      text: `Comparing this month to last: Revenue ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}% (₦${data.revenue_prev_30d.toLocaleString()} → ₦${data.revenue_30d.toLocaleString()}), active clients ${data.clients_active} (unchanged), open leads ${data.leads_open}. ${pct > 10 ? 'Strong month overall.' : pct > 0 ? 'Slight improvement — keep the momentum.' : 'Revenue dipped. Check for any stalled leads or unpaid invoices.'}`,
      sources: ['Invoice records — 30-day comparison', 'CRM — active client count', 'CRM — open leads'],
    }
  }

  // Out of scope
  if (ql.match(/other business|another client|portfolio|all business/)) {
    return {
      text: "I only have access to this business's data — I can't query another business's numbers. That's by design: each business's data is scoped separately. To see cross-portfolio analytics, use the Compare tab in the Operator dashboard.",
      sources: [],
    }
  }

  // General fallback
  return {
    text: "I can answer questions about this business's revenue, leads, clients, invoices, and social performance — and I can draft WhatsApp replies. I don't have access to general knowledge or other businesses' data. Try asking something like 'How did this month compare to last month?' or 'Do we have any overdue invoices?'",
    sources: [],
  }
}

const QUICK_QUESTIONS = [
  'How did this month compare to last month?',
  'Do we have any overdue invoices?',
  'How many open leads do we have?',
  'Draft a WhatsApp reply to a client complaint',
  'What is our current social following?',
]

export default function AskGrowthNet({ businesses }: Props) {
  const [selectedBizId, setSelectedBizId] = useState(businesses[0]?.id ?? 'default')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant',
      text: `Hi! I'm the GrowthNet assistant. Ask me anything about this business's data — revenue, leads, clients, invoices, or social performance. I'll always show you where my answers come from.\n\nI only have access to this business's data. I'll say so plainly if you ask something outside that scope.`,
      sources: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedBiz = businesses.find(b => b.id === selectedBizId) ?? businesses[0]
  const data = BUSINESS_DATA[selectedBizId] ?? BUSINESS_DATA.default

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (q: string = input) => {
    if (!q.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)

    // Simulate slight delay for realism
    setTimeout(() => {
      const { text, sources } = answerQuery(q, data)
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: 'assistant', text, sources,
      }])
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{ padding: '28px 28px', maxWidth: 860, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Data Assistant
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
            Ask GrowthNet
          </h1>
          {/* Business selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedBizId}
              onChange={e => {
                setSelectedBizId(e.target.value)
                setMessages(p => [{
                  id: Date.now().toString(), role: 'assistant',
                  text: `Switched to ${businesses.find(b => b.id === e.target.value)?.name ?? 'this business'}. Ask me anything about their data.`,
                  sources: [],
                }])
              }}
              className="gn-input"
              style={{ width: 240, paddingRight: 32, fontWeight: 500 }}
            >
              {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value="default">Demo Business</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '3px 10px', display: 'inline-block' }}>
          Demo mode — scoped to this business's data only. Connect accounts for real queries.
        </div>
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16, flexShrink: 0 }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 99,
              background: '#f1f0ed', border: '1px solid #e8e8e4',
              color: '#374151', cursor: 'pointer', fontWeight: 500,
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf4'; (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f0ed'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Bot size={14} color="#16a34a" />
              </div>
            )}
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: msg.role === 'user' ? '#0f0f0e' : '#fff',
                border: msg.role === 'user' ? 'none' : '1.5px solid #e8e8e4',
                color: msg.role === 'user' ? '#fff' : '#0f0f0e',
                fontSize: 13, lineHeight: 1.7,
                borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.text}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                  <Info size={10} color="#9ca3af" />
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Sources:</span>
                  {msg.sources.map(s => (
                    <span key={s} style={{ fontSize: 10, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: 4 }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <User size={13} color="#fff" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: '4px 12px 12px 12px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', opacity: 0.4, animation: `pulse-soft 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 14, flexShrink: 0, borderTop: '1px solid #e8e8e4' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about this business's data…"
          className="gn-input"
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{ borderRadius: 8, padding: '0 16px', flexShrink: 0, height: 44 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
