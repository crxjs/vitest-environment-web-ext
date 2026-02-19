import type { BrowserContext } from 'playwright'
import 'vitest/node'

declare module 'vitest/node' {
  interface EnvironmentOptions {
    /**
     * Options for the web-ext environment.
     */
    'web-ext'?: {
      /**
       * Path to the browser extension file or directory.
       *
       * Can be a .crx/.xpi file or a directory containing the extension manifest.
       */
      path: string
      /**
       * Compilation command such as
       * ```bash
       * npm run build
       * ```
       * if set, will be executed before running tests
       *
       * @default false
       */
      compiler?: string | false
      /**
       * Whether to automatically load and launch the browser extension.
       *
       * @default true
       */
      autoLaunch?: boolean
      /**
       * Options for Playwright.
       */
      playwright?: {
        /**
         * Browser to use for testing.
         *
         * @default 'chromium'
         */
        browser?: 'chromium' | 'firefox' | 'webkit'
        /**
         * Whether to run the browser in headless mode.
         *
         * @default true
         */
        headless?: boolean
        /**
         * Slow down Playwright operations by the given amount of milliseconds.
         *
         * @default 100
         */
        slowMo?: number
        /**
         * Directory to cache the browser binary.
         *
         * @default path.join(process.cwd(), './.vitest-web-ext-cache')
         */
        cacheDir?: string
      }
    }
  }
}

declare global {
  const context: BrowserContext
}
