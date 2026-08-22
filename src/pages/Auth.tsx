import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

interface AuthProps {
  onBack: () => void
}

export default function Auth({ onBack }: AuthProps) {
  const { signInWithGoogle, signInDummy } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInDummy()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-grid"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#0a0a0b',
      }}
    >
      {/* ── Left panel: hero image ───────────────────────────────────────── */}
      <div
        className="hide-mobile"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#0d0d10',
        }}
      >
        {/* Background image — tinted purple like the reference */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(30%)',
          }}
        />
        {/* Purple overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(88,28,220,0.72) 0%, rgba(139,92,246,0.45) 50%, rgba(10,10,11,0.7) 100%)',
          }}
        />
        {/* Bottom gradient fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(10,10,11,0.85) 0%, transparent 100%)',
          }}
        />

        {/* Logo top-left */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 10,
          }}
        >
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              objectFit: 'contain',
            }}
          />
          <span
            className="font-display"
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 1.5,
              color: '#fff',
            }}
          >
            GROWTH<span style={{ color: '#c4b5fd' }}>NET</span>
          </span>
        </div>

        {/* Bottom copy */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: 36,
            right: 36,
            zIndex: 10,
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: 0.2,
              marginBottom: 12,
            }}
          >
            Scale your business.<br />
            Track every win.
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.6,
            }}
          >
            The operator platform for growth agencies and the businesses they serve.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────────── */}
      <div
        className="auth-form-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          background: '#0a0a0b',
          position: 'relative',
        }}
      >
        {/* Back link */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b6b7b',
            fontSize: 13,
            padding: '6px 8px',
            borderRadius: 6,
          }}
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Mobile logo */}
        <div
          className="show-mobile"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 10,
            marginBottom: 36,
          }}
        >
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet"
            style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'contain' }}
          />
          <span
            className="font-display"
            style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1.5, color: '#f0f0f0' }}
          >
            GROWTH<span style={{ color: '#8b5cf6' }}>NET</span>
          </span>
        </div>

        {/* Form container */}
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h1
              className="font-display"
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#f0f0f0',
                letterSpacing: 0.2,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Back again?{' '}
              <span style={{ color: '#8b5cf6' }}>Respect.</span>
            </h1>
            <p style={{ fontSize: 14, color: '#6b6b7b', marginTop: 10 }}>
              Sign in to your operator dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 6,
                padding: '12px 14px',
                fontSize: 13,
                color: '#f87171',
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: 50,
              background: '#111114',
              border: '1px solid #1e1e24',
              borderRadius: 8,
              padding: '0 18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 10,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#d1d1d8' }}>
                Continue with Google
              </span>
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                color: '#8b5cf6',
                background: 'rgba(139,92,246,0.1)',
                padding: '2px 7px',
                borderRadius: 4,
                letterSpacing: 0.5,
              }}
            >
              LAST USED
            </span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '18px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#1e1e24' }} />
            <span
              style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono',
                color: '#3a3a48',
                letterSpacing: 1,
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: '#1e1e24' }} />
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#9090a0',
                marginBottom: 6,
                letterSpacing: 0.2,
              }}
            >
              Email
              <span style={{ color: '#8b5cf6', marginLeft: 3 }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              className="gn-input"
              style={{ fontSize: '14px !important' }}
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#9090a0',
                  letterSpacing: 0.2,
                }}
              >
                Password
                <span style={{ color: '#8b5cf6', marginLeft: 3 }}>*</span>
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#8b5cf6',
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="gn-input"
                style={{ paddingRight: 44 }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b6b7b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                  minHeight: 'auto',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleDemoSignIn}
            disabled={loading}
            className="gn-btn-primary"
            style={{ marginBottom: 10, fontSize: 15, fontWeight: 600 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Passkey option */}
          <button
            onClick={handleDemoSignIn}
            disabled={loading}
            className="gn-btn-ghost"
            style={{ marginBottom: 32 }}
          >
            Sign in with passkey
          </button>

          {/* Sign up prompt */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#6b6b7b',
            }}
          >
            New to Growth Network?{' '}
            <button
              type="button"
              onClick={handleDemoSignIn}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8b5cf6',
                fontSize: 13,
                fontWeight: 500,
                padding: 0,
                minHeight: 'auto',
              }}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
