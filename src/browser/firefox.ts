import type { Worker } from 'playwright'
import type { WebExtEnvironmentOptions } from '../options'
import { launchFirefoxExtension, RdpEvaluation } from '@openpolyfill/firefox-addon-playwright-harness'
import { prepareFirefox } from '../firefox'

export async function launchFirefox(path: string, options: WebExtEnvironmentOptions['playwright']) {
  await prepareFirefox()
  const running = await launchFirefoxExtension({
    extensionPath: path,
    headless: options.headless,
    launchOptions: { slowMo: options.slowMo },
  })
  let background = running.extension.background as RdpEvaluation | undefined
  let ready = Promise.resolve()
  let backgroundURL: string | undefined
  const onPacket = (packet: { type?: string, target?: { url?: string, consoleActor?: string } }) => {
    const target = packet.target
    if (packet.type !== 'target-available-form' || !backgroundURL || target?.url !== backgroundURL || !target.consoleActor)
      return
    background?.dispose()
    const actor = running.rdp.actor(target.consoleActor)
    background = new RdpEvaluation(running.rdp, actor)
    ready = actor.call('startListeners', { listeners: ['evaluationResult'] }).then(() => undefined)
    ready.catch(() => undefined)
  }
  try {
    backgroundURL = await background?.evaluate<string>('location.href')
    // The add-on id is not the moz-extension UUID. Query Firefox's registry so
    // page-only extensions work without needing a background or network probe.
    const process = await running.rdp.root.getProcess(0)
    const reply = await process.call('getTarget') as unknown as { process?: { consoleActor: string }, consoleActor: string }
    const parent = new RdpEvaluation(running.rdp, running.rdp.actor((reply.process ?? reply).consoleActor))
    let extensionURL: string
    try {
      extensionURL = await parent.evaluate<string>(`(() => {
        const { ExtensionParent } = ChromeUtils.importESModule('resource://gre/modules/ExtensionParent.sys.mjs')
        return ExtensionParent.GlobalManager.extensionMap.get(${JSON.stringify(running.extension.id)}).baseURI.spec
      })()`)
    }
    finally {
      parent.dispose()
    }
    running.rdp.on('packet', onPacket)
    const worker: Pick<Worker, 'evaluate' | 'url'> | undefined = background && {
      evaluate: (async (fn: Parameters<RdpEvaluation['evaluate']>[0], arg?: unknown) => {
        await ready
        // Never replay a call that may already have mutated the old target.
        return background!.evaluate(fn, [arg])
      }) as Worker['evaluate'],
      url: () => backgroundURL!,
    }
    let closed = false
    return {
      context: running.context,
      extensionURL,
      background: worker,
      close: async () => {
        if (closed)
          return
        closed = true
        running.rdp.off('packet', onPacket)
        background?.dispose()
        await running.close()
      },
    }
  }
  catch (error) {
    background?.dispose()
    await running.close()
    throw error
  }
}
