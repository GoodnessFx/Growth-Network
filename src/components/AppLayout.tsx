import { useState } from 'react'
import {
  LayoutGrid, TrendingUp, Users, Inbox, Megaphone, GitBranch, Bell,
  Settings, ChevronLeft, ChevronRight, LogOut, LogIn, Building2,
  Layers, Menu, X, Link2, Activity, FileText, CalendarDays,
  ClipboardList, UserPlus, BarChart3,
} from 'lucide-react'
import { alerts } from '../data/mockData'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../lib/AuthContext'

type Page = 'landing' | 'login' | 'operator' | 'business' | 'analytics'
type OperatorTab =
  | 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline' | 'alerts'
  | 'connections' | 'analytics' | 'results' | 'content'
  | 'client-dashboard' | 'client-calendar' | 'client-requests' | 'client-leads'
  | 'settings'

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
  section?: string
  badge?: number
}

const operatorNavItems: NavItem[] = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid, section: 'ops' },
  { id: 'compare', label: 'Compare', icon: TrendingUp, section: 'ops' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, section: 'ops' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, section: 'ops' },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch, section: 'ops' },
  { id: 'alerts', label: 'Alerts', icon: Bell, section: 'ops' },
  { id: 'connections', label: 'Connections', icon: Link2, section: 'ops' },
  { id: 'analytics', label: 'Analytics', icon: Activity, section: 'ops' },
  { id: 'results', label: 'Results', icon: FileText, section: 'ops' },
  { id: 'content', label: 'Content Calendar', icon: CalendarDays, section: 'ops' },
]

const featureNavItems: NavItem[] = [
  { id: 'client-dashboard', label: 'Dashboard', icon: BarChart3, section: 'features' },
  { id: 'client-calendar', label: 'Scheduling', icon: CalendarDays, section: 'features' },
  { id: 'client-requests', label: 'Service Requests', icon: ClipboardList, section: 'features' },
  { id: 'client-leads', label: 'Leads Pipeline', icon: UserPlus, section: 'features' },
]

function NavButton({
  item, active, collapsed, onClick, badge,
}: {
  item: NavItem; active: boolean; collapsed: boolean; onClick: () => void; badge?: number;
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%',
        padding: collapsed ? '10px 0' : '9px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 40,
        background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
        borderLeft: active ? '2px solid #8b5cf6' : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        cursor: 'pointer',
        color: active ? '#c4b5fd' : '#6b6b7b',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        textAlign: 'left',
        transition: 'background 0.12s, color 0.12s',
        position: 'relative',
        borderRadius: '0 6px 6px 0',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.05)'
          ;(e.currentTarget as HTMLElement).style.color = '#c4b5fd'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#6b6b7b'
        }
      }}
    >
      <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
      {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span
          style={{
            background: '#ef4444', color: '#fff',
            fontSize: 10, fontFamily: 'JetBrains Mono',
            borderRadius: 8, padding: '1px 6px', lineHeight: 1.4,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 1, background: '#1a1a20', margin: '8px 12px' }} />
  return (
    <div
      style={{
        fontSize: 9, fontFamily: 'JetBrains Mono', color: '#3a3a50',
        letterSpacing: 2.5, textTransform: 'uppercase',
        padding: '12px 16px 6px',
      }}
    >
      {label}
    </div>
  )
}

export default function AppLayout({
  page, operatorTab, setOperatorTab, setPage, children, businessName, onLogout,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const isOwner = user?.role === 'owner' || user?.role === 'admin'

  const visibleNavItems: NavItem[] = isOwner
    ? [...operatorNavItems, ...featureNavItems]
    : [...featureNavItems]

  const displayName = user?.name ?? 'Operator'
  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') ?? 'OP'

  const roleLabel = isOwner ? 'Owner' : user?.role === 'client' ? 'Client' : user?.role ?? 'User'

  const sidebarW = collapsed && !isMobile ? 52 : isMobile ? 240 : 220
  const showSidebar = !isMobile || mobileOpen

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0b' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ display: 'block' }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={isMobile ? 'mobile-sidebar' : ''}
        style={{
          width: showSidebar ? sidebarW : 0,
          minWidth: showSidebar ? sidebarW : 0,
          background: '#0d0d10',
          borderRight: '1px solid #1a1a20',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          overflow: 'hidden',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            padding: collapsed ? '0 0' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid #1a1a20',
            justifyContent: collapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet"
            style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <span
              className="font-display"
              style={{ fontSize: 17, fontWeight: 900, letterSpacing: 1.5, color: '#f0f0f0', whiteSpace: 'nowrap' }}
            >
              GROWTH<span style={{ color: '#8b5cf6' }}>NET</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 8, overflowY: 'auto', overflowX: 'hidden' }}>
          {page === 'business' ? (
            <button
              onClick={() => setPage('operator')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px', minHeight: 40,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#6b6b7b', fontSize: 13,
              }}
            >
              <Layers size={15} />
              {!collapsed && 'All Businesses'}
            </button>
          ) : (
            <>
              {/* Ops section — owners only */}
              {isOwner && (
                <>
                  <SectionLabel label="Operations" collapsed={collapsed} />
                  {visibleNavItems.filter((n) => n.section === 'ops').map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={operatorTab === item.id}
                      collapsed={collapsed}
                      badge={item.id === 'alerts' ? unreadAlerts : undefined}
                      onClick={() => {
                        setOperatorTab(item.id)
                        if (isMobile) setMobileOpen(false)
                      }}
                    />
                  ))}
                </>
              )}

              {/* Features section — all users */}
              <SectionLabel label="Features" collapsed={collapsed} />
              {visibleNavItems.filter((n) => n.section === 'features').map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={operatorTab === item.id}
                  collapsed={collapsed}
                  onClick={() => {
                    setOperatorTab(item.id)
                    if (isMobile) setMobileOpen(false)
                  }}
                />
              ))}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #1a1a20', paddingBottom: 8, flexShrink: 0 }}>
          {/* User badge */}
          {!collapsed && (
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: '1px solid #1a1a20',
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: '#6b6b7b', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {roleLabel}
                </div>
              </div>
            </div>
          )}

          <NavButton
            item={{ id: 'settings', label: 'Settings', icon: Settings }}
            active={operatorTab === 'settings'}
            collapsed={collapsed}
            onClick={() => {
              setOperatorTab('settings')
              if (isMobile) setMobileOpen(false)
            }}
          />

          <button
            onClick={user ? onLogout : () => setPage('login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: collapsed ? '10px 0' : '9px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              minHeight: 40, background: 'transparent',
              border: 'none', cursor: 'pointer',
              color: '#6b6b7b', fontSize: 13,
              borderRadius: '0 6px 6px 0',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#6b6b7b'
            }}
          >
            {user ? <LogOut size={15} /> : <LogIn size={15} />}
            {!collapsed && <span>{user ? 'Sign out' : 'Sign in'}</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: collapsed ? '10px 0' : '9px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 40, background: 'transparent',
                border: 'none', cursor: 'pointer',
                color: '#3a3a50', fontSize: 13,
                borderRadius: '0 6px 6px 0',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#6b6b7b')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#3a3a50')}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              {!collapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div className="app-topbar" style={{ background: '#0d0d10', borderBottom: '1px solid #1a1a20', height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#f0f0f0', display: 'flex', alignItems: 'center',
                padding: 4, minHeight: 'auto',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {page === 'business' && businessName ? (
              <>
                <button
                  onClick={() => setPage('operator')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b7b', fontSize: 13, padding: 0, minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Layers size={13} />
                  <span>Portfolio</span>
                </button>
                <ChevronRight size={12} color="#3a3a50" />
                <span style={{ fontSize: 13, color: '#f0f0f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {businessName}
                </span>
              </>
            ) : (
              <span
                style={{
                  fontSize: 13, color: '#9090a0',
                  fontFamily: 'JetBrains Mono', letterSpacing: 0.5,
                }}
              >
                {page === 'operator'
                  ? (isOwner ? 'OPERATOR MODE' : 'CLIENT MODE')
                  : page.toUpperCase()}
              </span>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {unreadAlerts > 0 && (
              <button
                onClick={() => setOperatorTab('alerts')}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#6b6b7b', padding: 4, minHeight: 'auto',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Bell size={17} />
                <span
                  style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#ef4444', color: '#fff',
                    fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {unreadAlerts}
                </span>
              </button>
            )}
            {user && (
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  flexShrink: 0,
                }}
                title={displayName}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )

}
