import { useState, useEffect, useMemo, useCallback } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { searchNotes } from '../services/vector.service'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const { addToast } = useToast()
  const { user } = useAuth()

  // Load notes from IndexedDB on mount
  useEffect(() => {
    idbGetAll('notes')
      .then(allNotes => {
        // Sort newest first by ID (timestamp-based)
        const sorted = (allNotes || []).sort((a, b) => Number(b.id) - Number(a.id))
        setNotes(sorted)
      })
      .catch(() => setNotes([]))
  }, [])

  // Save a new note
  const saveNote = useCallback(async () => {
    const text = input.trim()
    if (!text) {
      addToast('Please write something before saving.', 'error')
      return
    }

    const note = {
      id: Date.now().toString(),
      content: text,
      createdAt: new Date().toISOString(),
    }

    setNotes(prev => [note, ...prev])
    setInput('')

    try {
      await idbSave('notes', note)
    } catch (err) {
      console.error('Failed to save to IndexedDB:', err)
      addToast('Failed to save note locally.', 'error')
      return
    }

    addToast('Note saved! ✅', 'success')
    if (user?.uid) logActivity(user.uid, 'note').catch(() => {})
  }, [input, addToast, user])

  // Delete a note
  const deleteNote = useCallback(async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditText('')
    }
    try {
      await idbDelete('notes', id)
    } catch (err) {
      console.error('Failed to delete from IndexedDB:', err)
    }
    addToast('Note deleted', 'info')
  }, [editingId, addToast])

  // Start editing a note
  const startEdit = useCallback((note) => {
    setEditingId(note.id)
    setEditText(note.content)
  }, [])

  // Save edited note
  const saveEdit = useCallback(async () => {
    if (!editText.trim()) {
      addToast('Note cannot be empty.', 'error')
      return
    }

    const updatedNote = {
      id: editingId,
      content: editText.trim(),
      createdAt: notes.find(n => n.id === editingId)?.createdAt || new Date().toISOString(),
      editedAt: new Date().toISOString(),
    }

    setNotes(prev => prev.map(n => n.id === editingId ? updatedNote : n))
    setEditingId(null)
    setEditText('')

    try {
      await idbSave('notes', updatedNote)
    } catch (err) {
      console.error('Failed to save edit:', err)
    }
    addToast('Note updated! ✏️', 'success')
  }, [editingId, editText, notes, addToast])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  // Search results
  const results = useMemo(() => {
    if (query.length < 2) return []
    try {
      return searchNotes(query, notes)
    } catch {
      return []
    }
  }, [query, notes])

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Smart Notes</h1>
        <p className="text-muted-foreground text-sm">Organize your thoughts and study material</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 items-start">

        {/* Left Panel — Create Note */}
        <Card className="lg:col-span-3 p-5 sm:p-6 border-border/50 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-bold flex items-center gap-2 mb-1">✍️ Write Note</h3>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Write your study notes, formulas, concepts..."
            rows={6}
            className="resize-y bg-background/50 border-border/60 transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="flex gap-3">
            <Button onClick={saveNote} className="flex-1" disabled={!input.trim()}>
              Save Note
            </Button>
            {input.trim() && (
              <Button variant="outline" onClick={() => setInput('')}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Right Panel — Search */}
        <Card className="lg:col-span-2 p-5 sm:p-6 border-border/50 bg-card shadow-sm lg:sticky top-20">
          <h3 className="text-base font-bold flex items-center gap-2 mb-3">🔍 Search Notes</h3>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your notes..."
            className="bg-background/50 border-border/60"
          />
          <div className="mt-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
            {query.length < 2 && (
              <p className="text-xs text-muted-foreground text-center py-4 italic">Type 2+ characters to search</p>
            )}
            {query.length >= 2 && results.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No matches found.</p>
            )}
            {results.map((r, i) => (
              <Card key={i} className="p-3 text-xs leading-relaxed border-border/40 bg-background hover:border-primary/40 transition-colors cursor-pointer" onClick={() => {
                setInput(r.content)
                setQuery('')
              }}>
                <p className="line-clamp-3">{r.content}</p>
                {r.score > 0.1 && (
                  <Badge variant="secondary" className="mt-2 text-[0.6rem] px-1.5 py-0">
                    {Math.round(r.score * 100)}% match
                  </Badge>
                )}
              </Card>
            ))}
          </div>

          {notes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{notes.length}</span> notes saved locally
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2 border-border/50 bg-secondary/5">
          <p className="text-3xl mb-3">📝</p>
          <p className="font-semibold text-muted-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Write your first study note above to get started</p>
        </Card>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold tracking-tight">Your Notes</h2>
            <Badge variant="secondary" className="text-xs font-semibold">{notes.length}</Badge>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="flex flex-col gap-4">
            {notes.map(note => (
              <Card key={note.id} className="p-4 sm:p-5 border-border/50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                {/* Left accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                {editingId === note.id ? (
                  /* Edit mode */
                  <div className="flex flex-col gap-3">
                    <Textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={5}
                      className="resize-y bg-background/50 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={saveEdit}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pr-2">
                      {note.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                        {note.createdAt && (
                          <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        )}
                        {note.editedAt && <span className="italic">• edited</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(note)}
                          className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(note.content)
                            addToast('Copied to clipboard!', 'success')
                          }}
                          className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
                        >
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
