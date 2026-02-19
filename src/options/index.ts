import type { EnvironmentOptions } from 'vitest/node'
import type { WebExtEnvironmentOptions } from './types'
import process from 'node:process'
import { deepMerge } from '@antfu/utils'
import path from 'pathe'

function validateOptions(options: EnvironmentOptions['web-ext']) {
  if (!options?.path) {
    throw new Error(
      `The 'web-ext' environment option 'path' is required. `
      + `Please configure it in your vitest config:\n`
      + `  web-ext: { path: './path/to/extension' }`,
    )
  }
}

export function resolveOptions(options: EnvironmentOptions['web-ext']): WebExtEnvironmentOptions {
  validateOptions(options)

  const defaultOptions: Partial<WebExtEnvironmentOptions> = {
    compiler: false,
    autoLaunch: true,
    playwright: {
      browser: 'chromium',
      headless: true,
      slowMo: 100,
      cacheDir: path.join(process.cwd(), './.vitest-web-ext-cache'),
    },
  }

  return deepMerge(defaultOptions, options ?? {}) as WebExtEnvironmentOptions
}
