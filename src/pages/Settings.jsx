import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Settings() {
  const { theme, setSpecificTheme, themesList } = useTheme()
  const { addToast } = useToast()
  const [mood, setMood] = useState('neutral')
  const [age, setAge] = useState(() => localStorage.getItem('sb_age') || 'college')

  const moods = [
    { id: 'neutral', icon: '😊' },
    { id: 'focused', icon: '🎯' },
    { id: 'tired', icon: '😴' },
    { id: 'motivated', icon: '⚡' },
  ]

  const enablePush = async () => {
    if (!('Notification' in window)) {
      addToast('Browser natively blocks notifications', 'error')
      return
    }
    const p = await Notification.requestPermission()
    if (p === 'granted') addToast('Hardware relay enabled!', 'success')
    else addToast('User explicitly denied access.', 'error')
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Configuration</h1>
        <p className="text-muted-foreground text-sm">Customize visual themes, AI personalization, and hardware bridges</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Appearance Card */}
        <Card className="p-6 border-border/50 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><span>🎨</span> Appearance Core</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Select root CSS variable cluster</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themesList.map(t => (
              <Button 
                key={t.id} 
                variant={theme === t.id ? 'default' : 'outline'}
                className={`h-24 flex flex-col items-center justify-center gap-2 border-2 transition-all ${theme === t.id ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/50'}`}
                onClick={() => { setSpecificTheme(t.id); addToast(`Applied ${t.label} Layout Parameters!`, 'success') }}
              >
                <div className="text-3xl drop-shadow-sm">{t.icon}</div>
                <div className="text-xs uppercase tracking-widest font-black shrink-0">{t.label}</div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Mood Engine Card */}
        <Card className="p-6 border-border/50 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><span>🧘</span> Algorithmic Mood Matrix</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Adjust AI context temperament</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moods.map(m => (
              <Button 
                key={m.id} 
                variant={mood === m.id ? 'default' : 'outline'} 
                className={`flex gap-2 font-bold tracking-wide capitalize shadow-xs bg-background/50 backdrop-blur-sm ${mood === m.id ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => { setMood(m.id); addToast(`Biometric Sync: ${m.id}`, 'info') }}
              >
                {m.icon} {m.id}
              </Button>
            ))}
          </div>
        </Card>

        {/* Personalization Card */}
        <Card className="p-6 border-border/50 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><span>🎓</span> AI Persona Restrictions</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Set specific complexity bindings</p>

          <div className="space-y-2 max-w-xs">
            <label className="text-sm font-semibold tracking-wide text-foreground px-1 block">Account Phase Grouping</label>
            <Select value={age} onValueChange={(v) => { setAge(v); localStorage.setItem('sb_age', v); addToast('Persona bounds written.', 'success') }}>
              <SelectTrigger className="w-full font-bold shadow-sm bg-background border-border/60">
                <SelectValue placeholder="Select demographic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middle">Middle School Standard</SelectItem>
                <SelectItem value="high">High School Rigor</SelectItem>
                <SelectItem value="college" className="font-bold text-primary">Collegiate Architecture</SelectItem>
                <SelectItem value="adult">Adult Continuing Edu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Notifications Card */}
        <Card className="p-6 border-l-4 border-l-amber-500 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] z-0 point-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-foreground"><span>🔔</span> Hardware Relays</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Authorize system push notifications</p>
          </div>
          <Button variant="default" className="font-bold uppercase tracking-widest shadow-md shrink-0 relative z-10" onClick={enablePush}>
            Bridge Hardware
          </Button>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 pb-20">
          <p className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">StudyBuddy Engine V4 • React DOM</p>
          <p className="text-xs text-muted-foreground/60 italic font-medium">Rebuilt with Shadcn & Tailwind CSS 🚀</p>
        </div>
      </div>
    </div>
  )
}
