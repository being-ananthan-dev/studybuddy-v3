const test = async () => {
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are Chanakya.' },
          { role: 'user', content: 'I failed my exam.' }
        ],
        model: 'openai'
      })
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
  } catch(e) {
    console.log('Error:', e.message);
  }
};
test();
