import { viatorListing } from '../../../data/viatorListing'
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
        className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black"
      >
        {p.title}
      </h2>
      <div className="relative mt-5">
        <div className="scrollbar-hide flex touch-pan-x gap-3 overflow-x-auto pb-1 pr-1">
          {p.items.map((card) => (
            <PromotedProductCard key={card.id} card={card} />
          ))}
        </div>
        <button
          type="button"
          className="absolute right-0 top-[38%] z-10 -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next experiences"
        >
          <span className="grid size-9 place-content-center rounded-full border border-[#d9d9d9] bg-white shadow">
            <span className="text-stone-700" aria-hidden>
              →
            </span>
          </span>
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-[#707070]">
        {p.disclaimer}{' '}
        <a href="#promoted" className="text-[#0d0d0d] underline [text-decoration-skip-ink:none]">
          {p.disclaimerLink}
        </a>
        .
      </p>
    </section>
  )
}
