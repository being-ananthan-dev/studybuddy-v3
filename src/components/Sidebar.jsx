import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/',           icon: '🏠', label: 'Home',       end: true },
  { to: '/ai',         icon: '🤖', label: 'AI Tutor' },
  { to: '/planner',    icon: '📅', label: 'Planner' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Focus' },
  { to: '/focusroom',  icon: '👥', label: 'Focus Room' },
  { to: '/notes',      icon: '📓', label: 'Notes' },
  { to: '/reminders',  icon: '🔔', label: 'Reminders' },
  { to: '/groups',     icon: '💬', label: 'Chat' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral Test' },
  { to: '/challenges', icon: '🏆', label: 'Challenges' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
  { to: '/settings',   icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const { theme, toggle, themesList } = useTheme()
  const { user, logout } = useAuth()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  const close = () => setIsOpen(false)

  return (
    <>
      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 bg-background/95 backdrop-blur-xl border-b border-border">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary/60 transition-colors text-foreground"
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/>
          </svg>
        </button>

        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            StudyBuddy
          </span>
        </NavLink>

        <div className="w-10 flex justify-end">
          {isOffline && <span title="Offline" className="text-lg">⚠️</span>}
        </div>
      </header>

      {/* ===== MOBILE OVERLAY ===== */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] animate-in fade-in duration-200"
          onClick={close}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[999]
        w-64 flex flex-col
        bg-card border-r border-border shadow-2xl
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-md shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <div className="font-black text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              StudyBuddy
            </div>
            <div className="text-[0.65rem] text-muted-foreground font-semibold uppercase tracking-wider">AI Learning Hub</div>
          </div>
          {/* Mobile close */}
          <button
            onClick={close}
            className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors text-muted-foreground"
          >
            ✕
          </button>
        </div>

        {isOffline && (
          <div className="mx-4 mt-3 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs font-semibold flex items-center gap-2">
            ⚠️ You are offline
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>
              {({ isActive }) => (
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-200 cursor-pointer select-none
                  ${isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }
                `}>
                  <span className={`text-lg leading-none transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-3 py-4 border-t border-border flex flex-col gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            <span className="text-lg">{themesList.find(t => t.id === theme)?.icon || '🎨'}</span>
            <span>Theme: {themesList.find(t => t.id === theme)?.label || 'Default'}</span>
          </button>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30 border border-border/60">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'S')}&background=random&size=64`}
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-primary/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-foreground">{user.displayName || 'Student'}</div>
                <div className="text-[0.65rem] text-muted-foreground truncate">{user.email || ''}</div>
              </div>
              <button
                onClick={() => { close(); logout() }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                title="Logout"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
