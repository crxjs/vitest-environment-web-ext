import { describe, expect, it } from 'vitest'
import webExtEnvironment from '../src/index'

describe('web-ext environment contract', () => {
  it('exposes the runtime properties vitest requires', () => {
    expect(webExtEnvironment.name).toBe('web-ext')
    // vitest 0.34 – 3.x validates `transformMode` strictly at load time;
    // `declare` fields would be erased at compile time and fail the check
    expect(webExtEnvironment.transformMode).toBe('ssr')
    // vitest >= 3 uses `viteEnvironment` for module transforms
    expect(webExtEnvironment.viteEnvironment).toBe('ssr')
  })
})
