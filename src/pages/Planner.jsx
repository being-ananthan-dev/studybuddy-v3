import { useState } from 'react'
import { generateStudyPlan } from '../services/ai.service'

export default function Planner() {
  const [subjects, setSubjects] = useState('')
  const [hours, setHours] = useState('')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async (e) => {
    e.preventDefault()
    setLoading(true); setPlan(null)
    try {
      const p = await generateStudyPlan(subjects, hours)
      setPlan(p)
    } catch { setPlan({ days: [] }) }
    finally { setLoading(false) }
  }

  return (
    <div className="slide-up">
      <div className="section-header mb-6">
        <h1>AI Study Scheduler</h1>
        <p>Let AI create an optimized timetable for you</p>
      </div>
      <div className="grid grid-auto">
        <div className="card">
          <h3 className="mb-4">📝 Create Plan</h3>
          <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--s1)', fontWeight: 600, fontSize: '0.9rem' }}>Subjects</label>
              <input value={subjects} onChange={e => setSubjects(e.target.value)} placeholder="e.g. Physics, Math" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--s1)', fontWeight: 600, fontSize: '0.9rem' }}>Total Hours</label>
              <input type="number" value={hours} onChange={e => setHours(e.target.value)} min="1" placeholder="e.g. 10" required />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Plan ✨'}</button>
          </form>
        </div>
        <div>
          {loading && <div className="loader" style={{ height: 200 }}><div className="spinner"></div></div>}
          {!loading && !plan && (
            <div className="card text-center" style={{ padding: 'var(--s8)', color: 'var(--text-3)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 'var(--s2)' }}>📅</p>
              <p>Fill out the form to generate your AI schedule.</p>
            </div>
          )}
          {plan?.days?.map((d, i) => (
            <div key={i} className="card mb-4">
              <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--s3)' }}>Day {d.day}</h3>
              {d.tasks.map((t, j) => (
                <p key={j} style={{ padding: 'var(--s2) 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>✅ {t}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
