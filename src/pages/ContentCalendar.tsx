import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, ChevronLeft, ChevronRight, Link2, CheckCircle2, Sparkles, X, Check } from 'lucide-react'

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'TikTok']

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn:  '#0A66C2',
  Facebook:  '#1877F2',
  X:         '#000000',
  TikTok:    '#010101',
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: '#f1f0ed', color: '#6b7280',  label: 'DRF' },
  scheduled: { bg: '#fffbeb', color: '#d97706',  label: 'SCH' },
  published: { bg: '#f0fdf4', color: '#16a34a',  label: 'PUB' },
}

const SUGGESTIONS = [
  { text: 'Behind-the-scenes look at your team', platform: 'Instagram' },
  { text: 'Customer success story with real numbers', platform: 'LinkedIn' },
  { text: 'Limited-time offer with urgency copy', platform: 'Instagram' },
  { text: 'How we handle [common pain point]', platform: 'Facebook' },
  { text: 'Industry insight + your unique take', platform: 'LinkedIn' },
]

function getDemoPostsForMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const captions = [
    'New product launch! Exciting times ahead.',
    'Behind the scenes of our latest project.',
    'Customer spotlight — amazing results this quarter.',
    'Tips for growing your business in 2026.',
    'Limited offer this week only.',
    'How we scaled from 0 to 1,000 customers.',
  ]
  const posts: any[] = []
  for (let i = 0; i < 12; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1
    posts.push({
      id: `demo-${i}`,
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      body: captions[Math.floor(Math.random() * captions.length)],
      scheduled_date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status: ['draft','scheduled','published'][Math.floor(Math.random() * 3)],
    })
  }
  return posts
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ── shared card wrapper ── */
const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1.5px solid #e8e8e4',
  borderRadius: 12,
}

export default function ContentCalendar({ business }: { business: ApiBusiness }) {
  const [loading, setLoading]               = useState(true)
  const [posts, setPosts]                   = useState<any[]>([])
  const [connections, setConnections]       = useState<any[]>([])
  const [currentDate, setCurrentDate]       = useState(new Date())
  const [showNewPost, setShowNewPost]       = useState(false)
  const [showConnectModal, setShowConnect]  = useState(false)
  const [selectedDay, setSelectedDay]       = useState<number | null>(null)
  const [newCaption, setNewCaption]         = useState('')
  const [newPlatform, setNewPlatform]       = useState('Instagram')
  const [newDate, setNewDate]               = useState('')
  const [newStatus, setNewStatus]           = useState('draft')
  const [connectingPlatform, setCP]         = useState('Instagram')

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const loadData = async () => {
    setLoading(true)
    if (isSupabaseConfigured) {
      try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endDay    = new Date(year, month + 1, 0).getDate()
        const endDate   = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
        const [postsRes, connRes] = await Promise.all([
          supabase.from('content_calendar').select('*').eq('business_id', business.id).gte('scheduled_date', startDate).lte('scheduled_date', endDate).order('scheduled_date', { ascending: true }),
          supabase.from('social_connections').select('*').eq('business_id', business.id),
        ])
        setPosts(postsRes.data?.length ? postsRes.data : getDemoPostsForMonth(year, month))
        setConnections(connRes.data || [])
      } catch { setPosts(getDemoPostsForMonth(year, month)) }
    } else { setPosts(getDemoPostsForMonth(year, month)) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [business.id, year, month])

  const handleAddPost = async () => {
    if (!newCaption || !newDate) return
    const obj = { business_id: business.id, platform: newPlatform, body: newCaption, scheduled_date: newDate, status: newStatus, slot: 1 }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('content_calendar').insert([obj]).select()
      if (data && !error) setPosts(p => [...p, data[0]])
    } else { setPosts(p => [...p, { id: `local-${Date.now()}`, ...obj }]) }
    setNewCaption(''); setNewDate(''); setShowNewPost(false)
  }

  const handleConnect = async () => {
    const obj = { business_id: business.id, platform: connectingPlatform, access_token: 'demo-' + Date.now(), account_name: `${business.name} ${connectingPlatform}`, status: 'connected' }
    if (isSupabaseConfigured) { const { error } = await supabase.from('social_connections').insert([obj]); if (!error) loadData() }
    else { setConnections(p => [...p, { id: `demo-${Date.now()}`, ...obj }]) }
    setShowConnect(false)
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calDays: (number | null)[] = [...Array.from({ length: firstDay }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const today    = new Date()
  const isToday  = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const dayPosts = (day: number) => posts.filter(p => p.scheduled_date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Social Media Manager</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
            Content Calendar
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowConnect(true)} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <Link2 size={13} /> Connect Account
          </button>
          <button onClick={() => setShowNewPost(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Plus size={13} /> Create Post
          </button>
        </div>
      </div>

      {/* ── Connected accounts ── */}
      {connections.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {connections.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8f8f6', border: '1px solid #e8e8e4', padding: '5px 12px', borderRadius: 99 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: PLATFORM_COLORS[c.platform] ?? '#16a34a' }} />
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{c.account_name}</span>
              <CheckCircle2 size={12} color="#16a34a" />
            </div>
          ))}
        </div>
      )}

      {/* ── Connect modal ── */}
      {showConnectModal && (
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Connect Social Account</h2>
            <button onClick={() => setShowConnect(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={connectingPlatform} onChange={e => setCP(e.target.value)} className="gn-input" style={{ flex: 1 }}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button onClick={handleConnect} className="btn btn-primary btn-sm">Connect</button>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>Simulated OAuth — real integrations via API keys in settings.</p>
        </div>
      )}

      {/* ── New post form ── */}
      {showNewPost && (
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New Post</h2>
            <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Platform</label>
              <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="gn-input">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="gn-input" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Caption</label>
              <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)} rows={3} className="gn-input" style={{ resize: 'vertical' }} placeholder="Write your post caption…" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="gn-input">
                <option value="draft">Draft</option>
                <option value="scheduled">Schedule</option>
                <option value="published">Publish Now</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <button onClick={handleAddPost} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {newStatus === 'published' ? 'Publish Now' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Suggestions ── */}
      <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={14} color="#16a34a" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI Suggestions for {business.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setNewCaption(s.text); setNewPlatform(s.platform); setShowNewPost(true) }}
              style={{
                background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 99,
                padding: '6px 14px', fontSize: 12, color: '#374151', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7, transition: 'border-color 0.15s',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e4')}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PLATFORM_COLORS[s.platform] ?? '#16a34a', flexShrink: 0 }} />
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar ── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e8e8e4' }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#0f0f0e' }}>{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 20px', borderBottom: '1px solid #e8e8e4' }}>
          {Object.entries(STATUS_STYLES).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: val.color }} />
              {key}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading calendar…</div>
        ) : (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e8e8e4' }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding: '9px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calDays.map((day, i) => {
                const dp       = day ? dayPosts(day) : []
                const isTd     = day ? isToday(day) : false
                const isSel    = day === selectedDay
                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                    style={{
                      minHeight: 88,
                      borderBottom: '1px solid #e8e8e4',
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid #e8e8e4' : 'none',
                      padding: '6px 8px',
                      background: !day ? '#f8f8f6' : isSel ? '#f0fdf4' : '#ffffff',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (day && !isSel) (e.currentTarget as HTMLElement).style.background = '#fafaf8' }}
                    onMouseLeave={e => { if (day && !isSel) (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
                  >
                    {day && (
                      <>
                        <div style={{
                          fontSize: 12, fontWeight: isTd ? 700 : 400, marginBottom: 4,
                          color: isTd ? '#16a34a' : '#374151',
                          width: isTd ? 22 : 'auto', height: isTd ? 22 : 'auto',
                          background: isTd ? '#f0fdf4' : 'transparent',
                          borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {day}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dp.slice(0, 3).map(post => {
                            const ss = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
                            const pc = PLATFORM_COLORS[post.platform] ?? '#16a34a'
                            return (
                              <div key={post.id} style={{ fontSize: 9, padding: '3px 5px', borderRadius: 3, background: `${pc}12`, borderLeft: `2px solid ${pc}`, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                                <span style={{ color: ss.color, fontWeight: 700, marginRight: 3 }}>{ss.label}</span>
                                {post.body?.slice(0, 18)}
                              </div>
                            )
                          })}
                          {dp.length > 3 && <div style={{ fontSize: 9, color: '#9ca3af' }}>+{dp.length - 3} more</div>}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Day detail panel ── */}
      {selectedDay && dayPosts(selectedDay).length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>
              {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dayPosts(selectedDay).map(post => {
              const ss = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
              const pc = PLATFORM_COLORS[post.platform] ?? '#16a34a'
              return (
                <div key={post.id} style={{ background: '#f8f8f6', border: '1.5px solid #e8e8e4', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${pc}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{post.platform}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ss.bg, color: ss.color }}>{post.status.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{post.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
