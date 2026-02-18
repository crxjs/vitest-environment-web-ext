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
    this.validateWebExt(path)

    const args = [
      `--disable-extensions-except=${path}`,
      `--load-extension=${path}`,
      '--disable-features=ExtensionDisableUnsupportedDeveloper',
    ]

    this.webExtArgs = args
  }

  private validateWebExt(extPath: string) {
    const manifestPath = path.join(extPath, 'manifest.json')

    if (!fs.existsSync(extPath)) {
      throw new Error(`Extension path does not exist: ${extPath}`)
    }

    const stat = fs.statSync(extPath)
    if (!stat.isDirectory()) {
      throw new Error(`Extension path must be a directory: ${extPath}`)
    }

    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Extension manifest.json not found at: ${manifestPath}`)
    }
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
