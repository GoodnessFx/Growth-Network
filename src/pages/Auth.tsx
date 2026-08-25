import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Loader2, ArrowRight } from 'lucide-react'
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
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handle = async (fn: () => Promise<void>) => {
    setError('')
    setLoading(true)
    try { await fn() }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#fff',
      }}
      className="auth-layout"
    >
      {/* ── Left: decorative panel ── */}
      <div
        className="hide-mobile"
        style={{
          background: '#0f0f0e',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 14 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: -0.3 }}>
            GrowthNet
          </span>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h2
            className="serif"
            style={{ fontSize: 52, color: '#ffffff', marginBottom: 20, lineHeight: 0.95 }}
          >
            Scale every<br />
            <span className="serif-italic" style={{ color: '#4ade80' }}>business.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#6a6a62', lineHeight: 1.7, maxWidth: 360 }}>
            The operator platform for growth agencies managing African SMEs. One screen, every metric.
          </p>

          {/* Proof stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
            {[
              { v: '1,240+', l: 'Businesses' },
              { v: '14', l: 'Countries' },
              { v: '34%', l: 'Avg growth' },
            ].map(s => (
              <div key={s.l}>
                <div className="serif" style={{ fontSize: 28, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: '#4a4a45', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid #1a1a18', paddingTop: 24 }}>
          <p style={{ fontSize: 13, color: '#4a4a45', lineHeight: 1.6, fontStyle: 'italic' }}>
            "GrowthNet cut our reporting time from 3 hours a week to 15 minutes."
          </p>
          <p style={{ fontSize: 12, color: '#2a2a28', marginTop: 6, fontWeight: 600 }}>— Agency operator, Lagos</p>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div
        className="auth-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 40px',
          position: 'relative',
          background: '#fff',
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 24, left: 24,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8a8a82', fontSize: 13, fontWeight: 500, padding: '6px 8px',
            borderRadius: 6, transition: 'color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f0f0e')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8a8a82')}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Mobile logo */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 9, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, background: '#0f0f0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 13 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f0e', letterSpacing: -0.3 }}>GrowthNet</span>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 className="serif" style={{ fontSize: 36, color: '#0f0f0e', marginBottom: 8 }}>
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h1>
            <p style={{ fontSize: 14, color: '#8a8a82' }}>
              {mode === 'login' ? 'Sign in to your operator dashboard.' : 'Create your free account.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '11px 14px',
                fontSize: 13, color: '#dc2626', marginBottom: 20, lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={() => handle(signInWithGoogle)}
            disabled={loading}
            style={{
              width: '100%', height: 44,
              background: '#fff', border: '1.5px solid #e8e8e4',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '0 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 10, transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.borderColor = '#d0d0ca'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0e' }}>Continue with Google</span>
            </div>
            <span
              style={{
                fontSize: 10, fontWeight: 700, color: '#2d6a4f',
                background: '#e8f4ee', padding: '2px 7px', borderRadius: 4,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}
            >
              Recommended
            </span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
            <span style={{ fontSize: 12, color: '#b4b4ad', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a4a45', marginBottom: 6 }}>
              Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="gn-input"
              disabled={loading}
              style={{ background: '#f8f8f6', border: '1.5px solid #e8e8e4' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a4a45' }}>
                Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2d6a4f', fontWeight: 600, padding: 0 }}
                >
                  Forgot?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="gn-input"
                disabled={loading}
                style={{ paddingRight: 44, background: '#f8f8f6', border: '1.5px solid #e8e8e4' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8a8a82', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => handle(signInDummy)}
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ height: 44, borderRadius: 8, marginBottom: 8, justifyContent: 'center', fontSize: 14 }}
          >
            {loading ? <><Loader2 size={14} className="spin" /> Please wait…</> : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {/* Demo shortcut */}
          <button
            onClick={() => handle(signInDummy)}
            disabled={loading}
            className="btn btn-ghost btn-full"
            style={{ height: 40, borderRadius: 8, marginBottom: 24, justifyContent: 'center', fontSize: 13 }}
          >
            Continue as demo user
          </button>

          {/* Toggle mode */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#8a8a82' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f', fontWeight: 600, fontSize: 13, padding: 0 }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Mobile: collapse to single column */}
      <style>{`
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr !important; }
          .auth-panel { padding: 80px 24px 40px !important; }
        }
      `}</style>
    </div>
  )
}
