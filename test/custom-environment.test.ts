/** @vitest-environment web-ext */
import type {} from '../global'
import { expect, it } from 'vitest'

it('provides the public API through the real custom Vitest environment', async () => {
  await browser.launch(new URL('./fixtures/page-only', import.meta.url).pathname)
  expect(await context.pages()).toBeDefined()
  expect(await (await browser.getPopupPage()).title()).toBe('Page only')
}, 60000)
