// AI service — uses keyless free public endpoint so no API keys needed
const AI_TIMEOUT_MS = 30_000

/**
 * Ask the AI a question with system instruction.
 * Falls back gracefully on network errors with a user-friendly message.
 */
export async function askGemini(prompt, systemInstruction = '') {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const apiKey = localStorage.getItem('gemini_api_key')
    
    // 1. IF USER PROVIDED THEIR OWN KEY — USE OFFICIAL GEMINI API (100% RELIABLE)
    if (apiKey) {
      const fullPrompt = systemInstruction ? `System Instructions:\n${systemInstruction}\n\nUser Request:\n${prompt}` : prompt
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
        signal: controller.signal
      })
      
      if (!res.ok) {
        if (res.status === 400 || res.status === 403) throw new Error('Invalid Gemini API Key or API not enabled on your Google Cloud project.')
        throw new Error(`Gemini API responded with ${res.status}`)
      }
      
      const json = await res.json()
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text
      return text?.trim() || 'No response received.'
    }

    // 2. FALLBACK — FREE PUBLIC ENDPOINT (OFTEN OVERLOADED)
    const combinedPrompt = systemInstruction ? `System Instructions:\n${systemInstruction}\n\nUser Request:\n${prompt}` : prompt

    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}?model=openai`, {
      method: 'GET',
      signal: controller.signal
    })
    
    if (!res.ok) throw new Error(`Free AI Server responded with ${res.status}. Please set your own API key in Settings.`)
    
    const text = await res.text()
    return text?.trim() || 'No response received.'
  } catch (err) {
    if (err.name === 'AbortError') {
      return '⏱️ Request timed out. The AI service may be busy — please try again.'
    }
    console.warn('AI API error:', err.message)
    if (err.message.includes('API Key') || err.message.includes('Free AI Server')) {
      return `❌ ${err.message}`
    }
    return `❌ Could not reach the AI service. The free server might be overloaded. Please go to Settings and enter your own Gemini API key for zero errors.`
  } finally {
    clearTimeout(timer)
  }
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
