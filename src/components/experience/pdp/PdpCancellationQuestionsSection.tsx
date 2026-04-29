import { useState } from 'react'
import { viatorListing } from '../../../data/viatorListing'

/** DS chevron — mobile cancellation row ([Figma 17671:82481](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17671-82481)). */
function ChevronRight20({
  className,
  expanded,
}: Readonly<{ className?: string; expanded?: boolean }>) {
  return (
    <svg
      className={`size-5 shrink-0 text-black transition-transform duration-200 ${expanded ? 'rotate-90' : ''} ${className ?? ''}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.34467 4.27935C5.05178 3.98646 5.05178 3.51159 5.34467 3.21869C5.63756 2.9258 6.11244 2.9258 6.40533 3.21869L10.6564 7.46979C10.9493 7.76269 10.9493 8.23756 10.6564 8.53045L6.40533 12.7816C6.11244 13.0744 5.63756 13.0744 5.34467 12.7816C5.05178 12.4887 5.05178 12.0138 5.34467 11.7209L9.06544 8.00012L5.34467 4.27935Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Viator: Cancellation Policy + Questions — MW stacked dividers ([Figma 17671:82481](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17671-82481)); sm+ side-by-side cards.
 */
export function PdpCancellationQuestionsSection() {
  const [cOpen, setCOpen] = useState(false)
  const c = viatorListing.postPdp.cancellation
  const q = viatorListing.postPdp.questions

  const cancellationSummary = (
    <p className={`flex-1 text-base leading-[1.5] text-black ${cOpen ? '' : 'line-clamp-4'}`}>{c.summary}</p>
  )

  const cancellationTitle = (
    <h3 className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black sm:text-[28px] sm:leading-[1.2]">
      Cancellation Policy
    </h3>
  )

  const questionsTitle = (
    <h3 className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black sm:text-[28px] sm:leading-[1.2]">
      Questions?
    </h3>
  )

  return (
    <section aria-label="Policies and help">
      {/* Mobile — Figma 17671:82481 */}
      <div className="flex flex-col sm:hidden">
        <button
          type="button"
          className="flex w-full items-center gap-4 py-6 text-left"
          onClick={() => setCOpen((v) => !v)}
          aria-expanded={cOpen}
          aria-label={cOpen ? 'Show less cancellation policy' : 'Show more cancellation policy'}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {cancellationTitle}
            {cancellationSummary}
          </div>
          <ChevronRight20 expanded={cOpen} />
        </button>

        <div className="border-t border-[#d9d9d9] py-6">
          <div className="flex flex-col gap-4">
            {questionsTitle}
            <p className="text-base leading-[1.5] text-black">{q.body}</p>
            <p className="text-base leading-[1.5] text-black">
              Product code:{' '}
              <span className="text-black">{viatorListing.productCode}</span>
            </p>
            <span className="pdp-neutral-outline-btn-md mt-1 flex w-full cursor-default justify-center pointer-events-none">
              {q.helpCenterCta}
            </span>
          </div>
        </div>
      </div>

      {/* Tablet/desktop — bordered cards */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:py-6">
        <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border border-[#d9d9d9] bg-white px-6 py-8">
          {cancellationTitle}
          {cancellationSummary}
          <button
            type="button"
            className="pdp-neutral-outline-btn-md self-start"
            onClick={() => setCOpen((v) => !v)}
          >
            {cOpen ? 'Show less' : 'Show more'}
          </button>
        </div>
        <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border border-[#d9d9d9] bg-white px-6 py-8">
          {questionsTitle}
          <p className="text-base leading-[1.5] text-black">{q.body}</p>
          <p className="text-base leading-[1.5] text-black">
            Product code:{' '}
            <span className="text-black">{viatorListing.productCode}</span>
          </p>
          <span className="pdp-neutral-outline-btn-md mt-auto w-fit cursor-default pointer-events-none">
            {q.helpCenterCta}
          </span>
        </div>
      </div>
    </section>
  )
}
