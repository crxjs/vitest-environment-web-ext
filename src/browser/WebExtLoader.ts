import type { BrowserContext, Worker } from 'playwright'
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
   * Prefers an already registered service worker; otherwise races the
   * extension's service worker registering (MV3) against any extension-origin
   * request (MV2 / content-script fetches) while a probe tab navigates to
   * `targetUrl`. The tab is always closed before returning, and the whole
   * detection resolves within the timeout even if the network is unreachable.
   */
  async getExtensionId(
    context: BrowserContext,
    targetUrl: string,
    options: { timeout?: number } = {},
  ): Promise<string> {
    const timeout = options.timeout ?? 15_000

    const idFromWorker = (worker: Worker | undefined) =>
      worker ? this.extractExtensionId(worker.url()) : undefined

    // fast path: a registered service worker exposes the extension origin
    const existingId = idFromWorker(context.serviceWorkers()[0])
    if (existingId)
      return existingId

    // wait for either a matching extension service worker or an
    // extension-origin request; predicates keep non-extension events from
    // short-circuiting the race with a false negative
    const detectionPromise = Promise.race([
      context
        .waitForEvent('serviceworker', {
          predicate: worker => Boolean(this.extractExtensionId(worker.url())),
          timeout,
        })
        .then(worker => this.extractExtensionId(worker.url()) ?? ''),
      context
        .waitForEvent('request', {
          predicate: req => Boolean(this.extractExtensionId(req.url())),
          timeout,
        })
        .then(req => this.extractExtensionId(req.url()) ?? ''),
    ]).catch(() => '')

    // close the snapshot/listener race: if the worker registered between the
    // snapshot above and the listeners being attached, resolve immediately
    const recheckId = idFromWorker(context.serviceWorkers()[0])
    if (recheckId)
      return recheckId

    const page = await context.newPage().catch(() => undefined)
    if (page) {
      // navigate in the background: `detectionPromise` is the hard bound, and
      // page.goto has its own (longer) timeout that would defeat `detectTimeout`
      void page.goto(targetUrl).catch(() => {})
    }

    const id = await detectionPromise

    if (page)
      await page.close().catch(() => {})

    if (!id) {
      console.warn(
        `[web-ext] Could not detect the extension id within ${timeout}ms. `
        + 'Configure `extensionId`, check the extension `path`/`targetUrl`, '
        + 'or disable `detectExtensionId` if it is not needed.',
      )
    }

    return id
  }
}
