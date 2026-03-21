import { useState } from 'react'
import { useToast } from '../context/ToastContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const initChallenges = [
  { id: '1', title: 'First Steps', desc: 'Complete your first Pomodoro cycle', done: true, icon: '🌟', xp: 50 },
  { id: '2', title: 'Night Owl', desc: 'Study successfully past midnight', done: true, icon: '🦉', xp: 75 },
  { id: '3', title: 'Streak Master', desc: 'Keep a 7-day study streak', done: false, icon: '🔥', xp: 150 },
  { id: '4', title: 'AI Scholar', desc: 'Ask 50 questions to the AI Tutor', done: false, icon: '🧠', xp: 200 },
  { id: '5', title: 'Note Taker', desc: 'Save 20 study notes', done: false, icon: '📝', xp: 100 },
  { id: '6', title: 'Social Learner', desc: 'Send 10 messages in group chat', done: false, icon: '💬', xp: 80 },
  { id: '7', title: 'Focus Champ', desc: 'Accumulate 5+ hours of focus time', done: false, icon: '🏅', xp: 250 },
  { id: '8', title: 'Voice Master', desc: 'Complete 5 AI-graded oral test evaluations', done: false, icon: '🎤', xp: 175 },
]

export default function Challenges() {
  const [challenges, setChallenges] = useState(initChallenges)
  const { addToast } = useToast()
  
  const totalXP = challenges.filter(c => c.done).reduce((a, c) => a + c.xp, 0)
  const maxXP = challenges.reduce((a, c) => a + c.xp, 0)
  const pct = Math.round((totalXP / maxXP) * 100)

  const unlock = (id) => {
    setChallenges(cs => cs.map(c => c.id === id ? { ...c, done: true } : c))
    addToast('Badge Unlocked! 🎉', 'success')
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Challenges & Badges</h1>
        <p className="text-muted-foreground text-sm">Earn badges as you study and complete goals</p>
      </div>

      <Card className="p-8 mb-10 border-border/50 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-sm">🏆</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Global Rank</p>
              <h2 className="text-xl font-black text-foreground">Scholar Level 1</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Experience Points</p>
            <span className="text-2xl font-black text-primary">{totalXP} <span className="text-lg text-muted-foreground font-semibold">/ {maxXP} XP</span></span>
          </div>
        </div>
        <Progress value={pct} className="h-4 bg-secondary/40 shadow-inner" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {challenges.map(c => (
          <Card key={c.id} className={`p-6 border-border/50 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.done ? 'bg-background hover:border-emerald-500/50' : 'bg-secondary/5 opacity-80 backdrop-grayscale'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm ${c.done ? 'bg-primary/10' : 'bg-muted border border-border/50'}`}>
              {c.icon}
            </div>
            
            <Badge variant="outline" className="mb-3 uppercase tracking-widest text-[0.6rem] font-bold border-primary/20 bg-primary/5 text-primary">
              {c.xp} XP MATCH
            </Badge>

            <h3 className="text-lg font-bold mb-2 tracking-tight leading-tight">{c.title}</h3>
            <p className="text-sm font-medium text-muted-foreground mb-6 flex-1">{c.desc}</p>
            
            {c.done ? (
              <div className="w-full py-2 bg-emerald-500/10 text-emerald-600 font-extrabold text-sm uppercase tracking-widest rounded-lg border border-emerald-500/20">
                ✅ UNLOCKED
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full font-bold shadow-sm" onClick={() => unlock(c.id)}>
                SIMULATE UNLOCK
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
