import { useState } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Operator from './pages/Operator'
import BusinessView from './pages/Business'
import AppLayout from './components/AppLayout'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { type Business } from './data/mockData'

type Page = 'landing' | 'login' | 'operator' | 'business'
type OperatorTab = 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline' | 'alerts' | 'connections'

function AppInner() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [operatorTab, setOperatorTab] = useState<OperatorTab>('portfolio')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  const navigate = (p: Page) => {
    if ((p === 'operator' || p === 'business') && !user) {
      setPage('login')
      return
    }
    setPage(p)
  }

  const handleLogout = () => {
    logout()
    setSelectedBusiness(null)
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

  const guardedPage: Page = page === 'operator' || page === 'business' ? (user ? page : 'login') : page

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

  if (guardedPage === 'landing') {
    return (
      <Landing
        onLogin={() => navigate('login')}
        onRegister={() => navigate('login')}
        onDashboard={() => navigate('operator')}
      />
    )
  }

  if (guardedPage === 'login') {
    return (
      <Auth
        onSuccess={() => setPage('operator')}
        onBack={() => setPage('landing')}
      />
    )
  }

  return (
    <AppLayout
      page={guardedPage}
      operatorTab={operatorTab}
      setOperatorTab={(tab) => {
        setOperatorTab(tab as OperatorTab)
        if (guardedPage === 'business') {
          setPage('operator')
          setSelectedBusiness(null)
        }
      }}
      setPage={(p) => navigate(p as Page)}
      onLogout={handleLogout}
      businessName={selectedBusiness?.name}
    >
      {guardedPage === 'operator' && (
        <Operator tab={operatorTab} onSelectBusiness={handleSelectBusiness} />
      )}
      {guardedPage === 'business' && selectedBusiness && (
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
