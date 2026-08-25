import { useEffect, useState } from 'react'

// Core layout + auth
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import PublicResults from './pages/PublicResults'
import AppLayout from './components/AppLayout'
import { AuthProvider, useAuth } from './lib/AuthContext'

// Existing operator views
import Operator from './pages/Operator'
import BusinessView from './pages/Business'
import { type Business } from './data/mockData'

// Shared feature pages
import ClientDashboard from './pages/ClientDashboard'
import ContentCalendar from './pages/ContentCalendar'
import ServiceRequests from './pages/ServiceRequests'
import LeadsPipeline from './pages/LeadsPipeline'
import Settings from './pages/Settings'
import Automations from './pages/Automations'
import GrowthTools from './pages/GrowthTools'

// Owner-only pages
import OwnerOverview  from './pages/owner/OwnerOverview'
import SetupWizard    from './pages/owner/SetupWizard'
import IdeasPage      from './pages/owner/IdeasPage'
import OwnerCRM       from './pages/owner/OwnerCRM'
import OwnerAnalytics from './pages/owner/OwnerAnalytics'
import OwnerInvoices  from './pages/owner/OwnerInvoices'

// Unique feature pages (all authenticated users)
import GrowthTwin         from './pages/features/GrowthTwin'
import PortfolioExchange  from './pages/features/PortfolioExchange'
import ComplianceTracker  from './pages/features/ComplianceTracker'
import AIFrontDesk        from './pages/features/AIFrontDesk'
import ProofEngine        from './pages/features/ProofEngine'
import FinancialHealthScore from './pages/features/FinancialHealthScore'

// Operator agency tools
import AskGrowthNet       from './pages/operator/AskGrowthNet'
import ProspectingEngine  from './pages/operator/ProspectingEngine'
import ProposalGenerator  from './pages/operator/ProposalGenerator'
import ChurnRadar         from './pages/operator/ChurnRadar'
import ReferralEngine     from './pages/operator/ReferralEngine'
import ResellerMode       from './pages/operator/ResellerMode'
import SocialPublisher    from './pages/operator/SocialPublisher'

// Vertical config
import { type ApiBusiness, fetchBusinesses } from './lib/api'

type Page = 'landing' | 'login' | 'operator' | 'business'

// ── Tabs handled by the legacy Operator component ─────────────────────────
const OPERATOR_TABS = new Set([
  'portfolio', 'compare', 'inbox', 'campaigns', 'pipeline',
  'alerts', 'connections', 'analytics', 'results', 'content',
])

function AppInner() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [operatorTab, setOperatorTab] = useState('portfolio')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [pendingAddBusiness, setPendingAddBusiness] = useState(false)
  const [apiBusinesses, setApiBusinesses] = useState<ApiBusiness[]>([])

  const [publicBusinessId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/public\/([^/]+)/)
    return match ? decodeURIComponent(match[1]) : null
  })

  // Role-based post-login routing
  useEffect(() => {
    if (user && page === 'login') {
      const isOperator = user.role === 'owner' || user.role === 'admin'
      // Operator lands on portfolio, business owner lands on their overview
      setOperatorTab(isOperator ? 'portfolio' : 'owner-overview')
      setPage('operator')
    }
  }, [user, page])

  // Tabs the operator can see — clients are blocked from these entirely
  const OPERATOR_ONLY_TABS = new Set([
    ...Array.from(OPERATOR_TABS),
    'client-calendar', 'client-requests', 'client-leads',
    'automations', 'growth-tools', 'client-dashboard',
    'ask', 'prospecting', 'proposals', 'churn-radar', 'referrals', 'reseller',
    'portfolio-exchange',
  ])

  const isOperator = user?.role === 'owner' || user?.role === 'admin'

  // If a business owner somehow navigates to an operator-only tab, redirect them home
  const activeTab = operatorTab
  const effectiveTab = (!isOperator && OPERATOR_ONLY_TABS.has(activeTab)) ? 'owner-overview' : activeTab

  // Pre-fetch business list for Ask GrowthNet selector
  useEffect(() => {
    if (user) {
      fetchBusinesses().catch(() => []).then(list => { if (Array.isArray(list)) setApiBusinesses(list) })
    }
  }, [user])

  if (publicBusinessId) {
    return (
      <PublicResults
        businessId={publicBusinessId}
        onBack={() => { window.history.replaceState({}, '', '/') }}
      />
    )
  }

  const handleLogout = () => {
    logout()
    setSelectedBusiness(null)
    setPendingAddBusiness(false)
    setPage('landing')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#0f0f0e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 15 }}>G</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f0f0e', letterSpacing: -0.3 }}>GrowthNet</span>
        </div>
        <div style={{ width: 22, height: 22, border: '2px solid #e8e8e4', borderTopColor: '#16a34a', borderRadius: '50%' }} className="spin" />
        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Loading your dashboard…</p>
      </div>
    )
  }

  if (page === 'landing') return <Landing onLogin={() => setPage('login')} onDashboard={() => setPage('operator')} />
  if (page === 'login')   return <Auth onBack={() => { setPendingAddBusiness(false); setPage('landing') }} />

  // ── Shared dummy business for feature pages ────────────────────────────
  const dummyBusiness: ApiBusiness = {
    id: 'dummy-biz-1',
    name: user?.name ?? 'My Business',
    type: 'Generic SME',
    status: 'active',
    owner_id: user?.id ?? '',
    domain: '',
    visible: 1,
    created_at: '',
    updated_at: '',
  }

  const nav = (tab: string) => {
    // Block client from navigating to operator-only tabs
    if (!isOperator && OPERATOR_ONLY_TABS.has(tab)) return
    setOperatorTab(tab)
    if (page === 'business') { setPage('operator'); setSelectedBusiness(null) }
  }

  const tab = effectiveTab

  return (
    <AppLayout
      page={page}
      operatorTab={tab}
      setOperatorTab={nav}
      setPage={p => setPage(p as Page)}
      onLogout={handleLogout}
      businessName={selectedBusiness?.name}
    >
      {/* ── Legacy Operator tabs (portfolio, compare, inbox, etc.) ── */}
      {page === 'operator' && isOperator && OPERATOR_TABS.has(tab) && (
        <Operator
          tab={tab as any}
          onSelectBusiness={b => { setSelectedBusiness(b); setPage('business') }}
          onRequireAuth={() => { setPendingAddBusiness(true); setPage('login') }}
          autoOpenAddBusiness={pendingAddBusiness}
          onAddBusinessHandled={() => setPendingAddBusiness(false)}
        />
      )}

      {/* ── Business detail view ── */}
      {page === 'business' && selectedBusiness && (
        <BusinessView business={selectedBusiness} onBack={() => { setPage('operator'); setSelectedBusiness(null) }} />
      )}

      {/* ── Operator-only feature tabs ── */}
      {page === 'operator' && isOperator && tab === 'client-dashboard' && <ClientDashboard business={dummyBusiness} />}
      {page === 'operator' && isOperator && tab === 'client-calendar'  && <ContentCalendar business={dummyBusiness} />}
      {page === 'operator' && isOperator && tab === 'client-requests'  && <ServiceRequests business={dummyBusiness} />}
      {page === 'operator' && isOperator && tab === 'client-leads'     && <LeadsPipeline business={dummyBusiness} />}
      {page === 'operator' && isOperator && tab === 'automations'      && <Automations />}
      {page === 'operator' && isOperator && tab === 'growth-tools'     && <GrowthTools />}
      {page === 'operator' && tab === 'settings' && <Settings />}

      {/* ── Owner pages (business owner sees ONLY these) ── */}
      {page === 'operator' && tab === 'owner-overview'  && <OwnerOverview  business={dummyBusiness} onNavigate={nav} />}
      {page === 'operator' && tab === 'owner-setup'     && <SetupWizard    business={dummyBusiness} onComplete={() => nav('owner-overview')} />}
      {page === 'operator' && tab === 'owner-ideas'     && <IdeasPage      business={dummyBusiness} onNavigate={nav} />}
      {page === 'operator' && tab === 'owner-crm'       && <OwnerCRM       business={dummyBusiness} />}
      {page === 'operator' && tab === 'owner-analytics' && <OwnerAnalytics business={dummyBusiness} />}
      {page === 'operator' && tab === 'owner-invoices'  && <OwnerInvoices  business={dummyBusiness} />}

      {/* ── Business owner tools (accessible to business owners only) ── */}
      {page === 'operator' && tab === 'growth-twin'   && <GrowthTwin />}
      {page === 'operator' && tab === 'compliance'    && <ComplianceTracker business={dummyBusiness} />}
      {page === 'operator' && tab === 'ai-front-desk' && <AIFrontDesk business={dummyBusiness} />}
      {page === 'operator' && tab === 'proof-engine'  && <ProofEngine business={dummyBusiness} />}
      {page === 'operator' && tab === 'health-score'  && <FinancialHealthScore business={dummyBusiness} />}

      {/* ── Operator-only unique tools ── */}
      {page === 'operator' && isOperator && tab === 'portfolio-exchange' && <PortfolioExchange />}

      {/* ── Operator agency tools ── */}
      {page === 'operator' && isOperator && tab === 'ask'            && <AskGrowthNet businesses={apiBusinesses.length > 0 ? apiBusinesses : [dummyBusiness]} />}
      {page === 'operator' && isOperator && tab === 'prospecting'    && <ProspectingEngine />}
      {page === 'operator' && isOperator && tab === 'proposals'      && <ProposalGenerator />}
      {page === 'operator' && isOperator && tab === 'churn-radar'    && <ChurnRadar />}
      {page === 'operator' && isOperator && tab === 'referrals'      && <ReferralEngine />}
      {page === 'operator' && isOperator && tab === 'reseller'       && <ResellerMode />}
      {page === 'operator' && isOperator && tab === 'social-publish' && (
        <SocialPublisher businesses={apiBusinesses.length > 0 ? apiBusinesses : [dummyBusiness]} />
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
