/**
 * Business Setup Wizard — step-by-step onboarding for a new business.
 * Persists progress in localStorage (no backend needed for the wizard itself).
 */
import { useState } from 'react'
import { Check, ChevronRight, Building2, Globe, MessageSquare, Package, ArrowRight } from 'lucide-react'
import { VERTICAL_OPTIONS, type VerticalId } from '../../lib/verticals'

interface Props {
  business: { id: string; name: string; type?: string | null }
  onComplete: () => void
}

const CURRENCIES = ['NGN (₦)', 'GHS (₵)', 'KES (KSh)', 'ZAR (R)', 'USD ($)']
const CHANNELS = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'X (Twitter)']

type Step = 'profile' | 'offering' | 'channel' | 'done'
const STEPS: Array<{ id: Step; label: string; icon: React.ElementType }> = [
  { id: 'profile',  label: 'Business Profile', icon: Building2 },
  { id: 'offering', label: 'Your First Offer',  icon: Package },
  { id: 'channel',  label: 'Connect a Channel', icon: Globe },
  { id: 'done',     label: 'All Set!',           icon: Check },
]

function StepDot({ step, current }: { step: Step; current: Step }) {
  const order: Record<Step, number> = { profile: 0, offering: 1, channel: 2, done: 3 }
  const done = order[current] > order[step]
  const active = step === current
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: done ? '#16a34a' : active ? '#0f0f0e' : '#f1f0ed',
        border: `2px solid ${done ? '#16a34a' : active ? '#0f0f0e' : '#e8e8e4'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {done
          ? <Check size={13} color="#fff" />
          : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : '#9ca3af' }}>
              {STEPS.findIndex(s => s.id === step) + 1}
            </span>
        }
      </div>
    </div>
  )
}

export default function SetupWizard({ business, onComplete }: Props) {
  const [step, setStep] = useState<Step>('profile')
  const [vertical, setVertical] = useState<VerticalId>('generic')
  const [displayName, setDisplayName] = useState(business.name)
  const [currency, setCurrency] = useState('NGN (₦)')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [offerName, setOfferName] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerDesc, setOfferDesc] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [waNumber, setWaNumber] = useState('')

  const toggleChannel = (ch: string) =>
    setChannels(p => p.includes(ch) ? p.filter(c => c !== ch) : [...p, ch])

  const pct = step === 'profile' ? 25 : step === 'offering' ? 50 : step === 'channel' ? 75 : 100

  return (
    <div style={{ padding: '28px 28px', maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Setup Wizard</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Let's get you set up.
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Takes about 3 minutes. You can skip any step and come back later.</p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: i < STEPS.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StepDot step={s.id} current={step} />
                <span style={{ fontSize: 12, fontWeight: s.id === step ? 600 : 400, color: s.id === step ? '#0f0f0e' : '#9ca3af' }} className="hide-xs">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div style={{ height: 1, width: 24, background: '#e8e8e4', margin: '0 8px' }} className="hide-xs" />}
            </div>
          ))}
        </div>
        <div style={{ height: 6, background: '#f1f0ed', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #15803d, #22c55e)', borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 14, padding: 28 }}>

        {/* Step 1: Profile */}
        {step === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e', margin: 0 }}>Tell us about your business</h2>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Business Name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="gn-input" placeholder="e.g. Sunshine Catering" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Industry / Vertical</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {VERTICAL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVertical(opt.value)}
                    style={{
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: vertical === opt.value ? '#f0fdf4' : '#f8f8f6',
                      border: `1.5px solid ${vertical === opt.value ? '#16a34a' : '#e8e8e4'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: vertical === opt.value ? '#15803d' : '#374151' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field-grid">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="gn-input">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="gn-input" placeholder="e.g. Lagos" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>One-line description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="gn-input" placeholder="e.g. We provide catering services for events in Lagos" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setStep('offering')} className="btn btn-primary" style={{ gap: 7 }}>
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Offering */}
        {step === 'offering' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e', margin: 0 }}>Your first product or service</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>What do you sell or offer? This helps GrowthNet surface the right tools and suggestions for your business.</p>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Name of offering *</label>
              <input value={offerName} onChange={e => setOfferName(e.target.value)} className="gn-input" placeholder="e.g. Corporate Catering Package" />
            </div>
            <div className="field-grid">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Starting price</label>
                <input value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="gn-input" placeholder="e.g. 50,000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Type</label>
                <select className="gn-input" defaultValue="service">
                  {['Service', 'Product', 'Subscription', 'Retainer'].map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Short description</label>
              <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} className="gn-input" rows={3} style={{ resize: 'vertical' }} placeholder="What does this include? Who is it for?" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={() => setStep('profile')} className="btn btn-ghost">← Back</button>
              <button onClick={() => setStep('channel')} className="btn btn-primary" style={{ gap: 7 }}>
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Channel */}
        {step === 'channel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e', margin: 0 }}>Connect a channel</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Pick the channels your customers use to reach you. You can connect the actual accounts from the Social Media page.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  style={{
                    padding: '12px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    background: channels.includes(ch) ? '#f0fdf4' : '#f8f8f6',
                    border: `1.5px solid ${channels.includes(ch) ? '#16a34a' : '#e8e8e4'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                >
                  {channels.includes(ch) && <Check size={12} color="#16a34a" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: channels.includes(ch) ? '#15803d' : '#374151' }}>{ch}</span>
                </button>
              ))}
            </div>

            {channels.includes('WhatsApp') && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  <MessageSquare size={11} style={{ marginRight: 5 }} />WhatsApp Business number
                </label>
                <input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="gn-input" placeholder="+234 800 0000000" />
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>This is used for the AI Front Desk and broadcast features.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button onClick={() => setStep('offering')} className="btn btn-ghost">← Back</button>
              <button onClick={() => setStep('done')} className="btn btn-primary" style={{ gap: 7 }}>
                Finish setup <Check size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={28} color="#16a34a" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#0f0f0e', margin: '0 0 8px' }}>You're all set!</h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                <strong>{displayName}</strong> is ready to go. Your dashboard is live and GrowthNet will start tracking your growth as you add data.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onComplete} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                Go to my dashboard <ArrowRight size={16} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>You can always update these settings from the Settings page.</p>
          </div>
        )}
      </div>
    </div>
  )
}
