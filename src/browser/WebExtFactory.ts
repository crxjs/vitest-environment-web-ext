import type { BrowserContext, Page } from 'playwright'

export class WebExtFactory {
  async createExtPage(
    context: BrowserContext,
    url: string,
    extensionId?: string,
    browser = 'chromium',
  ): Promise<Page> {
    if (!extensionId) {
      throw new Error('Cannot open an extension page without an extension id.')
    }
    const page = await context.newPage()
    const normalizedUrl = url.replace(/^\/+/, '')
    await page.goto(`${browser === 'firefox' ? 'moz-extension' : 'chrome-extension'}://${extensionId}/${normalizedUrl}`)
    return page
  }
}
