/**
 * Product highlight PDP — layout / UI chrome (orthogonal to copy preset `phSet`).
 */

export const PRODUCT_HIGHLIGHT_LAYOUT_QUERY = 'phLayout'

export type ProductHighlightLayoutId = 'headout-grid' | 'expedia-split' | 'expedia-klook-labels'

export type ProductHighlightLayoutMeta = {
  id: ProductHighlightLayoutId
  facilitatorLabel: string
  /** Reference / inspiration for facilitators */
  reference: string
}

const LAYOUT_IDS: ProductHighlightLayoutId[] = ['headout-grid', 'expedia-split', 'expedia-klook-labels']

export const DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT: ProductHighlightLayoutId = 'headout-grid'

export function isProductHighlightLayoutId(v: string): v is ProductHighlightLayoutId {
  return (LAYOUT_IDS as readonly string[]).includes(v)
}

export const PRODUCT_HIGHLIGHT_LAYOUTS: ProductHighlightLayoutMeta[] = [
  {
    id: 'headout-grid',
    facilitatorLabel: 'Headout with Klook label',
    reference: 'Two-column grid, light outlined icon tiles, airy spacing.',
  },
  {
    id: 'expedia-split',
    facilitatorLabel: 'Expedia-style',
    reference: 'Highlight rows with round icon wells, then 2-col quick-facts grid (no section header).',
  },
  {
    id: 'expedia-klook-labels',
    facilitatorLabel: 'Expedia + Klook labels',
    reference:
      'Same Expedia summary + highlight rows; quick facts as Klook-style pills under the title (no in-section facts grid).',
  },
]
