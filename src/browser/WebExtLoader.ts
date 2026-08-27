import type { BrowserContext } from 'playwright'
import path from 'node:path'
import fs from 'fs-extra'

const EXTENSION_URL_PREFIX = 'chrome-extension://'

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
    // resolved but not validated here: `build --watch` style flows launch the
    // browser before the output directory exists, and Chromium reports a bad
    // --load-extension path loudly enough on its own
    this._extensionPath = path.resolve(extensionPath)
  }

  async getManifest(): Promise<WebExtManifest> {
    if (!this._extensionPath) {
      throw new Error('Extension path not set. Call load() first.')
    }

    const manifestPath = path.join(this._extensionPath, 'manifest.json')

    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Extension manifest.json not found at: ${manifestPath}`)
    }

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

  /**
   * Detects the extension id.
   *
   * Prefers an already registered service worker; otherwise opens one tab at
   * `targetUrl` and waits (bounded by `timeout`) for either that tab's
   * navigation or any extension-origin request to reveal the id. The tab is
   * always closed before returning, and the whole detection resolves within
   * the timeout even if the network is unreachable.
   */
  async getExtensionId(
    context: BrowserContext,
    targetUrl: string,
    options: { timeout?: number } = {},
  ): Promise<string> {
    const timeout = options.timeout ?? 15_000

    // fast path: a registered service worker exposes the extension origin
    const [worker] = context.serviceWorkers()
    if (worker) {
      const id = this.extractExtensionId(worker.url())
      if (id)
        return id
    }

    const requestPromise = context
      .waitForEvent('request', {
        predicate: req => req.url().startsWith(EXTENSION_URL_PREFIX),
        timeout,
      })
      .then(req => this.extractExtensionId(req.url()) ?? '')
      .catch(() => '')

    const page = await context.newPage()
    await page.goto(targetUrl).catch(() => {})

    // bounded: waitForEvent rejects with the timeout and `.catch` swallows it
    const id = await requestPromise

    await page.close().catch(() => {})

    return id
  }
}
