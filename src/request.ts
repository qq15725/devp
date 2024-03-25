import { URL } from 'node:url'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import consola from 'consola'
import type { IncomingMessage, OutgoingHttpHeaders } from 'http'

export interface RequestOptions {
  url: string
  method?: string
  data?: any
  headers?: OutgoingHttpHeaders
}

export function request(options: RequestOptions): Promise<IncomingMessage> {
  return new Promise(resolve => {
    const {
      url,
      method = 'GET',
      data,
      headers,
    } = options
    const isHttps = url.startsWith('https')
    const { hostname, port, pathname } = new URL(url)
    if (headers) {
      delete headers['content-length'] // will reset the content-length after rule
      delete headers['Content-Length']
      delete headers['Transfer-Encoding']
      delete headers['transfer-encoding']
    }
    (isHttps ? httpsRequest : httpRequest)({
      hostname: (hostname || headers!.host) as string,
      port: port || (isHttps ? 443 : 80),
      path: pathname,
      method,
      headers,
    }, resolve).on('error', error => {
      consola.error(`Failed to request ${ method } ${ url }`, error)
    }).end(data)
  })
}
