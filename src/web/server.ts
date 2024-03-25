import fs from 'fs'
import Koa from 'koa'
import Router from 'koa-router'
import { caCertPath } from '../cert'

export function createWebServer(port: number) {
  const app = new Koa()
  const router = new Router()
  app.use(router.routes())
  app.use(router.allowedMethods())
  router
    .get('/', async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Content-Type', 'application/x-x509-ca-cert')
      ctx.set('Content-Disposition', 'attachment; filename="rootCA.crt"')
      ctx.body = fs.readFileSync(caCertPath)
      next()
    })
  app.listen(port)
}
