import type { BrowserContext, Page } from 'playwright'
import type { WebExtEnvironmentOptions } from '@/options/types'
import { WebExtBrowserManager } from './WebExtBrowserManager'
import { WebExtFactory } from './WebExtFactory'
import { WebExtLoader } from './WebExtLoader'

export class WebExtBrowser {
  private loader: WebExtLoader
  private manager: WebExtBrowserManager
  private factory: WebExtFactory
  private _context: BrowserContext | null = null
  private extensionId: string = ''

  /**
   * Gets the Playwright browser context.
   * @throws Error if browser context not initialized. Call launch() first.
   */
  get context(): BrowserContext {
    if (!this._context) {
      throw new Error('Browser context not initialized. Call launch() first.')
    }
    return this._context
  }

  /**
   * Creates a new WebExtBrowser instance.
   * @param options - Configuration options for the web extension environment.
   */
  constructor(private options: WebExtEnvironmentOptions) {
    this.loader = new WebExtLoader()
    this.manager = new WebExtBrowserManager(options.playwright)
    this.factory = new WebExtFactory()
  }

  /**
   * Launches the browser and loads the web extension.
   * @param path - Optional path to the web extension directory. Defaults to options.path.
   */
  async launch(path?: string): Promise<void> {
    this.loader.load(path ?? this.options.path)
    this._context = await this.manager.launch(this.loader.extensionPath)
    this.extensionId = await this.loader.getExtensionId(this.context, this.options.targetUrl)
  }

  /**
   * Closes the browser and cleans up resources.
   */
  close(): void {
    this.manager.close()
  }

  /**
   * Gets the extension ID from the loaded extension.
   * @returns The extension ID as a string.
   */
  async getExtensionId(): Promise<string> {
    return this.extensionId
  }

  /**
   * Gets the popup page of the extension.
   * @returns The popup page as a Playwright Page.
   */
  async getPopupPage(): Promise<Page> {
    const popupPath = await this.loader.getPopupPath()
    return this.factory.createExtPage(this.context, popupPath, this.extensionId)
  }

  /**
   * Gets the side panel page of the extension.
   * @returns The side panel page as a Playwright Page.
   */
  async getSidePanelPage(): Promise<Page> {
    const sidePanelPath = await this.loader.getSidePanelPath()
    return this.factory.createExtPage(this.context, sidePanelPath, this.extensionId)
  }

  /**
   * Gets the service worker of the extension.
   * @returns The service worker as a Playwright Worker.
   */
  async getServiceWorker() {
    let [serviceWorker] = this.context.serviceWorkers() || []
    if (!serviceWorker) {
      serviceWorker = await this.context.waitForEvent('serviceworker')
    }
    return serviceWorker
  }
}
