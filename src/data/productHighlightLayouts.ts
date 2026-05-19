/**
 * Product highlight PDP — layout / UI chrome (columns, icon rail).
 */

export const PRODUCT_HIGHLIGHT_LAYOUT_QUERY = 'phLayout'

export type ProductHighlightLayoutId =
  | 'headout-grid'
  | 'headout-expedia-rail'
  | 'headout-viator-rail'
  | 'expedia-split'
  | 'expedia-klook-labels'
  | 'expedia-viator-rail'

/** Highlight grid chrome family (facilitator tabs). */
export type ProductHighlightBase = 'headout' | 'expedia'

/** Quick-facts presentation (facilitator icon-rail tabs). */
export type ProductHighlightIconRail = 'klook' | 'expedia' | 'viator'

export type ProductHighlightLayoutOptions = {
  base: ProductHighlightBase
  iconRail: ProductHighlightIconRail
}

export type ProductHighlightLayoutMeta = {
  id: ProductHighlightLayoutId
  facilitatorLabel: string
  /** Reference / inspiration for facilitators */
  reference: string
}

const LAYOUT_IDS: ProductHighlightLayoutId[] = [
  'headout-grid',
  'headout-expedia-rail',
  'headout-viator-rail',
  'expedia-split',
  'expedia-klook-labels',
  'expedia-viator-rail',
]

export const DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT: ProductHighlightLayoutId = 'expedia-split'

export function isProductHighlightLayoutId(v: string): v is ProductHighlightLayoutId {
  return (LAYOUT_IDS as readonly string[]).includes(v)
}

export function parseProductHighlightLayoutOptions(
  id: ProductHighlightLayoutId,
): ProductHighlightLayoutOptions {
  switch (id) {
    case 'headout-expedia-rail':
      return { base: 'headout', iconRail: 'expedia' }
    case 'headout-viator-rail':
      return { base: 'headout', iconRail: 'viator' }
    case 'expedia-split':
      return { base: 'expedia', iconRail: 'expedia' }
    case 'expedia-klook-labels':
      return { base: 'expedia', iconRail: 'klook' }
    case 'expedia-viator-rail':
      return { base: 'expedia', iconRail: 'viator' }
    case 'headout-grid':
      return { base: 'headout', iconRail: 'klook' }
  }
}

/** Maps facilitator base + icon-rail tab to a stored `phLayout` id. */
export function productHighlightLayoutFromOptions(
  base: ProductHighlightBase,
  iconRail: ProductHighlightIconRail,
): ProductHighlightLayoutId {
  if (base === 'headout') {
    if (iconRail === 'expedia') return 'headout-expedia-rail'
    if (iconRail === 'viator') return 'headout-viator-rail'
    return 'headout-grid'
  }
  if (iconRail === 'klook') return 'expedia-klook-labels'
  if (iconRail === 'viator') return 'expedia-viator-rail'
  return 'expedia-split'
}

export const PRODUCT_HIGHLIGHT_LAYOUTS: ProductHighlightLayoutMeta[] = [
  {
    id: 'headout-grid',
    facilitatorLabel: 'Headout with Klook label',
    reference: 'Two-column grid, light outlined icon tiles, airy spacing.',
  },
  {
    id: 'headout-expedia-rail',
    facilitatorLabel: 'Headout + Expedia rail',
    reference: 'Headout two-column highlight grid, then Expedia 2-col quick-facts grid in-section.',
  },
  {
    id: 'headout-viator-rail',
    facilitatorLabel: 'Headout + Viator rail',
    reference: 'Headout two-column highlight grid; default standalone Viator icon rail below.',
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
  {
    id: 'expedia-viator-rail',
    facilitatorLabel: 'Expedia + Viator rail',
    reference: 'Expedia highlight rows; default standalone Viator icon rail below.',
  },
]
