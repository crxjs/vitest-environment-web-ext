export type BrowserType = 'chromium' | 'firefox' | 'webkit'

export interface BrowserOptions {
  browser: BrowserType
  headless: boolean
  slowMo: number
  cacheDir: string
}
