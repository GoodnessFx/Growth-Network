import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

interface AuthProps {
  onBack: () => void
}

export default function Auth({ onBack }: AuthProps) {
  const { signInWithGoogle, signInDummy } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]       = useState<'login' | 'signup'>('login')

  const handle = async (fn: () => Promise<void>) => {
    setError('')
    setLoading(true)
    try { await fn() }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  /* ── No-Supabase pass-through ── */
  if (!isSupabaseConfigured) {
    return (
      <div style={{
        minHeight: '100svh',
        background: '#0f0f0e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 16 }}>G</span>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: -0.4 }}>
              Growth Network
            </span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#fff', marginBottom: 12, lineHeight: 1.05 }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 14, color: '#6a6a62', marginBottom: 36, lineHeight: 1.65 }}>
            Enter your dashboard to manage your portfolio.
          </p>
          <button
            onClick={() => handle(signInDummy)}
            disabled={loading}
            style={{
              width: '100%', height: 50, background: '#fff', color: '#0f0f0e',
              border: 'none', borderRadius: 10, fontFamily: "'Inter', sans-serif",
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}
          >
            {loading ? <><Loader2 size={15} className="spin" /> Please wait…</> : 'Enter Dashboard'}
          </button>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4a45', fontSize: 13, marginTop: 18, padding: '8px 12px', fontFamily: "'Inter', sans-serif" }}
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  /* ── Full login page (Supabase configured) ── */
  return (
    <div className="auth-root">
      {/* ══ LEFT — dark panel ══ */}
      <div className="auth-left">
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0f0f0e', fontSize: 15 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: -0.3 }}>
            Growth Network
          </span>
        </div>

        {/* Main copy */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3a3a38', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Operating system for growth
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(34px, 4vw, 54px)',
            color: '#fff',
            lineHeight: 1.0,
            marginBottom: 20,
          }}>
            Scale every<br />
            <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', color: '#5a5a58' }}>business.</span>
          </h2>
          <p style={{ fontSize: 14, color: '#4a4a48', lineHeight: 1.75, maxWidth: 300 }}>
            One dashboard for every business you manage.
            CRM, social, pipeline, analytics, and automations.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { v: '13', l: 'Businesses' },
              { v: 'NGN', l: 'Primary' },
              { v: '2026', l: 'Building now' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#3a3a38', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid #1e1e1c', paddingTop: 22 }}>
          <p style={{ fontSize: 12, color: '#3a3a38', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 8 }}>
            "All our client reporting in one place. Less admin, more actual work."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#1e1e1c', flexShrink: 0 }}>
              <img src="/ig.png" alt="Goodness" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: 12, color: '#2a2a28', fontWeight: 600 }}>Goodness Iyamah, Founder</span>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — form panel ══ */}
      <div className="auth-right">
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 22, left: 22,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', fontSize: 13, fontWeight: 500,
            padding: '6px 10px', borderRadius: 6,
            fontFamily: "'Inter', sans-serif",
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f0f0e')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}
        >
          ← Back
        </button>

        {/* Mobile logo */}
        <div className="auth-mobile-logo">
          <div style={{ width: 30, height: 30, background: '#0f0f0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 14 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f0e', letterSpacing: -0.3 }}>Growth Network</span>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 4vw, 38px)', color: '#0f0f0e', marginBottom: 8, lineHeight: 1.05 }}>
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

          {/* Google */}
          <button
            onClick={() => handle(signInWithGoogle)}
            disabled={loading}
            className="auth-social-btn"
          >
            <svg width="17" height="17" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#eaeae6' }} />
            <span style={{ fontSize: 11, color: '#c0c0b8', fontWeight: 600, letterSpacing: '0.04em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#eaeae6' }} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label className="auth-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="gn-input"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888880', fontWeight: 500, padding: 0, fontFamily: "'Inter', sans-serif" }}
                >
                  Forgot password?
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
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#b0b0a8', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => handle(signInDummy)}
            disabled={loading}
            style={{
              width: '100%', height: 50,
              background: '#0f0f0e', color: '#fff',
              border: 'none', borderRadius: 9,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 20,
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.background = '#2a2a28' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0f0f0e' }}
          >
            {loading
              ? <><Loader2 size={15} className="spin" /> Please wait…</>
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#888880', lineHeight: 1.5 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#0f0f0e', fontWeight: 700, fontSize: 13, padding: 0,
                fontFamily: "'Inter', sans-serif",
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
