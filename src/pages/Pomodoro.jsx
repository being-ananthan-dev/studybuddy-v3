import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

export default function Pomodoro() {
  const [display, setDisplay] = useState('25:00')
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('focus')   // 'focus' | 'break'
  const [cycles, setCycles] = useState(0)
  const { addToast } = useToast()

  const timeRef  = useRef(25 * 60)
  const modeRef  = useRef('focus')
  const cyclesRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { cyclesRef.current = cycles }, [cycles])

  const clearTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null }

  const startTimer = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      timeRef.current -= 1
      setDisplay(fmt(timeRef.current))

      if (timeRef.current <= 0) {
        clearTimer()
        setRunning(false)

        if (modeRef.current === 'focus') {
          const newCycles = cyclesRef.current + 1
          setCycles(newCycles)
          cyclesRef.current = newCycles
          setMode('break')
          modeRef.current = 'break'
          timeRef.current = 5 * 60
          addToast(`Cycle ${newCycles} complete! Take a break 🎉`, 'success')
        } else {
          setMode('focus')
          modeRef.current = 'focus'
          timeRef.current = 25 * 60
          addToast('Break over! Ready for another round? 💪', 'info')
        }
        setDisplay(fmt(timeRef.current))
      }
    }, 1000)
  }

  const toggleRun = () => {
    if (running) { clearTimer(); setRunning(false) }
    else { startTimer(); setRunning(true) }
  }

  const reset = () => {
    clearTimer(); setRunning(false)
    setMode('focus'); modeRef.current = 'focus'
    timeRef.current = 25 * 60
    setDisplay('25:00')
  }

  useEffect(() => () => clearTimer(), [])

  const borderColor = mode === 'focus' ? 'border-primary' : 'border-emerald-500'
  const totalFocus = cycles * 25

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground text-sm">Stay focused with algorithmic 25/5 minute cycles</p>
      </div>

      <Card className="p-10 border-border/50 shadow-sm flex flex-col items-center">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-8 ${mode === 'focus' ? 'text-primary' : 'text-emerald-500'}`}>
          {mode === 'focus' ? 'Focus Session' : 'Break Time'}
        </p>

        {/* Circle timer */}
        <div
          className={`
            w-[min(260px,65vw)] h-[min(260px,65vw)] rounded-full flex items-center justify-center 
            mb-10 border-[6px] transition-colors duration-500
            ${borderColor}
            ${running ? 'animate-pulse shadow-[0_0_30px_hsl(var(--primary)/0.2)]' : ''}
          `}
        >
          <span className="font-sans text-[clamp(2.5rem,8vw,4rem)] font-extrabold tracking-tighter tabular-nums drop-shadow-sm">
            {display}
          </span>
        </div>

        <div className="flex gap-4 justify-center flex-wrap mb-10 w-full max-w-xs">
          <Button size="lg" className="flex-1 text-md shadow-md hover:scale-105 transition-transform" onClick={toggleRun}>
            {running ? 'Pause Timer' : (display !== (mode === 'focus' ? '25:00' : '05:00') ? 'Resume' : 'Start Focus')}
          </Button>
          <Button variant="outline" size="lg" className="px-6 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={reset}>
            Reset
          </Button>
        </div>

        <div className="flex gap-10 justify-center w-full border-t border-border/40 pt-8">
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
