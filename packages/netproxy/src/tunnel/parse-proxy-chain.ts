import { URL } from 'node:url'
import type { ProxyChainNode } from './interfaces'

/**
 * @example
 *
 * :8888 > socks5://127.0.0.1:1086 > ssh://jump > host:port
 *
 * @param source
 */
export function parseProxyChain(source: string): Array<ProxyChainNode> {
  return source
    .split('>')
    .map(input => {
      input = input.trim()
      if (!input.includes('://')) input = `tcp://${ input }`
      const url = new URL(input)
      let protocol = url.protocol
      protocol = protocol.substring(0, protocol.length - 1)
      return {
        type: protocol,
        host: url.hostname,
        port: Number(url.port),
      } as ProxyChainNode
    })
    .filter(url => /socks5|ssh|tcp/.test(url.type))
}
