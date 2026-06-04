/** Facilitator-only: show/hide the book-ahead label on mobile (session storage). */
export const BOOK_AHEAD_MOBILE_KEY = 'uxr_book_ahead_mobile'

export function readBookAheadMobile(): boolean {
  try {
    const v = sessionStorage.getItem(BOOK_AHEAD_MOBILE_KEY)
    if (v === '0') return false
    return true
  } catch {
    return true
  }
}

export function setBookAheadMobile(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.removeItem(BOOK_AHEAD_MOBILE_KEY)
    else sessionStorage.setItem(BOOK_AHEAD_MOBILE_KEY, '0')
  } catch {
    /* ignore */
  }
}
