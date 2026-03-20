import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Auto-redirect if somehow already logged in
  if (user) return <Navigate to="/" replace />

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch {
      setIsLoggingIn(false) // Toast will show the error via AuthContext
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--s6)',
      background: 'radial-gradient(circle at 10% 20%, hsla(250, 85%, 60%, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, hsla(320, 80%, 58%, 0.15) 0%, transparent 50%)'
    }}>
      <div className="card slide-up" style={{
        maxWidth: 420,
        width: '100%',
        padding: 'var(--s10) var(--s8)',
        textAlign: 'center',
        background: 'var(--surface-hover)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--s2)' }}>📚</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', marginBottom: 'var(--s2)' }}>
          Welcome to <span className="gradient-text">StudyBuddy</span>
        </h1>
        <p className="text-muted mb-8" style={{ fontSize: '0.95rem' }}>
          Your AI-powered study companion and productivity planner.
        </p>

        <button 
          className="btn btn-primary btn-block" 
          style={{ height: 50, fontSize: '1.05rem', gap: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-xs text-muted mt-6 text-center">
          By continuing, you agree to our Terms of Service and Study Honor Code.
        </p>
      </div>
    </div>
  )
}
