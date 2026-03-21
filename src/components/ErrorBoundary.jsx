import { Component } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }

  static getDerivedStateFromError(error) { return { hasError: true, error } }

  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="animate-in fade-in duration-500 max-w-lg mx-auto mt-20 text-center px-6">
          <Card className="p-10 border-destructive/20 border-2 shadow-2xl bg-destructive/5">
            <p className="text-5xl mb-5">⚠️</p>
            <h2 className="text-xl font-bold tracking-tight mb-2 text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-6 bg-background/50 p-3 rounded-lg border border-border/40">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Button 
              variant="destructive" 
              size="lg" 
              className="font-semibold w-full"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Go Home
            </Button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
