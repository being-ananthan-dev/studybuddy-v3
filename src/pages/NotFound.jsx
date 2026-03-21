import { Link } from 'react-router-dom'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto mt-20 text-center px-6">
      <Card className="p-12 border-border/50 shadow-xl bg-background/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <p className="text-7xl mb-6 drop-shadow-md animate-bounce [animation-duration:5s]">🔍</p>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">404 — Page Not Found</h1>
        <p className="text-muted-foreground font-medium mb-10 max-w-[280px] mx-auto leading-relaxed">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild size="lg" className="font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-transform active:scale-95">
          <Link to="/">Go Home</Link>
        </Button>
      </Card>
    </div>
  )
}
