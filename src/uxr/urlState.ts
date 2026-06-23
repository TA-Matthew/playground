import {
  AVAILABILITY_COMMERCE_QUERY,
  parseAvailabilityCommerceMode,
  type AvailabilityCommerceModeId,
} from '../data/availabilityShortcutCommerce'
import {
  parseProductHighlightConciseSummary,
  PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY,
} from '../data/productHighlightConciseSummary'
import {
  parseProductHighlightTopProduct,
  PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY,
} from '../data/productHighlightTopProduct'
import {
  isProductHighlightIconStyleId,
  parseProductHighlightIconStyle,
  PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY,
  type ProductHighlightIconStyleId,
} from '../data/productHighlightIconStyles'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT,
  isProductHighlightLayoutId,
  PRODUCT_HIGHLIGHT_LAYOUT_QUERY,
  type ProductHighlightLayoutId,
} from '../data/productHighlightLayouts'
import type { VariantId } from '../data/variants'

export { hasShareSignature, parseShareExpiry, SHARE_EXP_QUERY, SHARE_SIG_QUERY } from './shareLink'

/** Session-only: facilitator unlocked controls while URL stays participant-safe (hideUi=1). */
export const FACILITATOR_UNLOCK_KEY = 'uxr_facilitator_unlock'

export function readFacilitatorUnlock(): boolean {
  try {
    return sessionStorage.getItem(FACILITATOR_UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export function setFacilitatorUnlock(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(FACILITATOR_UNLOCK_KEY, '1')
    else sessionStorage.removeItem(FACILITATOR_UNLOCK_KEY)
  } catch {
    /* ignore */
  }
}

export function parseHideUi(searchParams: URLSearchParams): boolean {
  return searchParams.get('hideUi') === '1'
}

export function parseVariant(searchParams: URLSearchParams): VariantId {
  const v = searchParams.get('variant')
  if (v === 'a2') return 'a2'
  if (v === 'b') return 'b'
  if (v === 'b2') return 'b2'
  if (v === 'c') return 'c'
  if (v === 'c2') return 'c2'
  if (v === 'd2') return 'd2'
  return 'a'
}

/** Product highlight — `phLayout` query; invalid or missing → default chrome. */
export function parseHighlightLayout(searchParams: URLSearchParams): ProductHighlightLayoutId {
  const v = searchParams.get(PRODUCT_HIGHLIGHT_LAYOUT_QUERY)
  /** Legacy `phLayout` values removed from the experiment. */
  if (
    v === 'airbnb-trust' ||
    v === 'ggy-list' ||
    v === 'viator-cards' ||
    v === 'compact-strip' ||
    v === 'withlocals-merged'
  ) {
    return DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT
  }
  if (v && isProductHighlightLayoutId(v)) return v
  return DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT
}

/** Product highlight — `phIconStyle` query; invalid or missing → default (`large`). */
export function parseHighlightIconStyle(searchParams: URLSearchParams): ProductHighlightIconStyleId {
  return parseProductHighlightIconStyle(searchParams.get(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY))
}

export function parseHighlightConciseSummary(searchParams: URLSearchParams): boolean {
  return parseProductHighlightConciseSummary(searchParams.get(PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY))
}

export function parseHighlightTopProduct(searchParams: URLSearchParams): boolean {
  return parseProductHighlightTopProduct(searchParams.get(PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY))
}

export function parseAvailabilityCommerceModeFromUrl(
  searchParams: URLSearchParams,
): AvailabilityCommerceModeId {
  return parseAvailabilityCommerceMode(searchParams.get(AVAILABILITY_COMMERCE_QUERY))
}

export { isProductHighlightIconStyleId }

/** Whether facilitator chrome (variant switcher, etc.) should show for this URL + session. */
export function shouldShowFacilitatorChrome(
  hideUi: boolean,
  facilitatorUnlocked: boolean,
): boolean {
  if (!hideUi) return true
  return facilitatorUnlocked
}

/**
 * Participant-safe share link: always includes hideUi=1 and current variant.
 * (Copies URL text — not a screenshot.)
 * On the product-highlight route, pass `highlightLayoutId` so `phLayout` is preserved on the shared URL.
 */
export function buildParticipantUrl(
  variant: VariantId,
  extras?: {
    highlightLayoutId?: ProductHighlightLayoutId
    highlightIconStyleId?: ProductHighlightIconStyleId
    highlightConciseSummary?: boolean
    highlightTopProduct?: boolean
  },
): string {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('variant', variant)
  url.searchParams.set('hideUi', '1')
  if (extras?.highlightLayoutId != null) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_LAYOUT_QUERY, extras.highlightLayoutId)
  }
  if (extras?.highlightIconStyleId != null) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY, extras.highlightIconStyleId)
  }
  if (extras?.highlightConciseSummary === true) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY, '1')
  }
  if (extras?.highlightTopProduct === true) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY, '1')
  }
  return url.toString()
}
