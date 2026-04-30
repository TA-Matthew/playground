import { useId } from 'react'
import { figma } from '../../ai-review/figmaAssets'
import { getStarBarPercent } from '../../../data/viatorListing'
import type { PdpReview } from '../../../data/viatorListing'
import {
  VIATOR_BRAND_STAR_FILL,
  VIATOR_BRAND_STAR_OUTLINE_FILL,
  VIATOR_BRAND_STAR_OUTLINE_PATH_16,
  VIATOR_BRAND_STAR_PATH,
} from './ViatorSpotlightFiveStars'

export type StarKind = 'solid' | 'half' | 'outline'

const STAR_VIEW_BOX = '0 0 12 12'
const STAR_OUTLINE_VIEW_BOX = '0 0 16 16'

/**
 * Figma (Q2 Decide) star row — solid/half use 12×12 brand star; empty stars use Figma outline art (`viewBox` 16×16) in brand green.
 */
export function FigmaStarRow({ pattern, size = 16 }: { pattern: StarKind[]; size?: 16 | 24 }) {
  const h = size
  const clipPrefix = useId().replace(/:/g, '')
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label="Star rating">
      {pattern.map((k, i) => (
        <div key={i} className="shrink-0" style={{ width: h, height: h }}>
          {k === 'solid' ? (
            <svg width={h} height={h} viewBox={STAR_VIEW_BOX} className="block size-full" aria-hidden>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={VIATOR_BRAND_STAR_FILL}
                d={VIATOR_BRAND_STAR_PATH}
              />
            </svg>
          ) : null}
          {k === 'outline' ? (
            <svg width={h} height={h} viewBox={STAR_OUTLINE_VIEW_BOX} className="block size-full" aria-hidden>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={VIATOR_BRAND_STAR_FILL}
                d={VIATOR_BRAND_STAR_OUTLINE_PATH_16}
              />
            </svg>
          ) : null}
          {k === 'half' ? (
            <svg width={h} height={h} viewBox={STAR_VIEW_BOX} className="block size-full" aria-hidden>
              <defs>
                <clipPath id={`${clipPrefix}-h${i}`}>
                  <rect x="0" y="0" width="6" height="12" />
                </clipPath>
              </defs>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={VIATOR_BRAND_STAR_OUTLINE_FILL}
                d={VIATOR_BRAND_STAR_PATH}
              />
              <g clipPath={`url(#${clipPrefix}-h${i})`}>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill={VIATOR_BRAND_STAR_FILL}
                  d={VIATOR_BRAND_STAR_PATH}
                />
              </g>
            </svg>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ratingToPattern(value: number): StarKind[] {
  const v = Math.min(5, Math.max(0, value))
  const full = Math.floor(v)
  const hasHalf = v - full >= 0.5
  const p: StarKind[] = []
  for (let i = 0; i < 5; i += 1) {
    if (i < full) p.push('solid')
    else if (i === full && hasHalf) p.push('half')
    else p.push('outline')
  }
  return p
}

export function FigmaRatingRow({ value, size = 24 }: { value: number; size?: 16 | 24 }) {
  return <FigmaStarRow pattern={ratingToPattern(value)} size={size} />
}

export function FigmaReviewsSummarySection({
  averageDisplay,
  reviewCount,
  introLine,
  star5,
  star4,
  star3,
  star2,
  star1,
}: {
  averageDisplay: string
  reviewCount: number
  introLine: string
  star5: number
  star4: number
  star3: number
  star2: number
  star1: number
}) {
  const n = (s: 1 | 2 | 3 | 4 | 5) =>
    s === 5
      ? star5
      : s === 4
        ? star4
        : s === 3
          ? star3
          : s === 2
            ? star2
            : star1
  return (
    <section
      id="reviews"
      className="scroll-mt-8 border-b border-[#d9d9d9] pb-6"
      aria-labelledby="pdp-figma-reviews-section-h"
    >
      <h2
        id="pdp-figma-reviews-section-h"
        className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
      >
        Reviews
      </h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className="text-4xl font-medium leading-tight text-black"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            {averageDisplay}
          </p>
          <FigmaStarRow pattern={ratingToPattern(Number(averageDisplay))} size={24} />
          <p className="text-sm font-medium leading-normal text-black">
            based on {reviewCount.toLocaleString()} reviews
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-[#4d4d4d]">{introLine}</p>
          <div className="space-y-2">
            {([5, 4, 3, 2, 1] as const).map((s) => (
              <RatingBarFigma
                key={s}
                stars={`${s} star${s === 1 ? '' : 's'}`}
                count={n(s)}
                pctOverride={getStarBarPercent(s, n(s))}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <div className="size-4 shrink-0">
          <img alt="" className="block size-full" src={figma.checkmarkStar} />
        </div>
        <p className="text-[13px] leading-normal text-black">
          <span>We perform </span>
          <span className="underline decoration-solid [text-decoration-skip-ink:none]">
            checks on reviews
          </span>
        </p>
      </div>
    </section>
  )
}

function RatingBarFigma({
  stars,
  count,
  pctOverride,
}: {
  stars: string
  count: number
  pctOverride: number
}) {
  return (
    <div className="flex w-full items-center gap-4">
      <p className="w-12 shrink-0 text-right text-sm leading-normal text-[#333]">{stars}</p>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#d9d9d9]">
        <div
          className="h-full rounded-full bg-[#00c295]"
          style={{ width: `${Math.min(100, Math.max(0, pctOverride))}%` }}
        />
      </div>
      <p className="w-10 shrink-0 text-right text-sm tabular-nums text-[#333]">
        {count.toLocaleString()}
      </p>
    </div>
  )
}

function FigmaUpvote() {
  return (
    <button type="button" className="shrink-0 p-0.5" aria-label="Mark as helpful">
      <img alt="" className="size-6" src={figma.upvoteShape} />
    </button>
  )
}

function FigmaReadMore() {
  return (
    <div className="flex cursor-default items-center gap-2 text-black" aria-hidden>
      <span className="text-base leading-normal">Read more</span>
      <svg
        className="size-4 shrink-0 text-current"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M3.85355 5.39645C3.65829 5.20118 3.34171 5.20118 3.14645 5.39645C2.95118 5.59171 2.95118 5.90829 3.14645 6.10355L7.64645 10.6036C7.84171 10.7988 8.15829 10.7988 8.35355 10.6036L12.8536 6.10355C13.0488 5.90829 13.0488 5.59171 12.8536 5.39645C12.6583 5.20119 12.3417 5.20119 12.1464 5.39645L8 9.54289L3.85355 5.39645Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
export function FigmaViatorReviewCard({ r }: { r: PdpReview }) {
  return (
    <div className="flex w-full max-w-[864px] items-start justify-center gap-3">
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <div className="space-y-2">
            <FigmaStarRow
              size={16}
              pattern={['solid', 'solid', 'solid', 'solid', 'solid']}
            />
            <p
              className="text-base font-medium leading-[1.4] text-black"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {r.title}
            </p>
            <p className="text-sm leading-normal text-[#4d4d4d]">{r.byline}</p>
          </div>
        </div>
        <div className="flex flex-col gap-0 text-base leading-normal text-black">
          <p className="min-w-0 break-words text-pretty line-clamp-2">{r.body}</p>
          <FigmaReadMore />
        </div>
      </div>
      <div className="pt-0.5">
        <FigmaUpvote />
      </div>
    </div>
  )
}

/**
 * “Show more” control (research) — DS neutral outline, replaces circular pagination replica.
 */
export function FigmaReviewPagination() {
  return (
    <div className="flex justify-center">
      <button type="button" className="pdp-neutral-outline-btn-md" aria-label="Show 10 more reviews">
        Show 10 more reviews
      </button>
    </div>
  )
}
