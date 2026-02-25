import type { BrowserContext } from 'playwright'
import type { WebExtBrowser } from './dist/index.d.mts'
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
       * URL used to automatically retrieve the extension ID.
       *
       * Configure a URL that can trigger the browser extension when automatic extension ID retrieval fails.
       *
       * @default 'https://www.example.com'
       */
      targetUrl?: string
      /**
       * Options for Playwright.
       */
      playwright?: {
        // /**
        //  * Browser to use for testing.
        //  *
        //  * @default 'chromium'
        //  */
        // browser?: 'chromium' | 'firefox' | 'webkit'
        /**
         * Slow down Playwright operations by the given amount of milliseconds.
         *
         * @default 100
         */
        slowMo?: number
        /**
         * Directory to cache the browser user data.
         *
         * - `true`: Use default path `path.join(process.cwd(), './.vitest-web-ext-cache')`
         * - `string`: Use custom path
         * - `false`: Disable caching
         *
         * @default false
         */
        userDataDir?: string | boolean
        /**
         * Whether to automatically open the DevTools panel when browser starts.
         *
         * @default false
         */
        devtools?: boolean
      }
    }
  }
}

declare global {
  const context: BrowserContext
  const browser: WebExtBrowser
}
