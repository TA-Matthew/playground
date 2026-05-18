import {
  DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT,
  isProductHighlightLayoutId,
  PRODUCT_HIGHLIGHT_LAYOUT_QUERY,
  type ProductHighlightLayoutId,
} from '../data/productHighlightLayouts'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_SET,
  isProductHighlightSetId,
  PRODUCT_HIGHLIGHT_SET_QUERY,
  type ProductHighlightSetId,
} from '../data/productHighlightSets'
import type { VariantId } from '../data/variants'

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

/** Product highlight experiment — `phSet` query; invalid or missing → default balanced set. */
export function parseHighlightSet(searchParams: URLSearchParams): ProductHighlightSetId {
  const v = searchParams.get(PRODUCT_HIGHLIGHT_SET_QUERY)
  if (v && isProductHighlightSetId(v)) return v
  return DEFAULT_PRODUCT_HIGHLIGHT_SET
}

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
 * On the product-highlight route, pass `highlightSetId` / `highlightLayoutId` so `phSet` / `phLayout`
 * are preserved on the shared URL.
 */
export function buildParticipantUrl(
  variant: VariantId,
  extras?: {
    highlightSetId?: ProductHighlightSetId
    highlightLayoutId?: ProductHighlightLayoutId
  },
): string {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('variant', variant)
  url.searchParams.set('hideUi', '1')
  if (extras?.highlightSetId != null) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_SET_QUERY, extras.highlightSetId)
  }
  if (extras?.highlightLayoutId != null) {
    url.searchParams.set(PRODUCT_HIGHLIGHT_LAYOUT_QUERY, extras.highlightLayoutId)
  }
  return url.toString()
}
