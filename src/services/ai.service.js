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
    let url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`
    if (systemInstruction) {
      url += `&system=${encodeURIComponent(systemInstruction)}`
    }

    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Server responded with ${res.status}`)
    
    const text = await res.text()
    return text?.trim() || 'No response received.'
  } catch (err) {
    if (err.name === 'AbortError') {
      return '⏱️ Request timed out. The AI service may be busy — please try again.'
    }
    console.warn('AI API error:', err.message)
    return `❌ Could not reach the AI service. Check your internet connection and try again.`
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
