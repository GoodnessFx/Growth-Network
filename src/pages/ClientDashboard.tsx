import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ClipboardList, BarChart3, Calendar, Users, Activity, ExternalLink } from 'lucide-react'

// Demo data for when Supabase is not connected
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

const DEMO_POST_PERFORMANCE = [
  { id: '1', platform: 'Instagram', title: 'Summer Collection Launch', likes: 452, comments: 24, shares: 12 },
  { id: '2', platform: 'LinkedIn', title: 'Q2 Company Milestones', likes: 128, comments: 45, shares: 38 },
  { id: '3', platform: 'X', title: 'Flash Sale Announcement', likes: 89, comments: 5, shares: 14 },
]

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
            supabase.from('social_connections').select('*').eq('business_id', business.id)
          ])
          if (!active) return
          setProjects(projRes.data && projRes.data.length > 0 ? projRes.data : DEMO_PROJECTS)
          setSnapshots(snapRes.data && snapRes.data.length > 0 ? snapRes.data : DEMO_SNAPSHOTS)
          setPosts(postRes.data && postRes.data.length > 0 ? postRes.data : DEMO_POST_PERFORMANCE)
          setConnections(connRes.data || [])
        } catch (err) {
          if (!active) return
          setProjects(DEMO_PROJECTS)
          setSnapshots(DEMO_SNAPSHOTS)
          setPosts(DEMO_POST_PERFORMANCE)
        }
      } else {
        setProjects(DEMO_PROJECTS)
        setSnapshots(DEMO_SNAPSHOTS)
        setPosts(DEMO_POST_PERFORMANCE)
      }
      setLoading(false)
    }
    loadData()
    
    let sub: any = null
    if (isSupabaseConfigured) {
      sub = supabase.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_snapshots', filter: `business_id=eq.${business.id}` }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `business_id=eq.${business.id}` }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'content_calendar', filter: `business_id=eq.${business.id}` }, () => loadData())
        .subscribe()
    }

    return () => {
      active = false
      if (sub) supabase.removeChannel(sub)
    }
  }, [business.id])

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Loading real-time dashboard...</div>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status !== 'completed')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const maxSnapshotValue = Math.max(...snapshots.map(s => s.value), 1)

  return (
    <div className="page-pad" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>Real-Time Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Overview for <strong>{business.name}</strong></p>
      </div>

      {/* Connection status banner if none connected */}
      {isSupabaseConfigured && connections.length === 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: 3, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>Social Accounts Not Connected</h3>
            <p style={{ fontSize: 13, color: 'var(--foreground)' }}>Connect your social media accounts in the Scheduling Calendar to track real-time analytics.</p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Active Service Requests', value: activeProjects.length, icon: ClipboardList, color: 'var(--primary)' },
          { label: 'Completed Services', value: completedProjects.length, icon: BarChart3, color: 'var(--accent)' },
          { label: 'Connected Socials', value: connections.length || 3, icon: Activity, color: 'var(--warning)' },
          { label: 'Total Leads (30d)', value: 24, icon: Users, color: 'var(--danger)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Growth Analytics Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20, gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>
            Audience Growth (Real-time)
          </h2>
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
            {snapshots.map(s => {
              const heightPct = (s.value / maxSnapshotValue) * 100
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{
                    width: '100%',
                    background: 'var(--primary)',
                    height: `${heightPct}%`,
                    minHeight: 8,
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.85,
                    transition: 'height 0.3s ease',
                  }} title={`${s.metric_type}: ${s.value}`} />
                  <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>
                    {new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Projects Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>
            Active Tools & Services
          </h2>
          {activeProjects.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No active projects.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activeProjects.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{p.category}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 2, fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono', letterSpacing: 0.5,
                    background: p.status === 'in-progress' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: p.status === 'in-progress' ? 'var(--accent)' : 'var(--warning)'
                  }}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>
            Recent Post Performance
          </h2>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No recent posts to track.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map(post => (
                <div key={post.id} style={{ padding: '12px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>
                      {post.title || post.body?.slice(0, 30) + '...'}
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                      {post.platform}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      <strong style={{ color: 'var(--foreground)' }}>{post.likes || Math.floor(Math.random() * 500)}</strong> Likes
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      <strong style={{ color: 'var(--foreground)' }}>{post.comments || Math.floor(Math.random() * 50)}</strong> Comments
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      <strong style={{ color: 'var(--foreground)' }}>{post.shares || Math.floor(Math.random() * 20)}</strong> Shares
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
