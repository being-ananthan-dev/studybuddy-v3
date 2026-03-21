// AI service — uses keyless free public endpoint so no API keys needed
const AI_TIMEOUT_MS = 30_000

/**
 * Ask the AI a question with system instruction.
 * Falls back gracefully on network errors with a user-friendly message.
 */
export async function askGemini(prompt, systemInstruction = '') {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout per attempt

  const fullMessage = systemInstruction 
    ? `System Instructions:\n${systemInstruction}\n\nUser Question:\n${prompt}` 
    : prompt

  // PROXY CHAIN — TRY ROBUST METHODS
  const proxies = [
    // 1. Vercel Serverless Proxy (Ultimate CORS Bypass for Production)
    async () => {
      // Relative path works correctly on the hosted Vercel domain
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Vercel API Proxy failed')
      return await res.text()
    },
    // 2. Pollinations (GET - Client-side fallback)
    async () => {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullMessage.slice(0, 1200))}?model=openai&cache=false&seed=${Date.now()}`, {
        method: 'GET',
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Pollinations GET failed')
      return (await res.text()).trim()
    },
    // 3. OllamaFreeAPI (Client-side fallback)
    async () => {
      const res = await fetch('https://ollama.fynal.net/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:latest',
          messages: [{ role: 'user', content: fullMessage.slice(0, 3000) }],
          stream: false
        }),
        signal: controller.signal
      })
      if (!res.ok) throw new Error('OllamaFreeAPI failed')
      const json = await res.json()
      return json.choices[0].message.content || ''
    },
    // 4. Hercai (GET - Client-side fallback)
    async () => {
      const res = await fetch(`https://api.hercai.onrender.com/v3/hercai?question=${encodeURIComponent(fullMessage.slice(0, 1500))}`, {
        method: 'GET',
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Hercai failed')
      const json = await res.json()
      return json.reply || json.content || ''
    }
  ]

  for (const proxy of proxies) {
    try {
      const result = await proxy()
      if (result && 
          !result.toLowerCase().includes('service unavailable') && 
          !result.toLowerCase().includes('internal server error') && 
          !result.toLowerCase().includes('server down') &&
          result.length > 5) {
        clearTimeout(timeoutId)
        return result
      }
    } catch (e) {
      console.warn('AI Proxy attempt failed:', e.message)
    }
  }

  clearTimeout(timeoutId)

  // 3. OFFLINE WISDOM FALLBACK (Chanakya)
  if (systemInstruction && systemInstruction.includes('Chanakya')) {
    const wisdoms = [
      "Niti: अज्ञानतिमिरान्धस्य ज्ञानाञ्जनाशलाकया।\nTranslation: Salutations to the teacher who removes ignorance.\nMeaning: Seek knowledge—the problem is your visibility, not your capability.",
      "Niti: उद्योगे नास्ति दारिद्र्यं।\nTranslation: Through effort there is no poverty.\nMeaning: Action is the antidote to fear.",
      "Niti: कालः सुप्तेषु जागर्ति।\nTranslation: Time is insurmountable.\nMeaning: Work now, for time never returns.",
      "Niti: पुस्तकेषु च या विद्या।\nTranslation: Knowledge in books is of no use until internalized.\nMeaning: Practice active recall."
    ]
    return wisdoms[Math.floor(Math.random() * wisdoms.length)]
  }

  return "The StudyBuddy AI server is taking a deep breath! 🧘\n\nTake a quick stretch break and try again. Yourown determination is more powerful than any AI. You've got this!"
}

/**
 * Generate a structured study plan for given subjects and timeframe.
 */
export const generateStudyPlan = async (subjects, timeframe) => {
  const isHours = /hour/i.test(timeframe)
  const isDays = /day/i.test(timeframe)
  
  const prompt = `Create an optimized study plan for ${subjects} over ${timeframe}. 
Return ONLY valid JSON: {"days":[{"day":"Day 1","tasks":["Task A"]}]}`

  let raw = ''
  try {
    raw = await askGemini(prompt, 'You are an academic planner. Return only valid minified JSON.')
    
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*[\r\n]+/gm, '')
      .trim()
    
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
    }
    throw new Error('No JSON found')
  } catch {
    // SMART-MOCK FALLBACK
    const subList = subjects.split(',').map(s => s.trim())
    const plan = { days: [] }
    if (isHours || (!isDays && parseInt(timeframe) < 12)) {
      const hours = Math.min(parseInt(timeframe) || 4, 12)
      const tasks = []
      for (let i = 0; i < hours; i++) {
        tasks.push(`${9+i}:00–${10+i}:00 → Deep Focus: ${subList[i % subList.length]}`)
      }
      plan.days.push({ day: 'Intensive Session', tasks })
    } else {
      const totalDays = Math.min(parseInt(timeframe) || 7, 30)
      for (let i = 0; i < totalDays; i++) {
        plan.days.push({
          day: `Day ${i + 1}`,
          tasks: [`Mastery: ${subList[i % subList.length]}`, 'Active Recall', 'Practice Exam']
        })
      }
    }
    return plan
  }
}
