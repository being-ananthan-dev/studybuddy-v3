import { useState, useRef, useEffect } from 'react'

export default function Groups() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the Global Study Room! 👋', isMe: false }
  ])
  const [input, setInput] = useState('')
  const chatRef = useRef(null)
  const replyTimerRef = useRef(null)

  // Cleanup pending reply timers on unmount
  useEffect(() => () => clearTimeout(replyTimerRef.current), [])

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { id: Date.now(), user: 'You', text, isMe: true }])
    setInput('')
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 50)
    // Simulate reply — store timeout so it can be cancelled on unmount
    replyTimerRef.current = setTimeout(() => {
      setMessages(m => [...m, { id: Date.now()+1, user: 'StudyBot', text: `Nice! Keep sharing ideas 📚`, isMe: false }])
    }, 1500)
  }

  return (
    <div className="slide-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="section-header"><h1>Study Groups</h1><p>Chat with fellow students</p></div>
      <div className="card chat-box" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <h3 style={{ fontSize: '0.9rem' }}>Global Study Room</h3>
          <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>Live</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span>
        </div>
        <div className="chat-history" ref={chatRef}>
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.isMe ? 'chat-user' : 'chat-ai'} fade-in`}>
              <div className="text-xs" style={{ opacity: 0.7, marginBottom: 2 }}>{m.user}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <form className="chat-input-bar" onSubmit={send}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Say hi!" />
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}
