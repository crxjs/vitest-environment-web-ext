# vitest-environment-web-ext

A Vitest environment for end-to-end testing browser extensions with Playwright.

## [Document](https://crxjs.dev/guide/test/installation)

## Features

- E2E testing for Chromium and Firefox extensions
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
          browser: 'chromium', // or 'firefox'
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

## Firefox

Use Node.js 22.14 or newer. Firefox support uses OpenPolyfill 0.3.0 with
Playwright 1.64.1. Install the matching Firefox and apply its required patches:

```sh
pnpm exec web-ext-firefox install --with-deps
```

This command resolves this library's pinned Playwright CLI, even when another
Playwright version owns the shared `playwright` executable. It works after
`pnpm install --ignore-scripts`. `web-ext-firefox prepare` reapplies preparation
without downloading; `browser.launch()` also prepares Firefox automatically.
Preparation patches the cached Playwright Firefox resources and selector bundle,
not system Firefox. Chromium does not load or prepare the Firefox adapter.

```ts
const environmentOptions = {
  'web-ext': {
    path: './dist',
    autoLaunch: false, // useful when each test builds its own fixture
    playwright: { browser: 'firefox', headless: true, slowMo: 0 },
  },
}
```

```ts
await browser.launch('./dist')
const popup = await browser.getPopupPage()
const url = await browser.getExtensionURL('options.html')
const background = await browser.getBackground()
const name = await background?.evaluate(() => chrome.runtime.getManifest().name)
await browser.close()
```

`WebExtBrowser` is also exported for use without the Vitest environment; its
constructor accepts the same partial user options, with `path` required.
`getExtensionURL()` and popup helpers use the installed Firefox UUID, including
for extensions without a background. `getExtensionId()` returns that URL host,
not the manifest add-on ID. `getBackground()` returns `undefined` when Firefox
has no background; in Chromium it waits for a declared service worker (optional
timeout), or returns `undefined` when no worker is declared.

A background exposes `evaluate(functionOrExpression, serializableArgument?)`
and `url()`. Firefox uses an RDP background document rather than a service
worker. A retained handle follows replacement background actors after runtime
reload. Calls already sent to the old actor may reject and are never replayed:
the caller owns any retry decision for potentially mutating evaluations.
Playwright JSHandles and DOM handles are not supported by the Firefox evaluator.
`getServiceWorker()` remains the Chromium-only API.

Firefox profiles, debugger ports, temporary add-on installation, RDP listeners
and browser cleanup belong to the library. `close()` is idempotent, environment
teardown calls it automatically, and an instance can launch again after closing.
`launch()` waits for pending cleanup, and concurrent `close()` calls await the
same cleanup operation so an old close cannot clear a replacement context.
Firefox rejects Chromium-only `userDataDir`, `devtools` and `executablePath`
options rather than silently ignoring them. `playwright.executablePath` remains
available for Chromium consumers that install their own Chromium binary.

When testing build tools, keep Vitest's Vite dependency separate from the Vite
version under test. The environment is tested on Vitest 3 and 4; consumers can
retain their own Vite 3/6/7/8 dependency for fixture builds while Vitest resolves
its compatible Vite internally. Avoid overriding all Vite versions globally.

### Validation

```sh
pnpm build
pnpm exec web-ext-firefox install --with-deps
node node_modules/playwright/cli.js install --with-deps --no-shell chromium
pnpm test
pnpm typecheck
pnpm lint
```

The suite includes real headless Firefox tests for installation, page-only
extensions, reload, failed launch recovery and custom Vitest environment setup,
as well as a Chromium background/popup lifecycle test.
