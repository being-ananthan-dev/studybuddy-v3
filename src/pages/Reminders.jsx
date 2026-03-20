import { useState, useEffect } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { useToast } from '../context/ToastContext'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [input, setInput] = useState('')
  const { addToast } = useToast()

  useEffect(() => { idbGetAll('reminders').then(setReminders).catch(() => {}) }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const r = { id: Date.now(), text: input, completed: false }
    const updated = [...reminders, r]
    setReminders(updated)
    setInput('')
    try { await idbSave('reminders', r) } catch { /* ignore error */ }
    addToast('Reminder added!', 'success')
  }

  const toggle = async (id) => {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    const r = reminders.find(x => x.id === id)
    if (r) { try { await idbSave('reminders', { ...r, completed: !r.completed }) } catch { /* ignore error */ } }
  }

  const del = async (id) => {
    setReminders(rs => rs.filter(r => r.id !== id))
    try { await idbDelete('reminders', id) } catch { /* ignore error */ }
    addToast('Removed', 'info')
  }

  return (
    <div className="slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="section-header mb-6"><h1>Smart Reminders</h1><p>Never forget study tasks — saved offline</p></div>
      <form className="card mb-6" style={{ padding: 'var(--s4)', display: 'flex', gap: 'var(--s2)', alignItems: 'flex-end' }} onSubmit={add}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 'var(--s1)' }}>New Reminder</label>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="What to remember?" required />
        </div>
        <button className="btn btn-primary" type="submit" style={{ flexShrink: 0 }}>Add</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {reminders.length === 0 && <div className="card text-center" style={{ padding: 'var(--s8)', color: 'var(--text-3)' }}><p style={{ fontSize: '2rem' }}>🔔</p><p>No reminders yet</p></div>}
        {reminders.map(r => (
          <div key={r.id} className="card" style={{ padding: 'var(--s4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
              <input type="checkbox" checked={r.completed} onChange={() => toggle(r.id)} style={{ width: 20, height: 20, accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <span style={r.completed ? { textDecoration: 'line-through', color: 'var(--text-3)' } : {}}>{r.text}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => del(r.id)} style={{ color: 'var(--error)' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
