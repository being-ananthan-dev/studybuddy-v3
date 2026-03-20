import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { to: '/',           icon: '🏠', label: 'Home',    end: true },
  { to: '/ai',         icon: '🤖', label: 'AI Tutor' },
  { to: '/planner',    icon: '📅', label: 'Planner' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Focus' },
  { to: '/focusroom',  icon: '👥', label: 'Rooms' },
  { to: '/notes',      icon: '📓', label: 'Notes' },
  { to: '/reminders',  icon: '🔔', label: 'Alerts' },
  { to: '/groups',     icon: '💬', label: 'Chat' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral' },
  { to: '/challenges', icon: '🏆', label: 'Badges' },
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

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b z-50 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <span className="text-xl">☰</span>
        </Button>
        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
          StudyBuddy
        </span>
        <div className="w-10 flex justify-end">
          {isOffline && <span title="Offline" className="text-xl">⚠️</span>}
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[1999] animate-in fade-in duration-200" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[2000] w-72 bg-background/90 backdrop-blur-xl border-r 
        flex flex-col p-4 shadow-2xl lg:shadow-none lg:translate-x-0 transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="flex flex-col mb-6 pb-4 border-b">
          <div className="flex items-center justify-between w-full">
            <NavLink to="/" onClick={handleNavClick} className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-sm">🧠</span>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
                StudyBuddy
              </span>
            </NavLink>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setIsOpen(false)}>
              ✕
            </Button>
          </div>
          {isOffline && (
            <Badge variant="destructive" className="mt-4 self-start">⚠️ Offline Mode</Badge>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pr-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={handleNavClick}
                  className={`w-full justify-start gap-4 h-12 transition-all ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                  <span className="font-semibold text-[0.95rem]">{item.label}</span>
                </Button>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t flex flex-col gap-3">
          <Button variant="outline" onClick={toggle} className="w-full justify-start gap-4 h-12">
            <span className="text-lg">{themesList.find(t => t.id === theme)?.icon || '☀️'}</span>
            <span className="font-medium">Theme</span>
          </Button>

          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/10 border border-border/50">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'S'}&background=random`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full ring-2 ring-background" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{user.displayName || 'Student'}</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { handleNavClick(); logout(); }} 
                className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
