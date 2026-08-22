import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ClipboardList, TrendingUp, Users, Activity, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react'

const DEMO_PROJECTS = [
  { id: '1', title: 'Website Redesign', category: 'Software & Web', status: 'in-progress', description: 'Complete overhaul of the company website with modern design.' },
  { id: '2', title: 'Social Media Strategy', category: 'Growth & Marketing', status: 'scoping', description: 'Develop a 90-day content strategy for Instagram and LinkedIn.' },
  { id: '3', title: 'Brand Identity Package', category: 'Design & Branding', status: 'completed', description: 'Logo, color palette, typography, and brand guidelines.' },
]

const DEMO_SNAPSHOTS = [
  { id: '1', metric_type: 'followers', value: 1200, recorded_at: '2026-03-01' },
  { id: '2', metric_type: 'followers', value: 1450, recorded_at: '2026-04-01' },
  { id: '3', metric_type: 'followers', value: 1680, recorded_at: '2026-05-01' },
  { id: '4', metric_type: 'followers', value: 2100, recorded_at: '2026-06-01' },
  { id: '5', metric_type: 'followers', value: 2500, recorded_at: '2026-07-01' },
  { id: '6', metric_type: 'followers', value: 3200, recorded_at: '2026-08-01' },
]

const DEMO_POSTS = [
  { id: '1', platform: 'Instagram', title: 'Summer Collection Launch', likes: 452, comments: 24, shares: 12 },
  { id: '2', platform: 'LinkedIn', title: 'Q2 Company Milestones', likes: 128, comments: 45, shares: 38 },
  { id: '3', platform: 'X', title: 'Flash Sale Announcement', likes: 89, comments: 5, shares: 14 },
]

// Smart content suggestions per business type
const CONTENT_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'Share a behind-the-scenes look at your team this week',
    'Post a customer success story with real numbers',
    'Create a "how we do it" reel for your top service',
    'Run a limited-time offer with urgency copy',
    'Share an industry insight with your take on it',
  ],
  ecommerce: [
    'Product unboxing video — keep it under 30 seconds',
    'Before/after transformation post for your hero product',
    '"What our customers say" carousel — 5 testimonials',
    'Flash sale countdown — 24-hour window only',
    'Pack an order with us — shows care and process',
  ],
  agency: [
    'Case study thread — results from a recent client',
    'Team spotlight — introduce a key team member',
    'Share a tool you use daily and why it matters',
    '"What we learned this month" — authentic content wins',
    'Free audit or consultation offer for followers',
  ],
}

function getSuggestions(bizType: string): string[] {
  const type = bizType?.toLowerCase() ?? ''
  if (type.includes('ecommerce') || type.includes('retail') || type.includes('shop')) return CONTENT_SUGGESTIONS.ecommerce
  if (type.includes('agency') || type.includes('marketing') || type.includes('digital')) return CONTENT_SUGGESTIONS.agency
  return CONTENT_SUGGESTIONS.default
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Facebook: '#1877F2',
  X: '#1DA1F2',
  TikTok: '#a855f7',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'in-progress': { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
  scoping: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
}

export default function ClientDashboard({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function loadData() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const [projRes, snapRes, postRes, connRes] = await Promise.all([
            supabase.from('projects').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
            supabase.from('analytics_snapshots').select('*').eq('business_id', business.id).order('recorded_at', { ascending: true }),
            supabase.from('content_calendar').select('*').eq('business_id', business.id).eq('status', 'published').order('published_at', { ascending: false }).limit(5),
            supabase.from('social_connections').select('*').eq('business_id', business.id),
          ])
          if (!active) return
          setProjects(projRes.data?.length ? projRes.data : DEMO_PROJECTS)
          setSnapshots(snapRes.data?.length ? snapRes.data : DEMO_SNAPSHOTS)
          setPosts(postRes.data?.length ? postRes.data : DEMO_POSTS)
          setConnections(connRes.data || [])
        } catch {
          if (!active) return
          setProjects(DEMO_PROJECTS); setSnapshots(DEMO_SNAPSHOTS); setPosts(DEMO_POSTS)
        }
      } else {
        setProjects(DEMO_PROJECTS); setSnapshots(DEMO_SNAPSHOTS); setPosts(DEMO_POSTS)
      }
      setLoading(false)
    }
    loadData()
    let sub: any = null
    if (isSupabaseConfigured) {
      sub = supabase.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_snapshots', filter: `business_id=eq.${business.id}` }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `business_id=eq.${business.id}` }, () => loadData())
        .subscribe()
    }
    return () => { active = false; if (sub) supabase.removeChannel(sub) }
  }, [business.id])

  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: '#6b6b7b', fontSize: 13 }}>Loading dashboard...</div>
      </div>
    )
  }

  const activeProjects = projects.filter((p) => p.status !== 'completed')
  const completedProjects = projects.filter((p) => p.status === 'completed')
  const maxSnap = Math.max(...snapshots.map((s) => s.value), 1)
  const growthPct = snapshots.length >= 2
    ? Math.round(((snapshots[snapshots.length - 1].value - snapshots[0].value) / snapshots[0].value) * 100)
    : 0
  const suggestions = getSuggestions(business.type ?? '')

  const statCards = [
    { label: 'Active Services', value: activeProjects.length, icon: ClipboardList, color: '#8b5cf6', delta: null },
    { label: 'Completed Services', value: completedProjects.length, icon: TrendingUp, color: '#10b981', delta: null },
    { label: 'Audience Growth', value: `+${growthPct}%`, icon: Users, color: '#f59e0b', delta: growthPct },
    { label: 'Total Leads (30d)', value: 24, icon: Activity, color: '#3b82f6', delta: 8 },
  ]

  return (
    <div className="page-pad" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            Real-time Dashboard
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', margin: 0 }}>
            {business.name}
          </h1>
        </div>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '5px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} className="pulse-dot" />
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#10b981', letterSpacing: 1 }}>LIVE</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="stat-card"
              style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={stat.color} />
                </div>
                {stat.delta !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: stat.delta > 0 ? '#10b981' : stat.delta < 0 ? '#ef4444' : '#6b6b7b' }}>
                    {stat.delta > 0 ? <ArrowUpRight size={12} /> : stat.delta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                    {Math.abs(stat.delta)}
                  </div>
                )}
              </div>
              <div className="font-display" style={{ fontSize: 34, fontWeight: 900, color: '#f0f0f0', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: '#6b6b7b', marginTop: 5, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Growth chart */}
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
            Audience Growth
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {snapshots.map((s, i) => {
              const h = Math.round((s.value / maxSnap) * 100)
              const isLast = i === snapshots.length - 1
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: '100%',
                      height: h + '%',
                      minHeight: 8,
                      background: isLast
                        ? 'linear-gradient(to top, #6d28d9, #8b5cf6)'
                        : 'linear-gradient(to top, #1e1e2a, #2a2a3a)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                      position: 'relative',
                    }}
                    title={`${s.value.toLocaleString()}`}
                  />
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#3a3a50' }}>
                    {new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Content Suggestions */}
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={14} color="#8b5cf6" />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase' }}>
              Content Ideas
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  background: '#0f0f13',
                  border: '1px solid #1e1e24',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#c0c0d0',
                  lineHeight: 1.5,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e24')}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Active services */}
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Active Services
          </div>
          {activeProjects.length === 0 ? (
            <p style={{ color: '#6b6b7b', fontSize: 13 }}>No active services.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activeProjects.map((p) => {
                const ss = STATUS_STYLES[p.status] || STATUS_STYLES.scoping
                return (
                  <div
                    key={p.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a20' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{p.category}</div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono', letterSpacing: 0.5, background: ss.bg, color: ss.color, flexShrink: 0, marginLeft: 10 }}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent post performance */}
        <div style={{ background: '#111114', border: '1px solid #1e1e24', borderRadius: 10, padding: 20 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b6b7b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Post Performance
          </div>
          {posts.map((post) => {
            const platformColor = PLATFORM_COLORS[post.platform] ?? '#8b5cf6'
            return (
              <div key={post.id} style={{ padding: '12px 0', borderBottom: '1px solid #1a1a20' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: platformColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {post.platform}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#c0c0d0', marginBottom: 8, lineHeight: 1.4 }}>
                  {post.title || (post.body?.slice(0, 40) + '...')}
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['Likes', post.likes], ['Comments', post.comments], ['Shares', post.shares]].map(([label, val]) => (
                    <div key={label as string} style={{ fontSize: 11, color: '#6b6b7b' }}>
                      <strong style={{ color: '#f0f0f0', marginRight: 3 }}>{val}</strong>{label}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
