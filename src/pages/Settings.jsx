import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

export default function Settings() {
  const { theme, toggle } = useTheme()
  const { addToast } = useToast()
  const [mood, setMood] = useState('neutral')
  const [age, setAge] = useState(() => localStorage.getItem('sb_age') || 'college')

  const moods = [
    { id: 'neutral', icon: '😊' },
    { id: 'focused', icon: '🎯' },
    { id: 'tired', icon: '😴' },
    { id: 'motivated', icon: '⚡' },
  ]

  return (
    <div className="slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="section-header mb-6"><h1>Settings</h1><p>Customize your experience</p></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <h3 className="mb-4">🎨 Appearance</h3>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontWeight: 500 }}>Dark Mode</span>
            <input type="checkbox" checked={theme === 'dark'} onChange={toggle} style={{ width: 22, height: 22, accentColor: 'var(--primary)', cursor: 'pointer' }} />
          </label>
        </div>
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <h3 className="mb-4">🧘 Mood Engine</h3>
          <p className="text-sm text-muted mb-4">Adjust UI mood</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px,1fr))', gap: 'var(--s2)' }}>
            {moods.map(m => (
              <button key={m.id} className={`btn btn-sm ${mood === m.id ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}
                onClick={() => { setMood(m.id); addToast(`Mood: ${m.id}`, 'success') }}>
                {m.icon} {m.id}
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <h3 className="mb-4">🎓 AI Personalization</h3>
          <label style={{ display: 'block', marginBottom: 'var(--s2)', fontWeight: 500 }}>Age Group</label>
          <select value={age} onChange={e => { setAge(e.target.value); localStorage.setItem('sb_age', e.target.value); addToast('Updated!', 'success') }}>
            <option value="middle">Middle School</option>
            <option value="high">High School</option>
            <option value="college">College</option>
            <option value="adult">Adult Learner</option>
          </select>
        </div>
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <h3 className="mb-4">🔔 Push Notifications</h3>
          <p className="text-sm text-muted mb-4">Get study reminders and alerts</p>
          <button className="btn btn-primary btn-block" onClick={() => {
            if ('Notification' in window) { Notification.requestPermission().then(p => addToast(p === 'granted' ? 'Enabled!' : 'Denied', p === 'granted' ? 'success' : 'error')) }
            else addToast('Not supported', 'error')
          }}>Enable Notifications</button>
        </div>
        <div className="card text-center" style={{ padding: 'var(--s4)' }}>
          <p className="text-sm text-muted">StudyBuddy V3 • React + Vite</p>
          <p className="text-xs text-muted">Built with ❤️</p>
        </div>
      </div>
    </div>
  )
}
