import type { BrowserContext } from 'playwright'
import type { WebExtBrowser, WebExtEnvironmentUserOptions } from './dist/index.d.mts'
import 'vitest/node'

declare module 'vitest/node' {
  interface EnvironmentOptions {
    /**
     * Options for the web-ext environment.
     */
    'web-ext'?: WebExtEnvironmentUserOptions
  }
}

declare global {
  const context: BrowserContext
  const browser: WebExtBrowser
}
