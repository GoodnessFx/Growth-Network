import { useState, useEffect } from 'react'
import { fetchBusinesses, type ApiBusiness } from '../lib/api'
import { supabase } from '../lib/supabase'

export default function ClientDashboard({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [projRes, snapRes] = await Promise.all([
          supabase.from('projects').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
          supabase.from('analytics_snapshots').select('*').eq('business_id', business.id).order('recorded_at', { ascending: true })
        ])
        if (projRes.data) setProjects(projRes.data)
        if (snapRes.data) setSnapshots(snapRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [business.id])

  if (loading) {
    return <div style={{ padding: 24 }}>Loading dashboard...</div>
  }

  const activeProjects = projects.filter(p => p.status !== 'completed')

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Dashboard for {business.name}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Active Projects Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Projects & Requests</h2>
          {activeProjects.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No active projects.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeProjects.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{p.category}</div>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: p.status === 'in-progress' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: p.status === 'in-progress' ? 'var(--accent)' : 'var(--warning)'
                    }}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Growth Analytics Widget */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Growth Analytics</h2>
          {snapshots.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No historical data available yet.</p>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              {/* Very basic bar chart representation, ideally use Recharts */}
              {snapshots.map(s => (
                <div key={s.id} style={{ 
                  flex: 1, 
                  background: 'var(--primary)', 
                  height: `${Math.min(100, s.value / 100)}%`, 
                  minHeight: 10,
                  borderRadius: '2px 2px 0 0'
                }} title={`${s.metric_type}: ${s.value}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
