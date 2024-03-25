import path from 'node:path'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import type { Readable } from 'stream'

export function parseHeaders(rawHeaders?: Array<any>): Record<string, any> {
  const result: Record<string, any> = {}
  const _handleSetCookie = (key: any, value: any): void => {
    if (result[key].constructor === Array) {
      result[key].push(value)
    } else {
      result[key] = [result[key], value]
    }
  }
  if (rawHeaders) {
    for (let i = 0; i < rawHeaders.length; i += 2) {
      const key = rawHeaders[i]
      let value = rawHeaders[i + 1]
      if (typeof value === 'string') {
        value = value.replace(/\0+$/g, '')
      }

      if (!result[key]) {
        result[key] = value
      } else {
        if (key.toLowerCase() === 'set-cookie') {
          _handleSetCookie(key, value)
        } else {
          result[key] = `${ result[key] },${ value }`
        }
      }
    }
  }
  return result
}

export function getIpAddresses(): Array<string> {
  const addresses = new Set<string>()
  const interfaces = os.networkInterfaces()
  for (const key in interfaces) {
    interfaces[key]?.forEach(v => {
      if (!v.internal && v.family === 'IPv4') {
        addresses.add(v.address)
      }
    })
  }
  return Array.from(addresses)
}

export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, () => {
      const address = server.address()
      if (!address || typeof address !== 'object') {
        return reject(new Error('Failed to address'))
      }
      server.close(() => resolve(address.port))
    })
  })
}

export function readStream(readable: Readable): Promise<Buffer> {
  return new Promise(resolve => {
    const chunks: Array<any> = []
    readable.on('data', (chunk) => chunks.push(chunk))
    readable.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export function getUserHome(): string {
  return (process.env.HOME || process.env.USERPROFILE) as string
}

export function getLibHome(): string {
  const home = path.join(getUserHome(), '/.devp/')
  if (!fs.existsSync(home)) {
    fs.mkdirSync(home)
  }
  return home
}

export function getLibPath(pathName: string): string {
  const targetPath = path.join(getLibHome(), pathName)
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath)
  }
  return targetPath
}
