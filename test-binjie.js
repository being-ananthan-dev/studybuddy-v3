const testBinjie = async () => {
  try {
    const res = await fetch('https://api.binjie.fun/api/generateStream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://chat.jinshutou.com/'
      },
      body: JSON.stringify({
        prompt: 'Say hi',
        systemMessage: 'You are Chanakya.',
        network: true
      })
    });
    console.log('Binjie Status:', res.status);
    const text = await res.text();
    console.log('Binjie Text:', text.slice(0, 50));
  } catch(e) {
    console.log('Failed:', e.message);
  }
};
testBinjie();
