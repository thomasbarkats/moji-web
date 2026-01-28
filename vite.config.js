import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/(auth|users|kana|vocabulary|kanji|subscription|progress)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
