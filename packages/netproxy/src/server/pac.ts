import type { Context } from '../types'

// TODO
export function generatePac(this: { ctx: Context }) {
  return `function FindProxyForURL(url, host) {
    if (host == "TODO") {
        return "DIRECT";
    } else {
        return "PROXY 127.0.0.1:${ this.ctx.httpProxyPort }";
    }
}`
}
