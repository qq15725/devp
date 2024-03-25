import https from 'node:https'
import constants from 'node:constants'
import tls from 'node:tls'
import { getCertificate } from '../cert'
import { handleRequest } from '../handle-request'
import { handleConnect } from '../handle-connect'
import type { Server } from 'node:https'

export async function createHttpsProxy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = https.createServer({
      secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_TLSv1,
      SNICallback: async (serverName, cb) => {
        const { key, cert } = await getCertificate(serverName)
        cb(null, tls.createSecureContext({ key, cert }))
      },
    })
    server
      .on('request', handleRequest)
      .on('connect', handleConnect)
      .on('listening', () => resolve(server))
      .on('error', e => reject(e))
      .listen(port)
  })
}
