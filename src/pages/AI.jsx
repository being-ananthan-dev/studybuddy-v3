import { useState, useRef } from 'react'
import { askGemini } from '../services/ai.service'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AI() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your AI tutor. Ask me anything — math, science, history, essays. How can I help? 🎓" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const histRef = useRef(null)

  const send = async (e) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const res = await askGemini(q, "You are a helpful educational AI tutor. Be concise and encouraging.")
      setMessages(m => [...m, { role: 'ai', text: res }])
      if (user?.uid) logActivity(user.uid, 'session', 2).catch(() => {})
    } catch {
      setMessages(m => [...m, { role: 'ai', text: "Sorry, I couldn't reach the AI." }])
    } finally {
      setLoading(false)
      setTimeout(() => { histRef.current?.scrollTo(0, histRef.current.scrollHeight) }, 50)
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 mx-auto max-w-4xl h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">AI Tutor</h1>
        <p className="text-muted-foreground text-sm">Ask anything and get instant formatted AI answers</p>
      </div>

      <Card className="flex flex-col flex-1 overflow-hidden border-border/50 shadow-sm relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 font-sans" ref={histRef}>
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-xl max-w-[90%] text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words markdown-body ${
                m.role === 'user' 
                  ? 'bg-primary text-primary-foreground self-end rounded-br-sm shadow-md font-medium' 
                  : 'bg-secondary/15 border border-border/50 self-start rounded-bl-sm text-foreground'
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {m.text}
              </ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-xl max-w-[85%] bg-secondary/15 border border-border/50 self-start rounded-bl-sm flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <form className="p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 flex gap-3" onSubmit={send}>
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask a question..." 
            className="flex-1 bg-surface" 
          />
          <Button type="submit" disabled={loading} className="px-6 shrink-0 shadow-md transition-all hover:scale-105 active:scale-95">
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
