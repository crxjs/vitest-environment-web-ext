import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  dts: true,
  publint: true,
  external: [
    '@dcloudio/uni-automator',
  ],
})
