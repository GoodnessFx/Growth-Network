import { useState } from 'react'
import { TrendingUp, Eye, EyeOff, ArrowLeft, Shield, Smartphone } from 'lucide-react'

type AuthMode = 'login' | 'register' | 'forgot' | 'verify' | '2fa'

interface AuthProps {
  initialMode?: AuthMode
  onSuccess: () => void
  onBack: () => void
}

function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontFamily: 'JetBrains Mono',
          color: 'var(--muted-foreground)',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            padding: isPassword ? '12px 44px 12px 14px' : '12px 14px',
            fontSize: 14,
            color: 'var(--foreground)',
            outline: 'none',
            fontFamily: 'Outfit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--ring)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>{hint}</p>}
    </div>
  )
}

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
      }}
    >
      <h2
        className="font-display"
        style={{ fontSize: 32, fontWeight: 900, margin: '0 0 6px', letterSpacing: 0.3, color: 'var(--foreground)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 32px', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
      {!subtitle && <div style={{ height: 28 }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
    </div>
  )
}

function PrimaryButton({ onClick, children, loading }: { onClick: () => void; children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: loading ? 'var(--muted)' : 'var(--primary)',
        border: 'none',
        color: '#111827',
        padding: '13px 24px',
        borderRadius: 3,
        fontSize: 14,
        fontWeight: 900,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Barlow Condensed',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        width: '100%',
        transition: 'opacity 0.15s',
      }}
    >
      {loading ? 'PLEASE WAIT...' : children}
    </button>
  )
}

export default function Auth({ initialMode = 'login', onSuccess, onBack }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (mode === 'login') onSuccess()
      else if (mode === 'register') setMode('verify')
      else if (mode === 'verify') setMode('2fa')
      else if (mode === '2fa') onSuccess()
      else if (mode === 'forgot') setMode('login')
    }, 1000)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* Left panel — decorative */}
      <div
        style={{
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--primary)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={17} color="#111827" strokeWidth={2.5} />
          </div>
          <span
            className="font-display"
            style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1, color: 'var(--foreground)' }}
          >
            GROWTH<span style={{ color: 'var(--primary)' }}>NET</span>
          </span>
        </div>

        {/* Big stat display */}
        <div style={{ marginBottom: 'auto' }}>
          <div
            className="font-display"
            style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              color: 'var(--primary)',
              opacity: 0.12,
              position: 'absolute',
              bottom: -20,
              left: -10,
              letterSpacing: -4,
              userSelect: 'none',
            }}
          >
            GROW
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Managed Revenue', value: '₦48B+', color: 'var(--primary)' },
                { label: 'Businesses Growing', value: '1,240+', color: 'var(--accent)' },
                { label: 'Countries Active', value: '14', color: 'var(--warning)' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    padding: '18px 24px',
                  }}
                >
                  <div
                    className="font-display"
                    style={{ fontSize: 40, fontWeight: 900, color: stat.color, lineHeight: 1 }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted-foreground)',
                      marginTop: 4,
                      fontFamily: 'JetBrains Mono',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          gap: 20,
        }}
      >
        <button
          onClick={onBack}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        {mode === 'login' && (
          <AuthCard title="Welcome back." subtitle="Sign in to your operator account.">
            <InputField label="Email" type="email" placeholder="you@agency.com" value={email} onChange={setEmail} />
            <InputField label="Password" type="password" value={password} onChange={setPassword} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -10 }}>
              <button
                onClick={() => setMode('forgot')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12 }}
              >
                Forgot password?
              </button>
            </div>
            <PrimaryButton onClick={handleSubmit} loading={loading}>
              SIGN IN
            </PrimaryButton>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center', margin: 0 }}>
              No account?{' '}
              <button
                onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}
              >
                Start free trial
              </button>
            </p>
          </AuthCard>
        )}

        {mode === 'register' && (
          <AuthCard title="Create account." subtitle="Start your 14-day free trial. No credit card required.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputField label="First name" value={firstName} onChange={setFirstName} placeholder="Sipho" />
              <InputField label="Last name" value={lastName} onChange={setLastName} placeholder="Ndlovu" />
            </div>
            <InputField label="Email" type="email" placeholder="you@agency.com" value={email} onChange={setEmail} />
            <InputField
              label="Business / Agency name"
              value={businessName}
              onChange={setBusinessName}
              placeholder="CoLab Digital"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              hint="Minimum 8 characters"
            />
            <PrimaryButton onClick={handleSubmit} loading={loading}>
              CREATE ACCOUNT
            </PrimaryButton>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', margin: 0 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--muted-foreground)' }}>Terms</a> and{' '}
              <a href="#" style={{ color: 'var(--muted-foreground)' }}>Privacy Policy</a>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center', margin: 0 }}>
              Have an account?{' '}
              <button
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}
              >
                Sign in
              </button>
            </p>
          </AuthCard>
        )}

        {mode === 'forgot' && (
          <AuthCard title="Reset password." subtitle="Enter your email and we'll send a reset link.">
            <InputField label="Email" type="email" placeholder="you@agency.com" value={email} onChange={setEmail} />
            <PrimaryButton onClick={handleSubmit} loading={loading}>
              SEND RESET LINK
            </PrimaryButton>
            <button
              onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}
            >
              Back to sign in
            </button>
          </AuthCard>
        )}

        {mode === 'verify' && (
          <AuthCard
            title="Check your email."
            subtitle={`We sent a 6-digit code to ${email || 'your email'}. Enter it below to verify your account.`}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={28} color="var(--accent)" />
              </div>
            </div>
            <InputField
              label="Verification code"
              placeholder="123456"
              value={otp}
              onChange={setOtp}
              hint="Check your spam folder if you don't see it."
            />
            <PrimaryButton onClick={handleSubmit} loading={loading}>
              VERIFY EMAIL
            </PrimaryButton>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}
            >
              Resend code
            </button>
          </AuthCard>
        )}

        {mode === '2fa' && (
          <AuthCard
            title="Two-factor auth."
            subtitle="Enter the 6-digit code from your authenticator app."
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smartphone size={28} color="var(--primary)" />
              </div>
            </div>
            <InputField
              label="Authenticator code"
              placeholder="000000"
              value={otp}
              onChange={setOtp}
            />
            <PrimaryButton onClick={handleSubmit} loading={loading}>
              CONFIRM
            </PrimaryButton>
          </AuthCard>
        )}
      </div>
    </div>
  )
}
