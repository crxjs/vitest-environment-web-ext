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
       * Whether to detect the extension id by opening a browser tab that
       * navigates to `targetUrl`.
       *
       * Disable when tests never use `getPopupPage()` / `getSidePanelPage()`
       * and you want launches to work without any network access (e.g. in
       * offline CI or behind a firewall), or when a fixture loads pages before
       * the launch finishes.
       *
       * @default true
       */
      detectExtensionId?: boolean
      /**
       * URL used to automatically retrieve the extension ID.
       *
       * Configure a URL that can trigger the browser extension when automatic extension ID retrieval fails.
       *
       * The tab opened for detection is closed automatically once the id is found.
       *
       * @default 'https://www.example.com'
       */
      targetUrl?: string
      /**
       * Maximum time in milliseconds spent detecting the extension id.
       *
       * @default 15000
       */
      detectTimeout?: number
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
         * Run the browser without a visible window.
         *
         * Chromium's default headless shell cannot load extensions, so this
         * relaunches the full browser binary in its new headless mode via the
         * `--headless=new` argument. Requires Chromium >= 112.
         *
         * @default false
         */
        headless?: boolean
        /**
         * Directory to cache the browser user data.
         *
         * - `true`: Use default path `path.join(process.cwd(), './.vitest-web-ext-cache')`
         * - `string`: Use custom path
         * - `false`: Every launch gets a fresh temporary profile directory
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
