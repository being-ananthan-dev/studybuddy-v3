import { useState, useEffect, useMemo } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { searchNotes } from '../services/vector.service'
import { askGemini } from '../services/ai.service'
import { useToast } from '../context/ToastContext'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set PDF.js worker to public CDN to avoid Vite build resolution conflicts
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)

  const { addToast } = useToast()

  useEffect(() => { idbGetAll('notes').then(setNotes).catch(() => {}) }, [])

  const save = async (contentToSave = input) => {
    if (!contentToSave.trim()) return
    const note = { id: Date.now().toString(), content: contentToSave }
    const updated = [note, ...notes] // Prepend new notes
    setNotes(updated)
    if (contentToSave === input) setInput('')
    try { await idbSave('notes', note) } catch { /* ignore */ }
    addToast('Note saved!', 'success')
  }

  const del = async (id) => {
    setNotes(n => n.filter(x => x.id !== id))
    try { await idbDelete('notes', id) } catch { /* ignore */ }
    addToast('Note deleted', 'info')
  }

  const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    // Limit to first 10 pages for speed
    const maxPages = Math.min(pdf.numPages, 10)
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map(item => item.str).join(' ') + '\n'
    }
    return text
  }

  const parseDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsSummarizing(true)
    addToast(`Extracting ${file.name}...`, 'info')

    try {
      let rawText = ''
      if (file.name.endsWith('.pdf')) {
        rawText = await parsePDF(file)
      } else if (file.name.endsWith('.docx')) {
        rawText = await parseDocx(file)
      } else if (file.name.endsWith('.txt')) {
        rawText = await file.text()
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.')
      }

      if (!rawText.trim()) throw new Error('No readable text found in document.')

      addToast('Text extracted. Generating AI summary...', 'info')
      // Slice text to prevent Gemini token limit overloads (approx 20,000 chars)
      const prompt = `Please provide a highly structured, comprehensive summary of the following embedded document text. Use bullet points and capture all key educational concepts.\n\nDOCUMENT TEXT:\n${rawText.substring(0, 20000)}`
      
      const summary = await askGemini(prompt, 'You are an elite academic summarizer.')
      
      const finalNote = `📚 Summary of ${file.name}\n\n${summary}`
      await save(finalNote)
      addToast('Summarization complete!', 'success')

    } catch (err) {
      console.error(err)
      addToast(err.message || 'Failed to parse document.', 'error')
    } finally {
      setIsSummarizing(false)
      e.target.value = null // reset input
    }
  }

  const results = useMemo(() => {
    if (query.length < 3) return []
    return searchNotes(query, notes)
  }, [query, notes])

  return (
    <div className="slide-up">
      <div className="section-header mb-6"><h1>Smart Notes</h1><p>Save concepts and auto-summarize study documents</p></div>
      <div className="grid grid-auto mb-6">
        <div className="card">
          <h3 className="mb-4">✍️ Create Material</h3>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Write study material..." rows={4} style={{ marginBottom: 'var(--s3)' }} />
          <button className="btn btn-primary btn-block mb-4" onClick={() => save()}>Save Note</button>
          
          <div style={{ padding: 'var(--s3)', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--s2)' }}>📄 AI Document Summarizer</h4>
            <p className="text-xs text-muted mb-3">Upload a PDF, DOCX, or TXT to automatically generate a study note summary.</p>
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              onChange={handleFileUpload}
              disabled={isSummarizing}
              style={{ fontSize: '0.8rem', width: '100%' }}
            />
            {isSummarizing && <p className="text-sm mt-3" style={{ color: 'var(--primary)', fontWeight: 600 }}>⏳ Reading document and generating summary...</p>}
          </div>

          <p className="text-xs text-muted" style={{ marginTop: 'var(--s3)' }}>{notes.length} notes safely stored offline</p>
        </div>
        <div className="card">
          <h3 className="mb-2">🔍 Semantic Search</h3>
          <p className="text-xs text-muted mb-4">Search your entire notebook conceptually</p>
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
          <h3 className="mb-3">📋 Your Notebook</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            {notes.map(n => (
              <div key={n.id} className="card" style={{ padding: 'var(--s4)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-1)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{n.content}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--s3)' }}>
                   <button className="btn btn-ghost btn-sm" onClick={() => del(n.id)} style={{ color: 'var(--error)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
