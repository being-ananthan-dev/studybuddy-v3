const testAirforceV1 = async () => {
  try {
    const res = await fetch('https://api.airforce/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hi' }],
        model: 'llama-3.1-70b-chat'
      }),
      signal: AbortSignal.timeout(5000)
    });
    console.log('Airforce V1 Status:', res.status);
    if (res.ok) {
      const json = await res.json();
      console.log('Airforce V1 Success:', json.choices[0].message.content);
    } else {
      console.log('Airforce V1 Error Text:', await res.text());
    }
  } catch(e) {
    console.log('Airforce V1 Failed:', e.message);
  }
};
testAirforceV1();
