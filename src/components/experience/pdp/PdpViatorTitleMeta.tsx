import { ViatorGreenStarRow } from './ViatorGreenStarRow'

type Props = {
  title: string
  averageRating: number
  reviewCount: number
  locationLine: string
  reviewsHref?: string
}

function MetaDivider() {
  return <span className="hidden h-3 w-px shrink-0 bg-[#d9d9d9] sm:block" aria-hidden />
}

function BadgeOfExcellence() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="grid size-6 shrink-0 place-content-center rounded-full bg-gradient-to-b from-amber-200 to-amber-500 ring-1 ring-amber-600/20"
        aria-hidden
      >
        <svg className="size-3.5 text-amber-950" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 1.2L9.2 4.1l2.1.2-1.6 1.3.5 2.1L8 6.3 5.8 7.7l.5-2.1-1.6-1.3 2.1-.2L8 1.2z" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-xs text-[#4d4d4d] sm:text-sm">Badge of Excellence</span>
    </span>
  )
}

/**
 * Viator B2C-style title + single metadata row (rating · stars · reviews · badge · location).
 */
export function PdpViatorTitleMeta({
  title,
  averageRating,
  reviewCount,
  locationLine,
  reviewsHref = '#reviews',
}: Props) {
  return (
    <div className="space-y-3">
      <h1 className="text-[28px] font-bold leading-[1.2] text-black">
        {title}
      </h1>
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3"
        role="group"
        aria-label="Product rating and location"
      >
        <span
          className="text-base font-bold tabular-nums text-black sm:text-lg"
          style={{ fontFeatureSettings: "'lnum' 1" }}
        >
          {averageRating.toFixed(1)}
        </span>
        <ViatorGreenStarRow value={averageRating} size={18} />
        <MetaDivider />
        <a
          className="text-sm font-medium text-black underline decoration-black underline-offset-2 [text-decoration-skip-ink:none] hover:decoration-[#00c295]"
          href={reviewsHref}
        >
          {reviewCount.toLocaleString()} reviews
        </a>
        <MetaDivider />
        <BadgeOfExcellence />
        <MetaDivider />
        <span className="text-sm text-[#4d4d4d]">{locationLine}</span>
      </div>
    </div>
  )
}
