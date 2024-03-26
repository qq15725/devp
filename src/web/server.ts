import fs from 'node:fs'
import path from 'node:path'
import Koa from 'koa'
import Router from 'koa-router'
import { caCertPath } from '../cert'

export function createWebServer(port: number) {
  const router = new Router()
    .get('/ca', async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Content-Type', 'application/x-x509-ca-cert')
      ctx.set('Content-Disposition', 'attachment; filename="rootCA.crt"')
      ctx.body = fs.readFileSync(caCertPath)
      next()
    })
    .get('/', async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Content-Type', 'text/html;charset=utf-8')
      ctx.body = fs.readFileSync(path.join(__dirname, '../../web/index.html'))
      next()
    })

  return new Koa()
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port)
}
