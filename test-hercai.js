const testHercai = async () => {
  try {
    const prompt = 'System: You are Chanakya.\n\nUser: I need help.';
    const res = await fetch(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(prompt)}`);
    console.log('Hercai Status:', res.status);
    if (res.ok) {
      const json = await res.json();
      console.log('Hercai Response:', json.reply);
    } else {
      console.log('Hercai Error:', await res.text());
    }
  } catch(e) {
    console.log('Hercai Failed:', e.message);
  }
};
testHercai();
