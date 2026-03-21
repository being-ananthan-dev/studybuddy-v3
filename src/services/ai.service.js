// AI service — uses keyless free public endpoint so no API keys needed
const AI_TIMEOUT_MS = 30_000

/**
 * Ask the AI a question with system instruction.
 * Falls back gracefully on network errors with a user-friendly message.
 */
export async function askGemini(prompt, systemInstruction = '') {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout for single requests

  // Merge system instruction into prompt for maximum compatibility with free proxies
  const fullMessage = systemInstruction 
    ? `System Instructions:\n${systemInstruction}\n\nUser Question:\n${prompt}` 
    : prompt

  // PROXY CHAIN — TRY ROBUST METHODS
  const proxies = [
    // 1. Pollinations (GET - Best CORS compatibility)
    async () => {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullMessage.slice(0, 1200))}?model=openai&cache=false&seed=${Date.now()}`, {
        method: 'GET',
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Pollinations GET failed')
      return (await res.text()).trim()
    },
    // 2. OllamaFreeAPI (New Alternative to Airforce)
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
    // 3. Hercai — Reliable Backup Proxy (GET)
    async () => {
      const res = await fetch(`https://api.hercai.onrender.com/v3/hercai?question=${encodeURIComponent(fullMessage.slice(0, 1500))}`, {
        method: 'GET',
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Hercai failed')
      const json = await res.json()
      return json.reply || json.content || ''
    },
    // 4. Pollinations (POST)
    async () => {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullMessage.slice(0, 4000) }],
          model: 'mistral'
        }),
        signal: controller.signal
      })
      if (!res.ok) throw new Error('Pollinations POST failed')
      return (await res.text()).trim()
    }
  ]

  for (const proxy of proxies) {
    try {
      const result = await proxy()
      // Basic check for error strings in successful responses
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

  // 3. OFFLINE WISDOM FALLBACK (100% Guaranteed Uptime for Chanakya Guide)
  if (systemInstruction && systemInstruction.includes('Chanakya')) {
    const wisdoms = [
      "Niti: अज्ञानतिमिरान्धस्य ज्ञानाञ्जनाशलाकया। चक्षुरुन्मीलितं येन तस्मै श्रीगुरवे नमः॥\nTranslation: Salutations to the teacher who removes the darkness of ignorance with the light of knowledge.\nMeaning: You are feeling lost because you lack specific knowledge. Seek a new perspective—the problem is your visibility, not your capability.\nQuestion: What one fact or concept do you need to master today?",
      "Niti: उद्योगे नास्ति दारिद्र्यं जपतो नास्ति पातकम्।\nTranslation: Through effort there is no poverty.\nMeaning: Action is the antidote to fear. Engage deeply in your task, and your anxiety will dissolve.\nQuestion: What is one small step you can take right now?",
      "Niti: कालः सुप्तेषु जागर्ति कालो हि दुरतिक्रमः॥\nTranslation: Time is insurmountable.\nMeaning: You are surrendering your greatest advantage: Time. Stop delaying.\nQuestion: How will you use the next 60 minutes to change your future?",
      "Niti: पुस्तकेषु च या विद्या परहस्तेषु यद्धनम्।\nTranslation: Knowledge in books is of no use until internalized.\nMeaning: Stop re-reading. Start testing your recall. Mastery is in the mind, not the paper.\nQuestion: Can you explain this concept to a child right now?"
    ]
    return wisdoms[Math.floor(Math.random() * wisdoms.length)]
  }

  // 4. GENERIC STUDENT FALLBACK
  return "The StudyBuddy AI server is taking a deep breath! 🧘\n\nTake a quick stretch break and try again. Remember: Your own determination is more powerful than any AI. You've got this!"
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
    
    // Find the JSON object in the response
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
        const sub = subList[i % subList.length]
        tasks.push(`${9+i}:00–${10+i}:00 → Deep Focus: ${sub}`)
        if (i%2 === 0) tasks.push(`Short Break: 10 mins`)
      }
      tasks.push('Final Review')
      plan.days.push({ day: 'Intensive Session', tasks })
    } else {
      const totalDays = Math.min(parseInt(timeframe) || 7, 30)
      for (let i = 0; i < totalDays; i++) {
        const sub = subList[i % subList.length]
        plan.days.push({
          day: `Day ${i + 1}`,
          tasks: [
            `Study ${sub} — Mastery Phase ${i + 1}`,
            `Practice Exam Problems for ${sub}`,
            'Active Recall Session',
            'Evening Prep'
          ]
        })
      }
    }
    return plan
  }
}
