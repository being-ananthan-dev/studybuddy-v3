import { useState, useRef } from 'react'
import { startSpeechRecognition, synthesizeSpeech } from '../services/speech.service'
import { askGemini } from '../services/ai.service'
import { useToast } from '../context/ToastContext'

export default function OralTest() {
  const [question, setQuestion] = useState('Explain the process of Photosynthesis.')
  const [topic, setTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [recording, setRecording] = useState(false)
  const [loadingQ, setLoadingQ] = useState(false)
  const recognitionRef = useRef(null)
  const { addToast } = useToast()

  const toggleRecord = () => {
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop(); recognitionRef.current = null; setRecording(false); return
    }
    setTranscript('Listening...'); setEvaluation(''); setRecording(true)
    recognitionRef.current = startSpeechRecognition(async (text) => {
      setRecording(false); setTranscript(text)
      setTranscript(t => t + '\n\n⏳ Evaluating...')
      try {
        const grade = await askGemini(`Evaluate this oral answer to "${question}": "${text}". Give a score out of 10 and 2-sentence feedback.`, 'You are a strict but encouraging teacher.')
        setEvaluation(grade); setTranscript(text)
        synthesizeSpeech('Evaluation complete.')
      } catch { addToast('Evaluation failed', 'error'); setTranscript(text) }
    }, (err) => { addToast(err, 'error'); setRecording(false); setTranscript('Error.') })
  }

  const newQuestion = async () => {
    setLoadingQ(true)
    try {
      const qPrompt = topic.trim() 
        ? `Give one highly specific study question for an oral test relating to "${topic}". Return ONLY the question string with no markdown.`
        : 'Give one random study question for a general educational oral test. Return ONLY the question string.'
        
      const q = await askGemini(qPrompt, 'Strict teacher.')
      setQuestion(q); setTranscript(''); setEvaluation(''); synthesizeSpeech(q)
    } catch { addToast('Failed', 'error') }
    finally { setLoadingQ(false) }
  }

  return (
    <div className="slide-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="section-header mb-6"><h1>Voice Oral Test</h1><p>Speak answers, get AI evaluation</p></div>
      
      <div className="card mb-4" style={{ padding: 'var(--s6)' }}>
        <h3 className="mb-3">📚 Targeted Practice</h3>
        <p className="text-xs text-muted mb-3">Optionally enter a specific topic you want to be tested on.</p>
        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
          <input 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            placeholder="e.g. Mitochondria, WW2, Python..." 
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button className="btn btn-primary" onClick={newQuestion} disabled={loadingQ} style={{ flexShrink: 0 }}>
             {loadingQ ? 'Generating...' : 'Start Test 🧠'}
          </button>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: 'var(--s6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
          <div style={{ fontSize: '1.4rem', width: 44, height: 44, borderRadius: 12, background: 'var(--primary-ultra-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>❓</div>
          <div><p className="text-xs text-muted mb-2">Current Question</p><h3 style={{ fontSize: '1rem', lineHeight: 1.5 }}>{question}</h3></div>
        </div>
      </div>
      <div className="card mb-4" style={{ padding: 'var(--s6)' }}>
        <button className={`btn ${recording ? 'btn-outline' : 'btn-primary'} btn-lg btn-block mb-4`} onClick={toggleRecord} style={recording ? { borderColor: 'var(--error)', color: 'var(--error)', animation: 'recording 1.5s infinite' } : {}}>
          {recording ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>
        <p className="text-xs text-muted mb-3">Your Answer</p>
        <div style={{ padding: 'var(--s4)', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', minHeight: 80, color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {transcript || 'Tap the button and speak...'}
        </div>
      </div>
      {evaluation && (
        <div className="card fade-in" style={{ padding: 'var(--s6)', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 'var(--s3)' }}><span style={{ fontSize: '1.3rem' }}>📊</span><h3 style={{ fontSize: '1rem' }}>AI Evaluation</h3></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{evaluation}</p>
        </div>
      )}
    </div>
  )
}
