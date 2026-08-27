import type { EnvironmentOptions } from 'vitest/node'
import { describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'

describe('resolveOptions', () => {
  it('applies defaults', () => {
    const options = resolveOptions({ path: './dist' })

    expect(options.compiler).toBe(false)
    expect(options.autoLaunch).toBe(true)
    expect(options.extensionId).toBe('')
    expect(options.detectExtensionId).toBe(true)
    expect(options.detectTimeout).toBe(15_000)
    expect(options.targetUrl).toBe('https://www.example.com')
    expect(options.playwright).toMatchObject({
      slowMo: 100,
      headless: false,
      userDataDir: '',
      devtools: false,
    })
  })

  it('merges user options over defaults', () => {
    const options = resolveOptions({
      path: './dist',
      extensionId: 'abc123',
      detectExtensionId: false,
      detectTimeout: 5000,
      playwright: {
        headless: true,
        slowMo: 0,
      },
    })

    expect(options.extensionId).toBe('abc123')
    expect(options.detectExtensionId).toBe(false)
    expect(options.detectTimeout).toBe(5000)
    expect(options.playwright.headless).toBe(true)
    expect(options.playwright.slowMo).toBe(0)
  })

  it('throws when path is missing', () => {
    const options = {} as EnvironmentOptions['web-ext']
    expect(() => resolveOptions(options)).toThrow(/path.*required/i)
  })
})
