import type { Plugin, ResolvedConfig } from 'vite'
import { join } from 'pathe'
import { build } from 'vite'

/**
 * Builds a Chrome extension (CRX) using Vite with the crx plugin.
 *
 * @param root - The root directory of the project to build
 * @param configFile - The Vite configuration file name, defaults to 'vite.config.ts'
 * @returns An object containing build information including the output directory, build output, resolved config, and root path
 */
export async function buildCRX(root: string, configFile = 'vite.config.ts') {
  const cacheDir = join(root, '.vite-build')
  const outDir = join(root, 'dist-build')
  let config: ResolvedConfig

  const plugins: Plugin[] = [
    // @ts-expect-error we're going to override this from the vite config
    crx(null),
    {
      name: 'test:get-config',
      configResolved(_config) {
        config = _config
      },
    },
  ]

  const output = await build({
    root,
    configFile: join(root, configFile),
    envFile: false,
    build: {
      outDir,
      minify: false,
    },
    cacheDir,
    plugins,
    clearScreen: false,
    logLevel: 'error',
  })

  return {
    command: 'build',
    outDir,
    output,
    config: config!,
    root,
  }
}
