const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBZ9gdGwu_4oQuzb1iFwxQJb5HrP3IDYKs');
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello world to confirm API is running');
    console.log(result.response.text());
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}
run();
