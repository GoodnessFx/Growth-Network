import { useState, useEffect } from 'react'
import { type ApiBusiness } from '../lib/api'
import { supabase } from '../lib/supabase'
import { Plus } from 'lucide-react'

export default function ContentCalendar({ business }: { business: ApiBusiness }) {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  
  // Basic implementation of a calendar view
  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      const { data } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('business_id', business.id)
        .order('scheduled_date', { ascending: true })
      
      if (data) setPosts(data)
      setLoading(false)
    }
    loadPosts()
  }, [business.id])

  return (
    <div className="page-pad" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800 }}>Content Calendar</h1>
        <button style={{ 
          background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', 
          borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Plus size={16} /> NEW POST
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: 20 }}>
        {loading ? (
          <div>Loading calendar...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: 40 }}>
            No content scheduled. Click New Post to get started.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {posts.map(post => (
              <div key={post.id} style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{post.platform}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{new Date(post.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 14, marginBottom: 12 }}>{post.body}</div>
                <div style={{ display: 'inline-block', padding: '2px 8px', background: 'var(--secondary)', borderRadius: 2, fontSize: 11 }}>
                  {post.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
