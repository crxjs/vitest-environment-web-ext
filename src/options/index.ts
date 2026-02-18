import type { EnvironmentOptions } from 'vitest/node'
import type { WebExtEnvironmentOptions } from './types'

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
  }

  return Object.assign({}, defaultOptions, options)
}
