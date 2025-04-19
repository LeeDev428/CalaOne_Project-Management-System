import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true, // Expose the server to the network
    port: 5173, // Default port
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
});