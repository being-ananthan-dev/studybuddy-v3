import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

// FIX: Use refs for mutable state accessed inside setInterval to avoid stale closures
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

  // Keep refs synced with state
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

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [])

  const borderColor = mode === 'focus' ? 'var(--primary)' : 'var(--success)'
  const totalFocus = cycles * 25

  return (
    <div className="slide-up" style={{ maxWidth: 550, margin: '0 auto', textAlign: 'center' }}>
      <div className="section-header mb-6">
        <h1>Pomodoro Timer</h1>
        <p>Stay focused with 25/5 minute cycles</p>
      </div>

      <div className="card mb-6" style={{ padding: 'var(--s10)' }}>
        <p className="text-sm mb-4" style={{ textTransform: 'uppercase', letterSpacing: 3, color: borderColor }}>
          {mode === 'focus' ? 'Focus Session' : 'Break Time'}
        </p>

        {/* Circle timer */}
        <div
          className={running ? 'pulse-glow' : ''}
          style={{
            width: 'min(260px, 65vw)', height: 'min(260px, 65vw)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto var(--s6)',
            border: `5px solid ${borderColor}`, transition: 'border-color 0.4s',
          }}
        >
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: 800, fontVariantNumeric: 'tabular-nums',
          }}>
            {display}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--s6)' }}>
          <button className="btn btn-primary btn-lg" onClick={toggleRun}>
            {running ? 'Pause' : (timeRef.current < (mode === 'focus' ? 25*60 : 5*60) ? 'Resume' : 'Start')}
          </button>
          <button className="btn btn-outline" onClick={reset}>Reset</button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s6)', justifyContent: 'center' }}>
          <div className="text-center">
            <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700 }}>{cycles}</div>
            <div className="text-xs text-muted">Cycles</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div className="text-center">
            <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700 }}>{totalFocus}m</div>
            <div className="text-xs text-muted">Total Focus</div>
          </div>
        </div>
      </div>
    </div>
  )
}
