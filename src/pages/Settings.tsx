import { useState } from 'react'
import { User, Bell, Building2, Shield, Palette, Globe, Save, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

type SettingsTab = 'account' | 'business' | 'notifications' | 'security' | 'appearance'

// ── Shared field wrapper ──────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Toggle row ────────────────────────────────────────────────────────────
function Toggle({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9f9f7', border: '1.5px solid #eaeae6', borderRadius: 10, gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#888880', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 99,
          background: checked ? '#0f0f0e' : '#d4d4ce',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s', flexShrink: 0,
        }}
        aria-label={checked ? 'Disable' : 'Enable'}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: '#f9f9f7', border: '1.5px solid #eaeae6', borderRadius: 10, gap: 12 }}>
      <span style={{ fontSize: 13, color: '#888880' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>{value}</span>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f2f1ee', border: '1.5px solid #eaeae6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color="#0f0f0e" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0e' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#888880', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [saved, setSaved] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Form state
  const [name, setName]             = useState(user?.name ?? '')
  const [email, setEmail]           = useState(user?.email ?? '')
  const [timezone, setTimezone]     = useState('Africa/Lagos')
  const [notifAlerts, setNotifAlerts] = useState(true)
  const [notifReports, setNotifReports] = useState(true)
  const [notifLeads, setNotifLeads] = useState(false)
  const [notifContent, setNotifContent] = useState(true)
  const [emailDigest, setEmailDigest] = useState('weekly')
  const [bizName, setBizName]       = useState('Growth Network')
  const [bizType, setBizType]       = useState('Digital Agency')
  const [bizCurrency, setBizCurrency] = useState('NGN')
  const [bizCountry, setBizCountry] = useState('Nigeria')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account',       label: 'Account',       icon: User },
    { id: 'business',      label: 'Business',      icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
  ]

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label ?? 'Settings'

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 28px)', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Settings
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(22px, 3vw, 30px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Account &amp; Preferences
        </h1>
        <p style={{ fontSize: 13, color: '#888880', marginTop: 5 }}>
          Manage your account, business, and notification preferences.
        </p>
      </div>

      {/* Mobile: tab dropdown */}
      <div className="show-mobile" style={{ display: 'none', marginBottom: 20 }}>
        <select
          value={activeTab}
          onChange={e => setActiveTab(e.target.value as SettingsTab)}
          className="gn-input"
        >
          {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Desktop sidebar */}
        <div className="hide-mobile" style={{ width: 180, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 8,
                    background: active ? '#f2f1ee' : 'transparent',
                    border: active ? '1.5px solid #eaeae6' : '1.5px solid transparent',
                    color: active ? '#0f0f0e' : '#888880',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.12s',
                  }}
                >
                  <Icon size={14} strokeWidth={active ? 2.2 : 1.7} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: '#fff', border: '1.5px solid #eaeae6', borderRadius: 12, padding: 'clamp(18px, 3vw, 26px)' }}>

            {/* Account */}
            {activeTab === 'account' && (
              <div>
                <SectionHead icon={User} title="Account" desc="Your personal information and preferences." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                  <Field label="Full Name">
                    <input value={name} onChange={e => setName(e.target.value)} className="gn-input" placeholder="Your name" />
                  </Field>
                  <Field label="Email Address">
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="gn-input" placeholder="you@example.com" />
                  </Field>
                  <Field label="Role">
                    <input value={user?.role ?? 'owner'} readOnly className="gn-input" style={{ opacity: 0.55, cursor: 'not-allowed' }} />
                  </Field>
                  <Field label="Timezone">
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="gn-input">
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </Field>
                  <Field label="Language">
                    <select className="gn-input" defaultValue="en">
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="sw">Kiswahili</option>
                      <option value="yo">Yorùbá</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* Business */}
            {activeTab === 'business' && (
              <div>
                <SectionHead icon={Building2} title="Business" desc="Details about your agency or operator profile." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                  <Field label="Business Name">
                    <input value={bizName} onChange={e => setBizName(e.target.value)} className="gn-input" placeholder="Your agency name" />
                  </Field>
                  <Field label="Business Type">
                    <select value={bizType} onChange={e => setBizType(e.target.value)} className="gn-input">
                      {['Digital Agency', 'Consultancy', 'Holding Company', 'Freelancer', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Country">
                    <select value={bizCountry} onChange={e => setBizCountry(e.target.value)} className="gn-input">
                      {['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Default Currency">
                    <select value={bizCurrency} onChange={e => setBizCurrency(e.target.value)} className="gn-input">
                      {[['NGN', '₦ Nigerian Naira'], ['GHS', '₵ Ghanaian Cedi'], ['KES', 'KSh Kenyan Shilling'], ['ZAR', 'R South African Rand'], ['USD', '$ US Dollar']].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Business Website">
                    <div style={{ position: 'relative' }}>
                      <Globe size={14} color="#888880" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="gn-input" placeholder="https://youragency.com" style={{ paddingLeft: 36 }} />
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div>
                <SectionHead icon={Bell} title="Notifications" desc="Choose what you want to be notified about." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Toggle label="Business Alerts"    desc="When a business metric crosses a threshold"        checked={notifAlerts}   onChange={setNotifAlerts} />
                  <Toggle label="Weekly Reports"     desc="Automated summary every Monday morning"            checked={notifReports}  onChange={setNotifReports} />
                  <Toggle label="New Leads"          desc="When a new lead enters the pipeline"               checked={notifLeads}    onChange={setNotifLeads} />
                  <Toggle label="Content Calendar"   desc="24h reminder before scheduled posts go live"       checked={notifContent}  onChange={setNotifContent} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Field label="Email Digest Frequency">
                    <select value={emailDigest} onChange={e => setEmailDigest(e.target.value)} className="gn-input" style={{ maxWidth: 260 }}>
                      <option value="realtime">Real-time</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly digest</option>
                      <option value="off">Off</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div>
                <SectionHead icon={Shield} title="Security" desc="Manage your login methods and session." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <InfoRow label="Authentication Method" value="Google" />
                  <InfoRow label="Last Sign-in"          value="Today" />
                  <InfoRow label="Account Created"       value="2026" />
                </div>
                <div style={{ borderTop: '1px solid #eaeae6', marginTop: 24, paddingTop: 24 }}>
                  <p style={{ fontSize: 13, color: '#888880', marginBottom: 14 }}>
                    Danger zone — these actions cannot be undone.
                  </p>
                  <button style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div>
                <SectionHead icon={Palette} title="Appearance" desc="Customize the look of your dashboard." />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Interface Theme
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { name: 'Default', color: '#0f0f0e' },
                      { name: 'Slate', color: '#334155' },
                      { name: 'Forest', color: '#1a5c42' },
                      { name: 'Navy', color: '#1e3a5f' },
                    ].map((theme, i) => (
                      <button
                        key={theme.name}
                        title={theme.name}
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: theme.color,
                          border: i === 0 ? '3px solid #0f0f0e' : '3px solid transparent',
                          cursor: 'pointer', outline: 'none',
                          boxShadow: i === 0 ? '0 0 0 2px #fff, 0 0 0 3px #0f0f0e' : 'none',
                          transition: 'box-shadow 0.15s',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#888880', marginTop: 16, lineHeight: 1.6 }}>
                    Additional theme customization will be available in a future update.
                  </p>
                </div>
              </div>
            )}

            {/* Save */}
            {activeTab !== 'security' && (
              <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #eaeae6' }}>
                <button
                  onClick={handleSave}
                  className="btn"
                  style={{
                    background: saved ? '#16a34a' : '#0f0f0e',
                    color: '#fff', gap: 8, transition: 'background 0.2s',
                  }}
                >
                  {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
