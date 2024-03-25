import net from 'node:net'
import consola from 'consola'
import type { Context } from './types'
import type { IncomingMessage, ServerResponse } from 'node:http'

export async function handleConnect(this: { ctx: Context }, req: IncomingMessage, rep: ServerResponse) {
  consola.info(`${ req.method }: ${ req.url }`)
  const [rawHost, _rawPort] = req.url!.split(':')
  const rawPort = Number((Number(_rawPort) === 80) ? 443 : _rawPort)
  let host: string
  let port: number
  if (this.ctx.intercept) {
    host = '127.0.0.1'
    port = this.ctx.httpsProxyPort
  } else {
    host = rawHost
    port = rawPort
  }
  rep.on('error', (err) => consola.error(`Failed to https connect ${ req.method } ${ req.url }`, err))
  rep.write(`HTTP/${ req.httpVersion } 200 OK\r\n\r\n`, 'utf-8', () => {
    const conn = net.connect(port, host)
      .on('connect', () => {
        rep.pipe(conn)
        conn.pipe(rep)
      })
      .on('error', e => consola.error('Failed to tcp connect', e))
  })
}
