/* eslint-disable no-undef */
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [
    react({
      // Enable fast refresh with SWC-like optimizations
      fastRefresh: true,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Increase chunk size warning limit (pdfjs + mammoth are inherently large)
    chunkSizeWarningLimit: 1000,
    // Target standard modern browsers
    target: "modules",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/react-router-dom')) return 'vendor-router'
          if (id.includes('node_modules/firebase')) return 'vendor-firebase'
          if (id.includes('react-markdown') || id.includes('remark-math') || id.includes('rehype-katex') || id.includes('katex')) return 'vendor-markdown'
          if (id.includes('pdfjs-dist') || id.includes('mammoth')) return 'vendor-docs'
          if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('lucide-react')) return 'vendor-ui'
        },
      },
    },
    // Generate source maps only in dev for speed
    sourcemap: false,
  },

  // Speed up dev server by pre-bundling heavy deps
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-markdown",
      "clsx",
      "tailwind-merge",
    ],
    exclude: ["pdfjs-dist", "mammoth"],
  },

  // Faster HMR in dev
  server: {
    hmr: { overlay: false },
  },
})
