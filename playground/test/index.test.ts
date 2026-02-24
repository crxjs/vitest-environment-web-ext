import { describe, expect, it } from 'vitest'

describe('web-ext environment', () => {
  it('getPopupPage', async () => {
    const popupPage = await browser.getPopupPage()
    const text = await popupPage.waitForSelector('.read-the-docs')
    expect(await text.textContent()).toMatchInlineSnapshot(`" Click on the Vite, Vue and CRXJS logos to learn more "`)
  })

  it('getSidePanelPage', async () => {
    const sidePanelPage = await browser.getSidePanelPage()
    const text = await sidePanelPage.waitForSelector('.read-the-docs')
    expect(await text.textContent()).toMatchInlineSnapshot(`" Click on the Vite, Vue and CRXJS logos to learn more "`)
  })

  it('contains the Vue app', async () => {
    const page = await context.newPage()
    await page.goto(`https://www.bing.com`)
    const toggleButton = await page.waitForSelector('.toggle-button')
    await toggleButton.click()
    const appContainer = await page.waitForSelector('.popup-content')
    expect(await appContainer.textContent()).toMatchInlineSnapshot(`"HELLO CRXJS"`)
  })
})
