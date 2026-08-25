import { useState } from 'react'
import {
  LayoutGrid, TrendingUp, Inbox, Megaphone, GitBranch, Bell,
  Settings, ChevronLeft, ChevronRight, LogOut, LogIn,
  Layers, Menu, X, Link2, Activity, FileText, CalendarDays,
  ClipboardList, UserPlus, BarChart3, Zap, Home, Wrench,
  MessageSquare, Search, FileSignature, AlertOctagon,
  Share2, Building2, BookOpen, Lightbulb, DollarSign,
  TrendingDown, Users,
} from 'lucide-react'
import { alerts } from '../data/mockData'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../lib/AuthContext'

type Page = 'landing' | 'login' | 'operator' | 'business'

interface AppLayoutProps {
  page: Page
  operatorTab: string
  setOperatorTab: (t: string) => void
  setPage: (p: Page) => void
  children: React.ReactNode
  businessName?: string
  onLogout: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  section: string
}

// ── Operator-only: portfolio operations ───────────────────────────────────
const OPS_NAV: NavItem[] = [
  { id: 'portfolio',   label: 'Portfolio',        icon: LayoutGrid,   section: 'ops' },
  { id: 'compare',     label: 'Compare',          icon: TrendingUp,   section: 'ops' },
  { id: 'inbox',       label: 'Inbox',            icon: Inbox,        section: 'ops' },
  { id: 'campaigns',   label: 'Campaigns',        icon: Megaphone,    section: 'ops' },
  { id: 'pipeline',    label: 'Pipeline',         icon: GitBranch,    section: 'ops' },
  { id: 'alerts',      label: 'Alerts',           icon: Bell,         section: 'ops' },
  { id: 'connections', label: 'Connections',      icon: Link2,        section: 'ops' },
  { id: 'analytics',   label: 'Analytics',        icon: Activity,     section: 'ops' },
  { id: 'results',     label: 'Results',          icon: FileText,     section: 'ops' },
  { id: 'content',     label: 'Content Calendar', icon: CalendarDays, section: 'ops' },
]

// ── Operator-only: agency growth tools ───────────────────────────────────
const AGENCY_NAV: NavItem[] = [
  { id: 'churn-radar',    label: 'Churn Radar',      icon: TrendingDown,  section: 'agency' },
  { id: 'social-publish', label: 'Social Publisher', icon: Share2,        section: 'agency' },
  { id: 'ask',            label: 'Ask GrowthNet',    icon: MessageSquare, section: 'agency' },
  { id: 'prospecting',    label: 'Prospecting',      icon: Search,        section: 'agency' },
  { id: 'proposals',      label: 'Proposals',        icon: FileSignature, section: 'agency' },
  { id: 'referrals',      label: 'Referral Engine',  icon: Share2,        section: 'agency' },
  { id: 'reseller',       label: 'Reseller Mode',    icon: Building2,     section: 'agency' },
]

// ── Operator-only: internal feature/tool tabs (YOUR tools, not clients') ──
const FEATURES_NAV: NavItem[] = [
  { id: 'client-dashboard',  label: 'Dashboard',           icon: BarChart3,    section: 'features' },
  { id: 'client-calendar',   label: 'Scheduling',          icon: CalendarDays, section: 'features' },
  { id: 'client-requests',   label: 'Service Requests',    icon: ClipboardList,section: 'features' },
  { id: 'client-leads',      label: 'Leads Pipeline',      icon: UserPlus,     section: 'features' },
  { id: 'automations',       label: 'Tools & Automations', icon: Zap,          section: 'features' },
  { id: 'growth-tools',      label: 'Growth Tools',        icon: Wrench,       section: 'features' },
]

// ── Business Owner nav — what the CLIENT (business owner) sees ────────────
// Only their own business data. Nothing from the operator side.
const OWNER_NAV: NavItem[] = [
  { id: 'owner-overview',  label: 'Dashboard',            icon: Home,         section: 'owner' },
  { id: 'owner-setup',     label: 'Business Setup',       icon: BookOpen,     section: 'owner' },
  { id: 'owner-crm',       label: 'Clients & Leads',      icon: Users,        section: 'owner' },
  { id: 'owner-analytics', label: 'My Analytics',         icon: BarChart3,    section: 'owner' },
  { id: 'owner-invoices',  label: 'Invoices',             icon: DollarSign,   section: 'owner' },
  { id: 'owner-ideas',     label: 'Growth Ideas',         icon: Lightbulb,    section: 'owner' },
]

// ── Business owner growth tools — relevant to THEIR business ─────────────
const OWNER_TOOLS_NAV: NavItem[] = [
  { id: 'ai-front-desk',  label: 'AI Front Desk',        icon: MessageSquare,section: 'owner-tools' },
  { id: 'compliance',     label: 'Compliance Tracker',   icon: AlertOctagon, section: 'owner-tools' },
  { id: 'proof-engine',   label: 'Growth Proof',         icon: FileText,     section: 'owner-tools' },
  { id: 'health-score',   label: 'Financial Health',     icon: Activity,     section: 'owner-tools' },
  { id: 'growth-twin',    label: 'Growth Twin',          icon: TrendingUp,   section: 'owner-tools' },
]

// ── Operator-only unique tools ─────────────────────────────────────────────
const OPERATOR_UNIQUE_NAV: NavItem[] = [
  { id: 'growth-twin',        label: 'Growth Twin',        icon: TrendingUp,   section: 'unique' },
  { id: 'portfolio-exchange', label: 'Portfolio Exchange', icon: Share2,       section: 'unique' },
  { id: 'compliance',         label: 'Compliance Tracker', icon: AlertOctagon, section: 'unique' },
  { id: 'ai-front-desk',      label: 'AI Front Desk',      icon: MessageSquare,section: 'unique' },
  { id: 'proof-engine',       label: 'Proof Engine',       icon: FileText,     section: 'unique' },
  { id: 'health-score',       label: 'Health Score',       icon: Activity,     section: 'unique' },
]

// Need Users for OWNER_NAV - already imported above

function NavBtn({ item, active, collapsed, badge, onClick }: {
  item: NavItem; active: boolean; collapsed: boolean; badge?: number; onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 9,
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
        padding: collapsed ? '8px 0' : '7px 14px',
        minHeight: 34,
        background: active ? '#f0fdf4' : 'transparent',
        borderLeft: active ? '2px solid #16a34a' : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        cursor: 'pointer',
        color: active ? '#15803d' : '#6b7280',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        textAlign: 'left',
        borderRadius: '0 6px 6px 0',
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = '#f9fafb'
          ;(e.currentTarget as HTMLElement).style.color = '#111827'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#6b7280'
        }
      }}
    >
      <Icon size={13} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>{item.label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, borderRadius: 99, padding: '1px 5px', flexShrink: 0, fontWeight: 700 }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 1, background: '#f1f0ed', margin: '5px 10px' }} />
  return (
    <div style={{ padding: '10px 14px 3px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d1d5db', fontFamily: "'Inter', sans-serif" }}>
      {label}
    </div>
  )
}

function MobileBottomBar({ tab, setTab, isOperator }: { tab: string; setTab: (t: string) => void; isOperator: boolean }) {
  const operatorItems = [
    { id: 'portfolio',     label: 'Portfolio', icon: LayoutGrid },
    { id: 'churn-radar',   label: 'Radar',     icon: TrendingDown },
    { id: 'prospecting',   label: 'Prospect',  icon: Search },
    { id: 'proposals',     label: 'Proposals', icon: FileSignature },
    { id: 'settings',      label: 'Settings',  icon: Settings },
  ]
  const ownerItems = [
    { id: 'owner-overview',  label: 'Home',    icon: Home },
    { id: 'owner-crm',       label: 'Clients', icon: UserPlus },
    { id: 'owner-analytics', label: 'Analytics',icon: BarChart3 },
    { id: 'ai-front-desk',   label: 'AI Desk', icon: MessageSquare },
    { id: 'settings',        label: 'Settings', icon: Settings },
  ]
  const items = isOperator ? operatorItems : ownerItems
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60, background: '#ffffff', borderTop: '1px solid #e8e8e4', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
      {items.map(item => {
        const Icon = item.icon
        const active = tab === item.id
        return (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 4px 7px', background: 'none', border: 'none', cursor: 'pointer', color: active ? '#16a34a' : '#9ca3af', transition: 'color 0.15s', fontFamily: "'Inter', sans-serif" }}>
            <Icon size={17} strokeWidth={active ? 2.2 : 1.6} />
            <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: 0.2 }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function AppLayout({ page, operatorTab, setOperatorTab, setPage, children, businessName, onLogout }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const unread = alerts.filter(a => !a.read).length
  const isOperator = user?.role === 'owner' || user?.role === 'admin'  // "owner" = platform operator in current auth
  const isBusinessOwner = user?.role === 'client'

  const initials = user?.name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') ?? 'OP'
  const displayName = user?.name ?? 'User'
  const roleLabel = isOperator ? 'Operator' : 'Owner'
  const sideW = collapsed && !isMobile ? 48 : 210

  const navigate = (tab: string) => {
    setOperatorTab(tab)
    if (page === 'business') setPage('operator')
    if (isMobile) setDrawerOpen(false)
  }

  const Sidebar = (
    <aside style={{ width: sideW, minWidth: sideW, background: '#ffffff', borderRight: '1px solid #e8e8e4', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'width 0.18s ease, min-width 0.18s ease', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ height: 52, padding: collapsed ? '0' : '0 16px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid #e8e8e4', justifyContent: collapsed ? 'center' : 'flex-start', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, background: '#0f0f0e', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 12 }}>G</span>
        </div>
        {!collapsed && <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f0f0e', letterSpacing: -0.3, whiteSpace: 'nowrap' }}>GrowthNet</span>}
      </div>

      {/* Nav scroll area */}
      <nav style={{ flex: 1, paddingTop: 4, overflowY: 'auto', overflowX: 'hidden' }}>
        {page === 'business' ? (
          <NavBtn item={{ id: 'back', label: 'All Businesses', icon: Layers, section: '' }} active={false} collapsed={collapsed} onClick={() => setPage('operator')} />
        ) : isOperator ? (
          /* ── OPERATOR NAV — you (the founder) ── */
          <>
            <SectionLabel label="Operations" collapsed={collapsed} />
            {OPS_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} badge={item.id === 'alerts' ? unread : undefined} onClick={() => navigate(item.id)} />
            ))}

            <SectionLabel label="Agency Tools" collapsed={collapsed} />
            {AGENCY_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}

            <SectionLabel label="My Features" collapsed={collapsed} />
            {FEATURES_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}

            <SectionLabel label="Unique Tools" collapsed={collapsed} />
            {OPERATOR_UNIQUE_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}
          </>
        ) : (
          /* ── CLIENT/OWNER NAV — business owner sees ONLY their business ── */
          <>
            <SectionLabel label="My Business" collapsed={collapsed} />
            {OWNER_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}

            <SectionLabel label="Tools" collapsed={collapsed} />
            {OWNER_TOOLS_NAV.map(item => (
              <NavBtn key={item.id} item={item} active={operatorTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #e8e8e4', paddingBottom: 4, flexShrink: 0 }}>
        {!collapsed && user && (
          <div style={{ padding: '9px 14px', borderBottom: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 27, height: 27, borderRadius: '50%', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f0f0e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{roleLabel}</div>
            </div>
          </div>
        )}
        <NavBtn item={{ id: 'settings', label: 'Settings', icon: Settings, section: '' }} active={operatorTab === 'settings'} collapsed={collapsed} onClick={() => navigate('settings')} />
        <button
          onClick={user ? onLogout : () => setPage('login')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '8px 0' : '7px 14px', minHeight: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 12, fontFamily: "'Inter', sans-serif", transition: 'color 0.15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}
        >
          {user ? <LogOut size={13} /> : <LogIn size={13} />}
          {!collapsed && <span>{user ? 'Sign out' : 'Sign in'}</span>}
        </button>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%', padding: collapsed ? '8px 0' : '7px 14px', minHeight: 34, background: 'transparent', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 12, fontFamily: "'Inter', sans-serif", transition: 'color 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#6b7280')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#d1d5db')}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8f8f6', fontFamily: "'Inter', sans-serif" }}>
      {!isMobile && Sidebar}
      {isMobile && drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} />}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 50, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
          {Sidebar}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 52, background: '#ffffff', borderBottom: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {isMobile && (
            <button onClick={() => setDrawerOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, display: 'flex', alignItems: 'center' }}>
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {page === 'business' && businessName ? (
              <>
                <button onClick={() => setPage('operator')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s', fontFamily: "'Inter', sans-serif" }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#111827')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}>
                  <Layers size={12} /><span className="hide-xs">Portfolio</span>
                </button>
                <ChevronRight size={11} color="#d1d5db" />
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{businessName}</span>
              </>
            ) : (
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                {isOperator ? 'Operator Dashboard' : 'My Business Dashboard'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unread > 0 && (
              <button onClick={() => navigate('alerts')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex', alignItems: 'center' }}>
                <Bell size={17} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
              </button>
            )}
            {user && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }} title={displayName}>
                {initials}
              </div>
            )}
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#f8f8f6', paddingBottom: isMobile ? 64 : 0 }}>
          <div className="container page-pad" style={{ minHeight: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      {isMobile && <MobileBottomBar tab={operatorTab} setTab={navigate} isOperator={isOperator} />}
    </div>
  )
}
