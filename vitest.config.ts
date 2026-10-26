import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    environmentOptions: {
      'web-ext': {
        path: '.',
        autoLaunch: false,
        playwright: { browser: 'firefox', headless: true, slowMo: 0 },
      },
    },
  },
})
