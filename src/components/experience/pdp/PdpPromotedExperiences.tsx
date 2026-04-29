import { viatorListing } from '../../../data/viatorListing'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { PromotedProductCard } from './PromotedProductCard'

export function PdpPromotedExperiences() {
  const p = viatorListing.promotedExperiences
  return (
    <section
      id="promoted"
      className="border-t border-[#d9d9d9] pt-6"
      aria-labelledby="pdp-promoted-h"
    >
      <h2
        id="pdp-promoted-h"
        className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black"
      >
        {p.title}
      </h2>
      <div className="relative isolate mt-5 overflow-visible">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
          {p.items.map((card) => (
            <PromotedProductCard key={card.id} card={card} />
          ))}
        </div>
        <CarouselChevronNavButton
          className="absolute right-0 top-[38%] z-[40] hidden -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next experiences"
        />
      </div>
      <p className="pdp-disclaimer-label mt-6 text-left">
        {p.disclaimer}{' '}
        <a href="#promoted" className="text-inherit underline [text-decoration-skip-ink:none]">
          {p.disclaimerLink}
        </a>
        .
      </p>
    </section>
  )
}
