/**
 * Social Publisher — operator drafts posts for any managed business,
 * edits inline, then one-click shares to Facebook / Instagram / WhatsApp.
 * Designed to manage 100+ businesses' social content from one screen.
 * No external API needed — uses wa.me links and Web Share API / platform URLs.
 */
import { useState, useRef } from 'react'
import {
  Sparkles, Send, Edit2, Check, X, Copy,
  MessageSquare, RefreshCw, Clock, CheckCircle2,
  Globe, Share, AtSign,
} from 'lucide-react'
import { type ApiBusiness } from '../../lib/api'

// ── Platform config ────────────────────────────────────────────────────────
interface Platform {
  id: string
  label: string
  icon: React.ElementType
  color: string
  bg: string
  shareUrl: (text: string, biz: ApiBusiness) => string
  cta: string
}

const PLATFORMS: Platform[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Globe,
    color: '#1877F2',
    bg: '#eff6ff',
    shareUrl: (text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://growthnet.io')}&quote=${encodeURIComponent(text)}`,
    cta: 'Post to Facebook',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: AtSign,
    color: '#E1306C',
    bg: '#fdf2f8',
    shareUrl: (_text) => `https://www.instagram.com/`,
    cta: 'Copy & open Instagram',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
    color: '#16a34a',
    bg: '#f0fdf4',
    shareUrl: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
    cta: 'Send via WhatsApp',
  },
]

// ── Post templates per business type ──────────────────────────────────────
function draftPost(biz: ApiBusiness, tone: 'promo' | 'edu' | 'story' | 'offer'): string {
  const name = biz.name
  const type = (biz.type ?? 'business').toLowerCase()

  const posts: Record<string, Record<string, string>> = {
    promo: {
      default:     `Big things are happening at ${name}. If you've been waiting for the right moment to reach out — this is it.\n\nWe're ready to help you move faster, grow smarter, and get results that actually show up.\n\nDM us or visit our link in bio to get started. 🚀`,
      procurement: `Planning your end-of-year procurement?\n\nThe earlier you move, the better the prices and the smoother the delivery.\n\n✅ Staff gifts\n✅ Corporate souvenirs\n✅ Branded merchandise\n✅ Bulk sourcing from China, Vietnam, and beyond\n\nDon't wait for the rush. Let's get your 2026 order sorted early.\n\n📧 Contact us via our bio link\n\n— ${name}`,
      trading:     `Looking for a reliable trading partner in West Africa?\n\n${name} connects buyers and suppliers across the region — with a track record of on-time delivery and competitive pricing.\n\nGet in touch today to discuss your next order. 📦\n\n— ${name}`,
      law:         `Your legal matter deserves expert attention from day one.\n\n${name} — experienced, responsive, results-driven.\n\nBook a consultation today.\n\n— ${name}`,
      clinic:      `Your health is our priority at ${name}.\n\nBook your appointment today and take the first step toward feeling your best.\n\n📅 Appointments available this week.\n\n— ${name}`,
      school:      `Applications are open at ${name}.\n\nGive your child the foundation they deserve. Limited spaces available.\n\nContact us today to learn more.\n\n— ${name}`,
    },
    edu: {
      default:     `Did you know?\n\nMost businesses lose 30% of potential revenue simply because they don't follow up on leads within 48 hours.\n\nAt ${name}, we make sure nothing falls through the cracks.\n\nWhat's your biggest challenge right now? Drop it in the comments 👇`,
      procurement: `3 mistakes businesses make when sourcing products:\n\n1. Waiting until the last minute\n2. Not comparing multiple suppliers\n3. Skipping quality checks\n\n${name} helps you avoid all three.\n\nComment "SOURCING" to learn how we work. 👇`,
      trading:     `Understanding Incoterms before you import could save you thousands.\n\nEXW, FOB, CIF — do you know the difference?\n\nAt ${name}, we guide you through every step.\n\nDM us with your questions. 📦`,
    },
    story: {
      default:     `Behind the scenes at ${name}.\n\nEvery day we're doing the work — so our clients don't have to worry about it.\n\nHere's what a typical week looks like for us... 🧵\n\n[Share what makes your process unique]`,
      procurement: `How we sourced 10,000 units from Asia in 3 weeks — and delivered on time.\n\nThread 🧵\n\nWhen one of our clients came to us with an emergency order, here's exactly what we did:\n\n1. Identified 3 verified suppliers within 24 hours\n2. Negotiated pricing in parallel\n3. Arranged quality inspection before shipping\n4. Coordinated customs clearance end-to-end\n\nResult: client received goods 2 days ahead of schedule.\n\nThis is what ${name} does every day. 📦`,
    },
    offer: {
      default:     `⚡ Limited offer from ${name}\n\nFor the next 48 hours only:\n\n✅ [Your offer here]\n✅ [Bonus or extra]\n✅ Free consultation included\n\nDon't miss this. Reply "YES" or DM us to claim.\n\n— ${name}`,
      procurement: `🔥 End-of-year procurement deal\n\nBook your order with ${name} before [date] and get:\n\n✅ Priority processing\n✅ Locked-in pricing\n✅ Early delivery guarantee\n\nReply "BOOK" to secure your slot. Only 5 spots left.\n\n— ${name}`,
    },
  }

  // Match business type
  const typeKey = (() => {
    if (type.includes('procure') || type.includes('supply')) return 'procurement'
    if (type.includes('trade') || type.includes('import') || type.includes('export')) return 'trading'
    if (type.includes('law') || type.includes('legal')) return 'law'
    if (type.includes('clinic') || type.includes('health') || type.includes('hospital')) return 'clinic'
    if (type.includes('school') || type.includes('college') || type.includes('academ')) return 'school'
    return 'default'
  })()

  const toneMap = posts[tone]
  return toneMap[typeKey] ?? toneMap.default ?? posts.promo.default
}

// ── Status types ───────────────────────────────────────────────────────────
type PostStatus = 'draft' | 'queued' | 'posted'

interface QueuedPost {
  id: string
  bizId: string
  bizName: string
  platform: string
  text: string
  status: PostStatus
  createdAt: string
  postedAt?: string
}

type ToneId = 'promo' | 'edu' | 'story' | 'offer'

const TONES: Array<{ id: ToneId; label: string; desc: string }> = [
  { id: 'promo',  label: 'Promotional', desc: 'Sell a product or service' },
  { id: 'edu',    label: 'Educational', desc: 'Share a tip or insight' },
  { id: 'story',  label: 'Behind scenes', desc: 'Show your process' },
  { id: 'offer',  label: 'Flash offer',  desc: 'Time-limited deal' },
]

const STATUS_CFG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft:  { label: 'Draft',  color: '#6b7280', bg: '#f8f8f6' },
  queued: { label: 'Queued', color: '#d97706', bg: '#fffbeb' },
  posted: { label: 'Posted', color: '#16a34a', bg: '#f0fdf4' },
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function SocialPublisher({ businesses }: { businesses: ApiBusiness[] }) {
  const [selectedBizId, setSelectedBizId] = useState<string>(businesses[0]?.id ?? '')
  const [platform, setPlatform]           = useState<string>('facebook')
  const [tone, setTone]                   = useState<ToneId>('promo')
  const [draft, setDraft]                 = useState<string>('')
  const [editing, setEditing]             = useState(false)
  const [copied, setCopied]               = useState(false)
  const [queue, setQueue]                 = useState<QueuedPost[]>([])
  const [queueFilter, setQueueFilter]     = useState<'all' | PostStatus>('all')
  const textRef = useRef<HTMLTextAreaElement>(null)

  const selectedBiz = businesses.find(b => b.id === selectedBizId) ?? businesses[0]
  const plt = PLATFORMS.find(p => p.id === platform) ?? PLATFORMS[0]

  // Generate a fresh draft
  const generate = () => {
    if (!selectedBiz) return
    const text = draftPost(selectedBiz, tone)
    setDraft(text)
    setEditing(false)
  }

  // Copy text to clipboard
  const copy = () => {
    navigator.clipboard.writeText(draft).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Add to review queue (does NOT post yet)
  const addToQueue = () => {
    if (!draft || !selectedBiz) return
    setQueue(p => [{
      id: `q-${Date.now()}`,
      bizId: selectedBiz.id,
      bizName: selectedBiz.name,
      platform,
      text: draft,
      status: 'queued',
      createdAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }, ...p])
  }

  // Mark as posted in queue
  const markPosted = (id: string) =>
    setQueue(p => p.map(q => q.id === id ? { ...q, status: 'posted', postedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) } : q))

  const removeFromQueue = (id: string) => setQueue(p => p.filter(q => q.id !== id))

  const filteredQueue = queueFilter === 'all' ? queue : queue.filter(q => q.status === queueFilter)

  const charCount   = draft.length
  const charWarning = charCount > 500

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 3vw, 34px)', color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Social Publisher
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 560, lineHeight: 1.65 }}>
          Pick a business, generate a tailored post, edit it, then post to any platform in one click.
          Manage all your clients' social content from one screen.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* ── Left: composer ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Business + platform selectors */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Business
                </label>
                <select
                  value={selectedBizId}
                  onChange={e => { setSelectedBizId(e.target.value); setDraft('') }}
                  className="gn-input"
                  style={{ fontWeight: 500 }}
                >
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Platform
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PLATFORMS.map(p => {
                    const Icon = p.icon
                    const active = platform === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        title={p.label}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '9px 8px', borderRadius: 8, cursor: 'pointer',
                          background: active ? p.bg : '#f8f8f6',
                          border: `1.5px solid ${active ? p.color + '60' : '#e8e8e4'}`,
                          color: active ? p.color : '#9ca3af',
                          fontSize: 11, fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                      >
                        <Icon size={14} />
                        <span className="hide-xs">{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tone selector */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Post tone
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  title={t.desc}
                  style={{
                    padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    background: tone === t.id ? '#0f0f0e' : '#f1f0ed',
                    color: tone === t.id ? '#fff' : '#6b7280',
                    border: 'none', transition: 'all 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Draft area */}
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} color="#16a34a" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e' }}>
                  {draft ? `Draft for ${selectedBiz?.name ?? 'business'}` : 'Click Generate to draft a post'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {draft && (
                  <>
                    <button
                      onClick={() => { setEditing(e => !e); setTimeout(() => textRef.current?.focus(), 50) }}
                      className="btn btn-ghost btn-sm"
                      style={{ gap: 4 }}
                    >
                      <Edit2 size={11} /> {editing ? 'Done' : 'Edit'}
                    </button>
                    <button onClick={copy} className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </>
                )}
                <button
                  onClick={generate}
                  className="btn btn-primary btn-sm"
                  style={{ gap: 5 }}
                  disabled={!selectedBiz}
                >
                  <RefreshCw size={11} /> {draft ? 'Regenerate' : 'Generate'}
                </button>
              </div>
            </div>

            {draft ? (
              <div style={{ padding: 18 }}>
                {editing ? (
                  <textarea
                    ref={textRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="gn-input"
                    rows={12}
                    style={{ resize: 'vertical', fontSize: '14px !important', lineHeight: 1.75 }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 14, color: '#374151', lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      padding: '4px 0',
                      cursor: 'text',
                    }}
                    onClick={() => setEditing(true)}
                  >
                    {draft}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: charWarning ? '#d97706' : '#9ca3af' }}>
                    {charCount} chars{charWarning ? ' — consider trimming for better engagement' : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                <Sparkles size={28} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>Select a business, choose a tone, hit Generate.</p>
                <p style={{ margin: '6px 0 0', fontSize: 12 }}>The post is tailored to that business's industry and name.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {draft && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Primary: open platform share link */}
              <a
                href={plt.shareUrl(draft, selectedBiz!)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (plt.id === 'instagram') copy()
                  markPosted(queue.find(q => q.bizId === selectedBizId && q.platform === platform && q.status === 'queued')?.id ?? '')
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 8,
                  background: plt.color, color: '#fff',
                  fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.9)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                <plt.icon size={14} />
                {plt.cta}
                {plt.id === 'instagram' && <span style={{ fontSize: 10, opacity: 0.75 }}>(copies first)</span>}
              </a>

              {/* Add to queue for later */}
              <button onClick={addToQueue} className="btn btn-ghost" style={{ gap: 6 }}>
                <Clock size={13} /> Add to queue
              </button>
            </div>
          )}

          {/* Quick multi-business fire — post same content to all */}
          {draft && businesses.length > 1 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '13px 16px' }}>
              <p style={{ fontSize: 12, color: '#92400e', margin: '0 0 10px', fontWeight: 600 }}>
                ⚡ Batch queue — add this post for multiple businesses at once
              </p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {businesses.filter(b => b.id !== selectedBizId).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setQueue(p => [{
                      id: `q-${Date.now()}-${b.id}`,
                      bizId: b.id,
                      bizName: b.name,
                      platform,
                      text: draftPost(b, tone),
                      status: 'queued',
                      createdAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    }, ...p])}
                    style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #fde68a', color: '#92400e', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fef9c3')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    + {b.name}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#a16207', margin: '8px 0 0' }}>
                Each business gets a post tailored to their industry — queued for your review before posting.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: post queue ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>
                Post Queue ({queue.length})
              </h2>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['all', 'queued', 'posted'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setQueueFilter(f)}
                    style={{
                      padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                      cursor: 'pointer',
                      background: queueFilter === f ? '#0f0f0e' : '#f1f0ed',
                      color: queueFilter === f ? '#fff' : '#9ca3af',
                      border: 'none', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredQueue.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                <Clock size={22} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No posts in queue yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: 11 }}>Generate a post and add it to the queue.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                {filteredQueue.map(post => {
                  const pCfg = PLATFORMS.find(p => p.id === post.platform) ?? PLATFORMS[0]
                  const sCfg = STATUS_CFG[post.status]
                  const PIcon = pCfg.icon
                  return (
                    <div
                      key={post.id}
                      style={{
                        padding: '13px 16px',
                        borderBottom: '1px solid #f1f0ed',
                        background: post.status === 'posted' ? '#fafaf8' : '#fff',
                        opacity: post.status === 'posted' ? 0.65 : 1,
                      }}
                    >
                      {/* Business + platform + status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PIcon size={13} color={pCfg.color} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#0f0f0e' }}>{post.bizName}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: sCfg.bg, color: sCfg.color }}>
                          {sCfg.label}
                        </span>
                      </div>

                      {/* Post preview */}
                      <p style={{
                        fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: '0 0 10px',
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      }}>
                        {post.text}
                      </p>

                      {/* Time */}
                      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} /> Added {post.createdAt}
                        {post.postedAt && <span style={{ marginLeft: 8 }}>· Posted {post.postedAt}</span>}
                      </div>

                      {/* Actions */}
                      {post.status === 'queued' && (
                        <div style={{ display: 'flex', gap: 7 }}>
                          <a
                            href={pCfg.shareUrl(post.text, businesses.find(b => b.id === post.bizId)!)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => markPosted(post.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 6,
                              background: pCfg.bg, color: pCfg.color,
                              border: `1px solid ${pCfg.color}30`, textDecoration: 'none',
                            }}
                          >
                            <Send size={10} /> Post now
                          </a>
                          <button
                            onClick={() => removeFromQueue(post.id)}
                            style={{ fontSize: 11, padding: '5px 9px', borderRadius: 6, cursor: 'pointer', background: 'none', border: '1px solid #e8e8e4', color: '#9ca3af' }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                      {post.status === 'posted' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                          <CheckCircle2 size={11} /> Done
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', margin: '0 0 8px' }}>How to post in 30 seconds</p>
            <ol style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#374151', lineHeight: 1.65 }}>
              <li>Pick a business + platform + tone</li>
              <li>Hit Generate — edit anything you want</li>
              <li>Click "Post to Facebook" — it opens with the caption pre-filled</li>
              <li>For Instagram: caption is auto-copied, opens the app</li>
              <li>For WhatsApp: opens wa.me with the message ready</li>
            </ol>
            <p style={{ fontSize: 11, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>
              Use Batch Queue to draft for all businesses at once — then post them one by one during the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
