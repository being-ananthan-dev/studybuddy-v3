/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themesList = [
  { id: 'light', icon: '☀️', label: 'Light' },
  { id: 'dark', icon: '🌙', label: 'Dark' },
  { id: 'ocean', icon: '🌊', label: 'Ocean' },
  { id: 'forest', icon: '🌲', label: 'Forest' },
  { id: 'sunset', icon: '🌇', label: 'Sunset' },
]

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sb_theme', theme)
  }, [theme])

  const toggle = () => {
    setTheme(current => {
      const idx = themesList.findIndex(t => t.id === current)
      const nextIdx = (idx + 1) % themesList.length
      return themesList[nextIdx].id
    })
  }

  const setSpecificTheme = (id) => setTheme(id)

  return (
    <ThemeContext.Provider value={{ theme, toggle, setSpecificTheme, themesList }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
