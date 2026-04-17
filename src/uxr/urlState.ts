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
  return v === 'b' ? 'b' : 'a'
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
 */
export function buildParticipantUrl(variant: VariantId): string {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('variant', variant)
  url.searchParams.set('hideUi', '1')
  return url.toString()
}
