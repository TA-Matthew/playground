/**
 * Product highlight — optional concise intro above highlight rows (`phConciseSummary`).
 */

export const PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY = 'phConciseSummary'

/** Default on so Expedia layouts keep the intro paragraph unless facilitators turn it off. */
export const DEFAULT_PRODUCT_HIGHLIGHT_CONCISE_SUMMARY = true

export const PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_TEXT =
  "Skip-the-line group tour of the Vatican Museums, Sistine Chapel, and St. Peter's Basilica with an expert guide. About three hours; admission and mobile tickets included."

export function parseProductHighlightConciseSummary(v: string | null): boolean {
  if (v === '0' || v === 'false') return false
  if (v === '1' || v === 'true') return true
  return DEFAULT_PRODUCT_HIGHLIGHT_CONCISE_SUMMARY
}
