import net from 'node:net'
import consola from 'consola'
import type { Duplex } from 'node:stream'
import type { Context } from './types'
import type { IncomingMessage } from 'node:http'

export async function handleHttpConnect(
  this: { ctx: Context },
  req: InstanceType<typeof IncomingMessage>,
  socket: Duplex,
  _head: Buffer,
) {
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
  socket
    .on('error', (err) => consola.error(`Failed to connect ${ req.url }`, err))
    .write(`HTTP/${ req.httpVersion } 200 OK\r\n\r\n`, 'utf-8', () => {
      const conn = net.connect(port, host)
        .on('connect', () => {
          socket.pipe(conn)
          conn.pipe(socket)
        })
        .on('error', e => consola.error('Failed to tcp', e))
    })
}
