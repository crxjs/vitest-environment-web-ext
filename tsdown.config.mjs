import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/firefox.ts',
  ],
  dts: true,
  publint: true,
})
