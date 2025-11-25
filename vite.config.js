import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-table': ['@tanstack/react-table'],
          'vendor-ui': ['@headlessui/react', '@heroicons/react', 'clsx', 'zustand']
        }
      }
    }
  }
})
