/**
 * Logistics PDP top: Figma (Q2) layout with real Viator / Tripadvisor listing data.
 * @see FigmaViatorPdpBlock
 */
import type { ReactNode } from 'react'
import type { ProductHighlightIconStyleId } from '../../../data/productHighlightIconStyles'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { AvailabilityCommerceModeId } from '../../../data/availabilityShortcutCommerce'
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
  /** Oasis — highlights icon rows rendered between the icon rail and the review carousel. */
  extraHighlights?: ReactNode
  /** Availability shortcut — desktop “Upcoming availability” section. */
  showUpcomingAvailability?: boolean
  availabilityCommerceMode?: AvailabilityCommerceModeId
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
  onUpdateSearch?: () => void
}

export function ViatorPdpBlock({
  booking,
  productHighlightLayoutId,
  productHighlightIconStyleId,
  productHighlightConciseSummary,
  productHighlightTopProduct,
  hideBookAheadMobile,
  extraHighlights,
  showUpcomingAvailability,
  availabilityCommerceMode,
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
  onUpdateSearch,
}: ViatorPdpBlockProps) {
  return (
    <FigmaViatorPdpBlock
      booking={booking}
      productHighlightLayoutId={productHighlightLayoutId}
      productHighlightIconStyleId={productHighlightIconStyleId}
      productHighlightConciseSummary={productHighlightConciseSummary}
      productHighlightTopProduct={productHighlightTopProduct}
      hideBookAheadMobile={hideBookAheadMobile}
      extraHighlights={extraHighlights}
      showUpcomingAvailability={showUpcomingAvailability}
      availabilityCommerceMode={availabilityCommerceMode}
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
      onUpdateSearch={onUpdateSearch}
    />
  )
}
