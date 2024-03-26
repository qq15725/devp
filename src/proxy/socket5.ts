import { createServer } from 'node:net'
import type { Server } from 'node:net'

// TODO
export async function createSocket5Proxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server
      .on('listening', () => resolve(server))
      .on('error', e => reject(e))
      .listen(port)
  })
}
