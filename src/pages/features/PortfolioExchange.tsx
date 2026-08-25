/**
 * Portfolio Exchange — internal marketplace for businesses in the same
 * operator portfolio to refer work to each other.
 * Opt-in per business. Visible only within one Operator's portfolio.
 * DEMO DATA pattern — clearly labeled.
 */
import { useState } from 'react'
import { Plus, ArrowRight, Check, Bell, X, Tag } from 'lucide-react'

// DEMO DATA
const PORTFOLIO_BUSINESSES = [
  { id: 'b1', name: 'BuySmart Procurement', type: 'Procurement',   joined: true },
  { id: 'b2', name: 'Goodman & Goldsmith',  type: 'Trading',       joined: true },
  { id: 'b3', name: 'OPES Energy Services', type: 'Energy',        joined: false },
  { id: 'b4', name: 'Export Trade Ltd',     type: 'Export/Import', joined: true },
]

type PostCategory = 'overflow' | 'referral' | 'partnership' | 'resource'

interface ExchangePost {
  id: string
  businessId: string
  businessName: string
  businessType: string
  category: PostCategory
  title: string
  body: string
  value?: string
  createdAt: string
  responses: number
  isNew?: boolean
}

const DEMO_POSTS: ExchangePost[] = [
  { id: '1', businessId: 'b1', businessName: 'BuySmart Procurement', businessType: 'Procurement', category: 'overflow', title: 'Overflow: 2 procurement contracts available this month', body: 'We have more contract volume than we can handle in September. Looking for a reliable partner to take 2 mid-size procurement jobs (₦800k–1.2M each). Logistics and trade experience preferred.', value: '₦800k–1.2M each', createdAt: '2 hours ago', responses: 1, isNew: true },
  { id: '2', businessId: 'b2', businessName: 'Goodman & Goldsmith',  businessType: 'Trading', category: 'referral', title: 'Client needs a freight forwarder — does anyone cover Apapa?', body: 'One of our trading clients needs bonded warehouse access and port clearing at Apapa. We do not cover logistics. Can anyone in the portfolio take this referral?', value: undefined, createdAt: '1 day ago', responses: 2 },
  { id: '3', businessId: 'b4', businessName: 'Export Trade Ltd', businessType: 'Export/Import', category: 'partnership', title: 'Joint tender: looking for a co-applicant for an NNPC supply tender', body: 'We are applying for an NNPC materials supply tender worth ₦24M. The tender requires a JV partner with prior government procurement history. Interested businesses should have ₦5M+ verifiable track record.', value: '₦24M JV', createdAt: '3 days ago', responses: 0 },
]

const CAT_CFG: Record<PostCategory, { label: string; bg: string; color: string }> = {
  overflow:    { label: 'Overflow Work', bg: '#eff6ff', color: '#2563eb' },
  referral:    { label: 'Referral',      bg: '#f0fdf4', color: '#16a34a' },
  partnership: { label: 'Partnership',   bg: '#f5f3ff', color: '#7c3aed' },
  resource:    { label: 'Resource Share',bg: '#fffbeb', color: '#d97706' },
}

export default function PortfolioExchange() {
  const [posts, setPosts] = useState<ExchangePost[]>(DEMO_POSTS)
  const [businesses, setBusinesses] = useState(PORTFOLIO_BUSINESSES)
  const [catFilter, setCatFilter] = useState<'all' | PostCategory>('all')
  const [showNew, setShowNew] = useState(false)
  const [responded, setResponded] = useState<Set<string>>(new Set())

  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [cat, setCat]           = useState<PostCategory>('overflow')
  const [valueStr, setValueStr] = useState('')

  const addPost = () => {
    if (!title || !body) return
    setPosts(p => [{
      id: `local-${Date.now()}`,
      businessId: 'b1', businessName: 'Your Business', businessType: 'SME',
      category: cat, title, body, value: valueStr || undefined,
      createdAt: 'Just now', responses: 0,
    }, ...p])
    setTitle(''); setBody(''); setValueStr(''); setShowNew(false)
  }

  const toggleJoin = (id: string) =>
    setBusinesses(p => p.map(b => b.id === id ? { ...b, joined: !b.joined } : b))

  const respond = (id: string) => {
    setResponded(p => new Set([...p, id]))
    setPosts(p => p.map(post => post.id === id ? { ...post, responses: post.responses + 1 } : post))
  }

  const filtered = catFilter === 'all' ? posts : posts.filter(p => p.category === catFilter)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Portfolio Exchange</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f0f0e', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Businesses helping<br />
          <span style={{ fontStyle: 'italic', color: '#2d6a4f' }}>each other grow.</span>
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 540, lineHeight: 1.65 }}>
          Refer overflow work, find co-applicants for tenders, and share resources — only visible inside this portfolio.
          The more businesses join, the more valuable this becomes for everyone.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Main feed */}
        <div>
          {/* Filters + post button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'overflow', 'referral', 'partnership', 'resource'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: catFilter === c ? '#0f0f0e' : '#f1f0ed',
                    color: catFilter === c ? '#fff' : '#6b7280',
                    transition: 'all 0.15s',
                  }}
                >
                  {c === 'all' ? 'All' : CAT_CFG[c].label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNew(s => !s)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Plus size={12} /> Post request
            </button>
          </div>

          {/* New post form */}
          {showNew && (
            <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New Exchange Post</h3>
                <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={15} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Category</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(Object.keys(CAT_CFG) as PostCategory[]).map(c => (
                      <button key={c} onClick={() => setCat(c)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: cat === c ? CAT_CFG[c].bg : '#f1f0ed', color: cat === c ? CAT_CFG[c].color : '#9ca3af', border: `1px solid ${cat === c ? CAT_CFG[c].color + '40' : 'transparent'}`, transition: 'all 0.15s' }}>
                        {CAT_CFG[c].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="gn-input" placeholder="e.g. Overflow: 2 logistics contracts available" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Details *</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} className="gn-input" rows={4} style={{ resize: 'vertical' }} placeholder="Describe what you're offering or looking for. Be specific — the more detail, the better the match." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Value / Budget (optional)</label>
                  <input value={valueStr} onChange={e => setValueStr(e.target.value)} className="gn-input" placeholder="e.g. ₦800k–1.2M, or 'Revenue share'" />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={addPost} className="btn btn-accent" style={{ gap: 6 }}><Check size={13} /> Post</button>
                  <button onClick={() => setShowNew(false)} className="btn btn-ghost">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(post => {
              const cfg = CAT_CFG[post.category]
              const hasResponded = responded.has(post.id)
              return (
                <div
                  key={post.id}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${post.isNew ? '#bbf7d0' : '#e8e8e4'}`,
                    borderRadius: 12, padding: '18px 20px',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f4ee, #c3e6cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                        {post.businessName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e' }}>{post.businessName}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{post.businessType} · {post.createdAt}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {post.isNew && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>New</span>}
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 12 }}>{post.body}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {post.value && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#0f0f0e', background: '#f8f8f6', border: '1px solid #e8e8e4', padding: '3px 9px', borderRadius: 6 }}>
                          <Tag size={9} style={{ marginRight: 4 }} />{post.value}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{post.responses} {post.responses === 1 ? 'response' : 'responses'}</span>
                    </div>
                    <button
                      onClick={() => respond(post.id)}
                      disabled={hasResponded}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600,
                        color: hasResponded ? '#16a34a' : '#0f0f0e',
                        background: hasResponded ? '#f0fdf4' : '#f1f0ed',
                        border: `1px solid ${hasResponded ? '#bbf7d0' : '#e8e8e4'}`,
                        borderRadius: 7, padding: '6px 12px', cursor: hasResponded ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {hasResponded ? <><Check size={11} /> Responded</> : <>Respond <ArrowRight size={11} /></>}
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: 13, background: '#fff', border: '1.5px dashed #e8e8e4', borderRadius: 12 }}>
                No posts in this category yet. Be the first to post a request.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: portfolio businesses */}
        <div>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e8e4' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>Portfolio Businesses</h2>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Opt-in to participate in the Exchange</p>
            </div>
            {businesses.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f1f0ed' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f4ee, #c3e6cb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                  {b.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 12, color: '#0f0f0e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{b.type}</div>
                </div>
                <button
                  onClick={() => toggleJoin(b.id)}
                  style={{
                    padding: '4px 9px', borderRadius: 99, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: b.joined ? '#f0fdf4' : '#f1f0ed',
                    color: b.joined ? '#16a34a' : '#9ca3af',
                    transition: 'all 0.15s',
                  }}
                >
                  {b.joined ? '✓ In' : 'Join'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
            <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600, margin: '0 0 6px' }}>How it works</p>
            <ol style={{ paddingLeft: 16, fontSize: 12, color: '#374151', lineHeight: 1.8, margin: 0 }}>
              <li>A business posts overflow work, a referral, or a partnership need</li>
              <li>Other opted-in businesses in this portfolio see the post</li>
              <li>Interested businesses respond — the posting business connects directly</li>
              <li>No platform fee, no cross-portfolio visibility</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
