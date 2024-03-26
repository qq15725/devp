import { createServer } from 'node:http'
import { handleHttpRequest } from '../handle-http-request'
import { handleHttpConnect } from '../handle-http-connect'
import type { Server } from 'node:http'

export async function createHttpProxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer()

    server
      .on('request', handleHttpRequest)
      .on('connect', handleHttpConnect)
      .on('listening', () => resolve(server))
      .on('error', e => reject(e))
      .listen(port)
  })
}
