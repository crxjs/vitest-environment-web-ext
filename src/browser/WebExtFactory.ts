import type { BrowserContext, Page } from 'playwright'

const EXTENSION_URL_PREFIX = 'chrome-extension://'

export class WebExtFactory {
  async createExtPage(
    context: BrowserContext,
    url: string,
    extensionId?: string,
  ): Promise<Page> {
    if (!extensionId) {
      throw new Error('Cannot open an extension page without an extension id.')
    }
    const page = await context.newPage()
    const normalizedUrl = url.replace(/^\/+/, '')
    await page.goto(`${EXTENSION_URL_PREFIX}${extensionId}/${normalizedUrl}`)
    return page
  }
}
