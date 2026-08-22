/**
 * White-Label Reseller Mode.
 * Resellers run GrowthNet under their own brand (logo, name, accent color).
 * Platform owner sees rollup: reseller count, businesses under each, revenue share owed.
 * Multi-tenant branding layer is real — applied via ResellerBranding context.
 * Billing v1: flat percentage per reseller. No tiered pricing yet.
 */
import { useState } from 'react'
import { Plus, Building2, Users, DollarSign, Palette, Check, X, Globe, ChevronDown, Eye } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
interface Reseller {
  id: string
  name: string
  brandName: string       // what their clients see instead of "GrowthNet"
  brandColor: string      // hex accent color for their instance
  logo?: string           // URL — blank = initials fallback
  ownerEmail: string
  businessCount: number
  monthlyRevenue: number  // revenue they're generating on the platform
  revenueSharePct: number // flat % you earn
  status: 'active' | 'trial' | 'suspended'
  joinedAt: string
}

// ── Demo data ─────────────────────────────────────────────────────────────
const DEMO_RESELLERS: Reseller[] = [
  {
    id: '1', name: 'Tayo Adeyemi', brandName: 'ScaleStack Africa', brandColor: '#6d28d9',
    ownerEmail: 'tayo@scalestackafrica.com',
    businessCount: 8, monthlyRevenue: 360000, revenueSharePct: 20,
    status: 'active', joinedAt: '2026-05-01',
  },
  {
    id: '2', name: 'Chinonso Obi', brandName: 'Launchpad Pro', brandColor: '#dc2626',
    ownerEmail: 'chinonso@launchpadpro.ng',
    businessCount: 3, monthlyRevenue: 135000, revenueSharePct: 20,
    status: 'trial', joinedAt: '2026-08-10',
  },
]

const STATUS_CFG = {
  active:    { label: 'Active',    color: '#16a34a', bg: '#f0fdf4' },
  trial:     { label: 'Trial',     color: '#d97706', bg: '#fffbeb' },
  suspended: { label: 'Suspended', color: '#dc2626', bg: '#fef2f2' },
}

// ── Branding preview ──────────────────────────────────────────────────────
function BrandPreview({ reseller }: { reseller: Reseller }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 10, overflow: 'hidden' }}>
      {/* Mock topbar with reseller branding */}
      <div style={{ height: 44, background: '#fff', borderBottom: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: reseller.brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
          {reseller.brandName[0]}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: '#0f0f0e' }}>
          {reseller.brandName}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#9ca3af', fontStyle: 'italic' }}>GrowthNet branding hidden</span>
      </div>
      {/* Mock sidebar */}
      <div style={{ display: 'flex', height: 80 }}>
        <div style={{ width: 100, background: '#f8f8f6', borderRight: '1px solid #e8e8e4', padding: '8px 0' }}>
          {['Dashboard', 'Clients', 'Tools'].map(item => (
            <div key={item} style={{ padding: '5px 12px', fontSize: 10, color: item === 'Dashboard' ? reseller.brandColor : '#9ca3af', fontWeight: item === 'Dashboard' ? 600 : 400, borderLeft: item === 'Dashboard' ? `2px solid ${reseller.brandColor}` : '2px solid transparent' }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>DASHBOARD</div>
          <div style={{ height: 8, background: '#f1f0ed', borderRadius: 4, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 6, background: reseller.brandColor + '20', borderRadius: 4, width: '40%' }} />
        </div>
      </div>
    </div>
  )
}

// ── Add reseller form ──────────────────────────────────────────────────────
function AddResellerForm({ onAdd, onClose }: { onAdd: (r: Reseller) => void; onClose: () => void }) {
  const [name, setName]             = useState('')
  const [brandName, setBrandName]   = useState('')
  const [email, setEmail]           = useState('')
  const [color, setColor]           = useState('#6d28d9')
  const [sharePct, setSharePct]     = useState(20)

  const submit = () => {
    if (!name || !brandName || !email) return
    onAdd({
      id: `local-${Date.now()}`, name, brandName, brandColor: color,
      ownerEmail: email, businessCount: 0, monthlyRevenue: 0,
      revenueSharePct: sharePct, status: 'trial',
      joinedAt: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0f0f0e', margin: 0 }}>Add Reseller</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Reseller's name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="gn-input" placeholder="e.g. Tayo Adeyemi" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Brand name (what their clients see) *</label>
            <input value={brandName} onChange={e => setBrandName(e.target.value)} className="gn-input" placeholder="e.g. ScaleStack Africa" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="gn-input" placeholder="reseller@example.com" />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Brand accent color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1.5px solid #e8e8e4', cursor: 'pointer' }} />
                <input value={color} onChange={e => setColor(e.target.value)} className="gn-input" style={{ flex: 1 }} />
              </div>
            </div>
            <div style={{ width: 140 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Your revenue share %</label>
              <input type="number" value={sharePct} onChange={e => setSharePct(Number(e.target.value))} min={5} max={50} className="gn-input" />
            </div>
          </div>
          {brandName && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Preview</label>
              <BrandPreview reseller={{ id: 'preview', name, brandName, brandColor: color, ownerEmail: email, businessCount: 0, monthlyRevenue: 0, revenueSharePct: sharePct, status: 'trial', joinedAt: '' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={submit} disabled={!name || !brandName || !email} className="btn btn-primary" style={{ gap: 7 }}>
              <Check size={13} /> Invite reseller
            </button>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function ResellerMode() {
  const [resellers, setResellers] = useState<Reseller[]>(DEMO_RESELLERS)
  const [showAdd, setShowAdd]     = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)

  const totalBiz         = resellers.reduce((s, r) => s + r.businessCount, 0)
  const totalRevenue     = resellers.reduce((s, r) => s + r.monthlyRevenue, 0)
  const totalEarnings    = resellers.reduce((s, r) => s + Math.round(r.monthlyRevenue * r.revenueSharePct / 100), 0)
  const activeCount      = resellers.filter(r => r.status === 'active').length

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      {showAdd && <AddResellerForm onAdd={r => { setResellers(p => [r, ...p]); setShowAdd(false) }} onClose={() => setShowAdd(false)} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Agency Tools</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
              White-Label Reseller Mode
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 520, lineHeight: 1.65 }}>
              Other agencies run GrowthNet under their own brand. You earn a flat revenue share on every business they manage. No GrowthNet branding visible to their clients.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ gap: 7 }}>
            <Plus size={14} /> Add reseller
          </button>
        </div>
      </div>

      {/* Platform rollup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active resellers', value: activeCount, color: '#16a34a', bg: '#f0fdf4', icon: Building2 },
          { label: 'Businesses managed', value: totalBiz, color: '#2563eb', bg: '#eff6ff', icon: Users },
          { label: 'Platform revenue/mo', value: `₦${(totalRevenue / 1000).toFixed(0)}k`, color: '#7c3aed', bg: '#f5f3ff', icon: Globe },
          { label: 'Your earnings/mo',   value: `₦${(totalEarnings / 1000).toFixed(0)}k`, color: '#d97706', bg: '#fffbeb', icon: DollarSign },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '18px 20px', border: `1.5px solid ${s.color}22` }}>
              <div style={{ marginBottom: 10 }}><Icon size={15} color={s.color} /></div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginTop: 5 }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Reseller cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {resellers.map(r => {
          const cfg = STATUS_CFG[r.status]
          const earnings = Math.round(r.monthlyRevenue * r.revenueSharePct / 100)
          const isOpen = expanded === r.id
          return (
            <div key={r.id} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : r.id)}>
                {/* Brand logo */}
                <div style={{ width: 42, height: 42, borderRadius: 10, background: r.brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {r.brandName[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{r.brandName}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>by {r.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.ownerEmail} · Joined {r.joinedAt}</div>
                </div>

                <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f0f0e', lineHeight: 1 }}>{r.businessCount}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Businesses</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#d97706', lineHeight: 1 }}>₦{(earnings / 1000).toFixed(0)}k</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Your share/mo</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{r.revenueSharePct}%</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Share rate</div>
                  </div>
                </div>

                <ChevronDown size={16} color="#9ca3af" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </div>

              {/* Expanded: branding preview + config */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f0ed' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
                    {/* Branding preview */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Eye size={11} /> How clients see their dashboard
                      </label>
                      <BrandPreview reseller={r} />
                      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>GrowthNet branding is hidden. Their clients see "{r.brandName}" throughout.</p>
                    </div>

                    {/* Config */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '14px 16px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Revenue share</div>
                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                          <strong>Platform rate:</strong> ₦{(r.monthlyRevenue / 1000).toFixed(0)}k/mo<br />
                          <strong>Your cut ({r.revenueSharePct}%):</strong> ₦{(earnings / 1000).toFixed(0)}k/mo<br />
                          <strong>Reseller keeps:</strong> ₦{((r.monthlyRevenue - earnings) / 1000).toFixed(0)}k/mo
                        </div>
                      </div>
                      <div style={{ background: '#f8f8f6', border: '1px solid #e8e8e4', borderRadius: 8, padding: '14px 16px' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Brand color</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 5, background: r.brandColor, border: '1px solid #e8e8e4' }} />
                          <span style={{ fontSize: 13, color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>{r.brandColor}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit config</button>
                        {r.status === 'active'
                          ? <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', color: '#dc2626' }}>Suspend</button>
                          : <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', color: '#16a34a' }}>Activate</button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {resellers.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', border: '1.5px dashed #e8e8e4', borderRadius: 12, color: '#9ca3af' }}>
            <Building2 size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No resellers yet</p>
            <p style={{ fontSize: 13 }}>Add a reseller to start earning revenue share from other agencies on your platform.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 18px' }}>
        <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.7 }}>
          <strong>How it works:</strong> Each reseller gets their own branded subdomain (e.g. scalestackafrica.growthnet.io). Their clients never see "GrowthNet" — they see the reseller's brand throughout. You earn your flat {resellers[0]?.revenueSharePct ?? 20}% on their total monthly platform revenue, paid monthly.
        </p>
      </div>
    </div>
  )
}
