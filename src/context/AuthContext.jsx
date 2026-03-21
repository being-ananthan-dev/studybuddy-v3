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
import { initUserProfile } from '../services/user.service'
import { useToast } from './ToastContext'

const AuthContext = createContext()
const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Initialize or update user profile in database
        try {
          const { isNew } = await initUserProfile(firebaseUser)
          if (isNew) {
            addToast(`Welcome to StudyBuddy, ${firebaseUser.displayName || 'Student'}! 🎉`, 'success')
          }
        } catch (err) {
          console.warn('Profile init error:', err)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signup = useCallback(async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
      })
      setUser({ ...cred.user, displayName: name })
      addToast(`Welcome aboard, ${name}! 🎉`, 'success')
    } catch (err) {
      addToast(firebaseErrorMessage(err.code), 'error')
      throw err
    }
  }, [addToast])

  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      addToast(`Welcome back, ${cred.user.displayName || 'Student'}! 👋`, 'success')
    } catch (err) {
      addToast(firebaseErrorMessage(err.code), 'error')
      throw err
    }
  }, [addToast])

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      addToast(`Welcome, ${result.user.displayName || 'Student'}! 🎉`, 'success')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return
      if (err.code === 'auth/cancelled-popup-request') return
      addToast(firebaseErrorMessage(err.code), 'error')
      throw err
    }
  }, [addToast])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      addToast('Signed out successfully.', 'info')
    } catch (err) {
      addToast('Failed to sign out.', 'error')
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

function firebaseErrorMessage(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found. Sign up first!',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-blocked': 'Popup blocked. Please allow popups.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/account-exists-with-different-credential': 'Account exists with a different sign-in method.',
  }
  return map[code] || `Authentication error: ${code || 'Unknown'}`
}
