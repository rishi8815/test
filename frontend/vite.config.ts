import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:4000',
      '/tracking': 'http://localhost:4000',
      '/reseller': 'http://localhost:4000',
      '/privacy': 'http://localhost:4000',
      '/marketing': 'http://localhost:4000',
      '/analytics': 'http://localhost:4000',
    },
  },
})
