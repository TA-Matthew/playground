import { useState } from 'react'

type Props = {
  title: string
  averageRating: number
  reviewCount: number
  duration: { value: string; unit: string }
  language: { value: string; extra: string }
  bookedTodayCount: number
  freeCancellation: string
  summary: string
  fullDescription: string
}

/**
 * Title + info row + value-prop chips + short copy w/ "More".
 * Mobile: centered column (Figma MW spec). Desktop: left-aligned header row with share/save actions.
 */
export function OasisTitleInfo({
  title,
  averageRating,
  reviewCount,
  duration,
  language,
  bookedTodayCount,
  freeCancellation,
  summary,
  fullDescription,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="flex flex-col items-center gap-6 py-6 text-center lg:items-start lg:gap-4 lg:text-left">
      <div className="flex w-full items-start justify-between gap-4">
        <h1 className="text-2xl font-medium leading-tight text-stone-900 lg:text-[32px]">{title}</h1>
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <button
            type="button"
            aria-label="Share"
            className="flex size-10 items-center justify-center rounded-full border border-stone-200 text-stone-700"
          >
            ⇗
          </button>
          <button
            type="button"
            aria-label="Save"
            className="flex size-10 items-center justify-center rounded-full border border-stone-200 text-stone-700"
          >
            ♡
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 lg:justify-start">
        <div className="flex flex-col items-center lg:items-start">
          <p className="text-base font-medium text-stone-900">{duration.value}</p>
          <p className="text-xs text-stone-500">{duration.unit}</p>
        </div>
        <div className="h-10 w-px bg-stone-200" aria-hidden />
        <div className="flex flex-col items-center lg:items-start">
          <p className="flex items-center gap-1 text-base font-medium text-stone-900">
            {averageRating.toFixed(1)} <StarIcon />
          </p>
          <p className="text-xs text-stone-500">{reviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="h-10 w-px bg-stone-200" aria-hidden />
        <div className="flex flex-col items-center lg:items-start">
          <p className="text-base font-medium text-stone-900">{language.value}</p>
          <p className="text-xs text-stone-500">{language.extra}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <span className="rounded bg-stone-100 px-1 py-0.5 text-xs text-stone-900">
          Booked {bookedTodayCount}+ times today
        </span>
        <span className="rounded bg-emerald-50 px-1 py-0.5 text-xs text-emerald-900">{freeCancellation}</span>
      </div>

      <p className="text-sm leading-relaxed text-stone-600 lg:max-w-2xl">
        {expanded ? fullDescription : summary}{' '}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-medium text-stone-900 underline underline-offset-2"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </p>
    </section>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="#008768" aria-hidden>
      <path d="M8 1.2l2.1 4.6 5 .6-3.7 3.4.9 4.9L8 12.2l-4.3 2.5.9-4.9L.9 6.4l5-.6L8 1.2z" />
    </svg>
  )
}
