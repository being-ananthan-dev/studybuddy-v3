import { Component } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }

  static getDerivedStateFromError(error) { return { hasError: true, error } }

  componentDidCatch(error, info) { console.error('StudyBuddy Error Boundary:', error, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="animate-in fade-in duration-500 max-w-lg mx-auto mt-20 text-center px-6">
          <Card className="p-10 border-destructive/20 border-2 shadow-2xl bg-destructive/5 backdrop-blur-sm">
            <p className="text-6xl mb-6 drop-shadow-sm">⚠️</p>
            <h2 className="text-2xl font-black tracking-tight mb-3 text-destructive">System Fault Detected</h2>
            <p className="text-sm font-semibold text-muted-foreground mb-8 bg-background/50 p-4 rounded-lg border border-border/40 italic">
              {this.state.error?.message || 'A catastrophic UI thread exception occurred.'}
            </p>
            <Button 
              variant="destructive" 
              size="lg" 
              className="font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform active:scale-95 w-full"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Reboot Interface
            </Button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
