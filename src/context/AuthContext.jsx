/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // Bypass Firebase completely and provide a static local user profile
  // so the Chat and Sidebar features still function beautifully!
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('sb_temp_name') || 'Student'
    return { 
      uid: 'local-desktop-user-123', 
      displayName: savedName, 
      photoURL: `https://ui-avatars.com/api/?name=${savedName}&background=random` 
    }
  })
  
  const [loading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    // Simulate a gentle welcome popup without hitting any external APIs
    addToast(`Welcome to StudyBuddy, ${user.displayName}! 🎉`, 'success')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array ensures this only happens once per session load

  // Mock functions so nothing crashes if clicked
  const signup = async (name) => {
    localStorage.setItem('sb_temp_name', name)
    setUser({ ...user, displayName: name })
    addToast(`Profile updated to ${name}!`, 'success')
  }

  const login = async () => { return user }

  const logout = async () => {
    addToast('You are now in offline guest mode.', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
