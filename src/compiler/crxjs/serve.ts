import type { Plugin } from 'vite'
import fs from 'fs-extra'
import { join } from 'pathe'
import { createServer } from 'vite'

/**
 * Creates a development server for a Chrome extension (CRX) using Vite with the crx plugin.
 *
 * @param root - The root directory of the project to serve
 * @param configFile - The Vite configuration file name, defaults to 'vite.config.ts'
 * @param port - The port number for the development server, defaults to 5200
 * @returns An object containing server information including the output directory, Vite server instance, resolved config, and root path
 */
export async function serveCRX(root: string, configFile = 'vite.config.ts', port = 5200) {
  const cacheDir = join(root, '.vite-build')
  const outDir = join(root, 'dist-build')
  await fs.remove(cacheDir)
  await fs.remove(outDir)

  const plugins: Plugin[] = [
    // @ts-expect-error we're going to override this from the vite config
    crx(null),
  ]

  const server = await createServer({
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
    server: {
      port,
      hmr: true,
      watch: {
        // cache dir should not trigger update in these tests
        ignored: [cacheDir],
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100,
      },
    },
  })

  await server.listen()

  return {
    command: 'serve',
    outDir,
    server,
    config: server.config,
    root,
  }
}
