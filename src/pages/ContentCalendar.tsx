import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, ChevronLeft, ChevronRight, Link2, CheckCircle2, Sparkles, X } from 'lucide-react'

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'TikTok']

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Facebook: '#1877F2',
  X: '#1DA1F2',
  TikTok: '#a855f7',
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: 'rgba(107,107,123,0.15)', color: '#9090a0', label: 'DRF' },
  scheduled: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'SCH' },
  published: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'PUB' },
}

// Smart content suggestions based on business type
const SUGGESTIONS: Record<string, Array<{ text: string; platform: string }>> = {
  default: [
    { text: 'Behind-the-scenes look at your team', platform: 'Instagram' },
    { text: 'Customer success story with real numbers', platform: 'LinkedIn' },
    { text: 'Limited-time offer with urgency copy', platform: 'Instagram' },
    { text: 'How we handle [common pain point]', platform: 'Facebook' },
    { text: 'Industry insight + your unique take', platform: 'LinkedIn' },
  ],
}

function getDemoPostsForMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const captions = [
    'New product launch! Exciting times ahead.',
    'Behind the scenes of our latest project.',
    'Customer spotlight — amazing results this quarter.',
    'Tips for growing your business in 2026.',
    'Team update — welcome our newest member!',
    'Limited offer this week only. Don\'t miss out.',
    'How we scaled from 0 to 1,000 customers.',
  ]
  const posts: any[] = []
  for (let i = 0; i < 12; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
    const statusKeys = ['draft', 'scheduled', 'published']
    const status = statusKeys[Math.floor(Math.random() * statusKeys.length)]
    posts.push({
      id: `demo-${i}`,
      platform,
      body: captions[Math.floor(Math.random() * captions.length)],
      scheduled_date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status,
    })
  }
  return posts
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ContentCalendar({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewPost, setShowNewPost] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Post form
  const [newCaption, setNewCaption] = useState('')
  const [newPlatform, setNewPlatform] = useState('Instagram')
  const [newDate, setNewDate] = useState('')
  const [newStatus, setNewStatus] = useState('draft')
  const [connectingPlatform, setConnectingPlatform] = useState('Instagram')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const loadData = async () => {
    setLoading(true)
    if (isSupabaseConfigured) {
      try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endDay = new Date(year, month + 1, 0).getDate()
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
        const [postsRes, connRes] = await Promise.all([
          supabase.from('content_calendar').select('*').eq('business_id', business.id).gte('scheduled_date', startDate).lte('scheduled_date', endDate).order('scheduled_date', { ascending: true }),
          supabase.from('social_connections').select('*').eq('business_id', business.id),
        ])
        setPosts(postsRes.data?.length ? postsRes.data : getDemoPostsForMonth(year, month))
        setConnections(connRes.data || [])
      } catch {
        setPosts(getDemoPostsForMonth(year, month))
      }
    } else {
      setPosts(getDemoPostsForMonth(year, month))
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [business.id, year, month])

  const handleAddPost = async () => {
    if (!newCaption || !newDate) return
    const postObj = {
      business_id: business.id, platform: newPlatform,
      body: newCaption, scheduled_date: newDate, status: newStatus, slot: 1,
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('content_calendar').insert([postObj]).select()
      if (data && !error) setPosts((prev) => [...prev, data[0]])
    } else {
      setPosts((prev) => [...prev, { id: `local-${Date.now()}`, ...postObj }])
    }
    setNewCaption(''); setNewDate(''); setShowNewPost(false)
  }

  const handleConnectAccount = async () => {
    const connObj = {
      business_id: business.id, platform: connectingPlatform,
      access_token: 'demo-token-' + Date.now(),
      account_name: business.name + ' ' + connectingPlatform,
      status: 'connected',
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('social_connections').insert([connObj])
      if (!error) loadData()
    } else {
      setConnections((prev) => [...prev, { id: `demo-${Date.now()}`, ...connObj }])
    }
    setShowConnectModal(false)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const today = new Date()
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const dayPosts = (day: number) =>
    posts.filter((p) => p.scheduled_date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  const selectedDayPosts = selectedDay ? dayPosts(selectedDay) : []

  return (
    <div className="page-pad" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            Social Media Manager
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', margin: 0 }}>
            Content Calendar
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowConnectModal(true)}
            style={{ background: '#111114', color: '#c0c0d0', border: '1px solid #1e1e24', padding: '9px 16px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Link2 size={14} /> Connect Account
          </button>
          <button
            onClick={() => setShowNewPost(true)}
            style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Plus size={14} /> Create Post
          </button>
        </div>
      </div>

      {/* Connected accounts */}
      {connections.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {connections.map((c) => (
            <div
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111114', border: '1px solid #1e1e24', padding: '6px 12px', borderRadius: 20 }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: PLATFORM_COLORS[c.platform] ?? '#8b5cf6' }} />
              <span style={{ fontSize: 12, color: '#c0c0d0', fontWeight: 500 }}>{c.account_name}</span>
              <CheckCircle2 size={12} color="#10b981" />
            </div>
          ))}
        </div>
      )}

      {/* Connect modal */}
      {showConnectModal && (
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Connect Social Account</h2>
            <button onClick={() => setShowConnectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={connectingPlatform} onChange={(e) => setConnectingPlatform(e.target.value)}
              className="gn-input" style={{ flex: 1 }}
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={handleConnectAccount}
              style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Connect
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#6b6b7b', marginTop: 10 }}>Simulated OAuth — real integrations via API keys in settings.</p>
        </div>
      )}

      {/* New post form */}
      {showNewPost && (
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>New Post</h2>
            <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Platform</label>
              <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} className="gn-input">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Date</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="gn-input" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Caption</label>
              <textarea
                value={newCaption} onChange={(e) => setNewCaption(e.target.value)}
                rows={3}
                className="gn-input"
                style={{ resize: 'vertical', height: 80 }}
                placeholder="Write your post caption..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9090a0', marginBottom: 6 }}>Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="gn-input">
                <option value="draft">Draft</option>
                <option value="scheduled">Schedule</option>
                <option value="published">Publish Now</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <button
                onClick={handleAddPost}
                style={{ flex: 1, background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                {newStatus === 'published' ? 'Publish Now' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI suggestions panel */}
      <div style={{ background: '#111114', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={14} color="#8b5cf6" />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8b5cf6', letterSpacing: 2, textTransform: 'uppercase' }}>
            AI Suggestions for {business.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(SUGGESTIONS.default).map((s, i) => (
            <button
              key={i}
              onClick={() => { setNewCaption(s.text); setNewPlatform(s.platform); setShowNewPost(true) }}
              style={{
                background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 20,
                padding: '6px 14px', fontSize: 12, color: '#c0c0d0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e24')}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PLATFORM_COLORS[s.platform] ?? '#8b5cf6', flexShrink: 0 }} />
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, overflow: 'hidden' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #1a1a20' }}>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#f0f0f0', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: '#f0f0f0' }}>{monthName}</span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#f0f0f0', display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Post count legend */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 20px', borderBottom: '1px solid #1a1a20' }}>
          {Object.entries(STATUS_STYLES).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b6b7b' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: val.color }} />
              {key}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6b6b7b', fontSize: 13 }}>Loading calendar...</div>
        ) : (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #1a1a20' }}>
              {DAYS.map((d) => (
                <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontFamily: 'JetBrains Mono', color: '#3a3a50', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calDays.map((day, i) => {
                const dp = day ? dayPosts(day) : []
                const isTd = day ? isToday(day) : false
                const isSelected = day === selectedDay
                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                    style={{
                      minHeight: 88,
                      borderBottom: '1px solid #1a1a20',
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid #1a1a20' : 'none',
                      padding: '6px 8px',
                      background: !day ? '#0d0d10' : isSelected ? 'rgba(139,92,246,0.08)' : 'transparent',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (day && !isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={(e) => { if (day && !isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {day && (
                      <>
                        <div
                          style={{
                            fontSize: 12, fontWeight: isTd ? 700 : 400, marginBottom: 4,
                            color: isTd ? '#8b5cf6' : '#c0c0d0',
                            width: isTd ? 22 : 'auto', height: isTd ? 22 : 'auto',
                            background: isTd ? 'rgba(139,92,246,0.15)' : 'transparent',
                            borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {day}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dp.slice(0, 3).map((post) => {
                            const ss = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
                            const pc = PLATFORM_COLORS[post.platform] ?? '#8b5cf6'
                            return (
                              <div
                                key={post.id}
                                style={{
                                  fontSize: 9, padding: '3px 5px', borderRadius: 3,
                                  background: `${pc}14`,
                                  borderLeft: `2px solid ${pc}`,
                                  color: '#c0c0d0',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  lineHeight: 1.4,
                                }}
                              >
                                <span style={{ color: ss.color, fontWeight: 700, marginRight: 3 }}>{ss.label}</span>
                                {post.body?.slice(0, 18)}
                              </div>
                            )
                          })}
                          {dp.length > 3 && (
                            <div style={{ fontSize: 9, color: '#6b6b7b', fontFamily: 'JetBrains Mono' }}>+{dp.length - 3} more</div>
                          )}
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

      {/* Selected day detail panel */}
      {selectedDay && selectedDayPosts.length > 0 && (
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>
              {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedDayPosts.map((post) => {
              const ss = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
              const pc = PLATFORM_COLORS[post.platform] ?? '#8b5cf6'
              return (
                <div key={post.id} style={{ background: '#0f0f13', border: '1px solid #1e1e24', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${pc}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{post.platform}</span>
                    <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', padding: '2px 6px', borderRadius: 3, background: ss.bg, color: ss.color }}>{post.status.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#c0c0d0', margin: 0, lineHeight: 1.5 }}>{post.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
