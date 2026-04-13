import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import InvestmentZones from './pages/InvestmentZones';
import ChatBot from './pages/ChatBot';
import FinancialReportDashboard from './pages/FinancialReportDashboard';
import FinancialAnalyticsDashboard from './pages/FinancialAnalyticsDashboard';
import FinoraLogo from './components/FinoraLogo';

// Page title mapping
const pageTitles = {
  '/': 'Dashboard',
  '/documents': 'Documents',
  '/analytics': 'Analytics',
  '/investments': 'Investment Zones',
  '/chat': 'Finora Assistant',
  '/financial-report': 'Financial Report',
  '/financial-analytics': 'Financial Analytics',
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen-logo">
          <FinoraLogo size={80} variant="light" />
        </div>
        <h2>FINORA-CO</h2>
        <span>Rise Up Now</span>
        <div className="loading-bar">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img 
            src="/finora-logo.jpg" 
            alt="FINORA-CO Logo" 
            style={{ 
              width: '100%', 
              maxWidth: '200px',
              height: 'auto',
              objectFit: 'contain',
              marginTop: '10px'
            }}
          />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main</div>

          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📁</span>
            Documents
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            Analytics
          </NavLink>

          <NavLink to="/investments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💰</span>
            Investment Zones
          </NavLink>

          <div className="sidebar-section-title">Reports</div>

          <NavLink to="/financial-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            Financial Report
          </NavLink>

          <NavLink to="/financial-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Analytics Dashboard
          </NavLink>

          <div className="sidebar-section-title">Intelligence</div>

          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🤖</span>
            Finora Assistant
            <span className="nav-badge">AI</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <div className="status-dot"></div>
            <span>System Online • v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div>
              <div className="navbar-title">{currentTitle}</div>
              <div className="navbar-breadcrumb">
                <span>Finora-Co</span>
                <span className="separator">/</span>
                <span>{currentTitle}</span>
              </div>
            </div>
          </div>

          <div className="navbar-right">
            <button className="navbar-btn" title="Notifications">
              🔔
              <span className="notification-dot"></span>
            </button>
            <button className="navbar-btn" title="Settings">⚙️</button>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'var(--navy-800)', color: 'var(--gold-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem'
            }}>
              FC
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content fade-in" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/investments" element={<InvestmentZones />} />
            <Route path="/chat" element={<ChatBot />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/financial-report" element={<FinancialReportDashboard />} />
        <Route path="/financial-analytics" element={<FinancialAnalyticsDashboard />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
