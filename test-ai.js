

const testPollinations = async () => {
  // Test 1: With System Role (What likely caused the original POST 500 error)
  try {
    const res1 = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hi' }
        ]
      })
    });
    console.log('Test 1 (System Role) Status:', res1.status);
    if (!res1.ok) console.log(await res1.text());
  } catch(e) { console.log('Test 1 Failed:', e.message) }

  // Test 2: Without System Role (Just one user prompt)
  try {
    const res2 = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'System: You are a helpful assistant.\n\nUser: Say hi' }
        ]
      })
    });
    console.log('Test 2 (User Role Only) Status:', res2.status);
    if (res2.ok) {
      console.log('Test 2 Success Response:', await res2.text());
    } else {
      console.log('Test 2 Error:', await res2.text());
    }
  } catch(e) { console.log('Test 2 Failed:', e.message) }
};

testPollinations();
