import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

interface AuthProps {
  onBack: () => void
}

export default function Auth({ onBack }: AuthProps) {
  const { signInWithGoogle, signInDummy } = useAuth()
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [mode, setMode]             = useState<'login' | 'signup'>('login')

  const handle = async (fn: () => Promise<void>) => {
    setError('')
    setLoading(true)
    try { await fn() }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  // When Supabase is not configured (no env vars), show a clean pass-through
  // so anyone can enter the dashboard without a login form.
  if (!isSupabaseConfigured) {
    return (
      <div style={{ minHeight: '100svh', background: '#0f0f0e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 15 }}>G</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: -0.3 }}>Growth Network</span>
          </div>
          <h1 className="serif" style={{ fontSize: 32, color: '#fff', marginBottom: 12, lineHeight: 1.1 }}>Welcome back.</h1>
          <p style={{ fontSize: 14, color: '#6a6a62', marginBottom: 32, lineHeight: 1.65 }}>
            Click below to enter the dashboard.
          </p>
          <button
            onClick={() => handle(signInDummy)}
            disabled={loading}
            className="btn btn-lg"
            style={{ background: '#fff', color: '#0f0f0e', width: '100%', justifyContent: 'center', borderRadius: 10, fontWeight: 700 }}
          >
            {loading ? <><Loader2 size={15} className="spin" /> Please wait</> : 'Enter Dashboard'}
          </button>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6a6a62', fontSize: 13, marginTop: 16, padding: 8 }}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff' }} className="auth-layout">

      {/* ── Left decorative panel ── */}
      <div className="hide-mobile" style={{ background: '#0f0f0e', display: 'flex', flexDirection: 'column', padding: 40, position: 'relative', overflow: 'hidden' }}>
        {/* Subtle texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 14 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: -0.3 }}>
            Growth Network
          </span>
        </div>

        {/* Main copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#fff', marginBottom: 18, lineHeight: 0.98 }}>
            Scale every<br />
            <span className="serif-italic" style={{ color: '#a3a3a3' }}>business.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#6a6a62', lineHeight: 1.75, maxWidth: 320 }}>
            The operating system for growth agencies managing African businesses.
            One screen, every metric.
          </p>

          {/* Proof numbers */}
          <div style={{ display: 'flex', gap: 28, marginTop: 44, flexWrap: 'wrap' }}>
            {[
              { v: '13', l: 'Businesses' },
              { v: 'NG', l: 'Nigeria first' },
              { v: '0→', l: 'Building live' },
            ].map(s => (
              <div key={s.l}>
                <div className="serif" style={{ fontSize: 26, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#4a4a45', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid #1a1a18', paddingTop: 22 }}>
          <p style={{ fontSize: 13, color: '#4a4a45', lineHeight: 1.65, fontStyle: 'italic' }}>
            "Growth Network brought all our client reporting into one place. We spend less time on admin and more time on actual work."
          </p>
          <p style={{ fontSize: 12, color: '#2e2e2c', marginTop: 8, fontWeight: 600 }}>— Goodness Iyamah, Founder</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="auth-panel"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'clamp(72px, 8vw, 56px) clamp(20px, 5vw, 48px) clamp(32px, 5vw, 48px)', position: 'relative', background: '#fff', overflowY: 'auto' }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{ position: 'absolute', top: 24, left: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888880', fontSize: 13, fontWeight: 500, padding: '6px 8px', borderRadius: 6, transition: 'color 0.15s', minHeight: 44 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f0f0e')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#888880')}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Mobile logo */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: 9, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: '#0f0f0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 13 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f0e', letterSpacing: -0.3 }}>Growth Network</span>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 36px)', color: '#0f0f0e', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h1>
            <p style={{ fontSize: 14, color: '#888880', lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Sign in to your Growth Network dashboard.'
                : 'Create your Growth Network account.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={() => handle(signInWithGoogle)}
            disabled={loading}
            style={{ width: '100%', height: 46, background: '#fff', border: '1.5px solid #eaeae6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.borderColor = '#d4d4ce'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eaeae6'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
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
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: '#eaeae6' }} />
            <span style={{ fontSize: 12, color: '#b8b8b0', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: '#eaeae6' }} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" className="gn-input" disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#888880', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              {mode === 'login' && (
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#4a4a45', fontWeight: 600, padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters" className="gn-input" disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888880', padding: 4, display: 'flex', alignItems: 'center', minHeight: 'auto' }}
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
            style={{ height: 46, borderRadius: 8, marginBottom: 20, justifyContent: 'center', fontSize: 14 }}
          >
            {loading
              ? <><Loader2 size={14} className="spin" /> Please wait</>
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {/* Toggle login/signup */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#888880' }}>
            {mode === 'login' ? "New to Growth Network? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f0f0e', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
