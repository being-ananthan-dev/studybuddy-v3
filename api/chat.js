import { HfInference } from "@huggingface/inference";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Ensure API Key exists
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === "your_huggingface_api_key_here") {
    return res.status(500).json({ error: "Hugging Face API Key not configured on the server." });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, systemInstruction } = data;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const hf = new HfInference(apiKey);
    
    // Choose a strong, free instruction model on Hugging Face
    const model = "mistralai/Mistral-7B-Instruct-v0.3";

    // Call Hugging Face Chat Completion API
    const response = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: systemInstruction || "You are a helpful study buddy AI." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800
    });

    const text = response.choices[0].message.content;

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error("Vercel HF Function Error:", error);
    return res.status(500).json({ error: error.message || "Server encountered an error while communicating with Hugging Face." });
  }
}
