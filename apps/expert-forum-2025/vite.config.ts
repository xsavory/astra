import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import mkcert from 'vite-plugin-mkcert'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    // mkcert()
  ],
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: false,
    open: false,
  },
})
