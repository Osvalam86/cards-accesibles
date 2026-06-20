import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        bem: resolve(root, 'bem.html'),
        bemit: resolve(root, 'bemit.html'),
        tailwind: resolve(root, 'tailwind.html'),
      },
    },
  },
})
