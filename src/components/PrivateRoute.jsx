import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  // While Firebase is checking auth state, show spinner
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 bg-background text-muted-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium animate-pulse">Checking authentication...</p>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
