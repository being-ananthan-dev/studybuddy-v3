const testProviders = async () => {
  const providers = [
    { name: 'Airforce', url: 'https://api.airforce/chat/completions', model: 'llama-3.1-70b-chat' },
    { name: 'Darkness', url: 'https://darkness.ashlynn.workers.dev/chat/completions', model: 'gpt-4o' },
    { name: 'Kastg', url: 'https://api.kastg.xyz/api/ai/chatgptV4', raw: true },
  ];

  for (const p of providers) {
    try {
      console.log(`Testing ${p.name}...`);
      const body = p.raw ? 
        { prompt: 'Say hi' } : 
        { messages: [{role:'user', content:'Say hi'}], model: p.model };

      const res = await fetch(p.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000)
      });
      console.log(`${p.name} Status:`, res.status);
      if (res.ok) console.log('SUCCESS:', (await res.text()).substring(0, 100));
    } catch(e) {
      console.log(`${p.name} Failed:`, e.message);
    }
  }
};

testProviders();
