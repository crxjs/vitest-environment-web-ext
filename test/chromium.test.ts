import { afterEach, expect, it } from 'vitest'
import { WebExtBrowser } from '../src/index'

let browser: WebExtBrowser

afterEach(async () => {
  await browser?.close()
})

it('retains Chromium background and popup support across close and relaunch', async () => {
  browser = new WebExtBrowser({
    path: new URL('./fixtures/chromium', import.meta.url).pathname,
    playwright: { headless: true, slowMo: 0 },
  })
  await browser.launch()
  expect(await browser.getExtensionURL('popup.html')).toMatch(/^chrome-extension:\/\//)
  const background = await browser.getBackground()
  expect(await background?.evaluate('chrome.runtime.getManifest().name')).toBe('Chromium fixture')
  expect(await (await browser.getPopupPage()).title()).toBe('Chromium popup')
  await browser.close()
  await browser.close()
  await browser.launch()
  expect(await (await browser.getPopupPage()).title()).toBe('Chromium popup')
}, 60000)
