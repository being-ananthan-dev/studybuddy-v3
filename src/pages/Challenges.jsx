import { useState } from 'react'
import { useToast } from '../context/ToastContext'

const initChallenges = [
  { id: '1', title: 'First Steps', desc: 'Complete your first Pomodoro', done: true, icon: '🌟', xp: 50 },
  { id: '2', title: 'Night Owl', desc: 'Study past midnight', done: true, icon: '🦉', xp: 75 },
  { id: '3', title: 'Streak Master', desc: '7 days in a row', done: false, icon: '🔥', xp: 150 },
  { id: '4', title: 'AI Scholar', desc: 'Ask 50 AI questions', done: false, icon: '🧠', xp: 200 },
  { id: '5', title: 'Note Taker', desc: 'Save 20 notes', done: false, icon: '📝', xp: 100 },
  { id: '6', title: 'Social Learner', desc: '10 group messages', done: false, icon: '💬', xp: 80 },
  { id: '7', title: 'Focus Champ', desc: '5 hours total focus', done: false, icon: '🏅', xp: 250 },
  { id: '8', title: 'Voice Master', desc: '5 oral evaluations', done: false, icon: '🎤', xp: 175 },
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
    <div className="slide-up">
      <div className="section-header mb-6"><h1>Challenges & Badges</h1><p>Unlock achievements as you learn</p></div>
      <div className="card mb-6" style={{ padding: 'var(--s5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
          <span style={{ fontWeight: 700 }}>🏆 Total XP</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalXP} / {maxXP}</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
      </div>
      <div className="grid grid-auto">
        {challenges.map(c => (
          <div key={c.id} className="card" style={{ padding: 'var(--s5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s3)' }}>
              <div style={{ fontSize: '1.6rem', width: 44, height: 44, borderRadius: 12, background: 'var(--primary-ultra-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div><h3 style={{ fontSize: '0.95rem', marginBottom: 2 }}>{c.title}</h3><span className="text-xs text-muted">{c.xp} XP</span></div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-2)', marginBottom: 'var(--s3)' }}>{c.desc}</p>
            {c.done
              ? <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>✅ Unlocked</span>
              : <button className="btn btn-outline btn-sm btn-block" onClick={() => unlock(c.id)}>Simulate Unlock</button>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
