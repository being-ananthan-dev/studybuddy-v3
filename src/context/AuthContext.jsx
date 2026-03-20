/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/firebase.config'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth'
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

  const signup = async (name, email, password) => {
    try {
      // Create user
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Attach name to the user profile
      await updateProfile(result.user, { displayName: name })
      
      // Update local state explicitly since onAuthStateChanged might not catch the immediate name update
      setUser({ ...result.user, displayName: name })

      addToast(`Welcome to StudyBuddy, ${name}! 🎉`, 'success')
      return result.user
    } catch (error) {
      console.error("Signup failed", error)
      addToast(error.message.replace('Firebase: Error (', '').replace(').', ''), 'error')
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const name = result.user.displayName || 'Student'
      
      addToast(`Welcome back, ${name}! Ready to focus? 💪`, 'info')
      return result.user
    } catch (error) {
      console.error("Login failed", error)
      addToast(error.message.replace('Firebase: Error (', '').replace(').', ''), 'error')
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    addToast('Logged out successfully', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
