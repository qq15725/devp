import process from 'node:process'
import { cac } from 'cac'
import consola from 'consola'
import { bin, version } from '../package.json'
import { generateRootCA } from './cert'
import { createHttpProxy, createHttpsProxy, createWebsocketProxy } from './server'
import { getIpAddresses } from './utils'
import type { Context, Options } from './types'

export function createCli(_options: Options) {
  const cli = cac(Object.keys(bin)[0])

  cli
    .command('ca')
    .action(() => {
      generateRootCA('NetProxy')
    })

  cli
    .command('')
    .option('-p, --port <port>', 'port')
    .option('-i, --intercept', 'intercept')
    .action(async (options) => {
      const { port = 8001, intercept } = options

      getIpAddresses().forEach(ip => consola.info(`Network: ${ ip }`))

      const httpServerPort = port + 2

      process.env.NITRO_PORT = httpServerPort
      import('@netproxy/web')

      const ctx = {
        // httpServer,
        httpServerPort,
        // websocketServer,
        intercept,
        httpProxyPort: port,
        httpsProxyPort: port + 1,
      } as Context

      try {
        ctx.httpProxy = await createHttpProxy(ctx.httpProxyPort)
        ;(ctx.httpProxy as any).ctx = ctx
        createWebsocketProxy({ server: ctx.httpProxy })
        consola.info(`Proxy http port: ${ ctx.httpProxyPort }`)
      } catch (e) {
        consola.error('Failed to proxy http server', e)
      }

      try {
        ctx.httpsProxy = await createHttpsProxy(ctx.httpsProxyPort)
        ;(ctx.httpsProxy as any).ctx = ctx
        await createWebsocketProxy({ server: ctx.httpsProxy })
        consola.info(`Proxy https port: ${ ctx.httpsProxyPort }`)
      } catch (e) {
        consola.error('Failed to proxy https server', e)
      }
    })

  cli
    .help()
    .version(version)
    .parse(process.argv, { run: false })

  return cli
}
