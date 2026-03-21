import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getUserStats, getUserHeatmap, logActivity } from '../services/user.service'

const features = [
  { to: '/chanakya',   icon: '🪔', label: 'Chanakya',    desc: 'Ancient Wisdom' },
  { to: '/flashcards', icon: '🧠', label: 'Flashcards',  desc: 'Memory Bank' },
  { to: '/whiteboard', icon: '🎨', label: 'Whiteboard',  desc: 'Mind Mapping' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Pomodoro',    desc: '25/5 focus' },
  { to: '/focusroom',  icon: '👥', label: 'Focus Room',  desc: 'Study together' },
  { to: '/notes',      icon: '📓', label: 'Notes',       desc: 'Smart notes' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral Test',   desc: 'Voice quiz' },
  { to: '/challenges', icon: '🏆', label: 'Challenges',  desc: 'Earn badges' },
]

const quotes = [
  "The secret to getting ahead is getting started. 🚀",
  "Success is the sum of small efforts, repeated daily. 💪",
  "Study hard, stay focused, great things will happen. 🌟",
  "Your future self will thank you for studying today. 📖",
  "Every expert was once a beginner. Keep going! ✨",
]

function formatMinutes(mins) {
  if (!mins || mins < 60) return `${mins || 0}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function Heatmap({ data }) {
  // Generate last 35 days
  const cells = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const level = data[key] || 0
    cells.push({ key, level })
  }

  return (
    <div className="heatmap">
      {cells.map(c => (
        <div
          key={c.key}
          className="heat-cell"
          data-level={c.level}
          title={`${c.key}: Level ${c.level}`}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [stats, setStats] = useState(null)
  const [heatmap, setHeatmap] = useState({})
  const [loadingStats, setLoadingStats] = useState(true)
  const [quests, setQuests] = useState([])

  const { addToast } = useToast()

  // Initialize Daily Quests
  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('daily_quests')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.date === today) {
          setQuests(parsed.list)
          return
        }
      } catch (e) {}
    }
    
    const defaults = [
      { id: 1, text: 'Study for 30 minutes', done: false, xp: 50 },
      { id: 2, text: 'Review 10 Flashcards', done: false, xp: 30 },
      { id: 3, text: "Consult Chanakya's wisdom", done: false, xp: 20 },
    ]
    setQuests(defaults)
    localStorage.setItem('daily_quests', JSON.stringify({ date: today, list: defaults }))
  }, [])

  const toggleQuest = (id) => {
    const updated = quests.map(q => q.id === id ? { ...q, done: !q.done } : q)
    setQuests(updated)
    localStorage.setItem('daily_quests', JSON.stringify({ date: new Date().toDateString(), list: updated }))
    
    const quest = updated.find(q => q.id === id)
    if (quest.done) {
      addToast(`Quest Completed! +${quest.xp} XP 🌟`, 'success')
      if (user?.uid) logActivity(user.uid, 'quest_completed', quest.xp).catch(() => {})
    }
  }

  useEffect(() => {
    if (!user?.uid) return

    // Log a visit activity
    logActivity(user.uid, 'visit', 0).catch(() => {})

    // Fetch stats and heatmap
    Promise.all([
      getUserStats(user.uid),
      getUserHeatmap(user.uid),
    ]).then(([s, h]) => {
      setStats(s)
      setHeatmap(h || {})
    }).catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [user?.uid])

  const displayName = user?.displayName || 'Student'
  const s = stats || {}

  const statCards = [
    { icon: '🔥', value: s.streak || 0,                    label: 'Day Streak',    color: 'text-orange-400',  bg: 'bg-orange-500/10' },
    { icon: '⏱️', value: formatMinutes(s.totalMinutes),    label: 'Study Time',    color: 'text-primary',     bg: 'bg-primary/10' },
    { icon: '📝', value: s.notesCount || 0,                label: 'Notes Saved',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: '🏆', value: s.badgesCount || 0,               label: 'Badges Earned', color: 'text-pink-400',    bg: 'bg-pink-500/10' },
  ]

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-8 pb-8">

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/20 via-card to-card border border-border/60 shadow-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary" className="text-xs font-bold uppercase tracking-widest px-3 py-1">
              📚 Study Dashboard
            </Badge>
            <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black">
              ⭐ LVL {Math.floor((s.xp || 0) / 100) + 1}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Welcome back, <span className="gradient-text">{displayName}!</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl leading-relaxed">{quote}</p>
        </div>
      </div>

      {/* ===== DAILY QUESTS ===== */}
      <Card className="p-5 sm:p-6 border-l-4 border-l-primary shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">🎯 Daily Quests</h2>
              <p className="text-xs text-muted-foreground">Complete these to earn XP and rank up!</p>
            </div>
            <div className="text-sm font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
              {quests.filter(q => q.done).length} / {quests.length}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {quests.map(quest => (
              <label 
                key={quest.id} 
                className={`flex justify-between items-center p-3 rounded-lg border transition-all cursor-pointer ${
                  quest.done ? 'bg-secondary/30 border-secondary/50 opacity-60' : 'bg-background hover:border-primary/50 hover:bg-primary/5 border-border/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    quest.done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
                  }`}>
                    {quest.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <span className={`text-sm font-semibold selection:bg-transparent ${quest.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {quest.text}
                  </span>
                </div>
                <Badge variant="secondary" className={`text-[0.65rem] ${quest.done ? 'opacity-50' : 'text-primary'}`}>+{quest.xp} XP</Badge>
                <input 
                  type="checkbox" 
                  checked={quest.done} 
                  onChange={() => toggleQuest(quest.id)} 
                  className="hidden" 
                />
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((st, i) => (
          <Card key={i} className="p-5 border-border/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${st.bg} group-hover:scale-110 transition-transform duration-300`}>
                {st.icon}
              </div>
              <div>
                <div className={`text-2xl font-black leading-none ${st.color}`}>
                  {loadingStats ? <span className="shimmer inline-block w-8 h-6 rounded" /> : st.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{st.label}</div>
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
        <Heatmap data={heatmap} />
      </Card>

    </div>
  )
}
