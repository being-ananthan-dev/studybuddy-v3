import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from "@/components/ui/card"

const features = [
  { to: '/ai',         icon: '🤖', label: 'AI Tutor' },
  { to: '/planner',    icon: '📅', label: 'Planner' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Pomodoro' },
  { to: '/focusroom',  icon: '👥', label: 'Focus Room' },
  { to: '/notes',      icon: '📓', label: 'Notes' },
  { to: '/reminders',  icon: '🔔', label: 'Reminders' },
  { to: '/groups',     icon: '💬', label: 'Study Chat' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral Test' },
  { to: '/challenges', icon: '🏆', label: 'Badges' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
  { to: '/settings',   icon: '⚙️', label: 'Settings' },
]

const stats = [
  { icon: '🔥', value: '4', label: 'Day Streak', bg: 'bg-orange-500/10 text-orange-600' },
  { icon: '⏱️', value: '12h', label: 'This Week', bg: 'bg-primary/10 text-primary' },
  { icon: '📝', value: '28', label: 'Notes Saved', bg: 'bg-emerald-500/10 text-emerald-600' },
  { icon: '🏆', value: '2', label: 'Badges', bg: 'bg-pink-500/10 text-pink-600' },
]

const quotes = [
  "The way to get started is to quit talking and begin doing. 💪",
  "Success is the sum of small efforts, repeated day in and day out. 🌟",
  "Study hard, stay focused, and great things will happen. 🚀",
  "Your future self will thank you for studying today. 📖",
]

function Heatmap() {
  const [cells] = useState(() => Array.from({ length: 30 }, () => Math.floor(Math.random() * 5)))
  return (
    <div className="grid grid-cols-[repeat(auto-fill,14px)] gap-1 justify-center">
      {cells.map((level, i) => (
        <div 
          key={i} 
          className={`w-[14px] h-[14px] rounded-[3px] transition-transform hover:scale-125
            ${level === 0 ? 'bg-secondary/20' : ''}
            ${level === 1 ? 'bg-primary/30' : ''}
            ${level === 2 ? 'bg-primary/50' : ''}
            ${level === 3 ? 'bg-primary/70' : ''}
            ${level === 4 ? 'bg-primary' : ''}
          `}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 mx-auto max-w-6xl">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl tracking-tight mb-3 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Welcome back, Student
        </h1>
        <p className="text-muted-foreground text-lg">{quote}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <Card key={i} className="p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-border/50">
            <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-black leading-none">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-5 tracking-tight">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-10">
        {features.map(f => (
          <Link key={f.to} to={f.to}>
            <Card className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center hover:scale-105 hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer border-border/50 group">
              <div className="text-3xl w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {f.icon}
              </div>
              <div className="font-semibold text-sm">{f.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-8 border-border/50 shadow-sm">
        <h3 className="text-lg font-bold mb-1 tracking-tight">Productivity Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-6">Last 30 days of study sessions</p>
        <Heatmap />
      </Card>
    </div>
  )
}
