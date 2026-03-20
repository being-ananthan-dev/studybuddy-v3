import { useState, useEffect, useRef } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { useToast } from '../context/ToastContext'

// Simple default repeating beep data URI for alarm sound
const alarmSoundUri = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [input, setInput] = useState('')
  const [targetTime, setTargetTime] = useState('')
  const [priority, setPriority] = useState('Medium')
  
  const { addToast } = useToast()
  const audioRef = useRef(null)

  useEffect(() => { idbGetAll('reminders').then(setReminders).catch(() => {}) }, [])

  // Top-level Alarm Monitor loop (checks every 10 seconds)
  useEffect(() => {
    if (reminders.length === 0) return

    const interval = setInterval(() => {
      const now = new Date()
      reminders.forEach(async r => {
        if (!r.completed && r.targetTime) {
          const target = new Date(r.targetTime)
          // Trigger alarm if the current minute matches the target minute and it hasn't fired yet
          if (now.getHours() === target.getHours() && now.getMinutes() === target.getMinutes() && !r.fired) {
            triggerAlarm(r)
          }
        }
      })
    }, 10000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders])

  const triggerAlarm = async (reminder) => {
    // Attempt to play sound (browsers might block this without user interaction, but we'll try)
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e))
    }
    
    // HTML5 Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${reminder.priority} Priority Alarm`, { body: reminder.text })
    }

    addToast(`ALARM: ${reminder.text}`, reminder.priority === 'High' ? 'error' : 'info')

    // Mark as fired so it doesn't loop forever during the same minute
    const updated = { ...reminder, fired: true }
    setReminders(rs => rs.map(x => x.id === reminder.id ? updated : x))
    try { await idbSave('reminders', updated) } catch { /* ignore */ }
  }

  const add = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const r = { 
      id: Date.now(), 
      text: input, 
      targetTime: targetTime || null,
      priority: priority,
      completed: false,
      fired: false
    }
    
    const updated = [...reminders, r].sort((a,b) => {
      // Sort by incomplete first, then priority (High -> Medium -> Low), then creation
      const weight = { 'High': 3, 'Medium': 2, 'Low': 1 }
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return weight[b.priority] - weight[a.priority]
    })
    
    setReminders(updated)
    setInput('')
    setTargetTime('')
    setPriority('Medium')
    try { await idbSave('reminders', r) } catch { /* ignore error */ }
    
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    
    addToast('Alarm Set!', 'success')
  }

  const toggle = async (id) => {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    const r = reminders.find(x => x.id === id)
    if (r) { try { await idbSave('reminders', { ...r, completed: !r.completed }) } catch { /* ignore error */ } }
  }

  const del = async (id) => {
    setReminders(rs => rs.filter(r => r.id !== id))
    try { await idbDelete('reminders', id) } catch { /* ignore error */ }
    addToast('Alarm Deleted', 'info')
  }

  const getPriorityColor = (p) => {
    if (p === 'High') return 'var(--error)'
    if (p === 'Medium') return 'var(--primary)'
    return 'var(--text-3)'
  }

  return (
    <div className="slide-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <audio ref={audioRef} src={alarmSoundUri} />
      
      <div className="section-header mb-6"><h1>Priority Alarms</h1><p>Trigger loud alerts and push notifications for critical tasks</p></div>
      
      <div className="card mb-6" style={{ padding: 'var(--s6)' }}>
        <h3 className="mb-4">🚨 Create New Alarm</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }} onSubmit={add}>
          <div>
             <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 'var(--s1)' }}>Alarm Title</label>
             <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. History Exam Study Session" required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s4)' }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 'var(--s1)' }}>Target Time (Optional)</label>
              <input type="datetime-local" value={targetTime} onChange={e => setTargetTime(e.target.value)} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 'var(--s1)' }}>Priority Level</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="High">🔴 High Priority (Immediate Action)</option>
                <option value="Medium">🟠 Medium Priority (Scheduled Task)</option>
                <option value="Low">🟢 Low Priority (Casual Reminder)</option>
              </select>
            </div>
          </div>
          
          <button className="btn btn-primary" type="submit" style={{ marginTop: 'var(--s2)' }}>Arm System</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {reminders.length === 0 && <div className="card text-center" style={{ padding: 'var(--s8)', color: 'var(--text-3)' }}><p style={{ fontSize: '2rem' }}>🕒</p><p>No active alarms</p></div>}
        {reminders.map(r => (
          <div key={r.id} className="card" style={{ padding: 'var(--s4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${r.completed ? 'transparent' : getPriorityColor(r.priority)}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)' }}>
              <input type="checkbox" checked={r.completed} onChange={() => toggle(r.id)} style={{ width: 22, height: 22, accentColor: 'var(--primary)', cursor: 'pointer', marginTop: 4 }} />
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 600, textDecoration: r.completed ? 'line-through' : 'none', color: r.completed ? 'var(--text-3)' : 'var(--text-1)' }}>
                  {r.text}
                </span>
                <div style={{ display: 'flex', gap: 'var(--s3)', marginTop: 'var(--s1)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'var(--surface-hover)', color: getPriorityColor(r.priority) }}>
                    {r.priority} Priority
                  </span>
                  {r.targetTime && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: r.fired ? 'rgba(255,0,0,0.1)' : 'var(--primary-ultra-light)', color: r.fired ? 'var(--error)' : 'var(--primary)' }}>
                      ⏱️ {new Date(r.targetTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => del(r.id)} style={{ color: 'var(--error)' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
