import type { Environment } from 'vitest/environments'
import type { EnvironmentOptions } from 'vitest/node'
import { WebExtBrowser } from './browser'
import { compileWebExt } from './compiler'
import { resolveOptions } from './options'

class WebExtEnvironment implements Environment {
  name = 'web-ext'
  // vitest >= 3 uses `viteEnvironment` for module transforms. This must be a
  // real runtime property: `declare` fields are erased at compile time and the
  // runner would fall back to the environment name ('web-ext'), which is not a
  // registered Vite environment.
  viteEnvironment = 'ssr' as const
  // vitest 0.34 – 3.x validates `transformMode` strictly when loading custom
  // environments; newer versions only warn about it.
  transformMode = 'ssr' as const
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
