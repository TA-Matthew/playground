/**
 * Product highlight — “Top product” first row with gold trophy (Figma 21501:113572).
 * @see https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=21501-113572
 */

export const PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY = 'phTopProduct'

export const DEFAULT_PRODUCT_HIGHLIGHT_TOP_PRODUCT = false

export const TOP_PRODUCT_HIGHLIGHT_COPY = {
  title: 'Top 1% of experiences',
  subtext: 'Ranked among the absolute best experiences based on travelers reviews.',
} as const

export const TOP_PRODUCT_TROPHY_SRC = '/figma-assets/product-highlight-trophy.png'

export function parseProductHighlightTopProduct(v: string | null): boolean {
  if (v === '1' || v === 'true') return true
  if (v === '0' || v === 'false') return false
  return DEFAULT_PRODUCT_HIGHLIGHT_TOP_PRODUCT
}
