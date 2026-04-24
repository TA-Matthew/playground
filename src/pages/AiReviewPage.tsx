import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookingSidebar } from '../components/booking/BookingSidebar'
import {
  type AiSummaryLayoutVariant,
  ReviewsFigmaReplica,
} from '../components/ai-review/ReviewsFigmaReplica'
import { variants, type VariantId } from '../data/variants'
import { parseVariant } from '../uxr/urlState'

export function AiReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  /** Same `variant` query as logistics (`a` = default, omit; `b` = explicit). */
  const summaryLayout: VariantId = parseVariant(searchParams)
  const setSummaryLayout = useCallback(
    (v: AiSummaryLayoutVariant) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v === 'a') {
            next.delete('variant')
          } else {
            next.set('variant', 'b')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-stone-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto w-full max-w-[1308px] px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-8 xl:px-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-emerald-800"
          >
            <span aria-hidden className="text-stone-400">
              ←
            </span>
            All projects
          </Link>
        </div>

        <div
          className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 px-5 py-4 text-[13px] text-amber-950 shadow-sm ring-1 ring-amber-100/80"
          role="region"
          aria-label="Layout variant"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
              UXR — Variations
            </span>
            <div className="inline-flex rounded-xl border border-amber-200/90 bg-white/90 p-1 shadow-sm">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  summaryLayout === 'a' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-950 hover:bg-amber-50'
                }`}
                onClick={() => setSummaryLayout('a')}
                aria-pressed={summaryLayout === 'a'}
              >
                Variant A
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  summaryLayout === 'b' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-950 hover:bg-amber-50'
                }`}
                onClick={() => setSummaryLayout('b')}
                aria-pressed={summaryLayout === 'b'}
              >
                Variant B
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:gap-12">
          <main id="main" className="min-w-0 lg:order-1" tabIndex={-1}>
            <ReviewsFigmaReplica key={summaryLayout} summaryLayout={summaryLayout} />
          </main>
          <aside className="hidden min-w-0 lg:order-2 lg:block lg:sticky lg:top-8 lg:z-10 lg:self-start">
            <BookingSidebar booking={variants[summaryLayout].booking} variantId={summaryLayout} />
          </aside>
        </div>
      </div>
    </div>
  )
}
