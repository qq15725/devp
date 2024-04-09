import { Server } from 'ws'
import consola from 'consola'
import { websocketOnConnection } from './websocket-on-connection'
import type { ServerOptions } from 'ws'

export function createWebsocketProxy(options: ServerOptions, connection = websocketOnConnection) {
  return new Server(options)
    .on('error', e => consola.error('error happened in proxy websocket:', e))
    .on('close', () => consola.error('closing the ws server'))
    .on('connection', connection)
    .on('headers', headers => headers.push('x-websocket:true'))
}
