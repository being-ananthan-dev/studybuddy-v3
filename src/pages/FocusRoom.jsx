import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

const ONLINE_COUNT = Math.floor(Math.random() * 20) + 5
const AVATARS = ['A', 'B', 'C', 'D', 'E']
const AVATAR_COLORS = ['hsl(200,60%,55%)', 'hsl(280,60%,55%)', 'hsl(45,70%,55%)', 'hsl(150,60%,45%)', 'hsl(330,60%,55%)']

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
    <div className="slide-up" style={{ maxWidth: 650, margin: '0 auto', textAlign: 'center' }}>
      <div className="section-header mb-8">
        <h1>Live Focus Room</h1>
        <p>Study silently together for accountability</p>
      </div>

      <div className="card mb-6" style={{ padding: 'var(--s10)' }}>
        <p className="text-sm text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 2 }}>
          {running ? 'Deep Focus Active' : 'Ready to Focus'}
        </p>

        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
          fontWeight: 800, fontVariantNumeric: 'tabular-nums',
          color: running ? 'var(--success)' : 'var(--primary)',
          marginBottom: 'var(--s6)',
          transition: 'color 0.3s',
        }}>
          {display}
        </div>

        {/* Avatar Stack */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s3)' }}>
          {AVATARS.map((a, i) => (
            <div key={i} style={{
              width: 40, height: 40, borderRadius: '50%',
              background: AVATAR_COLORS[i],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
              border: '3px solid var(--surface)',
              marginLeft: i > 0 ? -12 : 0,
              zIndex: 5 - i, position: 'relative',
            }}>{a}</div>
          ))}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--surface-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.7rem',
            border: '3px solid var(--surface)',
            marginLeft: -12, zIndex: 0, position: 'relative',
            color: 'var(--text-2)',
          }}>+{ONLINE_COUNT}</div>
        </div>
        <p className="text-sm text-muted mb-6">{ONLINE_COUNT + AVATARS.length} buddies focusing now</p>

        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={toggleRun}>
            {running ? 'Pause' : 'Start Focusing'}
          </button>
          <button className="btn btn-outline" onClick={reset}>Reset</button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--s5)', textAlign: 'left' }}>
        <h3 className="mb-3">🧘 Focus Tips</h3>
        <ul style={{ color: 'var(--text-2)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <li>• Put your phone on silent mode</li>
          <li>• Close all social media tabs</li>
          <li>• Take short breaks every 45 minutes</li>
          <li>• Stay hydrated — keep water nearby 💧</li>
        </ul>
      </div>
    </div>
  )
}
