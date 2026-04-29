import { viatorListing } from '../../../data/viatorListing'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { ProductCard } from './ProductCard'

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
        className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
      >
        {p.title}
      </h2>
      <div className="relative isolate mt-5 -mx-4 overflow-visible sm:mx-0">
        <div
          className="flex min-w-0 touch-pan-x gap-3 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:w-full sm:flex-row sm:items-stretch sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {p.items.map((card) => (
            <ProductCard key={card.id} card={card} mobileRail />
          ))}
        </div>
        <CarouselChevronNavButton
          className="absolute right-0 top-[38%] z-[40] hidden -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next experiences"
        />
      </div>
      <p className="pdp-disclaimer-label mt-6 text-left">
        {p.disclaimer}{' '}
        <span className="cursor-default text-inherit underline [text-decoration-skip-ink:none]">
          {p.disclaimerLink}
        </span>
        .
      </p>
    </section>
  )
}
