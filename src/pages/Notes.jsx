import { useState, useEffect, useMemo } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { searchNotes } from '../services/vector.service'
import { askGemini } from '../services/ai.service'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

// Set PDF.js worker to public CDN to avoid Vite build resolution conflicts
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)

  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => { idbGetAll('notes').then(setNotes).catch(() => {}) }, [])

  const save = async (contentToSave = input) => {
    if (!contentToSave.trim()) return
    const note = { id: Date.now().toString(), content: contentToSave }
    const updated = [note, ...notes]
    setNotes(updated)
    if (contentToSave === input) setInput('')
    try { await idbSave('notes', note) } catch { /* ignore */ }
    addToast('Note saved!', 'success')
    if (user?.uid) logActivity(user.uid, 'note').catch(() => {})
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
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Smart Notes</h1>
        <p className="text-muted-foreground text-sm">Save concepts and auto-summarize study documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-start">
        
        {/* Editor Panel */}
        <Card className="p-6 border-border/50 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><span>✍️</span> Create Material</h3>
          <Textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Write explicit study material here..." 
            rows={5} 
            className="resize-y"
          />
          <Button onClick={() => save()} className="w-full">Save Note</Button>
          
          <div className="p-5 mt-2 bg-secondary/10 border border-border/60 border-dashed rounded-xl flex flex-col gap-3 transition-colors hover:border-primary/50">
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">📄 AI Document Summarizer</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Upload a PDF, DOCX, or TXT. The AI will extract the contents and append a bullet point summary as a new note automatically.
              </p>
            </div>
            
            <div className="relative">
              <Input 
                type="file" 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileUpload}
                disabled={isSummarizing}
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/20 text-sm h-12 pt-1.5"
              />
            </div>
            
            {isSummarizing && (
              <p className="text-xs text-primary font-bold flex items-center gap-2 animate-pulse mt-2">
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                Generating summary...
              </p>
            )}
          </div>
        </Card>

        {/* Search Panel */}
        <Card className="p-6 border-border/50 bg-secondary/5 shadow-sm md:sticky top-20">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><span>🔍</span> Semantic Search</h3>
          <p className="text-xs text-muted-foreground mb-4">Search your entire notebook conceptually, not just by keywords.</p>
          <Input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search by meaning..." 
            className="bg-background"
          />
          <div className="mt-6 flex flex-col gap-3">
            {query.length < 3 && <p className="text-sm text-muted-foreground italic text-center py-4">Type 3+ characters to search...</p>}
            {query.length >= 3 && results.length === 0 && <p className="text-sm text-destructive font-medium text-center py-4">No conceptual matches found.</p>}
            {results.map((r, i) => (
              <Card key={i} className="p-4 text-sm leading-relaxed border-border/40 shadow-sm bg-background hover:border-primary/40 transition-colors">
                {r.content.substring(0, 150)}...
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {notes.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold tracking-tight">📋 Your Notebook</h3>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">{notes.length} Notes</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {notes.map(n => (
              <Card key={n.id} className="p-6 md:p-8 border-border/50 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[0.95rem] text-foreground whitespace-pre-wrap leading-loose">{n.content}</p>
                <div className="flex justify-end mt-6 pt-4 border-t border-border/30">
                   <Button variant="ghost" size="sm" onClick={() => del(n.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                     Delete Note
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
