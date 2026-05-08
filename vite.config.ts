import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// APIS SYSTEM RECOVERY CONFIGURATION
export default defineConfig({
  plugins: [react()],
  base: '/APIS-Academic-Intelligence-System/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined // Keep it simple for stability
      }
    }
  }
})
