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

  const defaultUserDataDir = path.join(process.cwd(), './.vitest-web-ext-cache')

  const defaultOptions: Partial<WebExtEnvironmentOptions> = {
    compiler: false,
    autoLaunch: true,
    targetUrl: 'https://www.example.com',
    playwright: {
      // browser: 'chromium',
      slowMo: 100,
      userDataDir: false,
    },
  }

  const resolved = deepMerge(defaultOptions, options ?? {}) as WebExtEnvironmentOptions

  if (resolved.playwright?.userDataDir === true) {
    resolved.playwright.userDataDir = defaultUserDataDir
  }
  if (resolved.playwright?.userDataDir === false) {
    resolved.playwright.userDataDir = ''
  }

  return resolved
}
