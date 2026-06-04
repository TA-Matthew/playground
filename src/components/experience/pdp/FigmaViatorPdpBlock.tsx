import { BookingSidebar } from '../../booking/BookingSidebar'
import {
  parseProductHighlightLayoutOptions,
  type ProductHighlightLayoutId,
} from '../../../data/productHighlightLayouts'
import type { ProductHighlightIconStyleId } from '../../../data/productHighlightIconStyles'
import { viatorListing } from '../../../data/viatorListing'
import type { BookingContent } from '../../../data/variants'
import { PdpOverviewSection } from './PdpOverviewSection'
import { PdpPromotedExperiences } from './PdpPromotedExperiences'
import { PdpViatorHeroGallery } from './PdpViatorHeroGallery'
import { ExpediaQuickFactsRail, PdpProductHighlights } from './PdpProductHighlights'
import { PdpViatorIconRail } from './PdpViatorIconRail'
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
}: Props) {
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
            <BookingSidebar booking={booking} embedded hideBookAheadMobile={hideBookAheadMobile} />
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
        <PdpWhyTravelersLoved
          showTopDivider={layoutOpts?.iconRail === 'expedia'}
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
