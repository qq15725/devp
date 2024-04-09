import fs from 'node:fs'
import path from 'node:path'

export function getUserHome(): string {
  return (process.env.HOME || process.env.USERPROFILE) as string
}

export function getLibHome(): string {
  const home = path.join(getUserHome(), '/.netproxy/')
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

export const certDir = getLibPath('certificates')
export const rootCACrtPath = path.join(certDir, 'rootCA.crt')
export const rootCAKeyPath = path.join(certDir, 'rootCA.key')
