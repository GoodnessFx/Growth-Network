import { useState } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Operator from './pages/Operator'
import BusinessView from './pages/Business'
import AppLayout from './components/AppLayout'
import { type Business } from './data/mockData'

type Page = 'landing' | 'login' | 'operator' | 'business'
type OperatorTab = 'portfolio' | 'compare' | 'inbox' | 'campaigns' | 'pipeline' | 'alerts'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [operatorTab, setOperatorTab] = useState<OperatorTab>('portfolio')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  const handleSelectBusiness = (b: Business) => {
    setSelectedBusiness(b)
    setPage('business')
  }

  const handleBackFromBusiness = () => {
    setPage('operator')
    setSelectedBusiness(null)
  }

  if (page === 'landing') {
    return (
      <Landing
        onLogin={() => setPage('login')}
        onRegister={() => setPage('login')}
        onDashboard={() => setPage('operator')}
      />
    )
  }

  if (page === 'login') {
    return (
      <Auth
        onSuccess={() => setPage('operator')}
        onBack={() => setPage('landing')}
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
      setPage={(p) => {
        setPage(p as Page)
        if (p !== 'business') setSelectedBusiness(null)
      }}
      businessName={selectedBusiness?.name}
    >
      {page === 'operator' && (
        <Operator tab={operatorTab} onSelectBusiness={handleSelectBusiness} />
      )}
      {page === 'business' && selectedBusiness && (
        <BusinessView business={selectedBusiness} onBack={handleBackFromBusiness} />
      )}
    </AppLayout>
  )
}
