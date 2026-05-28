import {
  PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY,
} from '../data/productHighlightConciseSummary'
import {
  PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY,
} from '../data/productHighlightTopProduct'
import {
  PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY,
  type ProductHighlightIconStyleId,
} from '../data/productHighlightIconStyles'
import {
  PRODUCT_HIGHLIGHT_LAYOUT_QUERY,
  type ProductHighlightLayoutId,
} from '../data/productHighlightLayouts'
import type { VariantId } from '../data/variants'

export const SHARE_SIG_QUERY = 'sig'
export const SHARE_EXP_QUERY = 'exp'

export type ShareDurationId = '1m' | '1d' | '7d' | '14d'

export const SHARE_DURATION_PRESETS: ReadonlyArray<{
  id: ShareDurationId
  label: string
  durationMs: number
}> = [
  { id: '1m', label: '1 minute (test)', durationMs: 60 * 1000 },
  { id: '1d', label: '1 day', durationMs: 24 * 60 * 60 * 1000 },
  { id: '7d', label: '1 week', durationMs: 7 * 24 * 60 * 60 * 1000 },
  { id: '14d', label: '2 weeks', durationMs: 14 * 24 * 60 * 60 * 1000 },
]

export type ParticipantLinkExtras = {
  highlightLayoutId?: ProductHighlightLayoutId
  highlightIconStyleId?: ProductHighlightIconStyleId
  highlightConciseSummary?: boolean
  highlightTopProduct?: boolean
}

export function hasShareSignature(searchParams: URLSearchParams): boolean {
  return searchParams.has(SHARE_SIG_QUERY)
}

export function parseShareExpiry(searchParams: URLSearchParams): Date | null {
  const raw = searchParams.get(SHARE_EXP_QUERY)
  if (!raw) return null
  const exp = Number(raw)
  if (!Number.isFinite(exp)) return null
  return new Date(exp * 1000)
}

/** Query params for a participant link (unsigned). */
export function buildParticipantParams(
  variant: VariantId,
  extras?: ParticipantLinkExtras,
): Record<string, string> {
  const params: Record<string, string> = {
    hideUi: '1',
    variant,
  }
  if (extras?.highlightLayoutId != null) {
    params[PRODUCT_HIGHLIGHT_LAYOUT_QUERY] = extras.highlightLayoutId
  }
  if (extras?.highlightIconStyleId != null) {
    params[PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY] = extras.highlightIconStyleId
  }
  if (extras?.highlightConciseSummary === true) {
    params[PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY] = '1'
  }
  if (extras?.highlightTopProduct === true) {
    params[PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY] = '1'
  }
  return params
}

export type CreateShareResponse = {
  url: string
  expiresAt: string
}

export type VerifyShareResponse = {
  valid: boolean
  expired: boolean
  invalidSignature: boolean
  expiresAt: string | null
}

export async function createExpiringParticipantUrl(
  path: string,
  params: Record<string, string>,
  durationMs: number,
): Promise<CreateShareResponse> {
  const res = await fetch('/api/share/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, params, durationMs }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? `Failed to create link (${res.status})`)
  }
  return res.json() as Promise<CreateShareResponse>
}

export async function verifyShareLink(
  path: string,
  searchParams: URLSearchParams,
): Promise<VerifyShareResponse> {
  const verifyUrl = new URL('/api/share/verify', window.location.origin)
  verifyUrl.searchParams.set('path', path)
  for (const [key, value] of searchParams.entries()) {
    verifyUrl.searchParams.set(key, value)
  }
  const res = await fetch(verifyUrl.toString())
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? `Failed to verify link (${res.status})`)
  }
  return res.json() as Promise<VerifyShareResponse>
}

export function formatShareExpiry(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
