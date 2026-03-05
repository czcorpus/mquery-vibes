import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8082',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/toolbar-proxy': {
        target: 'https://www.korpus.cz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/toolbar-proxy/, '/toolbar/toolbar'),
      },
    },
  },
})
