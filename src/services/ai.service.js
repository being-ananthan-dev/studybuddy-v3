const API_URL = '/api/gemini'

export async function askGemini(prompt, systemInstruction = '') {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Server API Error')
    
    return data.result || 'No response.'
  } catch (err) {
    console.warn('Gemini API unavailable or errored:', err)
    return `[API Error]: ${err.message}. If deploying to Vercel, ensure you added GEMINI_API_KEY in the Vercel project settings and triggered a Redeploy.`
  }
}

export async function generateStudyPlan(subjects, hours) {
  const prompt = `Create a detailed study plan as JSON. Subjects: ${subjects}. Total hours: ${hours}. Format: {"days":[{"day":1,"tasks":["task1","task2"]}]}. Return ONLY valid JSON.`
  const raw = await askGemini(prompt, 'You are a study planning expert. Return only valid JSON.')
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch { return { days: [{ day: 1, tasks: ['Review ' + subjects, 'Practice problems'] }] } }
}
