import { BookingSidebar } from '../../booking/BookingSidebar'
import {
  parseProductHighlightLayoutOptions,
  type ProductHighlightLayoutId,
} from '../../../data/productHighlightLayouts'
import type { ProductHighlightIconStyleId } from '../../../data/productHighlightIconStyles'
import type { AvailabilityMetaDisplayId } from '../../../data/availabilityShortcutMeta'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
import { totalTravelers } from '../../../data/availabilityShortcutTravelers'
import { formatAvailabilitySearchTotal } from '../../../data/availabilityShortcutOptions'
import { viatorListing } from '../../../data/viatorListing'
import type { BookingContent } from '../../../data/variants'
import { PdpOverviewSection } from './PdpOverviewSection'
import { PdpPromotedExperiences } from './PdpPromotedExperiences'
import { PdpViatorHeroGallery } from './PdpViatorHeroGallery'
import { ExpediaQuickFactsRail, PdpProductHighlights } from './PdpProductHighlights'
import { PdpViatorIconRail } from './PdpViatorIconRail'
import { PdpUpcomingAvailabilitySection } from './PdpUpcomingAvailabilitySection'
import { PdpWhatsIncludedSection } from './PdpWhatsIncludedSection'
import { PdpWhyTravelersLoved } from './PdpWhyTravelersLoved'

type Props = {
  booking: BookingContent
  /** When set (product-highlight project), renders below the hero gallery. */
  productHighlightLayoutId?: ProductHighlightLayoutId | null
  productHighlightIconStyleId?: ProductHighlightIconStyleId | null
  productHighlightConciseSummary?: boolean | null
  productHighlightTopProduct?: boolean | null
  /** Facilitator-only: hide the book-ahead row on mobile. */
  hideBookAheadMobile?: boolean
  /** Availability shortcut — desktop “Upcoming availability” between icon rail and reviews. */
  showUpcomingAvailability?: boolean
  /** Availability shortcut — date / travelers row style (`asMeta`). */
  availabilityMetaDisplay?: AvailabilityMetaDisplayId
  /** Availability shortcut — expanded options panel (post Select / Check Availability). */
  availabilityOptionsOpen?: boolean
  availabilityOptionsLoading?: boolean
  selectedAvailabilityOptionId?: string
  travelers?: number
  travelerCounts?: AvailabilityTravelerCounts
  onTravelerCountsChange?: (counts: AvailabilityTravelerCounts) => void
  dateLabel?: string
  onDateLabelChange?: (dateLabel: string) => void
  onSelectAvailabilityOption?: (optionId: string) => void
  onOpenAvailabilityOptions?: (optionId: string) => void
}

/**
 * Upper PDP: hero + thumbnails (Figma 20632:95823), key facts, rewards, body sections.
 * Mobile: booking card under gallery — [B2C page templates](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17671-82296).
 * Title/meta render full-width above the page grid — see {@link ExperiencePage}.
 * Down-page traveler photos and deep reviews live on {@link ExperiencePage}.
 */
export function FigmaViatorPdpBlock({
  booking,
  productHighlightLayoutId,
  productHighlightIconStyleId,
  productHighlightConciseSummary,
  productHighlightTopProduct,
  hideBookAheadMobile,
  showUpcomingAvailability = false,
  availabilityMetaDisplay = 'chips',
  availabilityOptionsOpen = false,
  availabilityOptionsLoading = false,
  selectedAvailabilityOptionId = 'english',
  travelerCounts,
  onTravelerCountsChange,
  dateLabel,
  onDateLabelChange,
  onSelectAvailabilityOption,
  onOpenAvailabilityOptions,
}: Props) {
  const resolvedTravelerCounts =
    travelerCounts ?? { adults: booking.travellers, children: 0, infants: 0 }
  const travelerTotal = totalTravelers(resolvedTravelerCounts)
  const l = viatorListing
  const layoutOpts =
    productHighlightLayoutId != null
      ? parseProductHighlightLayoutOptions(productHighlightLayoutId)
      : null
  const showStandaloneIconRail =
    productHighlightLayoutId == null || layoutOpts?.iconRail === 'viator'
  const groupHighlightsWithViatorRail = layoutOpts?.iconRail === 'viator'
  /** Deferred rail = Expedia quick-facts design rendered after the Overview section. */
  const showDeferredQuickFactsRail = layoutOpts?.iconRail === 'deferred'

  const productHighlights =
    productHighlightLayoutId ? (
      <PdpProductHighlights
        layoutId={productHighlightLayoutId}
        iconStyle={productHighlightIconStyleId ?? 'large'}
        conciseSummary={productHighlightConciseSummary ?? false}
        topProduct={productHighlightTopProduct ?? false}
      />
    ) : null
  const viatorIconRail = showStandaloneIconRail ? <PdpViatorIconRail items={l.iconRail} /> : null

  return (
    <div className="w-full">
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-6">
          <PdpViatorHeroGallery />
          <div className="lg:hidden">
            <BookingSidebar
              booking={booking}
              embedded
              travelers={travelerTotal}
              dateLabel={dateLabel ?? booking.dateLabel}
              hideBookAheadMobile={hideBookAheadMobile}
              onCheckAvailability={
                showUpcomingAvailability
                  ? () => onOpenAvailabilityOptions?.('english')
                  : undefined
              }
              availabilitySearchActive={showUpcomingAvailability && availabilityOptionsOpen}
              searchTotalAmount={
                showUpcomingAvailability
                  ? formatAvailabilitySearchTotal(resolvedTravelerCounts)
                  : undefined
              }
              searchTotalLoading={showUpcomingAvailability && availabilityOptionsLoading}
            />
          </div>
          {groupHighlightsWithViatorRail && productHighlights && viatorIconRail ? (
            <div className="flex flex-col gap-8">
              {productHighlights}
              {viatorIconRail}
            </div>
          ) : (
            <>
              {productHighlights}
              {viatorIconRail}
            </>
          )}
        </div>
        {showUpcomingAvailability ? (
          <PdpUpcomingAvailabilitySection
            metaDisplay={availabilityMetaDisplay}
            dateLabel={dateLabel ?? booking.dateLabel}
            onDateLabelChange={onDateLabelChange}
            travelerCounts={resolvedTravelerCounts}
            onTravelerCountsChange={onTravelerCountsChange}
            showOptionsPanel={availabilityOptionsOpen}
            optionsLoading={availabilityOptionsLoading}
            selectedOptionId={selectedAvailabilityOptionId}
            onSelectOption={onSelectAvailabilityOption}
            onOpenOptions={onOpenAvailabilityOptions}
          />
        ) : null}
        <PdpWhyTravelersLoved
          showTopDivider={layoutOpts?.iconRail === 'expedia'}
          showTopDividerFromLg={showUpcomingAvailability}
        />
        <div className="mt-5 flex flex-col gap-5">
          <PdpPromotedExperiences />
          {/* gap-5 only before Overview; deferred quick facts + What's included stack with top rules only (gap-0). */}
          <div className="flex flex-col gap-0">
            <PdpOverviewSection />
            {showDeferredQuickFactsRail ? <ExpediaQuickFactsRail topBorder /> : null}
            <PdpWhatsIncludedSection />
          </div>
        </div>
      </div>
    </div>
  )
}
