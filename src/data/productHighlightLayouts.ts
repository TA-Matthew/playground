/**
 * Product highlight PDP — layout / UI chrome (orthogonal to copy preset `phSet`).
 */

export const PRODUCT_HIGHLIGHT_LAYOUT_QUERY = 'phLayout'

export type ProductHighlightLayoutId =
  | 'viator-cards'
  | 'ggy-list'
  | 'headout-grid'
  | 'compact-strip'
  | 'expedia-split'
  | 'withlocals-merged'

export type ProductHighlightLayoutMeta = {
  id: ProductHighlightLayoutId
  facilitatorLabel: string
  /** Reference / inspiration for facilitators */
  reference: string
}

const LAYOUT_IDS: ProductHighlightLayoutId[] = [
  'viator-cards',
  'ggy-list',
  'headout-grid',
  'compact-strip',
  'expedia-split',
  'withlocals-merged',
]

export const DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT: ProductHighlightLayoutId = 'viator-cards'

export function isProductHighlightLayoutId(v: string): v is ProductHighlightLayoutId {
  return (LAYOUT_IDS as readonly string[]).includes(v)
}

export const PRODUCT_HIGHLIGHT_LAYOUTS: ProductHighlightLayoutMeta[] = [
  {
    id: 'viator-cards',
    facilitatorLabel: 'Viator cards',
    reference: 'Emerald icon wells + bordered cards (current PDP-adjacent).',
  },
  {
    id: 'ggy-list',
    facilitatorLabel: 'Airbnb trust',
    reference: 'Three highlight rows with filled icons and light dividers (no hero band).',
  },
  {
    id: 'headout-grid',
    facilitatorLabel: 'Headout grid',
    reference: 'Two-column grid, light outlined icon tiles, airy spacing.',
  },
  {
    id: 'compact-strip',
    facilitatorLabel: 'Compact strip',
    reference: 'Dense three-column strip — titles emphasized, subtext one line.',
  },
  {
    id: 'expedia-split',
    facilitatorLabel: 'Expedia-style',
    reference: '“Highlights” stack with round icon wells, then “About this property” 2-col line-icon rail from listing quick facts.',
  },
  {
    id: 'withlocals-merged',
    facilitatorLabel: 'Withlocals merged',
    reference: 'Single block: listing quick facts (2-col) + highlight rows with the same icon + label rhythm.',
  },
]
