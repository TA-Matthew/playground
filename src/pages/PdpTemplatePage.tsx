import { Link } from 'react-router-dom'
import { BookingSidebar } from '../components/booking/BookingSidebar'
import { CollapsibleSection } from '../components/common/CollapsibleSection'
import { AdditionalInfo } from '../components/additional/AdditionalInfo'
import { PdpCancellationQuestionsSection } from '../components/experience/pdp/PdpCancellationQuestionsSection'
import { PdpCompareSimilarExperiences } from '../components/experience/pdp/PdpCompareSimilarExperiences'
import { PdpCustomersAlsoBought } from '../components/experience/pdp/PdpCustomersAlsoBought'
import { PdpTravelerPhotosSection } from '../components/experience/pdp/PdpTravelerPhotosSection'
import { PdpViatorDeepReviewsBlock } from '../components/experience/pdp/PdpViatorDeepReviewsBlock'
import { PdpViatorTitleMeta } from '../components/experience/pdp/PdpViatorTitleMeta'
import { ViatorPdpBlock } from '../components/experience/pdp/ViatorPdpBlock'
import { viatorListing } from '../data/viatorListing'
import { variants } from '../data/variants'

/**
 * Base Viator booking PDP — hero, icon rail, overview, and down-page sections.
 * No logistics itinerary or product-highlight study chrome; use as a starting shell for new projects.
 */
export function PdpTemplatePage() {
  const booking = variants.a.booking

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto w-full max-w-[1308px] px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-8 xl:px-0">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-emerald-800"
          >
            <span aria-hidden className="text-stone-400">
              ←
            </span>
            All projects
          </Link>
        </div>

        <div className="mb-5 w-full min-w-0">
          <PdpViatorTitleMeta
            title={viatorListing.tourTitle}
            averageRating={viatorListing.averageRating}
            reviewCount={viatorListing.reviewCount}
            locationLine={viatorListing.locationLine}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6 xl:gap-6">
          <main className="pdp-figma w-full min-w-0 max-w-[864px] lg:order-1">
            <ViatorPdpBlock booking={booking} />

            <CollapsibleSection title="Additional Info" defaultOpen>
              <AdditionalInfo />
            </CollapsibleSection>

            <div className="w-full">
              <PdpCancellationQuestionsSection />
              <PdpTravelerPhotosSection />
            </div>
            <PdpViatorDeepReviewsBlock />
          </main>

          <aside className="hidden min-w-0 lg:order-2 lg:block lg:sticky lg:top-8 lg:z-10 lg:self-start">
            <BookingSidebar booking={booking} />
          </aside>
        </div>

        <PdpCompareSimilarExperiences />
        <PdpCustomersAlsoBought />
      </div>
    </div>
  )
}
