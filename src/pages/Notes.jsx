import { useState, useEffect, useMemo } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { searchNotes } from '../services/vector.service'
import { useToast } from '../context/ToastContext'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')

  const { addToast } = useToast()

  useEffect(() => { idbGetAll('notes').then(setNotes).catch(() => {}) }, [])

  const save = async () => {
    if (!input.trim()) return
    const note = { id: Date.now().toString(), content: input }
    const updated = [...notes, note]
    setNotes(updated)
    setInput('')
    try { await idbSave('notes', note) } catch { /* ignore */ }
    addToast('Note saved!', 'success')
  }

  const del = async (id) => {
    setNotes(n => n.filter(x => x.id !== id))
    try { await idbDelete('notes', id) } catch { /* ignore */ }
    addToast('Note deleted', 'info')
  }

  const results = useMemo(() => {
    if (query.length < 3) return []
    return searchNotes(query, notes)
  }, [query, notes])

  return (
    <div className="slide-up">
      <div className="section-header mb-6"><h1>Smart Notes</h1><p>Save and search by meaning</p></div>
      <div className="grid grid-auto mb-6">
        <div className="card">
          <h3 className="mb-4">✍️ Add Note</h3>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Write study material..." rows={4} />
          <button className="btn btn-primary btn-block" style={{ marginTop: 'var(--s3)' }} onClick={save}>Save Note</button>
          <p className="text-xs text-muted" style={{ marginTop: 'var(--s2)' }}>{notes.length} notes saved</p>
        </div>
        <div className="card">
          <h3 className="mb-2">🔍 Semantic Search</h3>
          <p className="text-xs text-muted mb-4">Search by concept</p>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by meaning..." />
          <div style={{ marginTop: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {query.length < 3 && <p className="text-sm text-muted">Type 3+ characters...</p>}
            {query.length >= 3 && results.length === 0 && <p className="text-sm text-muted">No matches found.</p>}
            {results.map((r, i) => <div key={i} className="card" style={{ padding: 'var(--s3)', fontSize: '0.85rem' }}>{r.content.substring(0, 120)}...</div>)}
          </div>
        </div>
      </div>
      {notes.length > 0 && (
        <>
          <h3 className="mb-3">📋 Your Notes ({notes.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            {notes.slice(0, 20).map(n => (
              <div key={n.id} className="card" style={{ padding: 'var(--s4)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{n.content.substring(0, 200)}{n.content.length > 200 ? '...' : ''}</p>
                <button className="btn btn-ghost btn-sm" onClick={() => del(n.id)} style={{ color: 'var(--error)', marginTop: 'var(--s2)' }}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
