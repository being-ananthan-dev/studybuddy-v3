import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

export default function Pomodoro() {
  const [focusLength, setFocusLength] = useState(25)
  const [breakLength, setBreakLength] = useState(5)
  
  const [display, setDisplay] = useState('25:00')
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('focus')   // 'focus' | 'break'
  const [cycles, setCycles] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  
  const { addToast } = useToast()
  const { user } = useAuth()

  const timeRemainingRef = useRef(25 * 60)
  const endTimeRef = useRef(null)
  const modeRef  = useRef('focus')
  const cyclesRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { cyclesRef.current = cycles }, [cycles])

  const clearTimer = useCallback(() => { clearInterval(intervalRef.current); intervalRef.current = null }, [])

  const startTimer = () => {
    if (intervalRef.current) return
    endTimeRef.current = Date.now() + timeRemainingRef.current * 1000

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000))
      
      timeRemainingRef.current = remaining
      setDisplay(fmt(remaining))

      if (remaining <= 0) {
        clearTimer()
        setRunning(false)

        if (modeRef.current === 'focus') {
          const newCycles = cyclesRef.current + 1
          setCycles(newCycles)
          cyclesRef.current = newCycles
          setMode('break')
          modeRef.current = 'break'
          timeRemainingRef.current = breakLength * 60
          addToast(`Session ${newCycles} complete! Take a break 🎉`, 'success')
          if (user?.uid) logActivity(user.uid, 'session', focusLength).catch(() => {})
        } else {
          setMode('focus')
          modeRef.current = 'focus'
          timeRemainingRef.current = focusLength * 60
          addToast('Break over! Ready for the next session? 💪', 'info')
        }
        setDisplay(fmt(timeRemainingRef.current))
      }
    }, 500)
  }

  const toggleRun = () => {
    if (running) { clearTimer(); setRunning(false) }
    else { startTimer(); setRunning(true); setShowSettings(false) }
  }

  const reset = () => {
    clearTimer(); setRunning(false)
    setMode('focus'); modeRef.current = 'focus'
    timeRemainingRef.current = focusLength * 60
    setDisplay(fmt(focusLength * 60))
  }

  const updateSettings = (f, b) => {
    setFocusLength(f)
    setBreakLength(b)
    if (!running) {
      if (mode === 'focus') {
        timeRemainingRef.current = f * 60
        setDisplay(fmt(f * 60))
      } else {
        timeRemainingRef.current = b * 60
        setDisplay(fmt(b * 60))
      }
    }
  }

  useEffect(() => () => clearTimer(), [clearTimer])

  const borderColor = mode === 'focus' ? 'border-primary' : 'border-emerald-500'
  const totalFocus = cycles * focusLength

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground text-sm">Stay focused with customizable intervals</p>
      </div>

      <Card className="p-8 sm:p-10 border-border/50 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Settings Toggle */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground active:scale-95"
          title="Timer Settings"
        >
          ⚙️
        </button>

        <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-8 ${mode === 'focus' ? 'text-primary' : 'text-emerald-500'}`}>
          {mode === 'focus' ? 'Focus Session' : 'Break Time'}
        </p>

        {/* Dynamic Settings Panel */}
        {showSettings && !running && (
          <div className="absolute top-16 right-4 sm:right-10 bg-card border border-border/60 shadow-xl rounded-xl p-4 z-10 animate-in fade-in slide-in-from-top-2 text-left w-64 ring-1 ring-black/5">
            <h4 className="font-bold text-sm mb-3">Timer Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Focus (minutes)</label>
                <div className="flex gap-1.5">
                  {[15, 25, 45, 50].map(m => (
                    <button 
                      key={m} 
                      onClick={() => updateSettings(m, breakLength)}
                      className={`flex-1 py-1 rounded text-xs font-bold border transition-colors ${focusLength === m ? 'bg-primary border-primary text-primary-foreground' : 'hover:bg-accent border-border/60'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Break (minutes)</label>
                <div className="flex gap-1.5">
                  {[5, 10, 15].map(m => (
                    <button 
                      key={m} 
                      onClick={() => updateSettings(focusLength, m)}
                      className={`flex-1 py-1 rounded text-xs font-bold border transition-colors ${breakLength === m ? 'bg-emerald-500 border-emerald-500 text-white' : 'hover:bg-accent border-border/60'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="mt-5 w-full py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Circle timer */}
        <div
          className={`
            w-[min(260px,65vw)] h-[min(260px,65vw)] rounded-full flex items-center justify-center 
            mb-10 border-[6px] transition-colors duration-500 bg-card
            ${borderColor}
            ${running ? 'animate-pulse shadow-[0_0_30px_hsl(var(--primary)/0.2)]' : ''}
          `}
        >
          <span className="font-sans text-[clamp(2.5rem,8vw,4rem)] font-extrabold tracking-tighter tabular-nums drop-shadow-sm">
            {display}
          </span>
        </div>

        <div className="flex gap-4 justify-center flex-wrap mb-10 w-full max-w-xs relative z-0">
          <Button size="lg" className="flex-1 text-md shadow-md hover:scale-105 transition-transform" onClick={toggleRun}>
            {running ? 'Pause Timer' : (display !== fmt((mode === 'focus' ? focusLength : breakLength) * 60) ? 'Resume' : 'Start Focus')}
          </Button>
          <Button variant="outline" size="lg" className="px-6 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={reset}>
            Reset
          </Button>
        </div>

        <div className="flex gap-10 justify-center w-full border-t border-border/40 pt-8 mt-2">
          <div className="text-center">
            <div className="text-3xl font-black">{cycles}</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Cycles</div>
          </div>
          <div className="w-px bg-border/40" />
          <div className="text-center">
            <div className="text-3xl font-black">{totalFocus}<span className="text-lg text-muted-foreground ml-1">m</span></div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Total Focus</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
