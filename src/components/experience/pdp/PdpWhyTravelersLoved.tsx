import { viatorListing } from '../../../data/viatorListing'
import { ViatorGreenStarRow } from './ViatorGreenStarRow'

/**
 * Viator B2C “Why travelers loved this” — social proof, theme chips, 2-up spotlight cards.
 */
export function PdpWhyTravelersLoved() {
  const w = viatorListing.whyTravelersLoved
  const n = w.socialProof.groupWord
  return (
    <section
      className="border-t border-[#d9d9d9] pt-6"
      aria-labelledby="pdp-why-travelers-h"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="pdp-why-travelers-h"
            className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black"
          >
            Why travelers loved this
            <span
              className="grid size-5 place-content-center rounded-full border border-[#d4d4d4] text-xs font-bold text-[#4d4d4d]"
              title="Info"
            >
              i
            </span>
          </h2>
        </div>
        <a
          href="#reviews"
          className="inline-flex shrink-0 items-center gap-1.5 text-lg text-black sm:mt-1.5"
        >
          <ViatorGreenStarRow value={viatorListing.averageRating} size={14} />
          <span className="font-bold tabular-nums leading-[1.2]">
            {viatorListing.averageRating.toFixed(1)}
          </span>
          <span className="text-black">·</span>
          <span className="font-normal underline [text-decoration-skip-ink:none] decoration-black underline-offset-2">
            {viatorListing.reviewCount.toLocaleString()} reviews
          </span>
        </a>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex -space-x-1.5" aria-hidden>
          {[ 'A', 'B', 'C'].map((c) => (
            <div
              key={c}
              className="grid size-7 place-content-center rounded-full border-2 border-white bg-gradient-to-br from-stone-300 to-stone-500 text-xs font-bold text-white"
            >
              {c}
            </div>
          ))}
        </div>
        <p className="text-sm text-[#333]">
          Popular choice among <strong className="font-semibold text-black">{n} people</strong>
        </p>
        <button
          type="button"
          className="grid size-4 place-content-center rounded-full border border-[#d4d4d4] text-[10px] font-bold text-[#666]"
          aria-label="More about popular choice"
        >
          i
        </button>
      </div>

      <div className="relative mt-4 -mx-1 flex touch-pan-x gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1">
        {w.filterTagLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={
              i === 0
                ? 'inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#b3b3b3] bg-white px-4 text-sm font-medium text-[#333] transition hover:bg-[#f5f5f5]'
                : 'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#003327] bg-[#ccf3ea] px-4 text-sm font-bold text-[#003327]'
            }
          >
            {i > 0 ? <span className="text-[#003327]">✓ </span> : null}
            {label}
          </button>
        ))}
        <button
          type="button"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 grid size-8 shrink-0 place-content-center rounded-full border border-[#d9d9d9] bg-white shadow"
          aria-label="More tags"
        >
          <span className="text-stone-700" aria-hidden>
            →
          </span>
        </button>
      </div>

      <div className="relative mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {w.spotlightReviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-[#d9d9d9] bg-white p-4 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)]"
            >
              <ViatorGreenStarRow value={5} size={16} />
              <p className="mt-2 text-sm text-[#4d4d4d]">
                {r.author} · {r.date}
              </p>
              <p className="mt-3 text-sm leading-[1.5] text-[#333] sm:text-base">{r.text}</p>
              <a
                href="#reviews"
                className="mt-3 inline-block text-sm font-medium text-[#0d0d0d] underline [text-decoration-skip-ink:none] underline-offset-2"
              >
                Read more
              </a>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next reviews"
        >
          <span className="grid size-9 place-content-center rounded-full border border-[#d9d9d9] bg-white shadow">
            <span className="text-stone-700" aria-hidden>
              →
            </span>
          </span>
        </button>
      </div>
    </section>
  )
}
