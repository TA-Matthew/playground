import { viatorListing } from '../../../data/viatorListing'

export function PdpOverviewSection() {
  const o = viatorListing.overview
  return (
    <section className="border-t border-[#d9d9d9] pb-10 pt-6" aria-labelledby="pdp-overview-h">
      <h2
        id="pdp-overview-h"
        className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
      >
        Overview
      </h2>
      <p className="pdp-tour-summary-body mt-4">{o.body}</p>
      <ul className="pdp-tour-summary-body mt-4 list-inside list-disc space-y-2.5 pl-0.5">
        {o.bullets.map((b) => (
          <li key={b} className="marker:text-[#b3b3b3]">
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <h3 className="text-base font-medium leading-[1.2] text-black sm:text-lg">{o.whyChooseTitle}</h3>
        <p className="pdp-tour-summary-body mt-2">{o.whyChooseBody}</p>
      </div>
    </section>
  )
}
