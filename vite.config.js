import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config() 

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vercel-functions-mock',
      configureServer(server) {
        server.middlewares.use('/api/gemini', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end("Method Not Allowed")
            return
          }

          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey || apiKey === "your_gemini_api_key_here") {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: "API Key not configured. Edit .env and set GEMINI_API_KEY" }))
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

               const genAI = new GoogleGenerativeAI(apiKey)
               const modelParams = { model: "gemini-2.5-flash" }
               if (systemInstruction) modelParams.systemInstruction = systemInstruction
               
               const model = genAI.getGenerativeModel(modelParams)
               const result = await model.generateContent(prompt)
               const text = result.response.text()

               res.statusCode = 200
               res.setHeader('Content-Type', 'application/json')
               res.end(JSON.stringify({ result: text }))
             } catch (err) {
               console.error("Mock Netlify Function Error:", err)
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
