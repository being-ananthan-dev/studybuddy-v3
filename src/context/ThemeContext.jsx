/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

export const themesList = [
  { id: 'dark',   icon: '🌙', label: 'Dark' },
  { id: 'light',  icon: '☀️', label: 'Light' },
  { id: 'ocean',  icon: '🌊', label: 'Ocean' },
  { id: 'forest', icon: '🌲', label: 'Forest' },
  { id: 'sunset', icon: '🌇', label: 'Sunset' },
]

// Apply theme immediately to <html> to avoid flash
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  // Also set class for components that use light/dark class detection
  document.documentElement.classList.toggle('dark', theme !== 'light')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('sb_theme')
    // Default to dark (more common preference for study apps)
    return saved || 'dark'
  })

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('sb_theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setThemeState(current => {
      const idx = themesList.findIndex(t => t.id === current)
      return themesList[(idx + 1) % themesList.length].id
    })
  }, [])

  const setSpecificTheme = useCallback((id) => {
    if (themesList.some(t => t.id === id)) {
      setThemeState(id)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setSpecificTheme, themesList }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
