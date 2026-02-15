import type { BrowserContext, Page } from 'playwright'
import process from 'node:process'
import jsesc from 'jsesc'

export async function getPage(
  browser: BrowserContext,
  test: RegExp | string,
): Promise<Page> {
  const timeout
    = process.env.NODE_ENV === 'test' && process.env.TIMEOUT
      ? Number.parseInt(process.env.TIMEOUT)
      : 5000
  const regex = test instanceof RegExp ? test : new RegExp(jsesc(test))
  const waitForUrl = async (p: Page): Promise<boolean> => {
    try {
      await p.waitForURL(regex, { timeout })
      return true
    }
    catch {
      // never resolve if page closes, etc
      return new Promise(() => undefined)
    }
  }
  const page = await Promise.race([
    browser.waitForEvent('page', {
      predicate: async (p) => {
        await waitForUrl(p)
        return true
      },
      timeout,
    }),
    ...browser.pages().map(async (p) => {
      await waitForUrl(p)
      return p
    }),
  ])

  return page
}
