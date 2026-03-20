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

export const generateStudyPlan = async (subjects, timeframe) => {
  const prompt = `Create a highly optimized study plan for the following subjects: ${subjects}.
The duration available is: ${timeframe}.
If the timeframe is specified in HOURS (e.g. '5 hours'), create exactly 1 day object containing an hourly breakdown of tasks.
If the timeframe is specified in DAYS (e.g. '3 days'), create an array of day objects (Day 1, Day 2, etc.) containing the daily goals.
You must return your response STRICTLY as a JSON object with this exact structure, completely stripping any markdown formatting or backticks:
{ "days": [ { "day": "1", "tasks": ["Task 1", "Task 2"] } ] }`

  const raw = await askGemini(prompt, 'You are a study planning expert. Return only valid JSON.')
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch { return { days: [{ day: 1, tasks: ['Review ' + subjects, 'Practice problems'] }] } }
}
