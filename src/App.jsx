import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatPanel from './components/ChatPanel'
import Dashboard from './pages/Dashboard'
import RegionalAnalysis from './pages/RegionalAnalysis'
import DemandAnalysis from './pages/DemandAnalysis'
import InvestmentZones from './pages/InvestmentZones'
import RiskAnalysis from './pages/RiskAnalysis'
import Reports from './pages/Reports'
import Login from './pages/Login'
import './index.css'

const API_BASE = 'http://127.0.0.1:8000/api'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)
  
  // RBAC User State
  const [user, setUser] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      const [overview, revenue, regional, demand, investments, risk] = await Promise.all([
        fetch(`${API_BASE}/dashboard/overview`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/revenue`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/regional`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/demand`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/investments`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/risk`).then(r => r.json()),
      ])
      setDashboardData({ overview, revenue, regional, demand, investments, risk })
      setBackendOnline(true)
      setLoading(false)
    } catch (err) {
      console.log('Backend not available:', err.message)
      // Show empty state — prompt user to start backend
      setDashboardData(getEmptyState())
      setBackendOnline(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Called by Reports page after a successful upload to refresh dashboard
  const handleReportUploaded = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const renderPage = () => {
    if (loading || !dashboardData) {
      return <LoadingState />
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard data={dashboardData} onNavigate={setActivePage} />
      case 'regional':
        return <RegionalAnalysis data={dashboardData.regional} onNavigate={setActivePage} />
      case 'demand':
        return <DemandAnalysis data={dashboardData.demand} onNavigate={setActivePage} />
      case 'investments':
        return <InvestmentZones data={dashboardData.investments} onNavigate={setActivePage} />
      case 'risk':
        return <RiskAnalysis data={dashboardData.risk} onNavigate={setActivePage} />
      case 'reports':
        return <Reports onReportUploaded={handleReportUploaded} backendOnline={backendOnline} />
      default:
        return <Dashboard data={dashboardData} onNavigate={setActivePage} />
    }
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="app-layout">
      <div className="ambient-bg" />
      
      <Sidebar 
        activePage={activePage} 
        onNavigate={(page) => { setActivePage(page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="main-content">
        <Header 
          onToggleChat={() => setChatOpen(!chatOpen)} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          chatOpen={chatOpen}
        />
        <div className="page-content">
          {renderPage()}
        </div>
      </main>

      <div className={`chat-backdrop ${chatOpen ? 'open' : ''}`} onClick={() => setChatOpen(false)} />
      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div>
      <div className="metrics-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="metric-card">
            <div className="loading-skeleton" style={{width:'60%',height:16,marginBottom:12}} />
            <div className="loading-skeleton" style={{width:'80%',height:28,marginBottom:8}} />
            <div className="loading-skeleton" style={{width:'40%',height:12}} />
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="chart-card"><div className="loading-skeleton" style={{width:'100%',height:300}} /></div>
        <div className="chart-card"><div className="loading-skeleton" style={{width:'100%',height:300}} /></div>
      </div>
    </div>
  )
}

function getEmptyState() {
  return {
    overview: {
      metrics: {
        total_revenue:    { value: 0, change: 0, period: '—' },
        net_profit:       { value: 0, change: 0, period: '—' },
        reports_analyzed: { value: 0, change: 0, period: 'None' },
        active_regions:   { value: 0, change: 0, period: '—' },
        investment_score: { value: 0, change: 0, period: '—' },
        risk_index:       { value: 0, change: 0, period: '—' },
      },
      recent_reports: [],
      alerts: [
        { type: 'insight', message: 'Start the backend server and upload a PDF report to see live data', priority: 'high' },
      ],
      source: 'offline',
    },
    revenue:     { monthly: [], quarterly: [], yearly: [], source: 'no_data' },
    regional:    { regions: [], top_cities: [], country_performance: [], source: 'no_data' },
    demand:      { monthly_demand: [], peak_periods: [], product_demand: [], seasonal_index: [], source: 'no_data' },
    investments: { opportunities: [], risk_matrix: [], roi_projections: [], source: 'no_data' },
    risk:        { risk_factors: [], risk_trend: [], mitigation_suggestions: [], source: 'no_data' },
  }
}

export default App
