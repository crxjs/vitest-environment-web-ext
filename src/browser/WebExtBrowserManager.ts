import type { BrowserContext } from 'playwright'
import type { WebExtEnvironmentOptions } from '@/options/types'
import fs from 'fs-extra'
import { chromium } from 'playwright'

export class WebExtBrowserManager {
  private _context: BrowserContext | null = null

  get context(): BrowserContext | null {
    return this._context
  }

  constructor(private options: WebExtEnvironmentOptions['playwright']) {}

  async launch(extensionPath: string): Promise<BrowserContext> {
    const userDataDir = this.options.userDataDir as string
    if (this.options.userDataDir) {
      await fs.remove(userDataDir)
    }

    const webExtArgs = [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--disable-features=ExtensionDisableUnsupportedDeveloper',
    ]

    this._context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
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

  async getExtensionId(context: BrowserContext): Promise<string> {
    let serviceWorker = context.serviceWorkers()[0]

    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker')
    }

    const match = serviceWorker.url().match(/chrome-extension:\/\/([^/]+)/)
    return match?.[1] ?? ''
  }
}
