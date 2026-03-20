/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../services/firebase.config'
import { onAuthStateChanged, signInWithPopup, signOut, getAdditionalUserInfo } from 'firebase/auth'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const details = getAdditionalUserInfo(result)
      const name = result.user.displayName?.split(' ')[0] || 'Student'
      
      if (details?.isNewUser) {
        addToast(`Welcome to StudyBuddy, ${name}! 🎉`, 'success')
      } else {
        addToast(`Welcome back, ${name}! Ready to focus? 💪`, 'info')
      }
      return result.user
    } catch (error) {
      console.error("Login failed", error)
      addToast(error.message, 'error')
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    addToast('Logged out successfully', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
