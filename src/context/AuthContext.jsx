/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut
} from 'firebase/auth'
import { auth } from '../services/firebase.config'
import { useToast } from './ToastContext'

const AuthContext = createContext()
const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  // Listen for auth state changes (fires on login/logout/page refresh)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  // Sign up with email + password + display name
  const signup = useCallback(async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
      })
      // Force refresh user so displayName appears immediately
      setUser({ ...cred.user, displayName: name })
      addToast(`Welcome aboard, ${name}! 🎉`, 'success')
    } catch (err) {
      const msg = firebaseErrorMessage(err.code)
      addToast(msg, 'error')
      throw err
    }
  }, [addToast])

  // Log in with email + password
  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      addToast(`Welcome back, ${cred.user.displayName || 'Student'}! 👋`, 'success')
    } catch (err) {
      const msg = firebaseErrorMessage(err.code)
      addToast(msg, 'error')
      throw err
    }
  }, [addToast])

  // Sign in with Google popup
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      addToast(`Welcome, ${result.user.displayName || 'Student'}! 🎉`, 'success')
    } catch (err) {
      // User closed popup — don't show error
      if (err.code === 'auth/popup-closed-by-user') return
      if (err.code === 'auth/cancelled-popup-request') return
      const msg = firebaseErrorMessage(err.code)
      addToast(msg, 'error')
      throw err
    }
  }, [addToast])

  // Log out
  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      addToast('Signed out successfully.', 'info')
    } catch (err) {
      addToast('Failed to sign out. Try again.', 'error')
      throw err
    }
  }, [addToast])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Map Firebase error codes to human-friendly messages
function firebaseErrorMessage(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email. Sign up first!',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
  }
  return map[code] || `Authentication error: ${code || 'Unknown'}`
}
