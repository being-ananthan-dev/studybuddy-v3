const testChurch = async () => {
  try {
    const res = await fetch('https://free.churchless.tech/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hi' }],
        model: 'gpt-3.5-turbo'
      })
    });
    console.log('Status:', res.status);
    console.log(await res.text());
  } catch(e) { console.log('Failed:', e.message); }
};
testChurch();
