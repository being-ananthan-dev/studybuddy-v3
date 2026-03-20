import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_10%_20%,hsla(250,85%,60%,0.08)_0%,transparent_50%),radial-gradient(circle_at_90%_80%,hsla(320,80%,58%,0.08)_0%,transparent_50%)]">
      
      <Card className="w-full max-w-md p-10 bg-background/80 backdrop-blur-2xl border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/20 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="text-5xl mb-4 drop-shadow-sm animate-bounce [animation-duration:3s]">📚</div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight mb-2 text-foreground">
            {isSignUp ? 'Create Platform Identity' : 'Secure Connection'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {isSignUp ? 'Initialize your student local datastore today.' : 'Provide clearance to re-enter your dashboard.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Student Identifier String</label>
              <Input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-12 bg-background shadow-inner placeholder:text-muted-foreground/50 border-border/60 transition-colors focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Authentication Handle</label>
            <Input 
              type="email" 
              placeholder="student@school.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="h-12 bg-background shadow-inner placeholder:text-muted-foreground/50 border-border/60 transition-colors focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Security Token</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              className="h-12 bg-background shadow-inner font-mono tracking-widest placeholder:text-muted-foreground/30 border-border/60 transition-colors focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          <Button 
            type="submit"
            size="lg"
            className="w-full h-12 mt-4 text-[0.95rem] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                <span>Bridging...</span>
              </div>
            ) : (isSignUp ? 'Initialize User Nodes 🚀' : 'Authorize Handshake 🔐')}
          </Button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-border/40 relative z-10">
          <p className="text-sm font-semibold text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2">
            {isSignUp ? 'Existing academic clearance?' : "No identity array found?"}
            <Button 
              variant="link" 
              className="p-0 h-auto font-black uppercase text-primary tracking-wider hover:no-underline hover:text-primary/80"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setName('')
                setPassword('')
              }}
            >
              {isSignUp ? 'Request Handshake' : 'Initialize Root Node'}
            </Button>
          </p>
        </div>
      </Card>
      
    </div>
  )
}
