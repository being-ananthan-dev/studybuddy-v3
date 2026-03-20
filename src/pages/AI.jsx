import { useState, useRef } from 'react'
import { askGemini } from '../services/ai.service'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function AI() {
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
    } catch {
      setMessages(m => [...m, { role: 'ai', text: "Sorry, I couldn't reach the AI." }])
    } finally {
      setLoading(false)
      setTimeout(() => { histRef.current?.scrollTo(0, histRef.current.scrollHeight) }, 50)
    }
  }

  return (
    <div className="slide-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="section-header">
        <h1>AI Tutor</h1>
        <p>Ask anything and get instant AI answers</p>
      </div>
      <div className="card chat-box" style={{ padding: 0 }}>
        <div className="chat-history" ref={histRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg chat-${m.role} fade-in markdown-body`}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {m.text}
              </ReactMarkdown>
            </div>
          ))}
          {loading && <div className="chat-msg chat-ai"><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div></div>}
        </div>
        <form className="chat-input-bar" onSubmit={send}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." />
          <button className="btn btn-primary" type="submit" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  )
}
