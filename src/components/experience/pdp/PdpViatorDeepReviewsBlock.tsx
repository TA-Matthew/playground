import { viatorListing } from '../../../data/viatorListing'
import {
  FigmaReviewPagination,
  FigmaReviewsSummarySection,
  FigmaViatorReviewCard,
} from './figmaListingUi'
import { InfoCircleIcon } from './InfoCircleIcon'

function starCounts() {
  const m = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  for (const row of viatorListing.starDistribution) {
    m[row.stars] = row.count
  }
  return m
}

/**
 * Figma / Viator full Reviews region (summary + search/sort + distribution + list + pagination).
 * Anchor id `reviews` lives on the summary in {@link FigmaReviewsSummarySection}.
 */
export function PdpViatorDeepReviewsBlock() {
  const l = viatorListing
  const s = starCounts()
  const sort = 'Most recent'

  return (
    <div
      className="w-full border-t border-[#d9d9d9] bg-white"
    >
      <div className="flex w-full flex-col gap-10 py-10 sm:py-12">
        <div className="space-y-6">
          <FigmaReviewsSummarySection
            averageDisplay={l.averageRating.toFixed(1)}
            reviewCount={l.reviewCount}
            introLine={l.reviewsIntro}
            star5={s[5]}
            star4={s[4]}
            star3={s[3]}
            star2={s[2]}
            star1={s[1]}
          />
          <div className="flex w-full min-w-0 max-w-full flex-col gap-3">
            <div className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-[#d9d9d9] bg-white px-3.5">
              <svg
                className="size-4 shrink-0 text-[#4d4d4d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-[#333] outline-none placeholder:text-[#707070]"
                placeholder="Search reviews (e.g. guide)"
                aria-label="Search reviews"
              />
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 py-2 text-left text-sm text-black"
              aria-label={`Sort reviews. Current sort: ${sort}`}
            >
              <span className="inline-flex flex-wrap items-baseline gap-x-1">
                <span className="font-normal">Sort by:</span>
                <span className="font-bold">{sort}</span>
              </span>
              <svg
                className="size-4 shrink-0 text-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <InfoCircleIcon className="size-4 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
        <div className="space-y-8">
          <div className="min-h-0">
            <div className="flex flex-col gap-12">
              {l.reviewSamples.map((r) => (
                <FigmaViatorReviewCard key={r.id} r={r} />
              ))}
            </div>
          </div>
          <div className="pt-2">
            <FigmaReviewPagination />
          </div>
        </div>
      </div>
    </div>
  )
}
