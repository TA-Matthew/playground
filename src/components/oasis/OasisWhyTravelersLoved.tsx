import { useRef } from 'react'
import { ViatorSpotlightFiveStars } from '../experience/pdp/ViatorSpotlightFiveStars'
import { viatorListing } from '../../data/viatorListing'

function InfoIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-black">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const GUIDE_MENTION_COUNTS = [231, 26, 26]

/**
 * "Why travelers loved this" spotlight row — Figma
 * [node 10033:21739](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-21739).
 * Bespoke to the Oasis desktop PDP.
 */
export function OasisWhyTravelersLoved() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const reviews = viatorListing.whyTravelersLoved.spotlightReviews.slice(0, 3)

  return (
    <div className="relative w-full">
      <div className="mb-5 flex items-center gap-1">
        <h2 className="text-[24px] font-medium leading-7 tracking-[0.2px] text-black">Why travelers loved this</h2>
        <InfoIcon />
      </div>

      <div ref={scrollerRef} className="flex w-full gap-4 overflow-x-auto pb-1">
        {reviews.map((review, i) => (
          <div
            key={review.id}
            className="flex w-[342px] shrink-0 flex-col gap-4 rounded-2xl border border-[#d9d9d9] p-4"
          >
            <span className="inline-flex w-fit items-center gap-1 rounded bg-[#ebfaf7] px-1 py-[2.5px] text-[12px] leading-4 tracking-[0.05px] text-[#00654e]">
              🙂 Expert local guide {GUIDE_MENTION_COUNTS[i]}
            </span>
            <p className="text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">
              &ldquo;{review.text}&rdquo;{' '}
              <span className="cursor-pointer underline decoration-solid">Read more</span>
            </p>
            <ViatorSpotlightFiveStars />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="See more reviews"
        onClick={() => scrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
        className="absolute -right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#d9d9d9] bg-white text-black shadow-sm"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}
