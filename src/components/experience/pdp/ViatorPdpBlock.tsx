/**
 * Logistics PDP top: Figma (Q2) layout with real Viator / Tripadvisor listing data.
 * @see FigmaViatorPdpBlock
 */
import type { ProductHighlightIconStyleId } from '../../../data/productHighlightIconStyles'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { BookingContent } from '../../../data/variants'
import { FigmaViatorPdpBlock } from './FigmaViatorPdpBlock'

export type ViatorPdpBlockProps = {
  booking: BookingContent
  productHighlightLayoutId?: ProductHighlightLayoutId | null
  productHighlightIconStyleId?: ProductHighlightIconStyleId | null
  productHighlightConciseSummary?: boolean | null
  productHighlightTopProduct?: boolean | null
  /** Facilitator-only: hide the book-ahead row on mobile. */
  hideBookAheadMobile?: boolean
}

export function ViatorPdpBlock({
  booking,
  productHighlightLayoutId,
  productHighlightIconStyleId,
  productHighlightConciseSummary,
  productHighlightTopProduct,
  hideBookAheadMobile,
}: ViatorPdpBlockProps) {
  return (
    <FigmaViatorPdpBlock
      booking={booking}
      productHighlightLayoutId={productHighlightLayoutId}
      productHighlightIconStyleId={productHighlightIconStyleId}
      productHighlightConciseSummary={productHighlightConciseSummary}
      productHighlightTopProduct={productHighlightTopProduct}
      hideBookAheadMobile={hideBookAheadMobile}
    />
  )
}
