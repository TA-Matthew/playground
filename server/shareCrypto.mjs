import { createHmac, timingSafeEqual } from 'node:crypto'

/** Sorted query string for signing (excludes `sig`). */
export function canonicalQuery(params) {
  return Object.entries(params)
    .filter(([key]) => key !== 'sig')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

export function signShareLink(path, params, secret) {
  const payload = `${path}?${canonicalQuery(params)}`
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function verifyShareLink(path, params, secret) {
  const sig = params.sig
  const expRaw = params.exp
  if (!sig || !expRaw) {
    return { valid: false, expired: false, expiresAt: null }
  }

  const exp = Number(expRaw)
  if (!Number.isFinite(exp)) {
    return { valid: false, expired: false, expiresAt: null }
  }

  const expiresAt = new Date(exp * 1000).toISOString()
  const nowSec = Math.floor(Date.now() / 1000)
  const expired = exp <= nowSec

  const { sig: _removed, ...paramsToSign } = params
  const expected = signShareLink(path, paramsToSign, secret)
  const signatureValid = safeEqual(sig, expected)

  return {
    valid: signatureValid && !expired,
    expired: signatureValid && expired,
    invalidSignature: !signatureValid,
    expiresAt,
  }
}
