import type { Server as HttpServer } from 'node:http'
import type { Server as HttpsServer } from 'node:https'
import type { Server as TcpServer } from 'node:net'

export interface Context {
  // http
  httpProxy: HttpServer
  httpProxyPort: number
  // https
  intercept: boolean
  httpsProxy: HttpsServer
  httpsProxyPort: number
  // socket5
  socket5Proxy: TcpServer
  socket5ProxyPort: number
}

export interface Options {
  cwd: string
}
