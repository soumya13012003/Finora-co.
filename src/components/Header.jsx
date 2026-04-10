import { Search, Bell, MessageSquare, Menu, Sparkles } from 'lucide-react'

export default function Header({ onToggleChat, onToggleSidebar, chatOpen }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <Menu />
        </button>
        <div className="header-search">
          <Search />
          <input 
            type="text" 
            placeholder="Search reports, regions, insights..." 
            id="global-search"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-btn" id="notifications-btn" title="Notifications">
          <Bell />
          <span className="notification-dot" />
        </button>
        <button 
          className="chat-toggle-btn" 
          onClick={onToggleChat}
          id="chat-toggle"
        >
          <Sparkles />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  )
}
