import { useState } from 'react'
import { generateStudyPlan } from '../services/ai.service'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Planner() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async (e) => {
    e.preventDefault()
    setLoading(true); setPlan(null)
    try {
      const p = await generateStudyPlan(subjects, timeframe)
      setPlan(p)
      if (user?.uid) logActivity(user.uid, 'plan').catch(() => {})
    } catch { setPlan({ days: [] }) }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">AI Study Scheduler</h1>
        <p className="text-muted-foreground text-sm">Let AI create a mathematically optimized timetable for you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Input Panel */}
        <Card className="p-6 border-border/50 shadow-sm lg:sticky top-20">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2"><span>📝</span> Create Plan</h3>
          <form onSubmit={generate} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Subjects / Curriculum</label>
              <Input 
                value={subjects} 
                onChange={e => setSubjects(e.target.value)} 
                placeholder="e.g. Physics Vectors, Math Calculus" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Target Timeframe</label>
              <Input 
                type="text" 
                value={timeframe} 
                onChange={e => setTimeframe(e.target.value)} 
                placeholder="e.g. 5 hours OR 3 days" 
                required 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2 shadow-md hover:scale-[1.02] transition-transform">
              {loading ? 'Running Algorithms...' : 'Generate AI Plan ✨'}
            </Button>
          </form>
        </Card>

        {/* Output Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading && (
            <Card className="h-64 flex flex-col items-center justify-center gap-4 border-dashed border-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground text-sm font-medium animate-pulse">Structuring curriculum...</p>
            </Card>
          )}

          {!loading && !plan && (
            <Card className="h-64 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed border-2 bg-secondary/5">
              <span className="text-5xl mb-4 opacity-50">📅</span>
              <p className="font-medium">Define your subjects and constraints to generate a personalized timeline.</p>
            </Card>
          )}

          {plan?.days?.map((d, i) => (
            <Card key={i} className="p-6 border-border/50 shadow-sm group hover:border-primary/30 transition-colors">
              <h3 className="text-xl font-black mb-5 text-primary border-b border-border/50 pb-3">
                {String(d.day).startsWith('Day') ? d.day : `Day ${d.day}`}
              </h3>
              <div className="flex flex-col gap-3">
                {d.tasks.map((t, j) => (
                  <div key={j} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/15 transition-colors">
                    <Badge variant="outline" className="mt-0.5 shrink-0 bg-background shadow-xs text-[0.7rem] px-2 py-0.5 border-border/60">Target</Badge>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
