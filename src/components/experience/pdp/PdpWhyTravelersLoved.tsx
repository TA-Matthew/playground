import { viatorListing } from '../../../data/viatorListing'
import { FigmaStarRow } from './figmaListingUi'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { InfoCircleIcon } from './InfoCircleIcon'
import { ViatorSpotlightFiveStars } from './ViatorSpotlightFiveStars'

/**
 * Viator B2C “Why travelers loved this” — social proof, theme chips, 2-up spotlight cards.
 */
export function PdpWhyTravelersLoved() {
  const w = viatorListing.whyTravelersLoved
  return (
    <section className="mt-6 pt-0" aria-labelledby="pdp-why-travelers-h">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2
            id="pdp-why-travelers-h"
            className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black"
          >
            Why travelers loved this
            <span className="inline-flex shrink-0" title="Info">
              <InfoCircleIcon aria-hidden />
            </span>
          </h2>
        </div>
        <a
          href="#reviews"
          className="inline-flex shrink-0 items-center gap-1.5 text-lg text-black sm:mt-1.5"
        >
          <span aria-hidden className="inline-flex shrink-0">
            <FigmaStarRow pattern={['solid']} size={16} />
          </span>
          <span className="font-medium tabular-nums leading-[1.2]">
            {viatorListing.averageRating.toFixed(1)}
          </span>
          <span className="text-black">·</span>
          <span className="font-normal underline [text-decoration-skip-ink:none] decoration-black underline-offset-2">
            {viatorListing.reviewCount.toLocaleString()} reviews
          </span>
        </a>
      </div>

      <div className="relative isolate mt-6 -mx-1 overflow-visible">
        <div className="flex touch-pan-x gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1">
          {w.filterTagLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={
                i === 0
                  ? 'inline-flex h-10 shrink-0 flex-row items-center justify-center gap-2 rounded-full bg-[#F5F5F5] px-4 font-sans text-[14px] font-bold leading-[1.5] text-[#333333] shadow-none outline-none ring-0 transition hover:bg-neutral-100/95'
                  : 'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#003327] bg-[#ccf3ea] px-4 font-sans text-sm font-bold text-[#003327]'
              }
            >
              {i > 0 ? <span className="text-[#003327]">✓ </span> : null}
              {label}
            </button>
          ))}
        </div>
        <CarouselChevronNavButton
          diameter="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
          aria-label="More tags"
        />
      </div>

      <div className="relative isolate mt-6 overflow-visible">
        <div className="grid gap-6 sm:grid-cols-2">
          {w.spotlightReviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-[#d9d9d9] bg-white p-4 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)]"
            >
              <div className="flex flex-wrap items-center gap-x-1.5 text-sm leading-[normal] text-[#4d4d4d]">
                <ViatorSpotlightFiveStars />
                <span className="select-none font-normal text-black" aria-hidden="true">
                  ·
                </span>
                <span>{r.author}</span>
                <span className="select-none font-normal text-black" aria-hidden="true">
                  ·
                </span>
                <span>{r.date}</span>
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-[150%] text-[#333]">{r.text}</p>
              <a
                href="#reviews"
                className="mt-3 inline-block font-normal text-sm leading-[150%] text-[#333] underline underline-offset-auto [font-feature-settings:'liga'_off,_'clig'_off] [text-decoration-skip-ink:none] [text-underline-position:from-font]"
              >
                Read more
              </a>
            </article>
          ))}
        </div>
        <CarouselChevronNavButton
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next reviews"
        />
      </div>
    </section>
  )
}
