import { BookingSidebar } from '../../booking/BookingSidebar'
import { viatorListing } from '../../../data/viatorListing'
import type { BookingContent } from '../../../data/variants'
import { PdpOverviewSection } from './PdpOverviewSection'
import { PdpPromotedExperiences } from './PdpPromotedExperiences'
import { PdpViatorHeroGallery } from './PdpViatorHeroGallery'
import { PdpViatorIconRail } from './PdpViatorIconRail'
import { PdpWhatsIncludedSection } from './PdpWhatsIncludedSection'
import { PdpWhyTravelersLoved } from './PdpWhyTravelersLoved'

type Props = { booking: BookingContent }

/**
 * Upper PDP: hero + thumbnails (Figma 20632:95823), key facts, rewards, body sections.
 * Mobile: booking card under gallery — [B2C page templates](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17671-82296).
 * Title/meta render full-width above the page grid — see {@link ExperiencePage}.
 * Down-page traveler photos and deep reviews live on {@link ExperiencePage}.
 */
export function FigmaViatorPdpBlock({ booking }: Props) {
  const l = viatorListing

  return (
    <div className="w-full">
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-5">
          <PdpViatorHeroGallery />
          <div className="lg:hidden">
            <BookingSidebar booking={booking} embedded />
          </div>
          <PdpViatorIconRail items={l.iconRail} />
        </div>
        <PdpWhyTravelersLoved />
        <div className="mt-5 flex flex-col gap-5">
          <PdpPromotedExperiences />
          {/* gap-5 only before Overview; Whats included abuts Overview with no spacer (top rule flush). */}
          <div className="flex flex-col gap-0">
            <PdpOverviewSection />
            <PdpWhatsIncludedSection />
          </div>
        </div>
      </div>
    </div>
  )
}
