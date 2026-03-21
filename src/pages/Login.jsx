import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const { user, login, signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isSignUp) {
        if (!name.trim()) return
        await signup(name.trim(), email, password)
      } else {
        await login(email, password)
      }
      navigate('/', { replace: true })
    } catch {
      // Toast handles errors via AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch {
      // Toast handles errors via AuthContext
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-[420px] p-0 border-border/50 shadow-2xl relative overflow-hidden bg-card/95 backdrop-blur-xl">
        {/* Top gradient accent */}
        <div className="h-1 w-full gradient-primary" />

        <div className="p-8 sm:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-primary/25">
              📚
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Start your learning journey today' : 'Sign in to continue studying'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 mb-6 text-sm font-semibold gap-3 hover:bg-accent/50"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-0.5">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-11 bg-background/50 border-border/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-0.5">Email Address</label>
              <Input
                type="email"
                placeholder="student@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-background/50 border-border/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-0.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="h-11 bg-background/50 border-border/60 font-mono transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 mt-2 font-bold tracking-wide"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{isSignUp ? 'Creating…' : 'Signing in…'}</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="font-bold text-primary hover:text-primary/80 transition-colors"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setName('')
                setPassword('')
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}
