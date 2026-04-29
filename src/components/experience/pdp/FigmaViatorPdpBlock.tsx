import { viatorListing } from '../../../data/viatorListing'
import { PdpOverviewSection } from './PdpOverviewSection'
import { PdpPromotedExperiences } from './PdpPromotedExperiences'
import { PdpViatorHeroGallery } from './PdpViatorHeroGallery'
import { PdpViatorIconRail } from './PdpViatorIconRail'
import { PdpWhatsIncludedSection } from './PdpWhatsIncludedSection'
import { PdpWhyTravelersLoved } from './PdpWhyTravelersLoved'

/**
 * Upper PDP: hero + thumbnails (Figma 20632:95823), key facts, rewards, body sections.
 * Title/meta render full-width above the page grid — see {@link ExperiencePage}.
 * Down-page traveler photos and deep reviews live on {@link ExperiencePage}.
 */
export function FigmaViatorPdpBlock() {
  const l = viatorListing

  return (
    <div className="w-full">
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-5">
          <PdpViatorHeroGallery />
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
