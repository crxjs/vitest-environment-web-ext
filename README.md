# vitest-environment-web-ext

A Vitest environment for end-to-end testing browser extensions with Playwright.

## [Document](https://crxjs.dev/guide/test/installation)

## Features

- E2E testing for Chrome extensions
- Supports MV3 manifest versions
- TypeScript ready

## Installation

```bash
pnpm add -D vitest-environment-web-ext
```

## Quick Start

> vitest.config.ts
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'web-ext',
  },
})
```
> tsconfig.json
```json
{
  "compilerOptions": {
    "types": [
      "vitest-environment-web-ext/types"
    ]
  }
}
```

## Options

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'web-ext',
    environmentOptions: {
      'web-ext': {
        path: './dist',
        compiler: false,
        autoLaunch: true,
        extensionId: '',
        detectExtensionId: true,
        detectTimeout: 15_000,
        targetUrl: 'https://www.example.com',
        playwright: {
          slowMo: 100,
          headless: false,
          userDataDir: false,
          devtools: false,
        },
      },
    },
  },
})
```

| Option | Default | Description |
| --- | --- | --- |
| `path` | – (required) | Directory containing the extension manifest |
| `compiler` | `false` | Shell command executed before tests run. Runs once per worker process (Vitest instantiates the environment for every test file; repeated runs in the same process are skipped). For a single build per run, prefer building in a `globalSetup` or a pretest script |
| `autoLaunch` | `true` | Load and launch the browser + extension during environment setup |
| `extensionId` | – | Explicit extension id; skips detection entirely when set. Useful for offline environments or extensions without a service worker (e.g. Manifest V2) |
| `detectExtensionId` | `true` | Detect the extension id by opening a tab at `targetUrl`. Disable for offline/air-gapped environments, when `getPopupPage()` / `getSidePanelPage()` are not used, or when `extensionId` is set |
| `detectTimeout` | `15000` | Max time in ms spent detecting the extension id |
| `targetUrl` | `'https://www.example.com'` | URL opened while detecting the id; the tab is closed automatically |
| `playwright.slowMo` | `100` | Slow down Playwright operations (ms) |
| `playwright.headless` | `false` | Run without a visible window. The default headless shell cannot load extensions, so this keeps the full Chromium binary via Playwright's `chromium` channel (Playwright >= 1.49). |
| `playwright.userDataDir` | `false` | Browser profile directory; `true` uses a per-test-file profile under `path.join(process.cwd(), '.vitest-web-ext-cache')` so parallel test files never share a Chromium profile; `false` gives every launch a fresh temporary profile |
| `playwright.devtools` | `false` | Auto-open DevTools for tabs |
