import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'X']
const STATUSES = ['draft', 'scheduled', 'posted']

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Facebook: '#1877F2',
  X: '#1DA1F2',
}

// Demo data
function generateDemoPosts(year: number, month: number) {
  const posts: any[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const captions = [
    'New product launch announcement! 🚀',
    'Behind the scenes of our latest project',
    'Customer spotlight: Amazing results this quarter',
    'Tips for growing your business in 2026',
    'Team update: Welcome our newest member!',
    'Industry insights and market trends',
    'Special offer this weekend only 🔥',
    'How we helped a client double their revenue',
  ]
  for (let i = 0; i < 15; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
    posts.push({
      id: `demo-${i}`,
      business_id: 'dummy-biz-1',
      platform,
      body: captions[Math.floor(Math.random() * captions.length)],
      scheduled_date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status,
      slot: 1,
    })
  }
  return posts
}

export default function ContentCalendar({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewPost, setShowNewPost] = useState(false)
  const [newCaption, setNewCaption] = useState('')
  const [newPlatform, setNewPlatform] = useState('Instagram')
  const [newDate, setNewDate] = useState('')
  const [newStatus, setNewStatus] = useState('draft')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
          const endDay = new Date(year, month + 1, 0).getDate()
          const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
          const { data } = await supabase
            .from('content_calendar')
            .select('*')
            .eq('business_id', business.id)
            .gte('scheduled_date', startDate)
            .lte('scheduled_date', endDate)
            .order('scheduled_date', { ascending: true })
          if (data && data.length > 0) {
            setPosts(data)
          } else {
            setPosts(generateDemoPosts(year, month))
          }
        } catch {
          setPosts(generateDemoPosts(year, month))
        }
      } else {
        setPosts(generateDemoPosts(year, month))
      }
      setLoading(false)
    }
    loadPosts()
  }, [business.id, year, month])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter(p => p.scheduled_date === dateStr)
  }

  const handleAddPost = () => {
    if (!newCaption || !newDate) return
    const post = {
      id: `local-${Date.now()}`,
      business_id: business.id,
      platform: newPlatform,
      body: newCaption,
      scheduled_date: newDate,
      status: newStatus,
      slot: 1,
    }
    setPosts(prev => [...prev, post])
    setNewCaption('')
    setNewDate('')
    setShowNewPost(false)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>Scheduling Calendar</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>{business.name}</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          style={{
            background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 18px',
            borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, letterSpacing: 0.5
          }}
        >
          <Plus size={16} /> NEW POST
        </button>
      </div>

      {/* New post form */}
      {showNewPost && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Create New Post</h2>
            <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Platform</label>
              <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Caption</label>
              <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)', resize: 'vertical' }} placeholder="Write your post caption..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleAddPost} style={{ background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 20px', borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed', width: '100%' }}>
                {newStatus === 'draft' ? 'SAVE DRAFT' : 'SCHEDULE POST'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 8, cursor: 'pointer', display: 'flex', color: 'var(--foreground)' }}>
          <ChevronLeft size={18} />
        </button>
        <span className="font-display" style={{ fontSize: 18, fontWeight: 700, minWidth: 200, textAlign: 'center' }}>{monthName}</span>
        <button onClick={nextMonth} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 8, cursor: 'pointer', display: 'flex', color: 'var(--foreground)' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading calendar...</div>
        ) : (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
              {dayNames.map(d => (
                <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calendarDays.map((day, i) => {
                const dayPosts = day ? getPostsForDay(day) : []
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                return (
                  <div
                    key={i}
                    style={{
                      minHeight: 100,
                      borderBottom: '1px solid var(--border)',
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                      padding: 6,
                      background: day ? (isToday ? 'rgba(203,213,225,0.08)' : 'transparent') : 'var(--secondary)',
                    }}
                  >
                    {day && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--primary)' : 'var(--foreground)', marginBottom: 4 }}>
                          {day}
                        </div>
                        {dayPosts.slice(0, 3).map(post => (
                          <div
                            key={post.id}
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              marginBottom: 2,
                              borderRadius: 2,
                              background: `${PLATFORM_COLORS[post.platform] || '#6b7280'}18`,
                              borderLeft: `3px solid ${PLATFORM_COLORS[post.platform] || '#6b7280'}`,
                              color: 'var(--foreground)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              cursor: 'pointer',
                            }}
                            title={`${post.platform} — ${post.body}`}
                          >
                            {post.body.slice(0, 25)}
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                            +{dayPosts.length - 3} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {PLATFORMS.map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-foreground)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: PLATFORM_COLORS[p] }} />
            {p}
          </div>
        ))}
      </div>
    </div>
  )
}
