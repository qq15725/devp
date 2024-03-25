import path from 'node:path'
import fs from 'fs'
import { md, pki } from 'node-forge'
import consola from 'consola'
import { getLibPath } from './utils'

const defaultAttrs = [
  { name: 'countryName', value: 'CN' },
  { name: 'organizationName', value: 'Devp' },
  { shortName: 'ST', value: 'SH' },
  { shortName: 'OU', value: 'Devp SSL' },
]

function getExtensionSAN(domain = '') {
  if (/^\d+?\.\d+?\.\d+?\.\d+?$/.test(domain)) {
    return {
      name: 'subjectAltName',
      altNames: [{ type: 7, ip: domain }],
    }
  } else {
    return {
      name: 'subjectAltName',
      altNames: [{ type: 2, value: domain }],
    }
  }
}

function getKeysAndCert(serialNumber = `${ Math.floor(Math.random() * 100000) }`) {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = serialNumber
  const now = Date.now()
  // compatible with apple's updated cert policy: https://support.apple.com/en-us/HT210176
  cert.validity.notBefore = new Date(now - 24 * 60 * 60 * 1000) // 1 day before
  cert.validity.notAfter = new Date(now + 824 * 24 * 60 * 60 * 1000) // 824 days after
  return {
    keys,
    cert,
  }
}

function createRootCA(commonName = 'CertManager') {
  const { keys, cert } = getKeysAndCert()
  const attrs = defaultAttrs.concat([{
    name: 'commonName',
    value: commonName,
  }])
  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    // { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
    // { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
    // { name: 'nsCertType', client: true, server: true, email: true, objsign: true, sslCA: true, emailCA: true, objCA: true },
    // { name: 'subjectKeyIdentifier' }
  ])
  cert.sign(keys.privateKey, md.sha256.create())
  return {
    privateKey: pki.privateKeyToPem(keys.privateKey),
    publicKey: pki.publicKeyToPem(keys.publicKey),
    certificate: pki.certificateToPem(cert),
  }
}

function createCertificate(domain: string, rootCA: any) {
  const md5 = md.md5.create()
  md5.update(domain)
  const { keys, cert } = getKeysAndCert(md5.digest().toHex())
  const caCert = pki.certificateFromPem(rootCA.cert)
  const caKey = pki.privateKeyFromPem(rootCA.key)
  cert.setIssuer(caCert.subject.attributes)
  cert.setSubject(defaultAttrs.concat([{
    name: 'commonName',
    value: domain,
  }]))
  cert.setExtensions([{ name: 'basicConstraints', cA: false }, getExtensionSAN(domain)])
  cert.sign(caKey, md.sha256.create())
  return {
    privateKey: pki.privateKeyToPem(keys.privateKey),
    publicKey: pki.publicKeyToPem(keys.publicKey),
    certificate: pki.certificateToPem(cert),
  }
}

export const certDir = getLibPath('certificates')
export const caCertPath = path.join(certDir, 'rootCA.crt')
export const caKeyPath = path.join(certDir, 'rootCA.key')

let cert
let key
export function getRootCa() {
  return {
    cert: cert ??= fs.readFileSync(caCertPath, { encoding: 'utf8' }),
    key: key ??= fs.readFileSync(caKeyPath, { encoding: 'utf8' }),
  }
}

let rootCAExists = false
export function checkRootCA() {
  if (rootCAExists) return true
  if (!(fs.existsSync(caCertPath) && fs.existsSync(caKeyPath))) {
    console.warn('can not find rootCA.crt or rootCA.key')
    console.warn('you may generate one')
    return false
  } else {
    rootCAExists = true
    return true
  }
}

export function generateRootCA(commonName: string) {
  return new Promise(resolve => {
    if (!fs.existsSync(caCertPath) || !fs.existsSync(caKeyPath)) {
      consola.success('temp certs cleared')
      const { certificate, privateKey } = createRootCA(commonName)
      fs.writeFileSync(caCertPath, certificate)
      fs.writeFileSync(caKeyPath, privateKey)
      consola.success('rootCA generated')
      consola.success(`PLEASE TRUST the rootCA.crt in ${ certDir }`)
    }
    resolve({ keyPath: caKeyPath, certPath: caCertPath })
  })
}

export function getCertificate(hostname: string): Promise<{ key: string | Buffer; cert: string | Buffer }> {
  return new Promise((resolve, reject) => {
    if (!checkRootCA()) {
      return reject(new Error('please generate root CA before getting certificate for sub-domains'))
    }
    const keyPath = path.join(certDir, `${ hostname }.key`)
    const crtPath = path.join(certDir, `${ hostname }.crt`)
    const { cert, key } = getRootCa()
    if (!fs.existsSync(keyPath) || !fs.existsSync(crtPath)) {
      const { privateKey, certificate } = createCertificate(hostname, { cert, key })
      fs.writeFileSync(keyPath, privateKey)
      fs.writeFileSync(crtPath, certificate)
      resolve({ key: privateKey, cert: certificate })
    } else {
      resolve({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(crtPath) })
    }
  })
}
