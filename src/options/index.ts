import type { WebExtEnvironmentOptions, WebExtEnvironmentUserOptions } from './types'
import process from 'node:process'
import { deepMerge } from '@antfu/utils'
import path from 'pathe'

function validateOptions(options?: WebExtEnvironmentUserOptions) {
  if (!options?.path) {
    throw new Error(
      `The 'web-ext' environment option 'path' is required. `
      + `Please configure it in your vitest config:\n`
      + `  web-ext: { path: './path/to/extension' }`,
    )
  }
}

/**
 * Removes `undefined` values recursively so `deepMerge` keeps the default
 * when a user explicitly passes `undefined` for an option.
 */
function omitUndefined<T>(value: T): T {
  if (Array.isArray(value))
    return value.map(item => omitUndefined(item)) as T
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined)
        result[key] = omitUndefined(item)
    }
    return result as T
  }
  return value
}

/**
 * Stable per-test-file key for the default user-data cache directory.
 *
 * Reads Vitest's internal worker state (the same source `getWorkerState`
 * uses); falls back to `default` when unavailable, e.g. outside a worker.
 */
function getProfileKey(): string {
  const filepath = (globalThis as typeof globalThis & { __vitest_worker__?: { filepath?: string } })
    .__vitest_worker__
    ?.filepath
  if (!filepath)
    return 'default'
  return path.basename(filepath, path.extname(filepath)) || 'default'
}

export function resolveOptions(options?: WebExtEnvironmentUserOptions): WebExtEnvironmentOptions {
  validateOptions(options)

  const defaultUserDataDir = path.join(process.cwd(), './.vitest-web-ext-cache')

  const defaultOptions: Partial<WebExtEnvironmentUserOptions> = {
    compiler: false,
    autoLaunch: true,
    extensionId: '',
    detectExtensionId: true,
    detectTimeout: 15_000,
    targetUrl: 'https://www.example.com',
    playwright: {
      // browser: 'chromium',
      slowMo: 100,
      headless: false,
      userDataDir: false,
      devtools: false,
    },
  }

  const resolved = deepMerge(defaultOptions, omitUndefined(options ?? {})) as WebExtEnvironmentOptions

  if (resolved.playwright?.userDataDir === true) {
    // Chromium forbids two browser instances sharing a user data directory,
    // and Vitest runs test files in parallel by default — so each test file
    // gets its own profile under the cache root. Repeat runs of the same
    // file still reuse it.
    resolved.playwright.userDataDir = path.join(defaultUserDataDir, getProfileKey())
  }
  if (resolved.playwright?.userDataDir === false) {
    resolved.playwright.userDataDir = ''
  }

  return resolved
}

export type { WebExtEnvironmentOptions, WebExtEnvironmentUserOptions } from './types'
