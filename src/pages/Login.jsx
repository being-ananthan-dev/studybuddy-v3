import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Auto-redirect if already logged in
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name.')
        await signup(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/', { replace: true })
    } catch {
      // Toast handles error display gracefully via AuthContext
    } finally {
      setIsLoading(false)
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
        padding: 'var(--s8)',
        background: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--s5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--s2)' }}>📚</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', marginBottom: 'var(--s1)' }}>
            <span className="gradient-text">{isSignUp ? 'Create an Account' : 'Welcome Back'}</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {isSignUp ? 'Sign up to start studying smarter.' : 'Log in to continue your progress.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@school.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary btn-block" 
            style={{ height: 48, fontSize: '1.05rem', marginTop: 'var(--s2)', display: 'flex', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--s5)' }}>
          <p className="text-sm text-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button"
              className="btn btn-ghost" 
              style={{ color: 'var(--primary)', padding: '0 8px', fontWeight: 600 }}
              onClick={() => {
                setIsSignUp(!isSignUp)
                setName('')
                setPassword('')
              }}
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
