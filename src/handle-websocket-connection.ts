import type { WebSocket } from 'ws'
import type { IncomingMessage } from 'http'

export function handleWebsocketConnection<
  T extends typeof WebSocket = typeof WebSocket,
  U extends typeof IncomingMessage = typeof IncomingMessage,
>(_socket: InstanceType<T>, _request: InstanceType<U>) {
  //
}
