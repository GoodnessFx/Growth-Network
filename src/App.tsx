import { useState } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Operator from './pages/Operator'
import BusinessView from './pages/Business'
import PublicResults from './pages/PublicResults'
import AppLayout from './components/AppLayout'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { type Business } from './data/mockData'

type Page = 'landing' | 'login' | 'operator' | 'business'
type OperatorTab =
  | 'portfolio'
  | 'compare'
  | 'inbox'
  | 'campaigns'
  | 'pipeline'
  | 'alerts'
  | 'connections'
  | 'analytics'
  | 'results'

function AppInner() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [operatorTab, setOperatorTab] = useState<OperatorTab>('portfolio')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [pendingAddBusiness, setPendingAddBusiness] = useState(false)
  const [publicBusinessId, setPublicBusinessId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/public\/([^/]+)/)
    return match ? decodeURIComponent(match[1]) : null
  })

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
          background: 'var(--background)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--primary)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="font-display" style={{ color: '#111827', fontWeight: 900, fontSize: 14 }}>
            GN
          </span>
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
        onSuccess={() => setPage('operator')}
        onBack={() => {
          setPendingAddBusiness(false)
          setPage('landing')
        }}
      />
    )
  }

  return (
    <AppLayout
      page={page}
      operatorTab={operatorTab}
      setOperatorTab={(tab) => {
        setOperatorTab(tab as OperatorTab)
        if (page === 'business') {
          setPage('operator')
          setSelectedBusiness(null)
        }
      }}
      setPage={(p) => navigate(p as Page)}
      onLogout={handleLogout}
      businessName={selectedBusiness?.name}
    >
      {page === 'operator' && (
        <Operator
          tab={operatorTab}
          onSelectBusiness={handleSelectBusiness}
          onRequireAuth={handleRequireAuth}
          autoOpenAddBusiness={pendingAddBusiness}
          onAddBusinessHandled={handleAddBusinessHandled}
        />
      )}
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
