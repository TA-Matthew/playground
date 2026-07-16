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

const GUIDE_MENTION_COUNTS = [231, 26, 26]

/**
 * Mobile-web "Why travelers loved this" — Figma
 * [node 10144:18594](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18594):
 * near-full-width (339px) horizontally-scrolling cards, one visible at a time with a peek of the next.
 */
export function OasisMobileWhyTravelersLoved() {
  const reviews = viatorListing.whyTravelersLoved.spotlightReviews.slice(0, 3)

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex items-center gap-1">
        <p className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black">Why travelers loved this</p>
        <InfoIcon />
      </div>

      <div className="flex w-full gap-4 overflow-x-auto pb-1">
        {reviews.map((review, i) => (
          <div
            key={review.id}
            className="flex w-[339px] shrink-0 flex-col gap-4 rounded-2xl border border-[#d9d9d9] p-4"
          >
            <span className="inline-flex w-fit items-center gap-1 rounded bg-[#d3f6ee] px-1 py-[2.5px] text-[12px] leading-4 tracking-[0.05px] text-[#004d3b]">
              🙂 Expert local guide {GUIDE_MENTION_COUNTS[i]}
            </span>
            <p className="text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">
              &ldquo;{review.text}&rdquo; <span className="cursor-pointer underline decoration-solid">Read more</span>
            </p>
            <ViatorSpotlightFiveStars />
          </div>
        ))}
      </div>
    </div>
  )
}
