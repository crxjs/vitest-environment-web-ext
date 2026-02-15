import type { BrowserContext } from 'playwright'
import type { BrowserOptions } from './types'
import path from 'node:path'
import fs from 'fs-extra'
import { chromium, firefox, webkit } from 'playwright'
import * as helpers from './helpers'

export class WebExtBrowser {
  private static readonly browsers = {
    chromium,
    firefox,
    webkit,
  } as const

  private context: BrowserContext | null = null
  private webExtArgs: string[] = []

  constructor(private options: BrowserOptions) {}

  async launch() {
    const browserType = WebExtBrowser.browsers[this.options.browser]
    const dataDir = path.join(this.options.cacheDir!, `.${this.options.browser}`)
    await fs.remove(dataDir)
    const context = await browserType.launchPersistentContext(dataDir, {
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      args: this.webExtArgs,
    })

    this.context = context
  }

  loadWebExt(path: string) {
    const args = [
      `--disable-extensions-except=${path}`,
      `--load-extension=${path}`,
      '--disable-features=ExtensionDisableUnsupportedDeveloper',
    ]

    this.webExtArgs = args
  }

  async getPage(test: RegExp | string) {
    if (!this.context) {
      throw new Error('Browser context not initialized')
    }
    return helpers.getPage(this.context, test)
  }

  close() {
    if (this.context) {
      this.context.close()
      this.context = null
    }
  }
}
