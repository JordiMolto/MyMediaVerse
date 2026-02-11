import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'app-icon.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'MyMediaVerse',
        short_name: 'MyMediaVerse',
        description: 'Organiza y gestiona tus películas, series, libros y videojuegos',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.png?v=2',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'app-icon.png?v=2',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
