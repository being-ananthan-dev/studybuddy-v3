import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }

  static getDerivedStateFromError(error) { return { hasError: true, error } }

  componentDidCatch(error, info) { console.error('StudyBuddy Error Boundary:', error, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="slide-up" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: 'var(--s8)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 'var(--s4)' }}>⚠️</p>
            <h2 className="mb-3">Something went wrong</h2>
            <p className="text-sm text-muted mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
