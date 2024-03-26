import { Server } from 'ws'
import consola from 'consola'
import { handleWebsocketConnection } from '../handle-websocket-connection'
import type { ServerOptions } from 'ws'

export function createWebsocketProxy(options: ServerOptions, connection = handleWebsocketConnection) {
  return new Server(options)
    .on('connection', connection)
    .on('headers', headers => headers.push('x-websocket:true'))
    .on('close', () => consola.error('closing the ws server'))
    .on('error', e => consola.error('error happened in proxy websocket:', e))
}
