import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configuración para evitar procesamiento de URLs externas
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      external: (id) => {
        return id.startsWith('https://') || id.startsWith('http://')
      }
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg']
})