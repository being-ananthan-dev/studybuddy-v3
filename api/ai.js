export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  const fullMessage = systemInstruction 
    ? `System Instructions:\n${systemInstruction}\n\nUser Question:\n${prompt}` 
    : prompt;

  const proxies = [
    // 1. Pollinations (Server-side POST is much more reliable)
    async () => {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullMessage.slice(0, 4000) }],
          model: 'openai',
          jsonMode: false
        })
      });
      if (!response.ok) throw new Error('Pollinations failed');
      return await response.text();
    },
    // 2. Hercai
    async () => {
      const response = await fetch(`https://api.hercai.onrender.com/v3/hercai?question=${encodeURIComponent(fullMessage.slice(0, 1500))}`);
      if (!response.ok) throw new Error('Hercai failed');
      const json = await response.json();
      return json.reply || json.content || '';
    }
  ];

  for (const proxy of proxies) {
    try {
      const result = await proxy();
      if (result && result.length > 5 && !result.toLowerCase().includes('server down')) {
        return res.status(200).send(result.trim());
      }
    } catch (e) {
      console.error('Vercel Proxy Attempt Failed:', e.message);
    }
  }

  return res.status(503).send('All AI proxies are currently unavailable.');
}
