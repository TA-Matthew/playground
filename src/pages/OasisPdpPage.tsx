import { Link } from 'react-router-dom'
import { OasisAvailability } from '../components/oasis/OasisAvailability'
import { OasisGalleryMw } from '../components/oasis/OasisGalleryMw'
import { OasisIncluded } from '../components/oasis/OasisIncluded'
import { OasisItineraryMw } from '../components/oasis/OasisItineraryMw'
import { OasisReviewsMw } from '../components/oasis/OasisReviewsMw'
import { OasisShelfMw } from '../components/oasis/OasisShelfMw'
import { OasisSidebarDw } from '../components/oasis/OasisSidebarDw'
import { OasisStickyCta } from '../components/oasis/OasisStickyCta'
import { OasisThingsToKnow } from '../components/oasis/OasisThingsToKnow'
import { OasisTitleInfo } from '../components/oasis/OasisTitleInfo'
import { OasisTrustProps } from '../components/oasis/OasisTrustProps'
import { OasisWhyLoved } from '../components/oasis/OasisWhyLoved'
import { oasisStonehenge } from '../data/oasisStonehenge'

/**
 * OASIS PDP concept — responsive across mobile web (MW) and desktop web (DW).
 * MW section structure follows the Figma spec: figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620
 * DW reflows the same content into a two-column layout (content + sticky booking sidebar)
 * with grid-based sections instead of horizontal scroll shelves.
 */
export function OasisPdpPage() {
  const d = oasisStonehenge

  return (
    <div className="min-h-screen bg-white pb-24 text-stone-900 lg:pb-0">
      <div className="mx-auto w-full max-w-lg px-4 pt-4 lg:max-w-6xl lg:px-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600">
            <span aria-hidden className="text-stone-400">
              ←
            </span>
            All projects
          </Link>
        </div>

        <OasisGalleryMw images={d.images} />

        <OasisTitleInfo
          title={d.title}
          averageRating={d.averageRating}
          reviewCount={d.reviewCount}
          duration={d.duration}
          language={d.language}
          bookedTodayCount={d.bookedTodayCount}
          freeCancellation={d.freeCancellation}
          summary={d.summary}
          fullDescription={d.fullDescription}
        />

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
          <div className="lg:min-w-0">
            <OasisTrustProps items={d.trustProps} />

            <OasisWhyLoved cards={d.whyLoved} />

            <OasisAvailability
              currencySymbol={d.currencySymbol}
              filterChips={d.availability.filterChips}
              options={d.availability.options}
              lowestPriceGuarantee={d.availability.lowestPriceGuarantee}
            />

            <OasisIncluded inclusions={d.inclusions} />

            <OasisItineraryMw meetingPoint={d.meetingPoint} stops={d.itinerary} />

            <OasisReviewsMw
              averageRating={d.reviewsSummary.averageRating}
              reviewCount={d.reviewsSummary.reviewCount}
              distribution={d.reviewsSummary.distribution}
              photos={d.reviewsSummary.photos}
              reviews={d.reviews}
            />

            <OasisThingsToKnow
              activityLevel={d.thingsToKnow.activityLevel}
              activityNote={d.thingsToKnow.activityNote}
              wheelchairAccessible={d.thingsToKnow.wheelchairAccessible}
              nearPublicTransport={d.thingsToKnow.nearPublicTransport}
              maxTravelers={d.thingsToKnow.maxTravelers}
              notes={d.thingsToKnow.notes}
            />
          </div>

          <aside className="hidden lg:sticky lg:top-8 lg:block">
            <OasisSidebarDw
              price={d.price}
              currencySymbol={d.currencySymbol}
              dealTag={d.dealTag}
              freeCancellation={d.freeCancellation}
              options={d.availability.options}
            />
          </aside>
        </div>

        <OasisShelfMw currencySymbol={d.currencySymbol} items={d.shelf} />
      </div>

      <OasisStickyCta price={d.price} currencySymbol={d.currencySymbol} dealTag={d.dealTag} />
    </div>
  )
}
