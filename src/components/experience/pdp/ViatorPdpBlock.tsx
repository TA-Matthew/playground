/**
 * Logistics PDP top: Figma (Q2) layout with real Viator / Tripadvisor listing data.
 * @see FigmaViatorPdpBlock
 */
import type { ProductHighlightIconStyleId } from '../../../data/productHighlightIconStyles'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { AvailabilityMetaDisplayId } from '../../../data/availabilityShortcutMeta'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
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
  /** Availability shortcut — desktop “Upcoming availability” section. */
  showUpcomingAvailability?: boolean
  availabilityMetaDisplay?: AvailabilityMetaDisplayId
  availabilityOptionsOpen?: boolean
  availabilityOptionsLoading?: boolean
  selectedAvailabilityOptionId?: string
  travelerCounts?: AvailabilityTravelerCounts
  onTravelerCountsChange?: (counts: AvailabilityTravelerCounts) => void
  travelers?: number
  dateLabel?: string
  onDateLabelChange?: (dateLabel: string) => void
  onSelectAvailabilityOption?: (optionId: string) => void
  onOpenAvailabilityOptions?: (optionId: string) => void
}

export function ViatorPdpBlock({
  booking,
  productHighlightLayoutId,
  productHighlightIconStyleId,
  productHighlightConciseSummary,
  productHighlightTopProduct,
  hideBookAheadMobile,
  showUpcomingAvailability,
  availabilityMetaDisplay,
  availabilityOptionsOpen,
  availabilityOptionsLoading,
  selectedAvailabilityOptionId,
  travelerCounts,
  onTravelerCountsChange,
  travelers,
  dateLabel,
  onDateLabelChange,
  onSelectAvailabilityOption,
  onOpenAvailabilityOptions,
}: ViatorPdpBlockProps) {
  return (
    <FigmaViatorPdpBlock
      booking={booking}
      productHighlightLayoutId={productHighlightLayoutId}
      productHighlightIconStyleId={productHighlightIconStyleId}
      productHighlightConciseSummary={productHighlightConciseSummary}
      productHighlightTopProduct={productHighlightTopProduct}
      hideBookAheadMobile={hideBookAheadMobile}
      showUpcomingAvailability={showUpcomingAvailability}
      availabilityMetaDisplay={availabilityMetaDisplay}
      availabilityOptionsOpen={availabilityOptionsOpen}
      availabilityOptionsLoading={availabilityOptionsLoading}
      selectedAvailabilityOptionId={selectedAvailabilityOptionId}
      travelerCounts={travelerCounts}
      onTravelerCountsChange={onTravelerCountsChange}
      travelers={travelers}
      dateLabel={dateLabel}
      onDateLabelChange={onDateLabelChange}
      onSelectAvailabilityOption={onSelectAvailabilityOption}
      onOpenAvailabilityOptions={onOpenAvailabilityOptions}
    />
  )
}
