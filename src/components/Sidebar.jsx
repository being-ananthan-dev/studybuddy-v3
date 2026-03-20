import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'

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

  return (
    <nav className="sidebar">
      {/* Desktop logo */}
      <div className="sidebar-header">
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', width: '100%' }}>
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <span className="gradient-text" style={{ fontSize: '1.15rem', fontWeight: 800 }}>StudyBuddy</span>
        </NavLink>
        {isOffline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', background: 'hsla(4,80%,58%,0.1)', borderRadius: 8, marginTop: 'var(--s2)' }}>
            ⚠️ Offline
          </div>
        )}
      </div>

      {/* Nav links — use NavLink's built-in className fn to avoid double-active */}
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}   /* FIX: prevents "/" matching all sub-routes */
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      {/* Desktop footer */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        <button
          className="nav-item mb-2"
          onClick={toggle}
          style={{ width: '100%', background: 'none', border: 'none' }}
          aria-label="Toggle theme"
        >
          <span className="nav-icon">{themesList.find(t => t.id === theme)?.icon || '☀️'}</span>
          <span>Theme</span>
        </button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s2)', borderRadius: 'var(--radius)', background: 'var(--surface-hover)' }}>
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'S'}&background=random`} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.displayName || 'Student'}</div>
            </div>
            <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--error)' }} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
