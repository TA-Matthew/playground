/**
 * Logistics PDP top: Figma (Q2) layout with real Viator / Tripadvisor listing data.
 * @see FigmaViatorPdpBlock
 */
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { ProductHighlightSetId } from '../../../data/productHighlightSets'
import type { BookingContent } from '../../../data/variants'
import { FigmaViatorPdpBlock } from './FigmaViatorPdpBlock'

export type ViatorPdpBlockProps = {
  booking: BookingContent
  productHighlightSetId?: ProductHighlightSetId | null
  productHighlightLayoutId?: ProductHighlightLayoutId | null
}

export function ViatorPdpBlock({ booking, productHighlightSetId, productHighlightLayoutId }: ViatorPdpBlockProps) {
  return (
    <FigmaViatorPdpBlock
      booking={booking}
      productHighlightSetId={productHighlightSetId}
      productHighlightLayoutId={productHighlightLayoutId}
    />
  )
}
