import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  ClipboardList, TrendingUp, Users, Activity,
  ArrowUpRight, ArrowDownRight, Sparkles, Plus,
  ExternalLink, BarChart2,
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

// ── Demo data ─────────────────────────────────────────────────────────────
const DEMO_PROJECTS = [
  { id: '1', title: 'Website Redesign',       category: 'Software & Web',     status: 'in-progress', description: 'Complete overhaul with modern design and lead capture.' },
  { id: '2', title: 'Social Media Strategy',  category: 'Growth & Marketing', status: 'scoping',     description: 'Develop a 90-day content strategy for Instagram and LinkedIn.' },
  { id: '3', title: 'Brand Identity Package', category: 'Design & Branding',  status: 'completed',   description: 'Logo, color palette, typography, and brand guidelines.' },
]

const DEMO_SNAPSHOTS = [
  { id: '1', value: 1200, recorded_at: '2026-03-01' },
  { id: '2', value: 1450, recorded_at: '2026-04-01' },
  { id: '3', value: 1680, recorded_at: '2026-05-01' },
  { id: '4', value: 2100, recorded_at: '2026-06-01' },
  { id: '5', value: 2500, recorded_at: '2026-07-01' },
  { id: '6', value: 3200, recorded_at: '2026-08-01' },
]

const DEMO_POSTS = [
  { id: '1', platform: 'Instagram', title: 'Summer Collection Launch',  likes: 452, comments: 24, shares: 12 },
  { id: '2', platform: 'LinkedIn',  title: 'Q2 Company Milestones',     likes: 128, comments: 45, shares: 38 },
  { id: '3', platform: 'X',         title: 'Flash Sale Announcement',   likes: 89,  comments: 5,  shares: 14 },
]

// Smart content ideas per business type
const IDEAS: Record<string, string[]> = {
  default: [
    'Share a behind-the-scenes look at your team this week',
    'Post a customer success story with real numbers',
    'Create a "how we do it" reel for your top service',
    'Run a 24-hour flash offer with urgency copy',
    'Share an industry insight with your own take',
  ],
  ecommerce: [
    'Unboxing video — keep it under 30 seconds',
    'Before/after transformation for your hero product',
    '"What our customers say" carousel — 5 testimonials',
    'Flash sale countdown — 24-hour window only',
    'Pack an order with us — shows care and process',
  ],
  agency: [
    'Case study thread — results from a recent client',
    'Team spotlight — introduce a key team member',
    'Share a tool you use daily and why it matters',
    '"What we learned this month" — authentic content wins',
    'Free audit offer for your followers',
  ],
}

function getIdeas(bizType: string): string[] {
  const t = bizType?.toLowerCase() ?? ''
  if (t.includes('ecommerce') || t.includes('retail') || t.includes('shop')) return IDEAS.ecommerce
  if (t.includes('agency') || t.includes('marketing') || t.includes('digital')) return IDEAS.agency
  return IDEAS.default
}

const PLATFORM_DOT: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn:  '#0A66C2',
  Facebook:  '#1877F2',
  X:         '#000000',
  TikTok:    '#010101',
}

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  'in-progress': { bg: '#eff6ff', color: '#2563eb', label: 'In Progress' },
  scoping:       { bg: '#fffbeb', color: '#d97706', label: 'Scoping' },
  completed:     { bg: '#f0fdf4', color: '#16a34a', label: 'Done' },
  cancelled:     { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, icon: Icon, accent }: {
  label: string; value: string | number; delta?: number | null;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div style={{
      background: '#ffffff', border: '1.5px solid #e8e8e4',
      borderRadius: 12, padding: '20px 22px',
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#d0d0ca' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: accent + '14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={accent} strokeWidth={2} />
        </div>
        {delta != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 12, fontWeight: 600,
            color: delta >= 0 ? '#16a34a' : '#dc2626',
            background: delta >= 0 ? '#f0fdf4' : '#fef2f2',
            padding: '3px 8px', borderRadius: 99,
          }}>
            {delta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 36, color: '#0f0f0e', lineHeight: 1, marginBottom: 5,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>{title}</h2>
      {action}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function ClientDashboard({ business }: { business: ApiBusiness }) {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner' || user?.role === 'admin'

  const [loading, setLoading]     = useState(true)
  const [projects, setProjects]   = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [posts, setPosts]         = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const [projRes, snapRes, postRes] = await Promise.all([
            supabase.from('projects').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
            supabase.from('analytics_snapshots').select('*').eq('business_id', business.id).order('recorded_at', { ascending: true }),
            supabase.from('content_calendar').select('*').eq('business_id', business.id).eq('status', 'published').order('published_at', { ascending: false }).limit(5),
          ])
          if (!active) return
          setProjects(projRes.data?.length  ? projRes.data  : DEMO_PROJECTS)
          setSnapshots(snapRes.data?.length ? snapRes.data  : DEMO_SNAPSHOTS)
          setPosts(postRes.data?.length     ? postRes.data  : DEMO_POSTS)
        } catch {
          if (!active) return
          setProjects(DEMO_PROJECTS); setSnapshots(DEMO_SNAPSHOTS); setPosts(DEMO_POSTS)
        }
      } else {
        setProjects(DEMO_PROJECTS); setSnapshots(DEMO_SNAPSHOTS); setPosts(DEMO_POSTS)
      }
      setLoading(false)
    }
    load()
    let sub: any = null
    if (isSupabaseConfigured) {
      sub = supabase.channel('dash-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_snapshots', filter: `business_id=eq.${business.id}` }, load)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects',            filter: `business_id=eq.${business.id}` }, load)
        .subscribe()
    }
    return () => { active = false; if (sub) supabase.removeChannel(sub) }
  }, [business.id])

  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: 14 }}>
          <div style={{ width: 18, height: 18, border: '2px solid #e8e8e4', borderTopColor: '#16a34a', borderRadius: '50%' }} className="spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  const active    = projects.filter(p => p.status !== 'completed')
  const completed = projects.filter(p => p.status === 'completed')
  const maxSnap   = Math.max(...snapshots.map(s => s.value), 1)
  const growthPct = snapshots.length >= 2
    ? Math.round(((snapshots.at(-1)!.value - snapshots[0].value) / snapshots[0].value) * 100)
    : 0
  const ideas = getIdeas(business.type ?? '')

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1200 }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Real-time Dashboard
          </p>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e',
            lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            {business.name}
          </h1>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 13px', borderRadius: 99,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} className="pulse" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Live</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Active Services"    value={active.length}    icon={ClipboardList} accent="#2563eb" delta={null} />
        <StatCard label="Completed Services" value={completed.length} icon={TrendingUp}    accent="#16a34a" delta={null} />
        <StatCard label="Audience Growth"    value={`+${growthPct}%`} icon={Users}         accent="#d97706" delta={growthPct} />
        <StatCard label="Total Leads (30d)"  value={24}               icon={Activity}      accent="#7c3aed" delta={8} />
      </div>

      {/* ── Main two-column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}
        className="stack-mobile">

        {/* Growth chart */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <SectionHead title="Audience Growth" />
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
            {snapshots.map((s, i) => {
              const h = Math.round((s.value / maxSnap) * 100)
              const isLast = i === snapshots.length - 1
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    title={s.value.toLocaleString()}
                    style={{
                      width: '100%', minHeight: 8,
                      height: `${h}%`,
                      background: isLast
                        ? 'linear-gradient(to top, #15803d, #22c55e)'
                        : '#f1f0ed',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                      border: isLast ? 'none' : '1px solid #e8e8e4',
                    }}
                  />
                  <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {new Date(s.recorded_at).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {snapshots[0]?.value.toLocaleString()} → {snapshots.at(-1)?.value.toLocaleString()} followers
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '2px 9px', borderRadius: 99 }}>
              +{growthPct}% overall
            </span>
          </div>
        </div>

        {/* Content ideas */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Content Ideas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {ideas.map((idea, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  background: '#f8f8f6', border: '1.5px solid #e8e8e4',
                  borderRadius: 8, fontSize: 13, color: '#374151',
                  lineHeight: 1.5, cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLElement).style.background = '#f0fdf4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e4'; (e.currentTarget as HTMLElement).style.background = '#f8f8f6' }}
              >
                {idea}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom two-column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="stack-mobile">

        {/* Active services */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <SectionHead
            title={`Active Services (${active.length})`}
            action={
              <button className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                <Plus size={12} /> New request
              </button>
            }
          />
          {active.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              No active services. Submit a request to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {active.map((p, i) => {
                const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.scoping
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 0',
                      borderBottom: i < active.length - 1 ? '1px solid #f1f0ed' : 'none',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>
                        {p.category}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 99,
                      fontSize: 11, fontWeight: 600,
                      background: cfg.bg, color: cfg.color,
                      flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Post performance */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <SectionHead title="Post Performance" />
          {posts.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No published posts yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {posts.map((post, i) => {
                const dot = PLATFORM_DOT[post.platform] ?? '#6b7280'
                return (
                  <div
                    key={post.id}
                    style={{
                      padding: '13px 0',
                      borderBottom: i < posts.length - 1 ? '1px solid #f1f0ed' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {post.platform}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0e', marginBottom: 7, lineHeight: 1.4 }}>
                      {post.title || post.body?.slice(0, 42)}
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {[['Likes', post.likes], ['Comments', post.comments], ['Shares', post.shares]].map(([lbl, val]) => (
                        <div key={lbl as string} style={{ fontSize: 12, color: '#6b7280' }}>
                          <strong style={{ color: '#0f0f0e', marginRight: 2 }}>{val}</strong>{lbl}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Owner-only quick links ── */}
      {isOwner && (
        <div style={{ marginTop: 20, background: '#ffffff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { label: 'Add Business',      icon: Plus,        color: '#2563eb', bg: '#eff6ff' },
              { label: 'View Analytics',    icon: BarChart2,   color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Schedule Content',  icon: Sparkles,    color: '#d97706', bg: '#fffbeb' },
              { label: 'Export Report',     icon: ExternalLink, color: '#16a34a', bg: '#f0fdf4' },
            ].map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 14px', borderRadius: 9,
                    background: item.bg, border: `1.5px solid ${item.color}22`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
                >
                  <Icon size={15} color={item.color} strokeWidth={2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
