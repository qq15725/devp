import { Buffer } from 'buffer'
import consola from 'consola'
import WebSocket from 'ws'
import { parseHeaders, readStream } from '../utils'
import { request } from './request'
import type { Context } from '../types'
import type { IncomingMessage, ServerResponse } from 'node:http'

export async function httpOnRequest(
  this: { ctx: Context },
  req: InstanceType<typeof IncomingMessage>,
  rep: InstanceType<typeof ServerResponse> & { req: InstanceType<typeof IncomingMessage> },
) {
  let url = req.url ?? ''
  if (!url.startsWith('http')) {
    url = `https://${ req.headers.host }${ url }`
  }
  consola.info(`${ req.method }: ${ url }`)
  const reqData = await readStream(req)
  const reqHeaders = parseHeaders(req.rawHeaders)
  const proxyed = await request({
    url,
    method: req.method,
    data: reqData,
    headers: reqHeaders,
  })
  const output = await readStream(proxyed)
  const repHeaders = parseHeaders(proxyed.rawHeaders)
  const transferEncoding = repHeaders['transfer-encoding'] || repHeaders['Transfer-Encoding'] || ''
  const contentLength = repHeaders['content-length'] || repHeaders['Content-Length']
  const connection = repHeaders.Connection || repHeaders.connection
  if (contentLength) {
    delete repHeaders['content-length']
    delete repHeaders['Content-Length']
  }
  if (connection) {
    repHeaders['x-origin-connection'] = connection
    delete repHeaders.connection
    delete repHeaders.Connection
  }
  if (transferEncoding !== 'chunked') {
    repHeaders['Content-Length'] = Buffer.byteLength(output)
  }
  rep.writeHead(proxyed.statusCode ?? 404, repHeaders)
  rep.end(output)

  this.ctx.websocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        time: new Date().getTime(),
        url,
        method: req.method,
        status: proxyed.statusCode,
        data: reqData.toString(),
      }))
    }
  })
}
