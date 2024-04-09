export type ProxyChainType = 'socks5' | 'ssh' | 'tcp'

export interface ProxyChainNode {
  type: ProxyChainType
  host: string
  port: number
}
