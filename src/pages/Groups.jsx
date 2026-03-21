import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendMessage, subscribeToMessages } from '../services/chat.service'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Groups() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToMessages('global', setMessages)
    return () => unsubscribe()
  }, [])

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
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-5rem)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Study Groups</h1>
        <p className="text-muted-foreground text-sm">Chat live with global students across platforms</p>
      </div>

      <Card className="flex flex-col flex-1 overflow-hidden border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-secondary/10 flex items-center gap-3 shrink-0">
          <span className="text-2xl drop-shadow-sm">💬</span>
          <h3 className="font-bold text-foreground">Global Study Hub</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            Global Stream Actively Online
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background/50">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground p-8 italic font-medium">No messages in global stream yet. Be the first to say hi!</p>
          )}

          {messages.map(m => {
            const isMe = m.uid === user.uid
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 items-end mb-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <img 
                    src={m.photoURL || `https://ui-avatars.com/api/?name=${m.displayName}&background=0D8ABC&color=fff`} 
                    alt={m.displayName} 
                    className="w-8 h-8 rounded-full shrink-0 shadow-sm border border-border/50" 
                  />
                )}
                
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-1 ml-1">{m.displayName}</span>}
                  
                  <div className={`
                    px-4 py-2 text-[0.95rem] shadow-sm font-medium leading-relaxed break-words whitespace-pre-wrap
                    ${isMe 
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' 
                      : 'bg-secondary/30 text-foreground border border-border/50 rounded-2xl rounded-bl-sm'
                    }
                  `}>
                    {m.text}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>
        
        <form onSubmit={send} className="p-4 bg-background border-t border-border/50 flex items-center gap-3 shrink-0">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Discuss study topics with the world..." 
            className="flex-1 rounded-full px-5 bg-secondary/10 border-transparent focus-visible:ring-primary focus-visible:border-primary shadow-inner"
          />
          <Button type="submit" disabled={!input.trim()} className="rounded-full px-6 font-bold shadow-md hover:scale-105 transition-transform active:scale-95">
            Send
          </Button>
        </form>
      </Card>
    </div>
  )
}
