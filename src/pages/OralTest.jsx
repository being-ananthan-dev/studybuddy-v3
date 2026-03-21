import { useState, useRef } from 'react'
import { startSpeechRecognition, synthesizeSpeech } from '../services/speech.service'
import { askGemini } from '../services/ai.service'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../services/user.service'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OralTest() {
  const [question, setQuestion] = useState('Explain the core process of Photosynthesis.')
  const [topic, setTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [recording, setRecording] = useState(false)
  const [loadingQ, setLoadingQ] = useState(false)
  const recognitionRef = useRef(null)
  const { addToast } = useToast()
  const { user } = useAuth()

  const toggleRecord = () => {
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop(); recognitionRef.current = null; setRecording(false); return
    }
    setTranscript('Listening for audio input...'); setEvaluation(''); setRecording(true)
    recognitionRef.current = startSpeechRecognition(async (text) => {
      setRecording(false); setTranscript(text)
      setTranscript(t => t + '\n\n⏳ Ping dispatched. Evaluating response...')
      try {
        const grade = await askGemini(`Evaluate this oral answer to "${question}": "${text}". Give a score out of 10 and 2-sentence feedback.`, 'You are a strict but encouraging teacher.')
        setEvaluation(grade); setTranscript(text)
        synthesizeSpeech('Voice evaluation complete.')
        if (user?.uid) logActivity(user.uid, 'test').catch(() => {})
      } catch { addToast('Evaluation logic failed', 'error'); setTranscript(text) }
    }, (err) => { addToast(err, 'error'); setRecording(false); setTranscript('Microphone Error.') })
  }

  const newQuestion = async () => {
    setLoadingQ(true)
    try {
      const qPrompt = topic.trim() 
        ? `Give one highly specific study question for an oral test relating to "${topic}". Return ONLY the question string with no markdown.`
        : 'Give one random study question for a general educational oral test. Return ONLY the question string.'
        
      const q = await askGemini(qPrompt, 'Strict academic evaluator.')
      setQuestion(q); setTranscript(''); setEvaluation(''); synthesizeSpeech(q)
    } catch { addToast('Database fetch failed', 'error') }
    finally { setLoadingQ(false) }
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Voice Oral Test</h1>
        <p className="text-muted-foreground text-sm">Speak answers into your microphone and receive instant AI grading</p>
      </div>
      
      <Card className="p-6 mb-6 border-border/50 shadow-sm transition-all">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span>📚</span> Targeted Curriculum</h3>
        <p className="text-xs text-muted-foreground mb-4">Optionally restrict the AI generator to a specific sub-topic domain.</p>
        <div className="flex gap-3">
          <Input 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            placeholder="e.g. Cellular Biology, World War 2, Python Algorithms" 
            className="flex-1"
          />
          <Button onClick={newQuestion} disabled={loadingQ} className="shrink-0 w-32 shadow-sm font-semibold">
             {loadingQ ? 'Routing...' : 'Start Test 🧠'}
          </Button>
        </div>
      </Card>

      <Card className="p-8 mb-6 border-border/50 shadow-sm bg-gradient-to-br from-secondary/10 to-transparent">
        <div className="flex items-start gap-5">
          <div className="text-3xl w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-inner">
            ❓
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-primary mb-2">Current Prompt</p>
            <h3 className="text-lg font-bold leading-relaxed">{question}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6 border-border/50 shadow-sm flex flex-col items-center">
        <Button 
          size="lg" 
          variant={recording ? "destructive" : "default"}
          className={`w-full max-w-sm mb-6 h-14 text-md font-bold transition-all shadow-md ${recording ? 'animate-pulse ring-4 ring-destructive/20 scale-105' : 'hover:scale-105'}`}
          onClick={toggleRecord} 
        >
          {recording ? '🛑 Stop Recording & Grade' : '🎤 Initialize Microphone'}
        </Button>
        <div className="w-full text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Raw Transcript</p>
          <div className="p-5 bg-secondary/10 border border-border/40 rounded-xl min-h-[120px] text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
            {transcript || 'Awaiting hardware audio input stream...'}
          </div>
        </div>
      </Card>

      {evaluation && (
        <Card className="p-6 border-l-4 border-l-emerald-500 shadow-md bg-emerald-500/5 animate-in slide-in-from-bottom-2 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl drop-shadow-sm">📊</span>
            <h3 className="text-lg font-extrabold text-foreground">AI Output Evaluation</h3>
          </div>
          <p className="text-[0.95rem] leading-loose text-foreground/90 font-medium">{evaluation}</p>
        </Card>
      )}
    </div>
  )
}
