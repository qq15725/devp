import fs from 'node:fs'
import { rootCACrtPath } from '@netproxy/shared'

export default defineEventHandler(async (event) => {
  if (!fs.existsSync(rootCACrtPath)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'rootCA.crt not found',
    })
  }
  event.node.res.setHeader('Access-Control-Allow-Origin', '*')
  event.node.res.setHeader('Content-Type', 'application/x-x509-ca-cert')
  event.node.res.setHeader('Content-Disposition', 'attachment; filename="rootCA.crt"')
  return fs.readFileSync(rootCACrtPath)
})
