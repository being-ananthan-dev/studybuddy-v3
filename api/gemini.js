import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Ensure API Key exists in Vercel Env
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return res.status(500).json({ error: "API Key not configured on the server." });
  }

  try {
    // Vercel parses req.body automatically if it's application/json
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, systemInstruction } = data;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure Model
    const modelParams = { model: "gemini-2.5-flash" };
    if (systemInstruction) {
        modelParams.systemInstruction = systemInstruction;
    }
    
    const model = genAI.getGenerativeModel(modelParams);

    // Call API
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: error.message || "Server encountered an error while communicating with AI." });
  }
}
