import { useCallback, useEffect, useRef, useState } from 'react'
import { viatorListing } from '../../../data/viatorListing'
import { FigmaRatingRow, FigmaStarRow } from './figmaListingUi'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { InfoCircleIcon } from './InfoCircleIcon'
import { ViatorSpotlightFiveStars } from './ViatorSpotlightFiveStars'

/**
 * Viator B2C “Why travelers loved this” — social proof, theme chips, horizontally scrolling spotlight cards.
 */
type Props = {
  /** Expedia-style PDP — divider + spacing above (replaces default top margin). */
  showTopDivider?: boolean
  /** Availability shortcut — divider above section on desktop only (upcoming block sits above). */
  showTopDividerFromLg?: boolean
}

export function PdpWhyTravelersLoved({
  showTopDivider = false,
  showTopDividerFromLg = false,
}: Props) {
  const w = viatorListing.whyTravelersLoved
  const spotlightScrollRef = useRef<HTMLDivElement>(null)
  const [spotlightHasMoreAfter, setSpotlightHasMoreAfter] = useState(true)

  const syncSpotlightScrollEdges = useCallback(() => {
    const root = spotlightScrollRef.current
    if (!root) return
    const pad = 1
    setSpotlightHasMoreAfter(root.scrollLeft + root.clientWidth < root.scrollWidth - pad)
  }, [])

  useEffect(() => {
    const root = spotlightScrollRef.current
    if (!root) return
    syncSpotlightScrollEdges()
    root.addEventListener('scroll', syncSpotlightScrollEdges, { passive: true })
    const ro = new ResizeObserver(syncSpotlightScrollEdges)
    ro.observe(root)
    window.addEventListener('resize', syncSpotlightScrollEdges)
    return () => {
      root.removeEventListener('scroll', syncSpotlightScrollEdges)
      ro.disconnect()
      window.removeEventListener('resize', syncSpotlightScrollEdges)
    }
  }, [syncSpotlightScrollEdges, w.spotlightReviews.length])

  const scrollSpotlightByTwoCards = useCallback(() => {
    const root = spotlightScrollRef.current
    if (!root) return
    const articles = root.querySelectorAll('article')
    if (articles.length === 0) return
    if (articles.length <= 2) {
      root.scrollTo({ left: root.scrollWidth - root.clientWidth, behavior: 'smooth' })
      return
    }
    const list = Array.from(articles) as HTMLElement[]
    const a0 = list[0]
    const a2 = list[Math.min(2, list.length - 1)]
    const delta = a2.offsetLeft - a0.offsetLeft
    root.scrollBy({ left: delta, behavior: 'smooth' })
  }, [])

  return (
    <section
      className={
        showTopDividerFromLg
          ? 'max-lg:mt-8 max-lg:pt-0 lg:border-t lg:border-[#d9d9d9] lg:pt-8'
          : showTopDivider
            ? 'border-t border-slate-200/90 pt-8'
            : 'mt-8 pt-0'
      }
      aria-labelledby="pdp-why-travelers-h"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2
            id="pdp-why-travelers-h"
            className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
          >
            Why travelers loved this
            <span className="inline-flex shrink-0" title="Info">
              <InfoCircleIcon aria-hidden />
            </span>
          </h2>
        </div>
        <a
          href="#reviews"
          className="flex w-full shrink-0 items-start justify-center gap-4 text-black sm:mt-1.5 sm:inline-flex sm:w-auto sm:items-center sm:justify-start sm:gap-1.5 sm:text-lg"
        >
          {/* Mobile — Figma 17671:82352: score + stars | count + “Reviews” */}
          <span className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:hidden">
            <span className="text-center text-[18px] font-medium leading-[22px] tracking-[0.2px] tabular-nums">
              {viatorListing.averageRating.toFixed(1)}
            </span>
            <FigmaRatingRow size={16} value={viatorListing.averageRating} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:hidden">
            <span className="text-center text-[18px] font-medium leading-[22px] tracking-[0.2px] tabular-nums">
              {viatorListing.reviewCount.toLocaleString()}
            </span>
            <span className="text-center text-sm font-normal leading-normal underline underline-offset-2 [text-decoration-skip-ink:none] decoration-black">
              Reviews
            </span>
          </span>

          <span className="hidden shrink-0 items-center gap-1.5 sm:inline-flex">
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
          </span>
        </a>
      </div>

      <div className="relative isolate mt-6 -mx-1 w-full min-w-0 max-w-full overflow-visible">
        <div
          className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [touch-action:pan-x_pan-y] px-1 whitespace-nowrap [&::-webkit-scrollbar]:hidden"
          aria-label="Review themes"
        >
          {w.filterTagLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={
                i === 0
                  ? 'inline-flex h-10 shrink-0 flex-row items-center justify-center gap-2 rounded-full border border-black bg-[#F5F5F5] px-4 font-sans text-[14px] font-bold leading-[1.5] text-[#333333] shadow-none outline-none ring-0 transition hover:bg-neutral-100/95'
                  : 'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#ccf3ea] px-4 font-sans text-sm font-bold text-[#003327]'
              }
            >
              {i > 0 ? <span className="text-[#003327]">✓ </span> : null}
              {label}
            </button>
          ))}
        </div>
        <CarouselChevronNavButton
          diameter="sm"
          className="absolute right-0 top-1/2 max-sm:hidden -translate-y-1/2 translate-x-1/2"
          aria-label="More tags"
        />
      </div>

      <div className="relative isolate mt-6 -mx-4 overflow-visible sm:-mx-6 lg:-mx-8 xl:mx-0">
        <div
          ref={spotlightScrollRef}
          className="flex gap-4 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [touch-action:pan-x_pan-y] sm:gap-6 sm:px-6 lg:px-8 lg:touch-auto xl:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Spotlight reviews"
        >
          {w.spotlightReviews.map((r) => (
            <article
              key={r.id}
              className="w-[min(316px,85vw)] shrink-0 rounded-2xl border border-[#d9d9d9] bg-white p-4 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] sm:w-[316px] lg:flex-[0_0_calc(50%-0.75rem)] lg:w-auto lg:min-w-0 lg:max-w-none"
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
              <span className="mt-3 inline-block cursor-default font-normal text-sm leading-[150%] text-[#333] underline underline-offset-auto [font-feature-settings:'liga'_off,_'clig'_off] [text-decoration-skip-ink:none] [text-underline-position:from-font]">
                Read more
              </span>
            </article>
          ))}
        </div>
        <CarouselChevronNavButton
          disabled={!spotlightHasMoreAfter}
          onClick={scrollSpotlightByTwoCards}
          className={`absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:grid ${spotlightHasMoreAfter ? '' : 'pointer-events-none opacity-40'}`}
          aria-label="Next spotlight reviews"
        />
      </div>
    </section>
  )
}
