import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 60000,
    environment: 'web-ext',
    environmentOptions: {
      'web-ext': {
        path: './dist',
        compiler: false,
        playwright: {
          browser: 'chromium',
          headless: false,
        },
      },
    },
  },
})
