import { NavLink } from 'react-router-dom'
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
  const { theme, toggle } = useTheme()
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
      <div className="sidebar-footer">
        <button
          className="nav-item"
          onClick={toggle}
          style={{ width: '100%', background: 'none', border: 'none' }}
          aria-label="Toggle theme"
        >
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>Theme</span>
        </button>
      </div>
    </nav>
  )
}
