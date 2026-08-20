import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ClipboardList, BarChart3, Calendar, Users } from 'lucide-react'

// Demo data for when Supabase is not connected
const DEMO_PROJECTS = [
  { id: '1', title: 'Website Redesign', category: 'Software & Web', status: 'in-progress', description: 'Complete overhaul of the company website with modern design.' },
  { id: '2', title: 'Social Media Strategy', category: 'Growth & Marketing', status: 'scoping', description: 'Develop a 90-day content strategy for Instagram and LinkedIn.' },
  { id: '3', title: 'Brand Identity Package', category: 'Design & Branding', status: 'completed', description: 'Logo, color palette, typography, and brand guidelines.' },
  { id: '4', title: 'Invoice Automation', category: 'Automation & AI', status: 'in-progress', description: 'Automated invoice generation and payment reminders.' },
]

const DEMO_SNAPSHOTS = [
  { id: '1', metric_type: 'followers', value: 1200, recorded_at: '2026-03-01' },
  { id: '2', metric_type: 'followers', value: 1450, recorded_at: '2026-04-01' },
  { id: '3', metric_type: 'followers', value: 1680, recorded_at: '2026-05-01' },
  { id: '4', metric_type: 'followers', value: 2100, recorded_at: '2026-06-01' },
  { id: '5', metric_type: 'followers', value: 2500, recorded_at: '2026-07-01' },
  { id: '6', metric_type: 'followers', value: 3200, recorded_at: '2026-08-01' },
]

export default function ClientDashboard({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const [projRes, snapRes] = await Promise.all([
            supabase.from('projects').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
            supabase.from('analytics_snapshots').select('*').eq('business_id', business.id).order('recorded_at', { ascending: true })
          ])
          if (projRes.data && projRes.data.length > 0) setProjects(projRes.data)
          else setProjects(DEMO_PROJECTS)
          if (snapRes.data && snapRes.data.length > 0) setSnapshots(snapRes.data)
          else setSnapshots(DEMO_SNAPSHOTS)
        } catch (err) {
          console.error(err)
          setProjects(DEMO_PROJECTS)
          setSnapshots(DEMO_SNAPSHOTS)
        }
      } else {
        setProjects(DEMO_PROJECTS)
        setSnapshots(DEMO_SNAPSHOTS)
      }
      setLoading(false)
    }
    loadData()
  }, [business.id])

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Loading dashboard...</div>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status !== 'completed')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const maxSnapshotValue = Math.max(...snapshots.map(s => s.value), 1)

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--foreground)' }}>
        Dashboard
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>
        Overview for <strong>{business.name}</strong>
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Projects', value: activeProjects.length, icon: ClipboardList, color: 'var(--primary)' },
          { label: 'Completed', value: completedProjects.length, icon: BarChart3, color: 'var(--accent)' },
          { label: 'Scheduled Posts', value: 12, icon: Calendar, color: 'var(--warning)' },
          { label: 'Total Leads', value: 8, icon: Users, color: 'var(--danger)' },
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
        {/* Active Projects Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>
            Active Projects & Requests
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

        {/* Growth Analytics Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted-foreground)' }}>
            Growth Over Time
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
      </div>
    </div>
  )
}
