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
| `path` | – (required) | Extension directory or `.crx`/`.xpi` file |
| `compiler` | `false` | Shell command executed before tests run |
| `autoLaunch` | `true` | Load and launch the browser + extension during environment setup |
| `detectExtensionId` | `true` | Detect the extension id by opening a tab at `targetUrl`. Disable for offline/air-gapped environments or when `getPopupPage()` / `getSidePanelPage()` are not used. |
| `detectTimeout` | `15000` | Max time in ms spent detecting the extension id |
| `targetUrl` | `'https://www.example.com'` | URL opened while detecting the id; the tab is closed automatically |
| `playwright.slowMo` | `100` | Slow down Playwright operations (ms) |
| `playwright.headless` | `false` | Run without a visible window. Chromium's default headless shell cannot load extensions, so this uses the full browser binary in its new headless mode (`--headless=new`, requires Chromium >= 112). |
| `playwright.userDataDir` | `false` | Browser profile directory; `true` uses a shared cache dir under `process.cwd()`, `false` gives every launch a fresh temporary profile |
| `playwright.devtools` | `false` | Auto-open DevTools for tabs |
