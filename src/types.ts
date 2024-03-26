import type { Server as HttpServer } from 'node:http'
import type { Server as WebsocketServer } from 'ws'
import type { Server as HttpsServer } from 'node:https'
import type { Server as TcpServer } from 'node:net'

export interface Context {
  // web
  httpServer: HttpServer
  httpServerPort: number
  websocketServer: WebsocketServer
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
