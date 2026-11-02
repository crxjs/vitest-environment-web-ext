import { expect, it, vi } from 'vitest'
import { WebExtBrowser } from '../src/index'

// The transport replaces an actor while the parent process answers URL lookup.
// Real-browser reload tests cover the same public handle after launch completes.
const transport = vi.hoisted(() => {
  const listeners = new Set<(packet: unknown) => void>()
  const url = 'moz-extension://fixture/_generated_background_page.html'
  const original = {
    evaluate: async () => url,
    dispose: vi.fn(),
  }
  const rdp = {
    on: (_event: string, listener: (packet: unknown) => void) => listeners.add(listener),
    off: (_event: string, listener: (packet: unknown) => void) => listeners.delete(listener),
    root: { getProcess: async () => ({ call: async () => ({ consoleActor: 'parent' }) }) },
    actor: (actorId: string) => ({ actorId, call: async () => undefined }),
  }
  class Evaluation {
    constructor(private _rdp: unknown, private actor: { actorId: string }) {}
    async evaluate() {
      if (this.actor.actorId === 'parent') {
        for (const listener of [...listeners]) {
          listener({ type: 'target-available-form', target: { url, consoleActor: 'replacement' } })
        }
        return 'moz-extension://fixture/'
      }
      return 'replacement actor'
    }

    dispose() {}
  }
  return { rdp, original, Evaluation, listeners }
})

vi.mock('@openpolyfill/firefox-addon-playwright-harness', () => ({
  ensureFirefoxPatched: async () => {},
  RdpEvaluation: transport.Evaluation,
  launchFirefoxExtension: async () => ({
    context: {},
    extension: { id: 'fixture@example.com', background: transport.original },
    rdp: transport.rdp,
    close: async () => {},
  }),
}))

it('retains the replacement actor when reload happens during extension URL lookup', async () => {
  const browser = new WebExtBrowser({ path: '.', playwright: { browser: 'firefox', headless: true } })
  try {
    await browser.launch()
    const background = await browser.getBackground()
    expect(await background?.evaluate('probe')).toBe('replacement actor')
    expect(transport.original.dispose).toHaveBeenCalledOnce()
  }
  finally {
    await browser.close()
  }
  expect(transport.listeners.size).toBe(0)
})
