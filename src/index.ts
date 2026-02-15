import type { Environment } from 'vitest/environments'
import { WebExtBrowser } from './browser'

class WebExtEnvironment implements Environment {
  name = 'web-ext'
  viteEnvironment = 'ssr'
  async setup(global: Record<string, unknown>) {
    const browser = new WebExtBrowser({
      browser: 'chromium',
      cacheDir: './tmp',
      headless: false,
      slowMo: 0,
    })

    await browser.launch()
    global.browser = browser

    return {
      teardown: async () => {
        browser.close()
      },
    }
  }
}

const webExtEnvironment = new WebExtEnvironment()
export default webExtEnvironment
