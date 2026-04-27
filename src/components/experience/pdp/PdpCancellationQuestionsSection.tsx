import { useState } from 'react'
import { viatorListing } from '../../../data/viatorListing'

/**
 * Viator: Cancellation Policy and Questions? side-by-side cards.
 */
export function PdpCancellationQuestionsSection() {
  const [cOpen, setCOpen] = useState(false)
  const c = viatorListing.postPdp.cancellation
  const q = viatorListing.postPdp.questions

  return (
    <section className="pt-8" aria-label="Policies and help">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border border-[#d9d9d9] bg-white px-6 py-8">
          <h3 className="text-2xl font-medium leading-[1.2] tracking-[0.2px] text-black">
            Cancellation Policy
          </h3>
          <p
            className={`flex-1 text-base leading-[1.5] text-black ${cOpen ? '' : 'line-clamp-4'}`}
          >
            {c.summary}
          </p>
          <button
            type="button"
            className="self-start rounded-lg border border-[#0d0d0d] bg-white px-4 py-2 text-sm font-medium text-[#0d0d0d] transition hover:bg-[#f5f5f5]"
            onClick={() => setCOpen((v) => !v)}
          >
            {cOpen ? 'Show less' : 'Show more'}
          </button>
        </div>
        <div className="flex h-full min-h-0 flex-col gap-4 rounded-lg border border-[#d9d9d9] bg-white px-6 py-8">
          <h3 className="text-2xl font-medium leading-[1.2] tracking-[0.2px] text-black">Questions?</h3>
          <p className="text-base leading-[1.5] text-black">{q.body}</p>
          <p className="text-base leading-[1.5] text-black">
            Product code:{' '}
            <span className="text-black">{viatorListing.productCode}</span>
          </p>
          <a
            href="https://www.viator.com/help"
            className="mt-auto inline-flex w-fit items-center justify-center rounded-lg border border-[#0d0d0d] bg-white px-4 py-2 text-sm font-medium text-[#0d0d0d] transition hover:bg-[#f5f5f5]"
          >
            {q.helpCenterCta}
          </a>
        </div>
      </div>
    </section>
  )
}
