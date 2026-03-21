const testAirforceModels = async () => {
  const models = ['gpt-4o-mini', 'gpt-3.5-turbo', 'llama-3-70b-chat', 'llama-3.1-70b-instruct', 'gemini-1.5-flash'];
  for (const m of models) {
    try {
      const res = await fetch('https://api.airforce/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say hi' }],
          model: m
        }),
      });
      const data = await res.json();
      console.log(`Model ${m}:`, data.choices?.[0]?.message?.content || data);
    } catch(e) {
      console.log(`Model ${m} failed:`, e.message);
    }
  }
};
testAirforceModels();
