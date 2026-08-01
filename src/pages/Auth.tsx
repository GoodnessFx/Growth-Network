import { useState } from 'react'
import { TrendingUp, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { ApiError } from '../lib/api'

interface AuthProps {
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 3,
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--danger)',
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  )
}

export default function Auth({ onSuccess, onBack }: AuthProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-grid"
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* Left panel — decorative */}
      <div
        className="hide-mobile"
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
        className="auth-form-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          gap: 20,
        }}
      >
        {/* Mobile logo */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 10, width: '100%', marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--primary)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
            minHeight: 44,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        <AuthCard title="Welcome back." subtitle="Owner sign-in. The showcase is open for everyone to browse — only the owner can add and manage businesses.">
          <InputField label="Email" type="email" placeholder="you@agency.com" value={email} onChange={setEmail} />
          <InputField label="Password" type="password" value={password} onChange={setPassword} />
          {error && <ErrorBanner message={error} />}
          <PrimaryButton onClick={handleLogin} loading={loading}>
            SIGN IN
          </PrimaryButton>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            No public sign-up. Only the owner of this Growth Network instance can sign in.
          </p>
        </AuthCard>
      </div>
    </div>
  )
}
