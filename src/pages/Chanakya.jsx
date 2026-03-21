import { useState, useRef, useEffect } from 'react'
import { askGemini } from '../services/ai.service'
import { logActivity } from '../services/user.service'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

const SYSTEM_PROMPT = `You are Acharya Chanakya, the ancient Indian polymath, master strategist, philosopher, economist, and royal advisor. 
You offer profound, strategic wisdom to students facing academic, motivational, focus, or life challenges.

When the user presents a problem or dilemma, you MUST reply EXACTLY in this format using Markdown:
### 🪔 Chanakya Niti
Quote a relevant, famous Sanskrit shloka/slogan (in Devanagari script) followed by its short English transliteration.

### 📜 The Meaning
Explain the deep meaning of the Niti. Then, apply it directly to the student's modern-day problem. Provide strategic, actionable, and harsh-yet-necessary advice.

### ❓ The Question
End with a single, profound Socratic question that forces the student to reflect, look inward, and find the solution themselves.

Do not break character. Be wise, authoritative, strategic, and deeply observant. Speak eloquently.`

export default function Chanakya() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chanakya_chat')
    if (saved) {
      try { return JSON.parse(saved) } catch { return [] }
    }
    return [{
      role: 'assistant',
      content: '### 🪔 Namaskaram\nI am Acharya Chanakya. Speak your dilemma, O student. Whether it is a lack of focus, fear of failure, or a clouded mind, true wisdom holds the answer.'
    }]
  })
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  
  const { user } = useAuth()
  const { addToast } = useToast()

  // Save chat to local storage
  useEffect(() => {
    localStorage.setItem('chanakya_chat', JSON.stringify(messages))
  }, [messages])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Pass the entire conversation history as context to the AI
      const prompt = newMessages
        .map(m => `${m.role === 'user' ? 'Student' : 'Chanakya'}: ${m.content}`)
        .join('\n\n') + '\n\nChanakya:'

      const response = await askGemini(prompt, SYSTEM_PROMPT)
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      
      if (user?.uid) logActivity(user.uid, 'chanakya_consult').catch(() => {})
    } catch (err) {
      addToast(err.message || 'Failed to seek guidance. Try again.', 'error')
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ The winds of time interfere. My wisdom cannot reach you right now. Please seek guidance again shortly.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    if (window.confirm('Clear the wisdom logs and start over?')) {
      setMessages([{
        role: 'assistant',
        content: '### 🪔 Namaskaram\nI am Acharya Chanakya. Speak your dilemma, O student. Whether it is a lack of focus, fear of failure, or a clouded mind, true wisdom holds the answer.'
      }])
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-[calc(100dvh-120px)] flex flex-col pb-6">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-orange-600 dark:text-orange-500">The Chanakya Guide</h1>
          <p className="text-muted-foreground text-sm font-medium">Ancient wisdom for modern study dilemmas</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="text-xs font-semibold shadow-sm">
          Clear Logs
        </Button>
      </div>

      <Card className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20 text-foreground rounded-tl-sm'
                }`}
              >
                {m.role === 'assistant' && i !== 0 && (
                  <div className="text-xl mb-2 opacity-80">🪔</div>
                )}
                <div className={`prose prose-sm dark:prose-invert max-w-none ${m.role === 'user' ? 'text-primary-foreground' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 shadow-sm rounded-tl-sm flex items-center gap-3">
                <span className="text-lg animate-pulse">🪔</span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-500 animate-pulse">Chanakya is pondering...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/50 border-t border-border/50 backdrop-blur-md">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="e.g., I have an exam tomorrow but I feel too unmotivated to study..."
              className="resize-none pr-24 py-3 bg-background border-border/60 shadow-inner focus-visible:ring-orange-500/50"
              rows={2}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="absolute bottom-2 right-2 font-bold shadow-md bg-orange-600 hover:bg-orange-700 text-white"
            >
              Seek Wisdom
            </Button>
          </div>
          <p className="text-[0.65rem] text-center text-muted-foreground mt-2 font-medium">
            Press <kbd className="px-1 py-0.5 bg-secondary rounded border border-border/50">Enter</kbd> to send. Uses the BYOK or Free AI endpoint.
          </p>
        </div>
      </Card>
    </div>
  )
}
