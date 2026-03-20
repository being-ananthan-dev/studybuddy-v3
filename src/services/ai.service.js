export async function askGemini(prompt, systemInstruction = '') {
  try {
    const encodedPrompt = encodeURIComponent(prompt)
    // Using a keyless free public AI endpoint so no API keys are required anywhere
    let url = `https://text.pollinations.ai/${encodedPrompt}?model=openai`
    if (systemInstruction) {
      url += `&system=${encodeURIComponent(systemInstruction)}`
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error(await res.text() || 'API Error')
    
    const text = await res.text()
    return text || 'No response.'
  } catch (err) {
    console.warn('Free AI API unavailable or errored:', err)
    return `[API Error]: ${err.message}. Ensure you have an active internet connection.`
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
