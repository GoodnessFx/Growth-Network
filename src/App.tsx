import { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Operator from './pages/Operator'
import BusinessView from './pages/Business'
import PublicResults from './pages/PublicResults'
import AppLayout from './components/AppLayout'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { type Business } from './data/mockData'
import ClientDashboard from './pages/ClientDashboard'
import ContentCalendar from './pages/ContentCalendar'
import ServiceRequests from './pages/ServiceRequests'
import LeadsPipeline from './pages/LeadsPipeline'
import Settings from './pages/Settings'

type Page = 'landing' | 'login' | 'operator' | 'business'

function AppInner() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [operatorTab, setOperatorTab] = useState('portfolio')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [pendingAddBusiness, setPendingAddBusiness] = useState(false)
  const [publicBusinessId, setPublicBusinessId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/public\/([^/]+)/)
    return match ? decodeURIComponent(match[1]) : null
  })

  // Google OAuth lands back on this origin after a full-page redirect. Supabase
  // restores the session, onAuthStateChange fires, and we move from the login
  // page into the dashboard automatically.
  useEffect(() => {
    if (user && page === 'login') {
      const isOwner = user.role === 'owner' || user.role === 'admin'
      setOperatorTab(isOwner ? 'portfolio' : 'client-dashboard')
      setPage('operator')
    }
  }, [user, page])

  if (publicBusinessId) {
    return (
      <PublicResults
        businessId={publicBusinessId}
        onBack={() => {
          window.history.replaceState({}, '', '/')
          setPublicBusinessId(null)
        }}
      />
    )
  }

  const navigate = (p: Page) => {
    setPage(p)
  }

  const handleLogout = () => {
    logout()
    setSelectedBusiness(null)
    setPendingAddBusiness(false)
    setPage('landing')
  }

  const handleSelectBusiness = (b: Business) => {
    setSelectedBusiness(b)
    setPage('business')
  }

  const handleBackFromBusiness = () => {
    setPage('operator')
    setSelectedBusiness(null)
  }

  const handleRequireAuth = () => {
    setPendingAddBusiness(true)
    setPage('login')
  }

  const handleAddBusinessHandled = () => {
    setPendingAddBusiness(false)
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0b',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="font-display" style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>
              GN
            </span>
          </div>
          <div
            style={{
              width: 24, height: 24,
              border: '2px solid #1e1e24',
              borderTopColor: '#8b5cf6',
              borderRadius: '50%',
            }}
            className="spin"
          />
        </div>
      </div>
    )
  }

  if (page === 'landing') {
    return (
      <Landing
        onLogin={() => navigate('login')}
        onDashboard={() => navigate('operator')}
      />
    )
  }

  if (page === 'login') {
    return (
      <Auth
        onBack={() => {
          setPendingAddBusiness(false)
          setPage('landing')
        }}
      />
    )
  }

  // Dummy business object for feature pages when no real business is selected
  const dummyBusiness = {
    id: 'dummy-biz-1',
    name: user?.name ?? 'My Company',
    type: 'E-commerce',
    status: 'active',
    owner_id: user?.id ?? '',
    domain: '',
    visible: 1,
    created_at: '',
    updated_at: '',
  }

  // Determine which operator-level tabs use the original Operator component
  const operatorTabs = ['portfolio', 'compare', 'inbox', 'campaigns', 'pipeline', 'alerts', 'connections', 'analytics', 'results', 'content']
  const isOperatorTab = operatorTabs.includes(operatorTab)

  return (
    <AppLayout
      page={page}
      operatorTab={operatorTab}
      setOperatorTab={(tab) => {
        setOperatorTab(tab)
        if (page === 'business') {
          setPage('operator')
          setSelectedBusiness(null)
        }
      }}
      setPage={(p) => navigate(p as Page)}
      onLogout={handleLogout}
      businessName={selectedBusiness?.name}
    >
      {/* Original operator views (portfolio, compare, inbox, etc.) */}
      {page === 'operator' && isOperatorTab && (
        <Operator
          tab={operatorTab as any}
          onSelectBusiness={handleSelectBusiness}
          onRequireAuth={handleRequireAuth}
          autoOpenAddBusiness={pendingAddBusiness}
          onAddBusinessHandled={handleAddBusinessHandled}
        />
      )}

      {/* New feature pages — accessible to ALL authenticated users */}
      {page === 'operator' && operatorTab === 'client-dashboard' && (
        <ClientDashboard business={dummyBusiness} />
      )}
      {page === 'operator' && operatorTab === 'client-calendar' && (
        <ContentCalendar business={dummyBusiness} />
      )}
      {page === 'operator' && operatorTab === 'client-requests' && (
        <ServiceRequests business={dummyBusiness} />
      )}
      {page === 'operator' && operatorTab === 'client-leads' && (
        <LeadsPipeline business={dummyBusiness} />
      )}

      {/* Settings page */}
      {page === 'operator' && operatorTab === 'settings' && (
        <Settings />
      )}

      {/* Business detail view */}
      {page === 'business' && selectedBusiness && (
        <BusinessView business={selectedBusiness} onBack={handleBackFromBusiness} />
      )}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
