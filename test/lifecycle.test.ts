import { expect, it, vi } from 'vitest'
import { WebExtBrowser } from '../src/index'

const launch = vi.hoisted(() => vi.fn())
vi.mock('playwright', () => ({ chromium: { launchPersistentContext: launch } }))

it('waits for pending cleanup before relaunch and shares concurrent close calls', async () => {
  let finishClose!: () => void
  const pending = new Promise<void>((resolve) => {
    finishClose = resolve
  })
  const first = { close: vi.fn(() => pending) }
  const second = { close: vi.fn(async () => {}) }
  launch.mockResolvedValueOnce(first).mockResolvedValueOnce(second)
  const browser = new WebExtBrowser({ path: '.', detectExtensionId: false })
  await browser.launch()
  const close = browser.close()
  const closeAgain = browser.close()
  let relaunched = false
  const relaunch = browser.launch().then(() => {
    relaunched = true
  })
  try {
    await new Promise(resolve => setImmediate(resolve))
    expect(relaunched).toBe(false)
    expect(launch).toHaveBeenCalledTimes(1)
    expect(first.close).toHaveBeenCalledOnce()
  }
  finally {
    finishClose()
    await Promise.all([close, closeAgain, relaunch])
    expect(browser.context).toBe(second)
    await browser.close()
  }
})
