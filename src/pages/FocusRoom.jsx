import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

const ONLINE_COUNT = Math.floor(Math.random() * 20) + 5
const AVATARS = ['A', 'B', 'C', 'D', 'E']
const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500']

export default function FocusRoom() {
  const [display, setDisplay] = useState('45:00')
  const [running, setRunning] = useState(false)
  const timeRef = useRef(45 * 60)
  const intervalRef = useRef(null)
  const { addToast } = useToast()

  const clearTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null }

  const startTimer = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      timeRef.current -= 1
      setDisplay(fmt(timeRef.current))
      if (timeRef.current <= 0) {
        clearTimer(); setRunning(false)
        addToast('Focus session complete! 🎉', 'success')
        timeRef.current = 45 * 60
        setDisplay('45:00')
      }
    }, 1000)
  }

  const toggleRun = () => {
    if (running) { clearTimer(); setRunning(false) }
    else { startTimer(); setRunning(true) }
  }

  const reset = () => { clearTimer(); setRunning(false); timeRef.current = 45 * 60; setDisplay('45:00') }

  useEffect(() => () => clearTimer(), [])

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Live Focus Room</h1>
        <p className="text-muted-foreground text-sm">Study silently together for global accountability</p>
      </div>

      <Card className="p-10 mb-6 border-border/50 shadow-sm flex flex-col items-center">
        <Badge variant={running ? "default" : "secondary"} className="mb-6 uppercase tracking-wider text-[0.65rem]">
          {running ? 'Deep Focus Active' : 'Ready to Focus'}
        </Badge>

        <div className={`
          font-sans text-[clamp(3.5rem,10vw,5rem)] font-black tabular-nums tracking-tighter mb-8 transition-colors duration-300
          ${running ? 'text-primary' : 'text-foreground'}
        `}>
          {display}
        </div>

        {/* Avatar Stack */}
        <div className="flex justify-center mb-4 isolate">
          {AVATARS.map((a, i) => (
            <div key={i} className={`
              w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs
              border-2 border-background shadow-sm relative hover:z-50 hover:scale-110 transition-transform cursor-pointer
              ${AVATAR_COLORS[i]}
            `}
            style={{ marginLeft: i > 0 ? '-12px' : '0', zIndex: 10 - i }}>
              {a}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-xs border-2 border-background shadow-sm relative z-0" style={{ marginLeft: '-12px' }}>
            +{ONLINE_COUNT}
          </div>
        </div>
        <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-8">
          {ONLINE_COUNT + AVATARS.length} BUDDIES FOCUSING NOW
        </p>

        <div className="flex gap-4 justify-center w-full max-w-[280px]">
          <Button size="lg" className="flex-1 shadow-md hover:scale-105 transition-transform" onClick={toggleRun}>
            {running ? 'Pause' : 'Start Synchronization'}
          </Button>
          <Button variant="outline" size="lg" className="px-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border/60" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 text-left border-border/50 bg-secondary/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span>🧘</span> Focus Tips</h3>
        <ul className="text-sm text-muted-foreground flex flex-col gap-3 font-medium">
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/40 shrink-0"/> Turn on Do Not Disturb on your phone.</li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/40 shrink-0"/> Close social media and distracting tabs.</li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/40 shrink-0"/> Take a short break every 45 minutes.</li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/40 shrink-0"/> Stay hydrated — keep water nearby.</li>
        </ul>
      </Card>
    </div>
  )
}
