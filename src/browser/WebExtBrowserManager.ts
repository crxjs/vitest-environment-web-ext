import type { BrowserContext } from 'playwright'
import type { launchFirefox } from './firefox'
import type { WebExtEnvironmentOptions } from '@/options/types'
import { chromium } from 'playwright'

export class WebExtBrowserManager {
  private firefox: Awaited<ReturnType<typeof launchFirefox>> | undefined

  get background() { return this.firefox?.background }
  get extensionURL() { return this.firefox?.extensionURL }

  private _context: BrowserContext | null = null

  get context(): BrowserContext | null {
    return this._context
  }

  constructor(private options: WebExtEnvironmentOptions['playwright']) {}

  async launch(extensionPath: string): Promise<BrowserContext> {
    if (this.options.browser === 'firefox') {
      const { launchFirefox } = await import('./firefox')
      this.firefox = await launchFirefox(extensionPath, this.options)
      this._context = this.firefox.context
      return this._context
    }
    const userDataDir = this.options.userDataDir as string

    const webExtArgs = [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--disable-features=ExtensionDisableUnsupportedDeveloper',
    ]

    if (this.options.devtools) {
      webExtArgs.push('--auto-open-devtools-for-tabs')
    }

    this._context = await chromium.launchPersistentContext(userDataDir, {
      headless: this.options.headless,
      // The bundled headless shell cannot load extensions, so headless runs
      // keep the full Chromium binary via the `chromium` channel (Playwright
      // >= 1.49), which runs Chrome's new headless mode.
      channel: this.options.headless ? 'chromium' : undefined,
      slowMo: this.options.slowMo,
      executablePath: this.options.executablePath || undefined,
      args: webExtArgs,
    })

    return this._context
  }

  async close(): Promise<void> {
    try {
      if (this.firefox)
        await this.firefox.close()
      else
        await this._context?.close()
    }
    finally {
      this.firefox = undefined
      this._context = null
    }
  }
}
