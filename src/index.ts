import type { Environment } from 'vitest/environments'
import type { EnvironmentOptions } from 'vitest/node'
import { WebExtBrowser } from './browser'
import { compileWebExt } from './compiler'
import { resolveOptions } from './options'

class WebExtEnvironment implements Environment {
  name = 'web-ext'
  viteEnvironment = 'ssr'
  async setup(global: Record<string, unknown>, options: EnvironmentOptions) {
    const webExtOptions = resolveOptions(options['web-ext'])

    await compileWebExt(webExtOptions.compiler)

    const browser = new WebExtBrowser(webExtOptions.playwright)

    if (webExtOptions.autoLaunch) {
      browser.loadWebExt(webExtOptions.path)
      await browser.launch()
    }

    global.browser = browser
    global.context = browser.context

    return {
      teardown: async () => {
        browser.close()
      },
    }
  }
}

const webExtEnvironment = new WebExtEnvironment()
export default webExtEnvironment
export { WebExtBrowser }
