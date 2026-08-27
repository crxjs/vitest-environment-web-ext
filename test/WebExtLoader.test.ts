import type { BrowserContext } from 'playwright'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebExtLoader } from '../src/browser/WebExtLoader'

describe('webExtLoader getExtensionId', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses an existing service worker without probing', async () => {
    const context = {
      serviceWorkers: () => [{ url: () => 'chrome-extension://abc123/manifest.json' }],
    } as unknown as BrowserContext
    const loader = new WebExtLoader()

    await expect(
      loader.getExtensionId(context, 'https://www.example.com', { timeout: 1000 }),
    ).resolves.toBe('abc123')
  })

  it('resolves within detectTimeout and closes the probe tab when nothing matches', async () => {
    const close = vi.fn(async () => {})
    const context = {
      serviceWorkers: () => [],
      newPage: async () => ({ goto: () => new Promise<never>(() => {}), close }),
      waitForEvent: (_event: string, options: { timeout: number }) =>
        new Promise((_resolve, reject) => {
          setTimeout(() => reject(new Error('Timeout')), options.timeout)
        }),
    } as unknown as BrowserContext
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loader = new WebExtLoader()
    const started = Date.now()

    const id = await loader.getExtensionId(context, 'https://www.example.com', { timeout: 50 })

    expect(id).toBe('')
    expect(Date.now() - started).toBeLessThan(1000)
    expect(close).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledOnce()
  })

  it('returns the id from an extension request while navigation is still pending', async () => {
    const close = vi.fn(async () => {})
    const context = {
      serviceWorkers: () => [],
      newPage: async () => ({ goto: () => new Promise<never>(() => {}), close }),
      waitForEvent: async () => ({ url: () => 'chrome-extension://def456/icon.png' }),
    } as unknown as BrowserContext
    const loader = new WebExtLoader()

    await expect(
      loader.getExtensionId(context, 'https://www.example.com', { timeout: 1000 }),
    ).resolves.toBe('def456')
    expect(close).toHaveBeenCalledOnce()
  })

  it('detects the id when the service worker registers after launch', async () => {
    let resolveWorker!: (worker: unknown) => void
    const close = vi.fn(async () => {})
    const context = {
      serviceWorkers: () => [],
      newPage: async () => ({ goto: () => new Promise<never>(() => {}), close }),
      waitForEvent: vi.fn((event: string) => {
        if (event === 'serviceworker')
          return new Promise((resolve) => { resolveWorker = resolve })
        // no extension-origin requests are ever made
        return new Promise(() => {})
      }),
    } as unknown as BrowserContext
    const loader = new WebExtLoader()

    const promise = loader.getExtensionId(context, 'https://www.example.com', { timeout: 1000 })
    resolveWorker({ url: () => 'chrome-extension://abc123/manifest.json' })

    await expect(promise).resolves.toBe('abc123')
    expect(close).toHaveBeenCalledOnce()
  })
})
