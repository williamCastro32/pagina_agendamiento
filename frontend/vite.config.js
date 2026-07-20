import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy the API in development so the browser sees a single origin and CORS
    // never enters the picture. In production the two are deployed separately
    // and CORS_ALLOWED_ORIGINS on the Django side takes over.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
