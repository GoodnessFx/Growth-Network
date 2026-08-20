import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase } from '../lib/supabase'

export default function ServiceRequests({ business }: { business?: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('software')
  const [description, setDescription] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (business) {
        query = query.eq('business_id', business.id)
      }
      const { data } = await query
      if (data) setRequests(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [business])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return // Must be in a business context to submit
    if (!title) return
    
    await supabase.from('projects').insert({
      business_id: business.id,
      title,
      category,
      description,
      status: 'scoping'
    })
    
    setTitle('')
    setDescription('')
    fetchRequests()
  }

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800 }}>Service Requests & Projects</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: business ? '2fr 1fr' : '1fr', gap: 24 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3 }}>
          {loading ? (
            <div style={{ padding: 20 }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)' }}>No service requests found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {requests.map(req => (
                <div key={req.id} style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{req.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>{req.description}</p>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                      {req.category}
                    </span>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 2, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono',
                      background: req.status === 'completed' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: req.status === 'completed' ? 'var(--accent)' : 'var(--warning)'
                    }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {business && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20, height: 'fit-content' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Submit New Request</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label>
                <input 
                  value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3 }}
                  placeholder="e.g. New Landing Page" required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Category</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3 }}
                >
                  <option value="software">Software & Web</option>
                  <option value="design">Design & Branding</option>
                  <option value="automation">Automation & AI</option>
                  <option value="operations">Business Operations</option>
                  <option value="marketing">Growth & Marketing</option>
                  <option value="custom">Custom Request</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 3, minHeight: 100 }}
                  placeholder="Describe what you need..."
                />
              </div>
              <button type="submit" style={{ 
                background: 'var(--primary)', color: 'white', border: 'none', padding: '10px', 
                borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed' 
              }}>
                SUBMIT REQUEST
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
