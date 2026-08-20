import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

interface AuthProps {
  onBack: () => void
}

// Spacing scale for this page: 4 / 8 / 16 / 24 / 32 / 40 / 48.
const RADIUS = 8

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: RADIUS,
        boxShadow: '0 1px 3px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.04)',
        padding: '40px 40px',
        width: '100%',
        maxWidth: 400,
      }}
    >
      <h2
        className="font-display"
        style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: 0, color: 'var(--foreground)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: '0 0 40px', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
      {!subtitle && <div style={{ height: 32 }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: RADIUS,
        padding: '12px 16px',
        fontSize: 13,
        color: 'var(--danger)',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  )
}

export default function Auth({ onBack }: { onBack?: () => void }) {
  const { signInWithGoogle, signInDummy } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // Browser redirects to Google, then back to this origin where Supabase
      // restores the session and the app moves to the dashboard on its own.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
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
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet logo"
            style={{ width: 32, height: 32, borderRadius: 2, objectFit: 'contain' }}
          />
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

      {/* Right panel — Google sign-in */}
      <div
        className="auth-form-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          gap: 24,
        }}
      >
        {/* Mobile logo */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 10, width: '100%', marginBottom: 16 }}>
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet logo"
            style={{ width: 32, height: 32, borderRadius: 2, objectFit: 'contain', flexShrink: 0 }}
          />
          <span
            className="font-display"
            style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1, color: 'var(--foreground)' }}
          >
            GROWTH<span style={{ color: 'var(--primary)' }}>NET</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 400 }}>
          <button
            onClick={onBack}
            className="auth-back-link"
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              marginBottom: 24,
              minHeight: 44,
              padding: '0 8px',
              marginLeft: -8,
            }}
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <AuthCard title="Welcome back.">
            {error && <ErrorBanner message={error} />}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="auth-google-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
                height: 46,
                background: loading ? 'var(--muted)' : 'var(--primary)',
                border: loading ? '1px solid var(--border)' : '1px solid var(--primary)',
                borderRadius: RADIUS,
                padding: '0 24px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: loading ? 'var(--muted-foreground)' : '#ffffff', letterSpacing: 0.5 }}>
                {loading ? 'PLEASE WAIT...' : 'SIGN IN WITH GOOGLE'}
              </span>
            </button>
          </AuthCard>
        </div>
      </div>
    </div>
  )
}
