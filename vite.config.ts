import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vis/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})