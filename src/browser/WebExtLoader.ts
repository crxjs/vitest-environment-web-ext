import type { BrowserContext } from 'playwright'
import path from 'node:path'
import fs from 'fs-extra'

interface WebExtManifest {
  action?: { default_popup?: string }
  browser_action?: { default_popup?: string }
  side_panel?: { default_path?: string }
}

export class WebExtLoader {
  private _extensionPath: string = ''

  get extensionPath(): string {
    return this._extensionPath
  }

  load(extensionPath: string): void {
    const resolvedPath = path.resolve(extensionPath)
    this.validate(resolvedPath)
    this._extensionPath = resolvedPath
  }

  private validate(extPath: string): void {
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

  async getManifest(): Promise<WebExtManifest> {
    if (!this._extensionPath) {
      throw new Error('Extension path not set. Call load() first.')
    }

    const manifestPath = path.join(this._extensionPath, 'manifest.json')
    return await fs.readJson(manifestPath)
  }

  private async getPathFromManifest<T>(
    getPath: (manifest: WebExtManifest) => T | undefined,
    name: string,
  ): Promise<NonNullable<T>> {
    const manifest = await this.getManifest()
    const extractedPath = getPath(manifest)

    if (!extractedPath) {
      throw new Error(`No ${name} defined path in manifest.json`)
    }

    return extractedPath
  }

  async getPopupPath(): Promise<string> {
    return this.getPathFromManifest(
      manifest => manifest.action?.default_popup ?? manifest.browser_action?.default_popup,
      'popup',
    )
  }

  async getSidePanelPath(): Promise<string> {
    return this.getPathFromManifest(
      manifest => manifest.side_panel?.default_path,
      'side_panel',
    )
  }

  private extractExtensionId(url: string): string | undefined {
    return url.match(/chrome-extension:\/\/([^/]+)/)?.[1]
  }

  async getExtensionId(context: BrowserContext, targetUrl: string): Promise<string> {
    const workers = context.serviceWorkers()[0]
    if (workers) {
      const id = this.extractExtensionId(workers.url())
      if (id)
        return id
    }

    const extensionUrlPromise = context.waitForEvent('request', req =>
      req.url().startsWith('chrome-extension://'))

    const page = await context.newPage()
    const navigationPromise = page.goto(targetUrl)

    try {
      await Promise.race([extensionUrlPromise, navigationPromise])
      const req = await extensionUrlPromise
      return this.extractExtensionId(req.url()) ?? ''
    }
    catch (error) {
      console.error(error)
      return ''
    }
  }
}
