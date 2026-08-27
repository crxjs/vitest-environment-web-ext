import type { WebExtEnvironmentOptions } from '@/options/types'
import { spawn } from 'node:child_process'

// Vitest instantiates the environment for every test file. When a worker
// process is reused across files (`pool: 'threads'`), skip re-running the
// same build command instead of compiling once per file.
const compiledCommands = new Set<string>()

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

  if (compiledCommands.has(compiler))
    return
  compiledCommands.add(compiler)

  // Run through the shell so `compiler` behaves like a real shell command
  // (quotes, env vars, `&&`, pipes, paths with spaces). Inherit stdio so
  // build logs and errors are visible instead of being swallowed.
  await new Promise<void>((resolve, reject) => {
    const child = spawn(compiler, { stdio: 'inherit', shell: true })

    child.once('error', (error) => {
      reject(new Error(`Compilation failed: ${error.message}`))
    })

    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(
          signal
            ? `Compilation terminated by signal ${signal}`
            : `Compilation failed with exit code ${code}`,
        ))
      }
    })
  })
}
