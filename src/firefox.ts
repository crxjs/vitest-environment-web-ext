import { execFileSync } from 'node:child_process'
import { createRequire, findPackageJSON } from 'node:module'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { firefox } from '@playwright/test'

let preparation: Promise<void> | undefined

/** Prepare the pinned Playwright/Firefox installation even with --ignore-scripts. */
export function prepareFirefox(): Promise<void> {
  return preparation ??= (async () => {
    const manifest = findPackageJSON('@openpolyfill/firefox-addon-playwright-harness', import.meta.url)
    if (!manifest)
      throw new Error('OpenPolyfill package was not found')
    execFileSync(process.execPath, [resolve(dirname(manifest), 'scripts/patch-closed-shadow-selectors.mjs')], { stdio: 'inherit' })
    const { ensureFirefoxPatched } = await import('@openpolyfill/firefox-addon-playwright-harness')
    await ensureFirefoxPatched()
  })().catch((error) => {
    preparation = undefined
    throw error
  })
}

/** Install the Firefox revision used by this library, never a shared playwright bin. */
export function installFirefox(args: string[] = []): void {
  const require = createRequire(import.meta.url)
  const cli = resolve(dirname(require.resolve('@playwright/test/package.json')), 'cli.js')
  execFileSync(process.execPath, [cli, 'install', 'firefox', ...args], { stdio: 'inherit' })
}

export function getFirefoxInfo() {
  const require = createRequire(import.meta.url)
  return { executablePath: firefox.executablePath(), playwright: require('@playwright/test/package.json').version as string }
}
