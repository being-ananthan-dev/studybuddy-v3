import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  { to: '/ai',         icon: '🤖', label: 'AI Tutor',    desc: 'Ask anything' },
  { to: '/planner',    icon: '📅', label: 'Planner',     desc: 'Study schedule' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Pomodoro',    desc: '25/5 focus' },
  { to: '/focusroom',  icon: '👥', label: 'Focus Room',  desc: 'Study together' },
  { to: '/notes',      icon: '📓', label: 'Notes',       desc: 'Smart notes' },
  { to: '/reminders',  icon: '🔔', label: 'Reminders',   desc: 'Set alarms' },
  { to: '/groups',     icon: '💬', label: 'Chat',        desc: 'Study groups' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral Test',   desc: 'Voice quiz' },
  { to: '/challenges', icon: '🏆', label: 'Challenges',  desc: 'Earn badges' },
]

const stats = [
  { icon: '🔥', value: '4',   label: 'Day Streak',   color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  { icon: '⏱️', value: '12h', label: 'This Week',    color: 'text-primary',     bg: 'bg-primary/10' },
  { icon: '📝', value: '28',  label: 'Notes Saved',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: '🏆', value: '2',   label: 'Badges Earned',color: 'text-pink-400',    bg: 'bg-pink-500/10' },
]

const quotes = [
  "The secret to getting ahead is getting started. 🚀",
  "Success is the sum of small efforts, repeated daily. 💪",
  "Study hard, stay focused, great things will happen. 🌟",
  "Your future self will thank you for studying today. 📖",
  "Every expert was once a beginner. Keep going! ✨",
]

function Heatmap() {
  const [cells] = useState(() => Array.from({ length: 35 }, () => Math.floor(Math.random() * 5)))
  return (
    <div className="heatmap">
      {cells.map((level, i) => (
        <div key={i} className="heat-cell" data-level={level} title={`Level ${level}`} />
      ))}
    </div>
  )
}

export default function Home() {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-8 pb-8">
      
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/20 via-card to-card border border-border/60 shadow-sm">
        {/* Decorative blob */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
        
        <div className="relative">
          <Badge variant="secondary" className="mb-4 text-xs font-bold uppercase tracking-widest px-3 py-1">
            📚 Study Dashboard
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Welcome back, <span className="gradient-text">Student!</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl leading-relaxed">{quote}</p>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="p-5 border-border/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.bg} group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
              <div>
                <div className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
          <div className="flex-1 h-px bg-border/60" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {features.map(f => (
            <Link key={f.to} to={f.to}>
              <Card className="h-full p-4 sm:p-5 border-border/50 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== HEATMAP ===== */}
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold tracking-tight">Study Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Last 35 days of sessions</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0,1,2,3,4].map(l => (
                <div key={l} className="w-3 h-3 rounded-sm heat-cell" data-level={l} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        <Heatmap />
      </Card>

    </div>
  )
}
