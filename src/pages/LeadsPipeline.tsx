import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase } from '../lib/supabase'

export default function LeadsPipeline({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (business) {
        query = query.eq('business_id', business.id)
      }
      const { data } = await query
      if (data) setLeads(data)
      setLoading(false)
    }
    fetchLeads()
  }, [business])

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800 }}>Leads Pipeline</h1>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3 }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading leads...</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>No leads captured yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Source</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13 }}>
                    <div>{lead.email}</div>
                    <div style={{ color: 'var(--muted-foreground)' }}>{lead.phone}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--muted-foreground)' }}>{lead.source}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 2, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono',
                      background: lead.status === 'converted' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: lead.status === 'converted' ? 'var(--accent)' : 'var(--warning)'
                    }}>
                      {lead.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
