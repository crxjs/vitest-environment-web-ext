type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T

/**
 * User-facing options for the `web-ext` Vitest environment.
 *
 * This is the single source of truth for the option shape: it augments
 * `EnvironmentOptions` in `global.d.ts` and is also the resolved options'
 * input type, so the two can never drift apart.
 */
export interface WebExtEnvironmentUserOptions {
  /**
   * Path to the directory containing the extension manifest.
   */
  path: string
  /**
   * Compilation command such as
   * ```bash
   * npm run build
   * ```
   * if set, will be executed before running tests. Runs once per worker
   * process (Vitest instantiates the environment for every test file, so
   * repeated runs in the same process are skipped).
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
   * Explicit extension id to use instead of probing the browser.
   *
   * When set, extension-id detection is skipped entirely. Useful for
   * offline/air-gapped environments or extensions that never register a
   * service worker (e.g. Manifest V2).
   *
   * @default undefined
   */
  extensionId?: string
  /**
   * Whether to detect the extension id by opening a browser tab that
   * navigates to `targetUrl`.
   *
   * Disable when tests never use `getPopupPage()` / `getSidePanelPage()`
   * and you want launches to work without any network access (e.g. in
   * offline CI or behind a firewall), when a fixture loads pages before
   * the launch finishes, or when `extensionId` is already configured.
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
     * The bundled headless shell cannot load extensions, so this keeps the
     * full Chromium binary via Playwright's `chromium` channel (requires
     * Playwright >= 1.49).
     *
     * @default false
     */
    headless?: boolean
    /**
     * Directory to cache the browser user data.
     *
     * - `true`: Use a per-test-file profile under
     *   `path.join(process.cwd(), './.vitest-web-ext-cache')`. Each test file
     *   gets its own directory so parallel test files never share a Chromium
     *   user-data directory, while repeat runs of the same file reuse it.
     * - `string`: Use custom path (all test files share it — do not combine
     *   with parallel test files)
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

/** Fully resolved options with defaults applied for every field. */
export type WebExtEnvironmentOptions = DeepRequired<WebExtEnvironmentUserOptions>
