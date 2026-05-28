import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { signShareLink, verifyShareLink } from './shareCrypto.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

loadEnvFile()

const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 3000

function getShareSecrets() {
  return {
    shareLinkSecret: process.env.SHARE_LINK_SECRET,
    shareCreateKey: process.env.SHARE_CREATE_KEY,
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function getOrigin(req) {
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, '')
  }
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`
  return `${proto}://${host}`
}

function isAuthorizedCreate(req) {
  const { shareCreateKey } = getShareSecrets()
  if (!shareCreateKey) return true
  const auth = req.headers.authorization
  return auth === `Bearer ${shareCreateKey}`
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function handleCreate(req, res, body) {
  const { shareLinkSecret } = getShareSecrets()
  if (!shareLinkSecret) {
    json(res, 503, { error: 'SHARE_LINK_SECRET is not configured' })
    return
  }
  if (!isAuthorizedCreate(req)) {
    json(res, 401, { error: 'Unauthorized' })
    return
  }

  const { path: linkPath, params, durationMs } = body ?? {}
  if (typeof linkPath !== 'string' || !linkPath.startsWith('/') || typeof params !== 'object' || params == null) {
    json(res, 400, { error: 'Invalid path or params' })
    return
  }

  const duration = Number(durationMs)
  if (!Number.isFinite(duration) || duration <= 0) {
    json(res, 400, { error: 'Invalid durationMs' })
    return
  }

  const stringParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    stringParams[key] = String(value)
  }

  const exp = Math.floor((Date.now() + duration) / 1000)
  const paramsWithExp = { ...stringParams, exp: String(exp) }
  const sig = signShareLink(linkPath, paramsWithExp, shareLinkSecret)
  const signedParams = { ...paramsWithExp, sig }

  const url = new URL(linkPath, getOrigin(req))
  for (const [key, value] of Object.entries(signedParams)) {
    url.searchParams.set(key, value)
  }

  json(res, 200, {
    url: url.toString(),
    expiresAt: new Date(exp * 1000).toISOString(),
  })
}

function handleVerify(req, res, url) {
  const { shareLinkSecret } = getShareSecrets()
  if (!shareLinkSecret) {
    json(res, 503, { error: 'SHARE_LINK_SECRET is not configured' })
    return
  }

  const linkPath = url.searchParams.get('path')
  if (!linkPath || !linkPath.startsWith('/')) {
    json(res, 400, { error: 'Missing path' })
    return
  }

  const params = {}
  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'path') continue
    params[key] = value
  }

  const result = verifyShareLink(linkPath, params, shareLinkSecret)
  json(res, 200, {
    valid: result.valid,
    expired: result.expired,
    invalidSignature: result.invalidSignature ?? false,
    expiresAt: result.expiresAt,
  })
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
}

async function serveStatic(req, res, url) {
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname
  const resolved = path.normalize(path.join(DIST_DIR, filePath))
  if (!resolved.startsWith(DIST_DIR)) {
    res.writeHead(403)
    res.end()
    return
  }

  let target = resolved
  if (!existsSync(target) || url.pathname === '/') {
    target = path.join(DIST_DIR, 'index.html')
  }

  try {
    const data = await readFile(target)
    const ext = path.extname(target)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  if (req.method === 'POST' && url.pathname === '/api/share/create') {
    const body = await readBody(req)
    handleCreate(req, res, body)
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/share/verify') {
    handleVerify(req, res, url)
    return
  }

  if (req.method === 'GET') {
    await serveStatic(req, res, url)
    return
  }

  res.writeHead(405)
  res.end()
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
  if (!getShareSecrets().shareLinkSecret) {
    console.warn('WARN: SHARE_LINK_SECRET is not set — share API will return 503')
  }
})
