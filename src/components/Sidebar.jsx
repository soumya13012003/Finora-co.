import { 
  LayoutDashboard, Globe, TrendingUp, Target, ShieldAlert, 
  FileText, Settings, HelpCircle, BarChart3 
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'regional', label: 'Regional Analysis', icon: Globe },
  { id: 'demand', label: 'Demand Trends', icon: TrendingUp },
  { id: 'investments', label: 'Investment Zones', icon: Target },
  { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
  { id: 'reports', label: 'Reports', icon: FileText, badge: 47 },
]

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="chat-backdrop open" onClick={onClose} style={{zIndex: 99}} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img 
            src="/logo.png" 
            alt="Finora Co. - Rise Up Now" 
            className="finora-logo"
            style={{ 
              width: '100%', 
              maxWidth: '180px', 
              height: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
            onError={(e) => {
              // Fallback if user hasn't saved the image yet
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback layout if logo.png is missing */}
          <div className="fallback-brand" style={{ display: 'none', alignItems: 'center', gap: 12 }}>
            <div className="sidebar-logo">
              <BarChart3 />
            </div>
            <div className="sidebar-brand">
              <h1>Finora Co.</h1>
              <span style={{ color: '#D4AF37', fontWeight: 600, letterSpacing: 1 }}>RISE UP NOW</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Analytics</div>
            {navItems.slice(0, 5).map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            {navItems.slice(5).map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </button>
            ))}
            <button className="nav-item" onClick={() => {}}>
              <Settings />
              <span>Settings</span>
            </button>
            <button className="nav-item" onClick={() => {}}>
              <HelpCircle />
              <span>Help & Support</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">SA</div>
            <div className="user-info">
              <span className="name">Sarah Anderson</span>
              <span className="role">Senior Analyst</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
