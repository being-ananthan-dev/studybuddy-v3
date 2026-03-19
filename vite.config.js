import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { HfInference } from '@huggingface/inference'
import dotenv from 'dotenv'

dotenv.config() 

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vercel-functions-mock',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end("Method Not Allowed")
            return
          }

          const apiKey = process.env.HUGGINGFACE_API_KEY
          if (!apiKey || apiKey === "your_huggingface_api_key_here") {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: "API Key not configured. Edit .env and set HUGGINGFACE_API_KEY" }))
            return
          }

          let body = ''
          req.on('data', chunk => { body += chunk.toString() })
          req.on('end', async () => {
             try {
               const { prompt, systemInstruction } = JSON.parse(body)
               if (!prompt) {
                 res.statusCode = 400
                 res.end(JSON.stringify({ error: "Missing prompt" }))
                 return
               }

               const hf = new HfInference(apiKey)
               const model = "mistralai/Mistral-7B-Instruct-v0.3"
               
               const response = await hf.chatCompletion({
                 model: model,
                 messages: [
                   { role: "system", content: systemInstruction || "You are a helpful study buddy AI." },
                   { role: "user", content: prompt }
                 ],
                 max_tokens: 800
               })
               const text = response.choices[0].message.content

               res.statusCode = 200
               res.setHeader('Content-Type', 'application/json')
               res.end(JSON.stringify({ result: text }))
             } catch (err) {
               console.error("Mock Vercel HF Function Error:", err)
               res.statusCode = 500
               res.setHeader('Content-Type', 'application/json')
               res.end(JSON.stringify({ error: err.message || "Internal Server Error" }))
             }
          })
        })
      }
    }
  ],
  server: {
    port: 5173,
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
