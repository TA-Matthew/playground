import { ViatorSpotlightFiveStars } from '../experience/pdp/ViatorSpotlightFiveStars'
import { getStarBarPercent, viatorListing } from '../../data/viatorListing'

function InfoIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-black">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17 7L7 17M7 7h10v10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Reviews section — Figma
 * [node 10033:22333](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-22333).
 * Bespoke to the Oasis desktop PDP — replaces `PdpViatorDeepReviewsBlock` + `PdpTravelerPhotosSection`.
 */
export function OasisReviews() {
  const { averageRating, reviewCount, starDistribution, reviewSamples, media } = viatorListing
  const photoStrip = [media.hero, ...media.thumbnails].slice(0, 6)
  const remainingPhotoCount = media.thumbnails.length + 1 - photoStrip.length

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <h2 className="w-full text-[24px] font-medium leading-7 tracking-[0.2px] text-black">Reviews</h2>

      <div className="grid w-full grid-cols-3 gap-6">
        <div className="col-span-1 flex flex-col items-center justify-center gap-2">
          <p className="text-[42px] font-medium leading-[46px] tracking-[0.2px] text-black">{averageRating}</p>
          <ViatorSpotlightFiveStars />
          <div className="flex items-center gap-1">
            <p className="text-[12px] leading-4 tracking-[0.05px] text-[#4d4d4d]">
              {reviewCount.toLocaleString()} reviews
            </p>
            <InfoIcon />
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          {starDistribution
            .slice()
            .sort((a, b) => b.stars - a.stars)
            .map((row) => (
              <div key={row.stars} className="flex items-center gap-4">
                <span className="w-2 text-center text-[14px] leading-5 text-[#333]">{row.stars}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#d9d9d9]">
                  <div
                    className="h-full rounded-full bg-[#00c295]"
                    style={{ width: `${getStarBarPercent(row.stars, row.count)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex w-full gap-2 overflow-x-auto">
        {photoStrip.map((photo) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className="size-[120px] shrink-0 rounded-lg object-cover"
          />
        ))}
        {remainingPhotoCount > 0 ? (
          <div className="relative flex size-[120px] shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-lg bg-black/60">
            <span className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-white">
              <ArrowIcon />
            </span>
            <span className="text-base text-white">See more</span>
          </div>
        ) : null}
      </div>

      <div className="relative flex w-full items-start gap-4">
        {reviewSamples.slice(0, 2).map((review) => (
          <div key={review.id} className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#d9d9d9] p-4">
            <div className="flex flex-col gap-1">
              <ViatorSpotlightFiveStars />
              <p className="text-[14px] font-medium leading-5 tracking-[0.05px] text-black">{review.title}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="line-clamp-4 text-[14px] leading-5 tracking-[0.05px] text-black">{review.body}</p>
              <p className="text-[12px] leading-4 text-[#4d4d4d]">{review.byline}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full items-center justify-between gap-4">
        <button type="button" className="pdp-neutral-outline-btn-md">
          Read all {reviewCount.toLocaleString()} reviews
        </button>
        <p className="text-[12px] leading-4 tracking-[0.05px] text-[#4d4d4d]">
          We perform <span className="cursor-pointer underline">checks on reviews</span>
        </p>
      </div>
    </div>
  )
}
