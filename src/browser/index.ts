import type { BrowserContext, Page } from 'playwright'
import type { WebExtEnvironmentOptions } from '@/options/types'
import path from 'node:path'
import fs from 'fs-extra'
import { chromium } from 'playwright'

interface WebExtManifest {
  action?: { default_popup?: string }
  browser_action?: { default_popup?: string }
  side_panel?: { default_path?: string }
}

export class WebExtBrowser {
  public context: BrowserContext | null = null
  private webExtArgs: string[] = []
  private extensionPath: string = ''

  constructor(private options: WebExtEnvironmentOptions['playwright']) {}

  async launch() {
    const userDataDir = this.options.userDataDir as string
    if (userDataDir) {
      await fs.remove(userDataDir)
    }
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      slowMo: this.options.slowMo,
      args: this.webExtArgs,
    })

    this.context = context
  }

  loadWebExt(extensionPath: string) {
    const resolvedPath = path.resolve(extensionPath)
    this.validateWebExt(resolvedPath)
    this.extensionPath = resolvedPath

    const args = [
      `--disable-extensions-except=${resolvedPath}`,
      `--load-extension=${resolvedPath}`,
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

  close() {
    if (this.context) {
      this.context.close()
      this.context = null
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

  async getPopupPage(): Promise<Page> {
    const popupPath = await this.getPathFromManifest(
      manifest => manifest.action?.default_popup ?? manifest.browser_action?.default_popup,
      'popup',
    )
    return this.getExtPage(popupPath)
  }

  async getSidePanelPage(): Promise<Page> {
    const sidePanelPath = await this.getPathFromManifest(
      manifest => manifest.side_panel?.default_path,
      'side_panel',
    )
    return this.getExtPage(sidePanelPath)
  }

  private async getExtPage(url: string): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context not initialized')
    }

    const extensionId = await this.getExtensionId(this.context)
    const page = await this.context.newPage()
    await page.goto(`chrome-extension://${extensionId}/${url}`)
    return page
  }

  async getManifest(): Promise<WebExtManifest> {
    if (!this.extensionPath) {
      throw new Error('Extension path not set. Call loadWebExt() first.')
    }

    const manifestPath = path.join(this.extensionPath, 'manifest.json')
    return await fs.readJson(manifestPath)
  }

  private async getPathFromManifest<T>(
    getPath: (manifest: WebExtManifest) => T | undefined,
    name: string,
  ): Promise<NonNullable<T>> {
    if (!this.extensionPath) {
      throw new Error('Extension path not set. Call loadWebExt() first.')
    }

    const manifest = await this.getManifest()
    const path = getPath(manifest)

    if (!path) {
      throw new Error(`No ${name} defined path in manifest.json`)
    }

    return path
  }
}
