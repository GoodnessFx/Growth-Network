import { useState } from 'react'
import { User, Bell, Building2, Shield, Palette, Globe, Save, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

type SettingsTab = 'account' | 'business' | 'notifications' | 'security' | 'appearance'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [saved, setSaved] = useState(false)

  // Account form state
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [timezone, setTimezone] = useState('Africa/Lagos')

  // Notification prefs
  const [notifAlerts, setNotifAlerts] = useState(true)
  const [notifReports, setNotifReports] = useState(true)
  const [notifLeads, setNotifLeads] = useState(false)
  const [notifContent, setNotifContent] = useState(true)
  const [emailDigest, setEmailDigest] = useState('weekly')

  // Business info
  const [bizName, setBizName] = useState('Growth Network')
  const [bizType, setBizType] = useState('Digital Agency')
  const [bizCurrency, setBizCurrency] = useState('NGN')
  const [bizCountry, setBizCountry] = useState('Nigeria')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="page-pad" style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', margin: 0, letterSpacing: 0.2 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: '#6b6b7b', marginTop: 6 }}>
          Manage your account, business, and notification preferences.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {/* Sidebar tabs */}
        <div style={{ width: 192, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px', borderRadius: 8,
                    background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                    color: active ? '#c4b5fd' : '#6b6b7b',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.12s',
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              background: '#111114', border: '1px solid #1e1e24',
              borderRadius: 10, padding: 28,
            }}
          >
            {/* ── Account ── */}
            {activeTab === 'account' && (
              <div>
                <SectionTitle icon={User} title="Account" desc="Your personal information and preferences." />
                <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                  <Field label="Full Name">
                    <input
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="gn-input" placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      type="email" className="gn-input" placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Role">
                    <input
                      value={user?.role ?? 'owner'} readOnly
                      className="gn-input"
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </Field>
                  <Field label="Timezone">
                    <select
                      value={timezone} onChange={(e) => setTimezone(e.target.value)}
                      className="gn-input"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </Field>
                </div>
                <div style={{ marginTop: 24 }}>
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

            {/* ── Business ── */}
            {activeTab === 'business' && (
              <div>
                <SectionTitle icon={Building2} title="Business" desc="Details about your agency or operator profile." />
                <div className="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                  <Field label="Business Name">
                    <input value={bizName} onChange={(e) => setBizName(e.target.value)} className="gn-input" placeholder="Your agency name" />
                  </Field>
                  <Field label="Business Type">
                    <select value={bizType} onChange={(e) => setBizType(e.target.value)} className="gn-input">
                      {['Digital Agency', 'Consultancy', 'Holding Company', 'Freelancer', 'Other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Country">
                    <select value={bizCountry} onChange={(e) => setBizCountry(e.target.value)} className="gn-input">
                      {['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Other'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Default Currency">
                    <select value={bizCurrency} onChange={(e) => setBizCurrency(e.target.value)} className="gn-input">
                      {[['NGN', '₦ Nigerian Naira'], ['GHS', '₵ Ghanaian Cedi'], ['KES', 'KSh Kenyan Shilling'], ['ZAR', 'R South African Rand'], ['USD', '$ US Dollar']].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Field label="Business Website">
                    <div style={{ position: 'relative' }}>
                      <Globe size={14} color="#6b6b7b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="gn-input" placeholder="https://youragency.com" style={{ paddingLeft: 36 }} />
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <div>
                <SectionTitle icon={Bell} title="Notifications" desc="Choose what you want to be notified about." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 24 }}>
                  {[
                    { label: 'Business Alerts', desc: 'Alerts when a business metric crosses a threshold', checked: notifAlerts, onChange: setNotifAlerts },
                    { label: 'Weekly Reports', desc: 'Automated summary reports every Monday morning', checked: notifReports, onChange: setNotifReports },
                    { label: 'New Leads', desc: 'Notify when a new lead enters the pipeline', checked: notifLeads, onChange: setNotifLeads },
                    { label: 'Content Calendar', desc: 'Remind 24h before scheduled posts go live', checked: notifContent, onChange: setNotifContent },
                  ].map((item) => (
                    <Toggle key={item.label} {...item} />
                  ))}
                </div>
                <div style={{ marginTop: 24 }}>
                  <Field label="Email Digest Frequency">
                    <select
                      value={emailDigest} onChange={(e) => setEmailDigest(e.target.value)}
                      className="gn-input" style={{ maxWidth: 280 }}
                    >
                      <option value="realtime">Real-time</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly digest</option>
                      <option value="off">Off</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === 'security' && (
              <div>
                <SectionTitle icon={Shield} title="Security" desc="Manage your login methods and session." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                  <InfoRow label="Authentication Method" value="Google OAuth" />
                  <InfoRow label="Last Sign-in" value="Today" />
                  <InfoRow label="Account Created" value="2026" />
                </div>
                <div style={{ borderTop: '1px solid #1e1e24', marginTop: 24, paddingTop: 24 }}>
                  <p style={{ fontSize: 13, color: '#6b6b7b', marginBottom: 16 }}>
                    Danger zone — these actions are irreversible.
                  </p>
                  <button
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171', padding: '10px 20px',
                      borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* ── Appearance ── */}
            {activeTab === 'appearance' && (
              <div>
                <SectionTitle icon={Palette} title="Appearance" desc="Customize the look of your dashboard." />
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 12, color: '#6b6b7b', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                    Color Theme
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { name: 'Purple (Default)', color: '#8b5cf6', active: true },
                      { name: 'Green', color: '#10b981', active: false },
                      { name: 'Blue', color: '#3b82f6', active: false },
                      { name: 'Amber', color: '#f59e0b', active: false },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        title={theme.name}
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: theme.color,
                          border: theme.active ? `3px solid #fff` : '3px solid transparent',
                          cursor: 'pointer',
                          boxShadow: theme.active ? `0 0 0 1px ${theme.color}` : 'none',
                          outline: 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#6b6b7b', marginTop: 20 }}>
                    More theme options coming soon.
                  </p>
                </div>
              </div>
            )}

            {/* Save button */}
            {activeTab !== 'security' && (
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e1e24' }}>
                <button
                  onClick={handleSave}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: saved ? '#10b981' : '#8b5cf6',
                    border: 'none', color: '#fff',
                    padding: '10px 24px', borderRadius: 6,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {saved ? <><Check size={15} /> Saved</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(139,92,246,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Icon size={17} color="#8b5cf6" />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b6b7b', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090a0', marginBottom: 6, letterSpacing: 0.3 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({
  label, desc, checked, onChange,
}: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: '#0f0f13',
        border: '1px solid #1e1e24', borderRadius: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#6b6b7b', marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? '#8b5cf6' : '#1e1e24',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute', top: 3, left: checked ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: '#0f0f13',
        border: '1px solid #1e1e24', borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 13, color: '#9090a0' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{value}</span>
    </div>
  )
}
