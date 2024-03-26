import { createServer } from 'node:https'
import constants from 'node:constants'
import tls from 'node:tls'
import { getCertificate } from '../cert'
import { handleHttpRequest } from '../handle-http-request'
import { handleHttpConnect } from '../handle-http-connect'
import type { Server } from 'node:https'

export async function createHttpsProxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer({
      secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_TLSv1,
      SNICallback: async (serverName, cb) => {
        const { key, cert } = await getCertificate(serverName)
        cb(null, tls.createSecureContext({ key, cert }))
      },
    })

    server
      .on('request', handleHttpRequest)
      .on('connect', handleHttpConnect)
      .on('listening', () => resolve(server))
      .on('error', e => reject(e))
      .listen(port)
  })
}
