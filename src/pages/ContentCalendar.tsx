import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Plus, ChevronLeft, ChevronRight, Link2, CheckCircle2 } from 'lucide-react'

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'TikTok']
const STATUSES = ['draft', 'scheduled', 'published']

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Facebook: '#1877F2',
  X: '#1DA1F2',
  TikTok: '#000000',
}

function generateDemoPosts(year: number, month: number) {
  const posts: any[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const captions = [
    'New product launch announcement! 🚀',
    'Behind the scenes of our latest project',
    'Customer spotlight: Amazing results this quarter',
    'Tips for growing your business in 2026',
    'Team update: Welcome our newest member!',
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
  const [connections, setConnections] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewPost, setShowNewPost] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Form states
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
          supabase.from('social_connections').select('*').eq('business_id', business.id)
        ])
        
        setPosts(postsRes.data && postsRes.data.length > 0 ? postsRes.data : generateDemoPosts(year, month))
        setConnections(connRes.data || [])
      } catch {
        setPosts(generateDemoPosts(year, month))
      }
    } else {
      setPosts(generateDemoPosts(year, month))
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [business.id, year, month])

  const handleAddPost = async () => {
    if (!newCaption || !newDate) return
    const postObj = {
      business_id: business.id,
      platform: newPlatform,
      body: newCaption,
      scheduled_date: newDate,
      status: newStatus,
      slot: 1,
      is_ai_generated: false,
      source: 'user',
      ...(newStatus === 'published' ? { published_at: new Date().toISOString(), publish_status: 'success' } : {})
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('content_calendar').insert([postObj]).select()
      if (data && !error) setPosts(prev => [...prev, data[0]])
    } else {
      setPosts(prev => [...prev, { id: `local-${Date.now()}`, ...postObj }])
    }
    setNewCaption(''); setNewDate(''); setShowNewPost(false)
  }

  const handleConnectAccount = async () => {
    if (isSupabaseConfigured) {
      const connObj = {
        business_id: business.id,
        platform: connectingPlatform,
        access_token: 'demo-token-' + Date.now(),
        account_name: business.name + ' ' + connectingPlatform,
        status: 'connected'
      }
      const { error } = await supabase.from('social_connections').insert([connObj])
      if (!error) loadData()
    } else {
      setConnections(prev => [...prev, { id: `demo-conn-${Date.now()}`, platform: connectingPlatform, account_name: business.name + ' ' + connectingPlatform, status: 'connected' }])
    }
    setShowConnectModal(false)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = Array.from({ length: firstDayOfMonth }, () => null as number | null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  return (
    <div className="page-pad" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>Social Media Manager</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Manage posts and connections for {business.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowConnectModal(true)} style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)', padding: '10px 18px', borderRadius: 3, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Link2 size={16} /> CONNECT ACCOUNT
          </button>
          <button onClick={() => setShowNewPost(true)} style={{ background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 18px', borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, letterSpacing: 0.5 }}>
            <Plus size={16} /> CREATE POST
          </button>
        </div>
      </div>

      {/* Connected Accounts Panel */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '16px 20px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)', marginBottom: 16 }}>
          Connected Accounts
        </h2>
        {connections.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>No social accounts connected. Connect an account to enable auto-publishing.</p>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {connections.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORM_COLORS[c.platform] || 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.account_name}</span>
                <CheckCircle2 size={14} color="var(--accent)" style={{ marginLeft: 8 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showConnectModal && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Connect Social Account</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select value={connectingPlatform} onChange={e => setConnectingPlatform(e.target.value)} style={{ padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)', flex: 1 }}>
              {PLATFORMS.filter(p => !connections.find(c => c.platform === p)).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={handleConnectAccount} style={{ background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 20px', borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed' }}>CONNECT</button>
            <button onClick={() => setShowConnectModal(false)} style={{ background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>CANCEL</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 12 }}>Note: This is a simulated OAuth flow for the current phase.</p>
        </div>
      )}

      {showNewPost && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Post</h2>
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
              <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--foreground)' }}>
                <option value="draft">Draft</option>
                <option value="scheduled">Schedule for Later</option>
                <option value="published">Publish Now</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <button onClick={handleAddPost} style={{ background: 'var(--primary)', color: '#111827', border: 'none', padding: '10px 20px', borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed', width: '100%' }}>
                {newStatus === 'published' ? 'PUBLISH NOW' : 'SAVE'}
              </button>
              <button onClick={() => setShowNewPost(false)} style={{ background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '16px' }}>
          <button onClick={prevMonth} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 8, cursor: 'pointer', color: 'var(--foreground)' }}><ChevronLeft size={18} /></button>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 700, minWidth: 200, textAlign: 'center' }}>{monthName}</span>
          <button onClick={nextMonth} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 8, cursor: 'pointer', color: 'var(--foreground)' }}><ChevronRight size={18} /></button>
        </div>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading calendar...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 1 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calendarDays.map((day, i) => {
                const dayPosts = day ? posts.filter(p => p.scheduled_date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) : []
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                return (
                  <div key={i} style={{ minHeight: 120, borderBottom: '1px solid var(--border)', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', padding: 6, background: day ? (isToday ? 'rgba(203,213,225,0.08)' : 'transparent') : 'var(--secondary)' }}>
                    {day && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--primary)' : 'var(--foreground)', marginBottom: 4 }}>{day}</div>
                        {dayPosts.slice(0, 4).map(post => (
                          <div key={post.id} style={{ fontSize: 10, padding: '4px 6px', marginBottom: 4, borderRadius: 2, background: `${PLATFORM_COLORS[post.platform] || '#6b7280'}18`, borderLeft: `3px solid ${PLATFORM_COLORS[post.platform] || '#6b7280'}`, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ fontWeight: 600, marginRight: 4 }}>[{post.status === 'published' ? 'PUB' : post.status === 'scheduled' ? 'SCH' : 'DRF'}]</span>
                            {post.body.slice(0, 20)}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
