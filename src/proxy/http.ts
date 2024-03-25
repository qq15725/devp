import http from 'node:http'
import { handleRequest } from '../handle-request'
import { handleConnect } from '../handle-connect'
import type { Server } from 'node:http'

export async function createHttpProxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer()
    server
      .on('request', handleRequest)
      .on('connect', handleConnect)
      .on('listening', () => resolve(server))
      .on('error', e => reject(e))
      .listen(port)
  })
}
