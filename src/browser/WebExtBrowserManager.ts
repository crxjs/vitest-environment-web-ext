import type { BrowserContext } from 'playwright'
import type { WebExtEnvironmentOptions } from '@/options/types'
import { chromium } from 'playwright'

export class WebExtBrowserManager {
  private _context: BrowserContext | null = null

  get context(): BrowserContext | null {
    return this._context
  }

  constructor(private options: WebExtEnvironmentOptions['playwright']) {}

  async launch(extensionPath: string): Promise<BrowserContext> {
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
      args: webExtArgs,
    })

    return this._context
  }

  async close(): Promise<void> {
    if (this._context) {
      await this._context.close()
      this._context = null
    }
  }
}
