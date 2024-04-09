import { createServer } from 'node:http'
import { httpOnRequest } from './http-on-request'
import { httpOnConnect } from './http-on-connect'
import type { Server } from 'node:http'

export async function createHttpProxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer()

    server
      .on('error', e => reject(e))
      .on('listening', () => resolve(server))
      .on('connect', httpOnConnect)
      .on('request', httpOnRequest)
      .listen(port)
  })
}
