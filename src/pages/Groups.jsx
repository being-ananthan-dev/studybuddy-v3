import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendMessage, subscribeToMessages } from '../services/chat.service'

export default function Groups() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  // Subscribe to real-time chat
  useEffect(() => {
    const unsubscribe = subscribeToMessages('global', setMessages)
    return () => unsubscribe()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !user) return
    
    setInput('')
    try {
      await sendMessage('global', user, text)
    } catch (err) {
      console.error("Failed to send message", err)
      // Offline writes will automatically buffer in Firebase until reconnected
    }
  }

  return (
    <div className="slide-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="section-header">
        <h1>Study Groups</h1>
        <p>Chat live with fellow active students</p>
      </div>
      <div className="card chat-box" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--s4)', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <h3 style={{ fontSize: '0.9rem' }}>Global Study Room</h3>
          <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>Live</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
        </div>
        
        <div className="chat-history" style={{ padding: 'var(--s4)' }}>
          {messages.length === 0 && (
            <p className="text-center text-muted" style={{ padding: 'var(--s4)' }}>No messages yet. Be the first to say hi!</p>
          )}
          {messages.map(m => {
            const isMe = m.uid === user.uid
            
            return (
              <div key={m.id} className={`chat-msg ${isMe ? 'chat-user' : 'chat-ai'} fade-in`} style={{ display: 'flex', gap: 'var(--s2)', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 'var(--s3)' }}>
                {!isMe && (
                  <img src={m.photoURL || `https://ui-avatars.com/api/?name=${m.displayName}&background=0D8ABC&color=fff`} alt={m.displayName} style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && <span className="text-xs" style={{ opacity: 0.6, marginBottom: 4, marginLeft: 2 }}>{m.displayName}</span>}
                  <div style={{ 
                    background: isMe ? 'var(--primary)' : 'var(--surface-hover)', 
                    color: isMe ? '#fff' : 'var(--text)',
                    padding: '8px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    {m.text}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>
        
        <form className="chat-input-bar" onSubmit={send} style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Discuss study topics here..." 
            style={{ borderRadius: 20, padding: '10px 16px' }}
          />
          <button className="btn btn-primary" type="submit" disabled={!input.trim()} style={{ borderRadius: 20 }}>Send</button>
        </form>
      </div>
    </div>
  )
}
