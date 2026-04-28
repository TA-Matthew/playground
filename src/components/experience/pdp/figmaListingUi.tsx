import { figma } from '../../ai-review/figmaAssets'
import { getStarBarPercent } from '../../../data/viatorListing'
import type { PdpReview } from '../../../data/viatorListing'

export type StarKind = 'solid' | 'half' | 'outline'

/**
 * Figma (Q2 Decide) star row — use listing assets, not system SVGs.
 * @see ReviewsFigmaReplica
 */
export function FigmaStarRow({ pattern, size = 16 }: { pattern: StarKind[]; size?: 16 | 24 }) {
  const h = size
  const solid = size === 24 ? figma.starSolidLg : figma.starSolid
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label="Star rating">
      {pattern.map((k, i) => (
        <div key={i} className="shrink-0" style={{ width: h, height: h }}>
          {k === 'solid' && <img alt="" className="block size-full" src={solid} />}
          {k === 'half' && <img alt="" className="block size-full" src={figma.starHalf} />}
          {k === 'outline' && <img alt="" className="block size-full" src={figma.starOutline} />}
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

export function FigmaRatingRow({ value }: { value: number }) {
  return <FigmaStarRow pattern={ratingToPattern(value)} size={24} />
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
        className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black"
      >
        Reviews
      </h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr]">
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className="text-4xl font-black leading-tight text-black"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            {averageDisplay}
          </p>
          <FigmaStarRow pattern={ratingToPattern(Number(averageDisplay))} size={24} />
          <p className="text-sm font-bold leading-normal text-black">
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
      <div className="size-4 overflow-hidden">
        <img alt="" className="size-4" src={figma.readMoreChevron} />
      </div>
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
              className="text-base font-bold leading-[1.4] text-black"
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {r.title}
            </p>
            <p className="text-sm leading-normal text-[#4d4d4d]">
              {r.ratingLabel} · {r.dateLabel} · {r.author}, {r.authorLocation}
            </p>
          </div>
        </div>
        <div className="space-y-4 text-base leading-normal text-black">
          <p className="whitespace-pre-wrap">{r.body}</p>
          <FigmaReadMore />
        </div>
      </div>
      <div className="pt-0.5">
        <FigmaUpvote />
      </div>
    </div>
  )
}

function FigmaChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'size-4 shrink-0 text-black'}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.85355 5.39645C3.65829 5.20118 3.34171 5.20118 3.14645 5.39645C2.95118 5.59171 2.95118 5.90829 3.14645 6.10355L7.64645 10.6036C7.84171 10.7988 8.15829 10.7988 8.35355 10.6036L12.8536 6.10355C13.0488 5.90829 13.0488 5.59171 12.8536 5.39645C12.6583 5.20119 12.3417 5.20119 12.1464 5.39645L8 9.54289L3.85355 5.39645Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Figma search + chip row with real review count (static controls).
 */
export function FigmaReviewFilterStrip({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-h-10 w-full min-w-0 flex-1 touch-pan-x items-center gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:pb-0">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#d9d9d9] bg-white"
          aria-label="Search reviews"
        >
          <img alt="" className="size-4" src={figma.searchIcon} />
        </button>
        <div
          className="hidden h-0 w-px self-stretch bg-[#d9d9d9] sm:block"
          style={{ minHeight: 24 }}
          aria-hidden
        />
        {(['All travelers', 'Ratings', 'Most recent'] as const).map((label) => (
          <div
            key={label}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <span className="whitespace-nowrap text-sm font-medium leading-5 text-[#333]">
              {label}
            </span>
            <FigmaChevronDown />
          </div>
        ))}
      </div>
      <p
        className="w-full shrink-0 text-left text-sm leading-5 text-[#333] tabular-nums sm:ml-auto sm:w-auto sm:shrink-0 sm:text-right sm:text-base sm:leading-normal"
        style={{ fontFeatureSettings: "'lnum' 1" }}
      >
        {reviewCount.toLocaleString()} reviews
      </p>
    </div>
  )
}

/**
 * Figma-style circular pagination (visual only), matches ReviewsFigmaReplica.
 */
export function FigmaReviewPagination() {
  const items: { key: string; t: string; current?: boolean }[] = [
    { key: '1', t: '1' },
    { key: 'e1', t: '...' },
    { key: '6', t: '6' },
    { key: '7', t: '7', current: true },
    { key: '8', t: '8' },
    { key: 'e2', t: '...' },
    { key: '15', t: '15' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Page navigation (example)">
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-white"
        aria-label="Previous page"
      >
        <img alt="" className="size-5" src={figma.pagePrev} />
      </button>
      {items.map((it) => (
        <div
          key={it.key}
          className={[
            'flex size-10 items-center justify-center rounded-full text-base font-medium',
            it.current ? 'bg-black text-white' : 'bg-white text-black',
          ].join(' ')}
        >
          {it.t}
        </div>
      ))}
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-white"
        aria-label="Next page"
      >
        <img alt="" className="size-5" src={figma.pageNext} />
      </button>
    </div>
  )
}
