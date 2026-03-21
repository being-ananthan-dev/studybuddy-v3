// AI service — uses keyless free public endpoint so no API keys needed
const AI_TIMEOUT_MS = 30_000

/**
 * Ask the AI a question with system instruction.
 * Falls back gracefully on network errors with a user-friendly message.
 */
export async function askGemini(prompt, systemInstruction = '') {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  const combinedPrompt = systemInstruction 
    ? `Instructions: ${systemInstruction}\n\nTask: ${prompt}` 
    : prompt

  // PROXY CHAIN — TRY MULTIPLE FREE PROVIDERS FOR 100% UPTIME
  const proxies = [
    // 1. Pollinations (Usually most reliable)
    async () => {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}?model=openai-large&cache=false`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000)
      })
      if (!res.ok) throw new Error('Pollinations failed')
      return (await res.text()).trim()
    },
    // 2. Secondary Proxy (Pollinations with different model/params)
    async () => {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}?model=mistral&seed=${Math.floor(Math.random()*1000)}`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000)
      })
      if (!res.ok) throw new Error('Mistral fallback failed')
      return (await res.text()).trim()
    }
  ]

  for (const proxy of proxies) {
    try {
      const result = await proxy()
      if (result) {
        clearTimeout(timer)
        return result
      }
    } catch (e) {
      console.warn('AI Proxy step failed, attempting next...', e.message)
    }
  }

  // 3. OFFLINE WISDOM FALLBACK (100% Guaranteed Uptime for Chanakya Guide)
  if (systemInstruction && systemInstruction.includes('Chanakya')) {
    const wisdoms = [
      "Niti: अज्ञानतिमिरान्धस्य ज्ञानाञ्जनाशलाकया। चक्षुरुन्मीलितं येन तस्मै श्रीगुरवे नमः॥\nTranslation: Salutations to the teacher who removes the darkness of ignorance with the light of knowledge.\nMeaning: You are feeling lost because you lack the specific knowledge for this obstacle. Do not despair; seek a mentor, a book, or a new perspective. The problem is not your capability, but your current visibility.\nQuestion: Where can you find the exact piece of knowledge you are missing today?",
      "Niti: उद्योगे नास्ति दारिद्र्यं जपतो नास्ति पातकम्। मौने च कलहो नास्ति नास्ति जागरिते भयम्॥\nTranslation: Through effort there is no poverty; through meditation there is no sin. In silence there is no quarrel; in wakefulness there is no fear.\nMeaning: Your anxiety stems from inaction. When you are deeply engaged in effort (Udyoga), the mind has no time for fear or doubt. The solution to your academic challenge is sheer, focused execution.\nQuestion: What is one small action you can take right now to break this paralysis?",
      "Niti: पुस्तकेषु च या विद्या परहस्तेषु यद्धनम्। उत्पन्नेषु च कार्येषु न सा विद्या न तद्धनम्॥\nTranslation: Knowledge residing in books and wealth residing in others' hands are of no use when the time comes to apply them.\nMeaning: You are relying too much on external notes and tutorials rather than internalizing the concepts. True mastery means the knowledge is in your head, ready to be deployed without looking at a guide.\nQuestion: Are you testing your recall, or merely passively re-reading the material?",
      "Niti: कालः पचति भूतानि कालः संहरते प्रजाः। कालः सुप्तेषु जागर्ति कालो हि दुरतिक्रमः॥\nTranslation: Time consumes all beings, time destroys all creatures. Time is awake when all are asleep; time is truly insurmountable.\nMeaning: You are facing a crisis of procrastination. Time is the only resource you cannot earn back. By delaying your work, you are surrendering your greatest strategic advantage to your competitors.\nQuestion: How many hours have you wasted today that could have been used to secure your future?"
    ]
    clearTimeout(timer)
    return wisdoms[Math.floor(Math.random() * wisdoms.length)]
  }

  // 4. GENERIC STUDENT FALLBACK
  clearTimeout(timer)
  return "The StudyBuddy AI is taking a short breath due to high traffic! 🧘\n\nTake a 2-minute stretch break and try again. Your focus is more important than any AI response. You've got this!"
}

/**
 * Generate a structured study plan for given subjects and timeframe.
 * Returns { days: [{ day, tasks }] }
 */
export const generateStudyPlan = async (subjects, timeframe) => {
  const isHours = /hour/i.test(timeframe)
  const prompt = `Create an optimized study plan.
Subjects: ${subjects}
Duration: ${timeframe}

Rules:
- If duration is in HOURS: return 1 day with hourly slots (e.g. "9:00–10:30: Physics")
- If duration is in DAYS: return one entry per day with specific goals

Return ONLY valid JSON in this exact shape, no markdown, no backticks:
{"days":[{"day":"Day 1","tasks":["Task A","Task B"]}]}`

  const raw = await askGemini(prompt, 'You are a world-class academic planner. Return only valid minified JSON.')
  
  try {
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*[\r\n]+/gm, '')
      .trim()
    
    // Find the JSON object in the response
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found')
    
    return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
  } catch {
    // Sensible fallback based on timeframe
    if (isHours) {
      const hours = parseInt(timeframe) || 3
      const tasks = Array.from({ length: hours }, (_, i) => `${9 + i}:00–${10 + i}:00 → Study: ${subjects}`)
      return { days: [{ day: 'Today', tasks }] }
    }
    const days = parseInt(timeframe) || 3
    return {
      days: Array.from({ length: days }, (_, i) => ({
        day: `Day ${i + 1}`,
        tasks: [`Review ${subjects} — Section ${i + 1}`, 'Practice problems', 'Quick revision notes']
      }))
    }
  }
}
