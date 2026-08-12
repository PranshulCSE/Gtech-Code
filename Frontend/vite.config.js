import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/user': 'http://localhost:3000',
      '/problem': 'http://localhost:3000',
      '/submission': 'http://localhost:3000',
      '/ai': 'http://localhost:3000',
      '/video': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  }
})
