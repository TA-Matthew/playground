/**
 * Product highlight icon wells — Grey / Outline (Figma 21601:124897–124930) / Large (32px, no well).
 */

export const PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY = 'phIconStyle'

export type ProductHighlightIconStyleId = 'grey' | 'outline' | 'large'

const STYLE_IDS: ProductHighlightIconStyleId[] = ['grey', 'outline', 'large']

export const DEFAULT_PRODUCT_HIGHLIGHT_ICON_STYLE: ProductHighlightIconStyleId = 'large'

export function isProductHighlightIconStyleId(v: string): v is ProductHighlightIconStyleId {
  return (STYLE_IDS as readonly string[]).includes(v)
}

export function parseProductHighlightIconStyle(v: string | null): ProductHighlightIconStyleId {
  if (v && isProductHighlightIconStyleId(v)) return v
  return DEFAULT_PRODUCT_HIGHLIGHT_ICON_STYLE
}

export function isLargeProductHighlightIconStyle(style: ProductHighlightIconStyleId): boolean {
  return style === 'large'
}

/** Tailwind classes for 48×48 wells (Figma `radius/l`, `space/150`). Large has no well. */
export function highlightIconWellClassName(style: ProductHighlightIconStyleId): string {
  switch (style) {
    case 'grey':
      return 'bg-[#f5f5f5]'
    case 'large':
      return ''
    case 'outline':
    default:
      return 'border border-[#d9d9d9] bg-white'
  }
}

/** Outer icon container — 48×48 well, or bare 32px slot for Large. */
export function highlightIconWellWrapperClassName(style: ProductHighlightIconStyleId): string {
  if (isLargeProductHighlightIconStyle(style)) {
    return 'flex shrink-0 items-start'
  }
  return `box-border flex size-12 shrink-0 items-center justify-center rounded-xl ${highlightIconWellClassName(style)}`
}

/** Line icon / trophy graphic size inside the well. */
export function highlightIconGraphicClassName(style: ProductHighlightIconStyleId): string {
  return isLargeProductHighlightIconStyle(style)
    ? 'size-8 shrink-0 text-stone-900'
    : 'size-6 shrink-0 text-stone-900'
}

/** Copy block beside the icon — Large drops top padding for optical alignment. */
export function highlightItemCopyClassName(style: ProductHighlightIconStyleId): string {
  return isLargeProductHighlightIconStyle(style) ? 'min-w-0' : 'min-w-0 pt-0.5'
}
