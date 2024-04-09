import { createServer } from 'node:net'
import consola from 'consola'
import { Client } from 'ssh2'
import socks from 'socksv5'
import { parseProxyChain } from './parse-proxy-chain'
import type { Socket } from 'net'

export function createTunnel(source: string): void {
  const [first, ...chain] = parseProxyChain(source)
  createServer(async socket => {
    let currentSocket: any = socket
    for (let i = 0; i < chain.length; i++) {
      const current = chain[i]
      const next = chain[i + 1]
      switch (current.type) {
        case 'socks5': {
          await new Promise<void>(resolve => {
            socks.connect({
              host: next.host,
              port: next.port,
              proxyHost: current.host,
              proxyPort: current.port,
              auths: [socks.auth.None()],
            }, (stream: Socket) => {
              consola.log(current, next)
              currentSocket = stream
              resolve()
            })
          })
          break
        }
        case 'ssh': {
          await new Promise<void>(resolve => {
            const conn = new Client()
              .on('ready', () => {
                conn.forwardOut(
                  currentSocket.localAddress!, currentSocket.localPort!,
                  next.host, next.port,
                  (err, stream) => {
                    if (err) throw err
                    consola.log(current, next)
                    currentSocket = stream
                    resolve()
                  },
                )
              })
              .connect({
                sock: currentSocket,
              })
          })
          break
        }
      }
    }
    socket.pipe(currentSocket).pipe(socket)
  }).listen(first.port)
}
