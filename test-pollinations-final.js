const testFinal = async () => {
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are Chanakya.' },
          { role: 'user', content: 'I need your wisdom.' }
        ]
        // Explicitly omitting the 'model' key!
      })
    });
    console.log('Status no-model:', res.status);
    console.log('Response no-model:', await res.text());
  } catch(e) {
    console.log('Error:', e.message);
  }
};
testFinal();
