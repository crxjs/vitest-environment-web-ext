import { afterEach, expect, it } from 'vitest'
import { WebExtBrowser } from '../src/index'

let browser: WebExtBrowser

afterEach(async () => {
  await browser?.close()
})

it('loads a Firefox extension and evaluates its background', async () => {
  browser = new WebExtBrowser({
    path: new URL('./fixtures/firefox', import.meta.url).pathname,
    playwright: { browser: 'firefox', headless: true, slowMo: 0 },
  })
  await browser.launch()
  expect(await browser.getExtensionURL('popup.html')).toMatch(/^moz-extension:\/\//)
  const background = await browser.getBackground()
  expect(await background?.evaluate('chrome.runtime.getManifest().name')).toBe('Firefox fixture')
  const page = await browser.getPopupPage()
  expect(await page.title()).toBe('Firefox popup')
}, 60000)

it('opens pages of an extension without a background', async () => {
  browser = new WebExtBrowser({
    path: new URL('./fixtures/page-only', import.meta.url).pathname,
    playwright: { browser: 'firefox', headless: true, slowMo: 0 },
  })
  await browser.launch()
  expect(await browser.getBackground()).toBeUndefined()
  expect(await (await browser.getPopupPage()).title()).toBe('Page only')
  await browser.close()
  expect(() => browser.context).toThrow(/not initialized/)
  await browser.launch()
  expect(await (await browser.getPopupPage()).title()).toBe('Page only')
}, 60000)

it('keeps a background handle usable after runtime reload', async () => {
  browser = new WebExtBrowser({
    path: new URL('./fixtures/firefox', import.meta.url).pathname,
    playwright: { browser: 'firefox', headless: true, slowMo: 0 },
  })
  await browser.launch()
  const background = (await browser.getBackground())!
  const url = await browser.getExtensionURL('popup.html')
  await background.evaluate('chrome.storage.local.set({ writes: 1 })')
  await background.evaluate('chrome.runtime.reload()').catch(() => undefined)
  await expect.poll(() => background.evaluate('chrome.runtime.getManifest().name'), { timeout: 15000 }).toBe('Firefox fixture')
  expect(await background.evaluate('chrome.storage.local.get("writes").then(value => value.writes)')).toBe(1)
  expect(await background.evaluate((arg: { value: string }) => arg.value, { value: 'serialized' })).toBe('serialized')
  expect(await browser.getExtensionURL('popup.html')).toBe(url)
  expect(await (await browser.getPopupPage()).title()).toBe('Firefox popup')
}, 60000)

it('cleans up a failed installation and can subsequently launch', async () => {
  browser = new WebExtBrowser({
    path: new URL('./fixtures/missing', import.meta.url).pathname,
    playwright: { browser: 'firefox', headless: true, slowMo: 0 },
  })
  await expect(browser.launch()).rejects.toThrow()
  expect(() => browser.context).toThrow(/not initialized/)
  await browser.close()
  await browser.launch(new URL('./fixtures/page-only', import.meta.url).pathname)
  expect(await (await browser.getPopupPage()).title()).toBe('Page only')
}, 60000)
