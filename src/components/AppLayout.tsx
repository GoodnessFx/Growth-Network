import { useState } from 'react'
import {
  LayoutGrid, TrendingUp, Inbox, Megaphone, GitBranch, Bell,
  Settings, ChevronLeft, ChevronRight, LogOut, LogIn,
  Layers, Menu, X, Link2, Activity, FileText, CalendarDays,
  ClipboardList, UserPlus, BarChart3, Zap, Home,
} from 'lucide-react'
import { alerts } from '../data/mockData'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../lib/AuthContext'

type Page = 'landing' | 'login' | 'operator' | 'business' | 'analytics'

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

const OPS_NAV: NavItem[] = [
  { id: 'portfolio',   label: 'Portfolio',         icon: LayoutGrid,  section: 'ops' },
  { id: 'compare',     label: 'Compare',           icon: TrendingUp,  section: 'ops' },
  { id: 'inbox',       label: 'Inbox',             icon: Inbox,       section: 'ops' },
  { id: 'campaigns',   label: 'Campaigns',         icon: Megaphone,   section: 'ops' },
  { id: 'pipeline',    label: 'Pipeline',          icon: GitBranch,   section: 'ops' },
  { id: 'alerts',      label: 'Alerts',            icon: Bell,        section: 'ops' },
  { id: 'connections', label: 'Connections',       icon: Link2,       section: 'ops' },
  { id: 'analytics',   label: 'Analytics',         icon: Activity,    section: 'ops' },
  { id: 'results',     label: 'Results',           icon: FileText,    section: 'ops' },
  { id: 'content',     label: 'Content Calendar',  icon: CalendarDays,section: 'ops' },
]

const FEATURES_NAV: NavItem[] = [
  { id: 'client-dashboard',  label: 'Dashboard',        icon: BarChart3,    section: 'features' },
  { id: 'client-calendar',   label: 'Scheduling',       icon: CalendarDays, section: 'features' },
  { id: 'client-requests',   label: 'Service Requests', icon: ClipboardList,section: 'features' },
  { id: 'client-leads',      label: 'Leads Pipeline',   icon: UserPlus,     section: 'features' },
  { id: 'automations',       label: 'Tools & Automations', icon: Zap,        section: 'features' },
]

// ── Sidebar nav button ────────────────────────────────────────────────────
function NavBtn({
  item, active, collapsed, badge, onClick,
}: {
  item: NavItem; active: boolean; collapsed: boolean; badge?: number; onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
        padding: collapsed ? '9px 0' : '8px 14px',
        minHeight: 36,
        background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
        borderLeft: active ? '2px solid #22c55e' : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        cursor: 'pointer',
        color: active ? '#22c55e' : '#606060',
        fontSize: 13, fontWeight: active ? 600 : 400,
        textAlign: 'left',
        borderRadius: '0 6px 6px 0',
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
          ;(e.currentTarget as HTMLElement).style.color = '#efefef'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#606060'
        }
      }}
    >
      <Icon size={14} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, borderRadius: 99, padding: '1px 6px', flexShrink: 0 }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function SectionDivider({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 1, background: '#1e1e1e', margin: '6px 10px' }} />
  return (
    <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 700, letterSpacing: 0.08, textTransform: 'uppercase', color: '#2e2e2e', fontFamily: "'Inter', sans-serif" }}>
      {label}
    </div>
  )
}

// ── Mobile bottom bar (4 key tabs) ────────────────────────────────────────
function MobileBottomBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const items = [
    { id: 'portfolio',        label: 'Portfolio',   icon: LayoutGrid },
    { id: 'client-dashboard', label: 'Dashboard',   icon: Home },
    { id: 'client-leads',     label: 'Leads',       icon: UserPlus },
    { id: 'automations',      label: 'Automations', icon: Zap },
    { id: 'settings',         label: 'Settings',    icon: Settings },
  ]
  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
        background: '#0c0c0c',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map(item => {
        const Icon = item.icon
        const active = tab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '10px 4px 8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? '#22c55e' : '#404040',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: 0.2 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function AppLayout({
  page, operatorTab, setOperatorTab, setPage, children, businessName, onLogout,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const unread = alerts.filter(a => !a.read).length
  const isOwner = user?.role === 'owner' || user?.role === 'admin'

  const visibleNav = isOwner
    ? [...OPS_NAV, ...FEATURES_NAV]
    : [...FEATURES_NAV]

  const initials = user?.name
    ?.split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0]!.toUpperCase()).join('') ?? 'OP'
  const displayName = user?.name ?? 'Operator'
  const roleLabel = isOwner ? 'Owner' : 'Client'

  const sideW = collapsed && !isMobile ? 48 : 216

  const navigate = (tab: string) => {
    setOperatorTab(tab)
    if (page === 'business') { setPage('operator'); }
    if (isMobile) setDrawerOpen(false)
  }

  const SidebarContent = (
    <aside
      style={{
        width: sideW, minWidth: sideW,
        background: '#0c0c0c',
        borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflow: 'hidden',
        transition: 'width 0.18s ease, min-width 0.18s ease',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 52, padding: collapsed ? '0' : '0 14px',
          display: 'flex', alignItems: 'center', gap: 9,
          borderBottom: '1px solid #1a1a1a',
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 26, height: 26, background: '#fff', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'DM Serif Display', serif", color: '#0c0c0c', fontSize: 12 }}>G</span>
        </div>
        {!collapsed && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: '#efefef', letterSpacing: -0.3, whiteSpace: 'nowrap' }}>
            GrowthNet
          </span>
        )}
      </div>

      {/* Nav scroll area */}
      <nav style={{ flex: 1, paddingTop: 6, overflowY: 'auto', overflowX: 'hidden' }}>
        {page === 'business' ? (
          /* Business view — single back button */
          <NavBtn
            item={{ id: 'back', label: 'All Businesses', icon: Layers, section: '' }}
            active={false} collapsed={collapsed}
            onClick={() => setPage('operator')}
          />
        ) : (
          <>
            {isOwner && (
              <>
                <SectionDivider label="Operations" collapsed={collapsed} />
                {visibleNav.filter(n => n.section === 'ops').map(item => (
                  <NavBtn
                    key={item.id} item={item}
                    active={operatorTab === item.id}
                    collapsed={collapsed}
                    badge={item.id === 'alerts' ? unread : undefined}
                    onClick={() => navigate(item.id)}
                  />
                ))}
              </>
            )}
            <SectionDivider label="Features" collapsed={collapsed} />
            {visibleNav.filter(n => n.section === 'features').map(item => (
              <NavBtn
                key={item.id} item={item}
                active={operatorTab === item.id}
                collapsed={collapsed}
                onClick={() => navigate(item.id)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingBottom: 4, flexShrink: 0 }}>
        {!collapsed && user && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#0c0c0c', flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#efefef', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: 10, color: '#404040', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{roleLabel}</div>
            </div>
          </div>
        )}

        <NavBtn
          item={{ id: 'settings', label: 'Settings', icon: Settings, section: '' }}
          active={operatorTab === 'settings'} collapsed={collapsed}
          onClick={() => navigate('settings')}
        />

        <button
          onClick={user ? onLogout : () => setPage('login')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', padding: collapsed ? '9px 0' : '8px 14px',
            minHeight: 36, background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#404040', fontSize: 13,
            borderRadius: '0 6px 6px 0',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#404040')}
        >
          {user ? <LogOut size={14} /> : <LogIn size={14} />}
          {!collapsed && <span>{user ? 'Sign out' : 'Sign in'}</span>}
        </button>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: collapsed ? '9px 0' : '8px 14px',
              minHeight: 36, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#2e2e2e', fontSize: 13,
              borderRadius: '0 6px 6px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#606060')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#2e2e2e')}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="dash-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0c0c0c' }}>

      {/* Desktop sidebar */}
      {!isMobile && SidebarContent}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setDrawerOpen(false)}
          style={{ display: 'block', zIndex: 40 }}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 240, zIndex: 50,
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {SidebarContent}
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div
          style={{
            height: 52, background: '#0c0c0c',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 10, flexShrink: 0,
          }}
        >
          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#efefef', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {page === 'business' && businessName ? (
              <>
                <button
                  onClick={() => { setPage('operator') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#404040', fontSize: 13, padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#efefef')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#404040')}
                >
                  <Layers size={12} />
                  <span className="hide-xs">Portfolio</span>
                </button>
                <ChevronRight size={11} color="#2e2e2e" />
                <span style={{ fontSize: 13, color: '#efefef', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {businessName}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 12, color: '#2e2e2e', fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                {isOwner ? 'Operator' : 'Dashboard'}
              </span>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unread > 0 && (
              <button
                onClick={() => navigate('alerts')}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#606060', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <Bell size={16} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread}
                </span>
              </button>
            )}
            {user && (
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#0c0c0c', cursor: 'pointer', flexShrink: 0,
                }}
                title={displayName}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main
          style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            paddingBottom: isMobile ? 64 : 0,
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom bar */}
      {isMobile && (
        <MobileBottomBar tab={operatorTab} setTab={navigate} />
      )}
    </div>
  )
}
