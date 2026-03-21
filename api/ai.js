export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method === 'GET') return res.status(200).json({ status: 'AI proxy running' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt = '', systemInstruction = '' } = req.body || {}
  
  // Read key from Vercel Environment Variable (set in Vercel Dashboard)
  const GROQ_API_KEY = process.env.GROQ_API_KEY

  if (GROQ_API_KEY) {
    try {
      const messages = []
      if (systemInstruction) messages.push({ role: 'system', content: systemInstruction })
      messages.push({ role: 'user', content: prompt.slice(0, 4000) })

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages,
          max_tokens: 1024,
          temperature: 0.7
        })
      })

      if (groqRes.ok) {
        const data = await groqRes.json()
        const text = data?.choices?.[0]?.message?.content
        if (text) return res.status(200).send(text.trim())
      }
    } catch (e) {
      console.error('Groq error:', e.message)
    }
  }

  // Fallback: Pollinations
  try {
    const fullMsg = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
    const polRes = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: fullMsg.slice(0, 4000) }],
        model: 'openai'
      })
    })
    if (polRes.ok) {
      const text = (await polRes.text()).trim()
      if (text && text.length > 5) return res.status(200).send(text)
    }
  } catch (e) {
    console.error('Pollinations error:', e.message)
  }

  return res.status(503).json({ error: 'AI temporarily unavailable' })
}
