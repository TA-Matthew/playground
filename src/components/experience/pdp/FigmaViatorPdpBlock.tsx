import { viatorListing } from '../../../data/viatorListing'
import { PdpOverviewSection } from './PdpOverviewSection'
import { PdpPromotedExperiences } from './PdpPromotedExperiences'
import { PdpViatorHeroGallery } from './PdpViatorHeroGallery'
import { PdpViatorIconRail } from './PdpViatorIconRail'
import { PdpViatorTitleMeta } from './PdpViatorTitleMeta'
import { PdpWhatsIncludedSection } from './PdpWhatsIncludedSection'
import { PdpWhyTravelersLoved } from './PdpWhyTravelersLoved'

/**
 * Upper PDP: title/meta, hero + thumbnails (Figma 20632:95823), key facts, rewards, body sections.
 * Down-page traveler photos and deep reviews live on {@link ExperiencePage}.
 */
export function FigmaViatorPdpBlock() {
  const l = viatorListing

  return (
    <div className="mb-10 w-full space-y-6 md:mb-12">
      <div className="w-full space-y-5">
        <PdpViatorTitleMeta
          title={l.tourTitle}
          averageRating={l.averageRating}
          reviewCount={l.reviewCount}
          locationLine={l.locationLine}
        />
        <PdpViatorHeroGallery />
        <PdpViatorIconRail items={l.iconRail} />
        <PdpWhyTravelersLoved />
        <PdpPromotedExperiences />
        <PdpOverviewSection />
        <PdpWhatsIncludedSection />
      </div>
    </div>
  )
}
