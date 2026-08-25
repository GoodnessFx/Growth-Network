/**
 * Referral Engine — turns happy clients into a source of new clients.
 * Each client has a unique trackable code. The system prompts them at
 * the right moment (post-milestone), not randomly.
 * All outreach stops at a review step — nothing goes out without approval.
 * DEMO DATA clearly labeled.
 */
import { useState } from 'react'
import { Users, Star, Gift, Copy, Check, Send, Clock, ArrowRight, TrendingUp } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
interface ReferralClient {
  id: string
  name: string
  bizType: string
  referralCode: string
  referralCount: number
  convertedCount: number
  pendingReward: string | null
  recentMilestone: string | null   // null = no milestone recently, otherwise description
  link: string
  topReferral?: string             // name of their best referral
}

interface Referral {
  id: string
  referrerId: string
  referrerName: string
  refereeName: string
  status: 'pending' | 'contacted' | 'converted'
  createdAt: string
  rewardOwed: string | null
}

// ── Demo data ─────────────────────────────────────────────────────────────
const DEMO_CLIENTS: ReferralClient[] = [
  {
    id: '1', name: 'Amira Hassan', bizType: 'E-commerce', referralCode: 'AMI-001',
    referralCount: 3, convertedCount: 2,
    pendingReward: '₦10,000 discount on next invoice',
    recentMilestone: 'Revenue up 34% this month',
    link: 'https://growthnet.io/ref/AMI-001',
    topReferral: 'Pinnacle Global',
  },
  {
    id: '2', name: 'Emeka Okonkwo', bizType: 'Trading', referralCode: 'EME-002',
    referralCount: 1, convertedCount: 0,
    pendingReward: null,
    recentMilestone: null,
    link: 'https://growthnet.io/ref/EME-002',
  },
  {
    id: '3', name: 'Export Trade Ltd', bizType: 'Export/Import', referralCode: 'EXP-003',
    referralCount: 2, convertedCount: 1,
    pendingReward: '1 month free (₦45,000 value)',
    recentMilestone: 'Added 5 new clients this quarter',
    link: 'https://growthnet.io/ref/EXP-003',
    topReferral: 'BluePeak Sourcing',
  },
  {
    id: '4', name: 'BuySmart Procurement', bizType: 'Procurement', referralCode: 'BUY-004',
    referralCount: 0, convertedCount: 0,
    pendingReward: null,
    recentMilestone: null,
    link: 'https://growthnet.io/ref/BUY-004',
  },
]

const DEMO_REFERRALS: Referral[] = [
  { id: 'r1', referrerId: '1', referrerName: 'Amira Hassan',     refereeName: 'Pinnacle Global Supplies', status: 'converted', createdAt: '2026-07-12', rewardOwed: '₦10,000 discount' },
  { id: 'r2', referrerId: '1', referrerName: 'Amira Hassan',     refereeName: 'Apex Procurement',         status: 'contacted', createdAt: '2026-08-03', rewardOwed: null },
  { id: 'r3', referrerId: '1', referrerName: 'Amira Hassan',     refereeName: 'StellarSource Trading',    status: 'pending',   createdAt: '2026-08-17', rewardOwed: null },
  { id: 'r4', referrerId: '3', referrerName: 'Export Trade Ltd', refereeName: 'BluePeak Sourcing Co.',    status: 'converted', createdAt: '2026-07-28', rewardOwed: '1 month free' },
  { id: 'r5', referrerId: '3', referrerName: 'Export Trade Ltd', refereeName: 'Goodman & Goldsmith',      status: 'pending',   createdAt: '2026-08-14', rewardOwed: null },
  { id: 'r6', referrerId: '2', referrerName: 'Emeka Okonkwo',    refereeName: 'Zenith Logistics',         status: 'pending',   createdAt: '2026-08-18', rewardOwed: null },
]

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: '#6b7280', bg: '#f8f8f6' },
  contacted: { label: 'Contacted', color: '#d97706', bg: '#fffbeb' },
  converted: { label: 'Converted', color: '#16a34a', bg: '#f0fdf4' },
}

// ── Prompt composer (shown in a review panel before anything sends) ────────
function MilestonePromptPanel({ client, onClose }: { client: ReferralClient; onClose: () => void }) {
  const [rewardType, setRewardType] = useState<'discount' | 'free-month' | 'none'>('discount')
  const [rewardValue, setRewardValue] = useState('₦5,000')
  const [queued, setQueued] = useState(false)

  const msg = `Hi ${client.name.split(' ')[0]}! ${client.recentMilestone} — that's a real milestone and it's great to see your business growing 📈

We'd love to keep that momentum going. If you know another business owner who could use the same kind of support, your referral link is:
${client.link}

${rewardType !== 'none' ? `As a thank you, you'll get ${rewardValue} for every client you refer who signs up.` : ''}

No pressure — just thought of you because this moment feels right 🙌`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e', margin: '0 0 6px' }}>Review referral prompt</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          This will be queued for your review — it doesn't send until you approve it in the queue below.
        </p>

        {/* Milestone callout */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '11px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="#16a34a" />
          <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>{client.recentMilestone}</span>
        </div>

        {/* Reward config */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Reward for referrer</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[['discount', 'Cash discount'], ['free-month', 'Free month'], ['none', 'No reward']] .map(([v, l]) => (
              <button key={v} onClick={() => setRewardType(v as any)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${rewardType === v ? '#16a34a' : '#e8e8e4'}`, background: rewardType === v ? '#f0fdf4' : '#f8f8f6', color: rewardType === v ? '#15803d' : '#374151', transition: 'all 0.15s' }}>
                {l}
              </button>
            ))}
          </div>
          {rewardType !== 'none' && (
            <input value={rewardValue} onChange={e => setRewardValue(e.target.value)} className="gn-input" placeholder="e.g. ₦5,000" style={{ maxWidth: 200 }} />
          )}
        </div>

        {/* Message preview */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Message preview</label>
          <div style={{ background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '13px 15px', fontSize: 13, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{msg}</div>
        </div>

        {queued ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            <Check size={16} /> Added to send queue — you review it before it goes out.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setQueued(true)} className="btn btn-primary" style={{ gap: 7 }}>
              <Send size={13} /> Add to send queue
            </button>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function ReferralEngine() {
  const [clients] = useState<ReferralClient[]>(DEMO_CLIENTS)
  const [referrals] = useState<Referral[]>(DEMO_REFERRALS)
  const [copied, setCopied] = useState<string | null>(null)
  const [promptClient, setPromptClient] = useState<ReferralClient | null>(null)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'log'>('leaderboard')

  const totalReferrals  = referrals.length
  const totalConverted  = referrals.filter(r => r.status === 'converted').length
  const rewardsOwed     = referrals.filter(r => r.status === 'converted' && r.rewardOwed).map(r => r.rewardOwed)
  const clientsWithMilestone = clients.filter(c => c.recentMilestone)

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sorted = [...clients].sort((a, b) => b.convertedCount - a.convertedCount || b.referralCount - a.referralCount)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {promptClient && <MilestonePromptPanel client={promptClient} onClose={() => setPromptClient(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Referral Engine
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 560, lineHeight: 1.65 }}>
          Every happy client has a unique referral link. The system spots growth milestones and queues a prompt for your review — you approve before anything goes out.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total referrals',  value: totalReferrals, color: '#2563eb', bg: '#eff6ff', icon: Users },
          { label: 'Converted',        value: totalConverted, color: '#16a34a', bg: '#f0fdf4', icon: Check },
          { label: 'Rewards owed',     value: rewardsOwed.length, color: '#d97706', bg: '#fffbeb', icon: Gift },
          { label: 'Prompt-ready',     value: clientsWithMilestone.length, color: '#7c3aed', bg: '#f5f3ff', icon: TrendingUp },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '16px 18px', border: `1.5px solid ${s.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={14} color={s.color} />
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Milestone prompts ready */}
      {clientsWithMilestone.length > 0 && (
        <div style={{ background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={15} color="#16a34a" />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>
              {clientsWithMilestone.length} client{clientsWithMilestone.length > 1 ? 's' : ''} hit a milestone — good time to ask for a referral
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clientsWithMilestone.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '12px 16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f0f0e' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={10} /> {c.recentMilestone}
                  </div>
                </div>
                <button
                  onClick={() => setPromptClient(c)}
                  className="btn btn-accent btn-sm"
                  style={{ gap: 6 }}
                >
                  <Send size={11} /> Draft referral ask
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
            All prompts go into a review queue — nothing sends without your approval.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f0ed', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ id: 'leaderboard', label: 'Client Leaderboard' }, { id: 'log', label: 'Referral Log' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400, cursor: 'pointer', background: activeTab === t.id ? '#fff' : 'transparent', color: activeTab === t.id ? '#0f0f0e' : '#9ca3af', border: activeTab === t.id ? '1px solid #e8e8e4' : '1px solid transparent', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((c, idx) => (
            <div key={c.id} style={{ background: '#fff', border: `1.5px solid ${idx === 0 && c.convertedCount > 0 ? '#fde68a' : '#e8e8e4'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {/* Rank */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: idx === 0 ? '#fffbeb' : '#f8f8f6', border: `2px solid ${idx === 0 ? '#d97706' : '#e8e8e4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {idx === 0 ? <Star size={15} color="#d97706" /> : <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: '#9ca3af' }}>{idx + 1}</span>}
              </div>

              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{c.bizType}</div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f0f0e', lineHeight: 1 }}>{c.referralCount}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Referred</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#16a34a', lineHeight: 1 }}>{c.convertedCount}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Converted</div>
                </div>
              </div>

              {c.pendingReward && (
                <div style={{ fontSize: 11, fontWeight: 600, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Gift size={10} /> Reward owed: {c.pendingReward}
                </div>
              )}

              {/* Copy link */}
              <button
                onClick={() => copyLink(c.link, c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {copied === c.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy link</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Referral log */}
      {activeTab === 'log' && (
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #e8e8e4' }}>
                  {['Referred by', 'Referee', 'Status', 'Date', 'Reward'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map(r => {
                  const cfg = STATUS_CFG[r.status]
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f0ed' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0f0f0e' }}>{r.referrerName}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{r.refereeName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{r.createdAt}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: r.rewardOwed ? '#d97706' : '#d1d5db' }}>
                        {r.rewardOwed ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
