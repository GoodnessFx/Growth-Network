import { useState } from 'react'
import {
  LayoutGrid,
  TrendingUp,
  Users,
  Inbox,
  Megaphone,
  GitBranch,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  ExternalLink,
  Building2,
  Layers,
  Menu,
  X,
  Link2,
  Activity,
  FileText,
} from 'lucide-react'
import { alerts } from '../data/mockData'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../lib/AuthContext'

type Page = 'landing' | 'login' | 'operator' | 'business' | 'analytics'
type OperatorTab = 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline' | 'alerts' | 'connections' | 'analytics' | 'results'

interface AppLayoutProps {
  page: Page
  operatorTab: OperatorTab
  setOperatorTab: (t: OperatorTab) => void
  setPage: (p: Page) => void
  children: React.ReactNode
  businessName?: string
  onLogout: () => void
}

const navItems: { id: OperatorTab; label: string; icon: React.ElementType }[] = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
  { id: 'compare', label: 'Compare', icon: TrendingUp },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'results', label: 'Results', icon: FileText },
]

export default function AppLayout({
  page,
  operatorTab,
  setOperatorTab,
  setPage,
  children,
  businessName,
  onLogout,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const displayName = user?.name ?? 'Operator'
  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') ?? 'OP'

  const sidebarWidth = collapsed && !isMobile ? 56 : isMobile ? 240 : 220
  const showSidebar = !isMobile || mobileOpen

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={isMobile ? 'mobile-sidebar' : ''}
        style={{
          width: showSidebar ? sidebarWidth : 0,
          minWidth: showSidebar ? sidebarWidth : 0,
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? '18px 12px' : '18px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 60,
          }}
        >
          <img
            src="/gnlogo.jpg"
            alt="GrowthNet logo"
            style={{ width: 28, height: 28, borderRadius: 2, objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <span
              className="font-display"
              style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: 'var(--foreground)', whiteSpace: 'nowrap' }}
            >
              GROWTH<span style={{ color: 'var(--primary)' }}>NET</span>
            </span>
          )}
        </div>

        {/* Mode indicator */}
        {!collapsed && (
          <div style={{ padding: '10px 20px 8px' }}>
            <div
              style={{
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                color: 'var(--muted-foreground)',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {page === 'business' ? 'BUSINESS VIEW' : 'OPERATOR MODE'}
            </div>
            {page === 'business' && businessName && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--accent)',
                  marginTop: 2,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {businessName}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {page === 'business' ? (
            <>
              <button
                onClick={() => setPage('operator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: collapsed ? '10px 14px' : '10px 20px',
                  minHeight: 44,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  fontSize: 13,
                }}
              >
                <Layers size={16} />
                {!collapsed && 'All Businesses'}
              </button>
            </>
          ) : (            navItems.map((item) => {
              const active = operatorTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setOperatorTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                  padding: collapsed ? '10px 14px' : '10px 20px',
                  minHeight: 44,
                  background: active ? 'var(--secondary)' : 'transparent',
                    borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'background 0.15s',
                  }}
                >
                  <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.id === 'alerts' && unreadAlerts > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: 'var(--danger)',
                        color: '#fff',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                        borderRadius: 10,
                        padding: '1px 6px',
                      }}
                    >
                      {unreadAlerts}
                    </span>
                  )}
                  {collapsed && item.id === 'alerts' && unreadAlerts > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 7,
                        height: 7,
                        background: 'var(--danger)',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </button>
              )
            })
          )}
        </nav>

        {/* Bottom actions */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
          <a
            href="https://github.com/GoodnessFx/Growth-Network"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: collapsed ? '10px 14px' : '10px 20px',
              minHeight: 44,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={16} />
            {!collapsed && 'GitHub'}
          </a>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: collapsed ? '10px 14px' : '10px 20px',
              minHeight: 44,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              fontSize: 13,
            }}
          >
            <Settings size={16} />
            {!collapsed && 'Settings'}
          </button>
          <button
            onClick={user ? onLogout : () => setPage('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: collapsed ? '10px 14px' : '10px 20px',
              minHeight: 44,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              fontSize: 13,
            }}
          >
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            {!collapsed && (user ? 'Sign out' : 'Sign in')}
          </button>
          {!isMobile && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: collapsed ? '10px 14px' : '10px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                fontSize: 13,
              }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!collapsed && 'Collapse'}
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header
          className="app-topbar"
          style={{
            height: 60,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 16,
            background: 'var(--card)',
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen((o) => !o)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            {page === 'business' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="var(--muted-foreground)" />
                <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                  {businessName ?? 'Business'}
                </span>
              </div>
            ) : (
              <span
                className="font-display"
                style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: 'var(--foreground)' }}
              >
                {navItems.find((n) => n.id === operatorTab)?.label ?? 'Dashboard'}
              </span>
            )}
          </div>

          {/* User chip / sign-in */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="hide-xs" style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', textAlign: 'right' }}>
                <div>{displayName}</div>
                <div style={{ color: 'var(--accent)', fontSize: 10 }}>Owner</div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--primary-foreground)',
                  fontFamily: 'Barlow Condensed',
                }}
              >
                {initials}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setPage('login')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                padding: '8px 18px',
                minHeight: 44,
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Sign in
            </button>
          )}
        </header>

        {/* Scrollable page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  )
}
