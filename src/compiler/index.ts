import type { WebExtEnvironmentOptions } from '@/options/types'
import { exec } from 'tinyexec'

/**
 * Compiles a web extension using the specified compiler command.
 * @param compiler - The compiler command to use for compilation.
 * @returns A Promise that resolves when the compilation is successful.
 * @throws An Error if the compilation fails.
 */
export async function compileWebExt(compiler: WebExtEnvironmentOptions['compiler']) {
  if (!compiler) {
    return
  }

  try {
    const command = compiler.trim().split(/\s+/)
    const { exitCode } = await exec(command[0], command.slice(1))
    if (exitCode !== 0) {
      throw new Error(`Compilation failed with exit code ${exitCode}`)
    }
  }
  catch (error) {
    throw new Error(`Compilation failed: ${error instanceof Error ? error.message : error}`)
  }
}
