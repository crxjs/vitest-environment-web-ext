import type { BrowserContext, Page } from 'playwright'

const EXTENSION_URL_PREFIX = 'chrome-extension://'

export class WebExtPageFactory {
  async createExtPage(context: BrowserContext, url: string): Promise<Page> {
    const extensionId = await this.getExtensionId(context)
    const page = await context.newPage()
    await page.goto(`${EXTENSION_URL_PREFIX}${extensionId}/${url}`)
    return page
  }

  private async getExtensionId(context: BrowserContext): Promise<string> {
    let serviceWorker = context.serviceWorkers()[0]

    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker')
    }

    const match = serviceWorker.url().match(/chrome-extension:\/\/([^/]+)/)
    return match?.[1] ?? ''
  }
}
