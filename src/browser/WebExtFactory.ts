import type { BrowserContext, Page } from 'playwright'

const EXTENSION_URL_PREFIX = 'chrome-extension://'

export class WebExtFactory {
  async createExtPage(
    context: BrowserContext,
    url: string,
    extensionId?: string,
  ): Promise<Page> {
    const page = await context.newPage()
    await page.goto(`${EXTENSION_URL_PREFIX}${extensionId}/${url}`)
    return page
  }
}
