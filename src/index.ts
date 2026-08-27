import type { Environment } from 'vitest/environments'
import type { EnvironmentOptions } from 'vitest/node'
import { WebExtBrowser } from './browser'
import { compileWebExt } from './compiler'
import { resolveOptions } from './options'

class WebExtEnvironment implements Environment {
  name = 'web-ext'
  // vitest >= 3
  declare viteEnvironment: 'ssr'
  // vitest < 3 validates this property when loading custom environments;
  // harmless to newer versions that only read viteEnvironment
  declare transformMode: 'web' | 'ssr'
  async setup(global: Record<string, unknown>, options: EnvironmentOptions) {
    const webExtOptions = resolveOptions(options['web-ext'])

    await compileWebExt(webExtOptions.compiler)

    const browser = new WebExtBrowser(webExtOptions)

    if (webExtOptions.autoLaunch) {
      await browser.launch()
    }

    global.browser = browser
    // expose the context lazily so `autoLaunch: false` users can read it
    // after calling launch() themselves, instead of crashing here
    Object.defineProperty(global, 'context', {
      configurable: true,
      get: () => browser.context,
    })

    return {
      teardown: () => {
        browser.close()
      },
    }
  }
}

const webExtEnvironment = new WebExtEnvironment()
export default webExtEnvironment
export { WebExtBrowser }
