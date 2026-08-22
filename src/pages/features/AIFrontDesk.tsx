/**
 * AI Front Desk — WhatsApp FAQ bot + booking intake + escalation config.
 * Owner configures Q&A pairs, escalation trigger, and booking fields.
 * Real WhatsApp integration is out of scope for this pass — clearly labeled demo.
 */
import { useState } from 'react'
import { Plus, MessageSquare, Check, X, Play, Pause, AlertCircle, ArrowRight, Bot } from 'lucide-react'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

interface FAQ {
  id: string
  question: string
  answer: string
  hits: number
}

interface Conversation {
  from: string
  time: string
  messages: Array<{ role: 'user' | 'bot'; text: string }>
  escalated?: boolean
}

const DEMO_FAQS: FAQ[] = [
  { id: '1', question: 'Are you open?',               answer: 'Yes! We are open Monday–Saturday, 8am–6pm. You can book an appointment anytime through this chat.',                        hits: 47 },
  { id: '2', question: 'How much does it cost?',       answer: 'Our starting price is ₦25,000. For a full quote, please tell us what you need and we\'ll get back to you within 2 hours.', hits: 89 },
  { id: '3', question: 'Where are you located?',       answer: 'We are in Lekki Phase 1, Lagos. Our full address is 15 Admiralty Way. Parking is available on-site.',                    hits: 31 },
  { id: '4', question: 'Can I book for next week?',    answer: 'Absolutely! Please share your preferred date and time and we\'ll confirm your slot within 1 hour.',                        hits: 62 },
]

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    from: '+234 802 000 1234', time: '10 mins ago',
    messages: [
      { role: 'user', text: 'Hi, are you open today?' },
      { role: 'bot',  text: 'Yes! We are open Monday–Saturday, 8am–6pm. You can book an appointment anytime through this chat.' },
      { role: 'user', text: 'How much?' },
      { role: 'bot',  text: 'Our starting price is ₦25,000. For a full quote, please tell us what you need and we\'ll get back to you within 2 hours.' },
    ],
  },
  {
    from: '+233 244 000 5678', time: '2 hours ago',
    escalated: true,
    messages: [
      { role: 'user', text: 'I want to discuss a custom enterprise contract' },
      { role: 'bot',  text: "That sounds great — I'm connecting you with our team right now to discuss the details. Someone will be with you within 30 minutes." },
    ],
  },
]

export default function AIFrontDesk({ business }: Props) {
  const [faqs, setFaqs] = useState<FAQ[]>(DEMO_FAQS)
  const [active, setActive] = useState(true)
  const [showAddFaq, setShowAddFaq] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [escalationPrompt, setEscalationPrompt] = useState("I'm connecting you with our team right now. Someone will be with you within 30 minutes.")
  const [bookingFields, setBookingFields] = useState(['Name', 'Phone', 'Preferred date', 'Service needed'])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(DEMO_CONVERSATIONS[0])
  const [tab, setTab] = useState<'faqs' | 'conversations' | 'settings'>('faqs')

  const addFaq = () => {
    if (!q || !a) return
    setFaqs(p => [...p, { id: `local-${Date.now()}`, question: q, answer: a, hits: 0 }])
    setQ(''); setA(''); setShowAddFaq(false)
  }

  const removeFaq = (id: string) => setFaqs(p => p.filter(f => f.id !== id))

  const totalHits = faqs.reduce((s, f) => s + f.hits, 0)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>AI Front Desk</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 34px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Your WhatsApp<br />
            <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>never sleeps.</span>
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 480, lineHeight: 1.65 }}>
            Answers FAQs, takes bookings, and hands off to a human the moment a question is outside its scope — all on WhatsApp.
          </p>
        </div>

        {/* Status + toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 14px', fontSize: 11, color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={11} />Demo mode — real WhatsApp API connects via Settings
          </div>
          <button
            onClick={() => setActive(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#f0fdf4' : '#f8f8f6', fontWeight: 600, fontSize: 13, color: active ? '#16a34a' : '#9ca3af', transition: 'all 0.15s' }}
          >
            {active ? <><Play size={13} /> Bot is ACTIVE</> : <><Pause size={13} /> Bot is PAUSED</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'FAQs configured', value: faqs.length, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Questions answered (demo)', value: totalHits, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Escalations (demo)', value: 3, color: '#d97706', bg: '#fffbeb' },
          { label: 'Bookings taken (demo)', value: 12, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 18px', flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f0ed', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ id: 'faqs', label: 'FAQs' }, { id: 'conversations', label: 'Recent Chats' }, { id: 'settings', label: 'Settings' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{ padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#0f0f0e' : '#9ca3af', border: tab === t.id ? '1px solid #e8e8e4' : '1px solid transparent', transition: 'all 0.15s' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FAQs tab */}
      {tab === 'faqs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>The bot answers these questions verbatim. Add as many as you like.</p>
            <button onClick={() => setShowAddFaq(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={12} /> Add FAQ</button>
          </div>
          {showAddFaq && (
            <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Question (what the customer asks) *</label>
                  <input value={q} onChange={e => setQ(e.target.value)} className="gn-input" placeholder='e.g. "Do you offer delivery?"' />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Answer (what the bot replies) *</label>
                  <textarea value={a} onChange={e => setA(e.target.value)} className="gn-input" rows={3} style={{ resize: 'vertical' }} placeholder="Yes, we offer same-day delivery within Lagos for orders above ₦10,000..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={addFaq} className="btn btn-accent" style={{ gap: 6 }}><Check size={13} /> Save FAQ</button>
                  <button onClick={() => setShowAddFaq(false)} className="btn btn-ghost">Cancel</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map(faq => (
              <div key={faq.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <MessageSquare size={12} color="#9ca3af" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e' }}>{faq.question}</span>
                      <span style={{ fontSize: 10, color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: 4, marginLeft: 'auto' }}>{faq.hits} answers given</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                      <Bot size={11} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{faq.answer}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFaq(faq.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, flexShrink: 0 }}><X size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations tab */}
      {tab === 'conversations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
            {DEMO_CONVERSATIONS.map(conv => (
              <div
                key={conv.from}
                onClick={() => setSelectedConv(conv)}
                style={{ padding: '14px 16px', borderBottom: '1px solid #f1f0ed', cursor: 'pointer', background: selectedConv?.from === conv.from ? '#f0fdf4' : 'transparent', transition: 'background 0.1s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f0f0e' }}>{conv.from}</span>
                  {conv.escalated && <span style={{ fontSize: 9, fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '1px 5px', borderRadius: 99 }}>ESCALATED</span>}
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.messages.at(-1)?.text}</p>
                <p style={{ fontSize: 10, color: '#d1d5db', margin: '3px 0 0' }}>{conv.time}</p>
              </div>
            ))}
          </div>
          {selectedConv && (
            <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f0ed' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e' }}>{selectedConv.from}</span>
                <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 10 }}>{selectedConv.time}</span>
              </div>
              <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                {selectedConv.messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '75%', padding: '10px 13px', borderRadius: 10, background: m.role === 'user' ? '#f8f8f6' : '#f0fdf4', border: `1px solid ${m.role === 'user' ? '#e8e8e4' : '#bbf7d0'}`, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      {m.role === 'bot' && <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Bot</div>}
                      {m.text}
                    </div>
                  </div>
                ))}
                {selectedConv.escalated && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={12} color="#d97706" />
                    Escalated — a human needs to respond to this conversation
                    <button style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>Reply <ArrowRight size={9} /></button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 14 }}>Escalation message</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>When a question is outside the bot's scope, it sends this message before handing off to a human.</p>
            <textarea value={escalationPrompt} onChange={e => setEscalationPrompt(e.target.value)} className="gn-input" rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 6 }}>Booking intake fields</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>When a customer wants to book, the bot collects these fields before confirming.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookingFields.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={f} onChange={e => setBookingFields(p => p.map((x, j) => j === i ? e.target.value : x))} className="gn-input" style={{ flex: 1 }} />
                  <button onClick={() => setBookingFields(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => setBookingFields(p => [...p, ''])} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', gap: 5 }}><Plus size={12} /> Add field</button>
            </div>
          </div>
          <button className="btn btn-accent" style={{ alignSelf: 'flex-start', gap: 7 }}><Check size={13} /> Save settings</button>
        </div>
      )}
    </div>
  )
}
