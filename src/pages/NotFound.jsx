import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="slide-up" style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: 'var(--s10)' }}>
        <p style={{ fontSize: '4rem', marginBottom: 'var(--s4)' }}>🔍</p>
        <h1 className="mb-3">404 — Page Not Found</h1>
        <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  )
}
