import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const stats = [
    { icon: '🔥', value: '4', label: 'Day Streak', bg: 'bg-orange-500/10 text-orange-600' },
    { icon: '⏱️', value: '12h', label: 'Total Focus', bg: 'bg-primary/10 text-primary' },
    { icon: '📝', value: '28', label: 'Notes', bg: 'bg-emerald-500/10 text-emerald-600' },
    { icon: '🏆', value: '2', label: 'Badges', bg: 'bg-pink-500/10 text-pink-600' },
  ]

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Student Profile</h1>
        <p className="text-muted-foreground text-sm">Access local metadata parameters and identity tokens</p>
      </div>

      <Card className="p-10 mb-8 border-border/50 shadow-sm text-center relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-5 shadow-lg flex items-center justify-center text-white text-4xl font-extrabold border-4 border-background ring-4 ring-primary/10 -mt-2">
          S
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-1 text-foreground">Student Identity</h2>
        <p className="text-sm font-semibold text-muted-foreground">student@studybuddy.app</p>
        <Badge variant="secondary" className="mt-4 uppercase tracking-widest text-[0.65rem] font-bold">Free Academic Tier</Badge>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform shadow-sm border-border/50 bg-card group">
            <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${s.bg} group-hover:scale-110 duration-300`}>
              {s.icon}
            </div>
            <div className="text-2xl font-black mb-1 leading-none">{s.value}</div>
            <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border/50 shadow-sm">
        <h3 className="text-lg font-bold mb-4 border-b border-border/50 pb-3 flex items-center gap-2"><span>🛡️</span> Technical Metadata</h3>
        
        <div className="flex flex-col">
          {[
            ['Datastore Relay', <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-bold shadow-none">Firebase Cloud Online</Badge>],
            ['Account Instantiated', <span className="font-semibold text-foreground">March 2026</span>],
            ['Engine Version', <span className="font-semibold text-foreground">V4 React / Native DOM</span>],
            ['Data Privacy', <span className="font-semibold text-foreground">End-to-end Local Fallback (IndexedDB)</span>],
          ].map(([label, value], i) => (
            <div key={i} className={`flex items-center justify-between py-4 ${i < 3 ? 'border-b border-border/40' : ''}`}>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
              <div className="text-sm text-right">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
