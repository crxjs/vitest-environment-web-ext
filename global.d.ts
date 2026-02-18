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
    }
  }
}
