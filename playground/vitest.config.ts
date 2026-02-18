import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'web-ext',
    environmentOptions: {
      'web-ext': {
        path: './dist',
        compiler: 'pnpm run build',
      },
    },
  },
})
