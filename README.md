# [WIP] vitest-environment-web-ext

A Vitest environment for end-to-end testing browser extensions with Playwright.

## Features

- E2E testing for Chrome extensions
- Supports MV3 manifest versions
- TypeScript ready

## Installation

```bash
pnpm add -D vitest-environment-web-ext
```

## Quick Start

// vitest.config.ts
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'web-ext',
  },
})
```
