import { viatorListing } from '../../../data/viatorListing'

export function PdpOverviewSection() {
  const o = viatorListing.overview
  return (
    <section className="border-t border-[#d9d9d9] pt-6" aria-labelledby="pdp-overview-h">
      <h2
        id="pdp-overview-h"
        className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black"
      >
        Overview
      </h2>
      <p className="mt-4 text-base leading-[1.5] text-[#333]">{o.body}</p>
      <ul className="mt-4 list-inside list-disc space-y-2.5 pl-0.5 text-base leading-[1.5] text-[#333]">
        {o.bullets.map((b) => (
          <li key={b} className="marker:text-[#b3b3b3]">
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-8 border-t border-[#d9d9d9] pt-6">
        <h3 className="text-lg font-bold leading-[1.2] text-black">{o.whyChooseTitle}</h3>
        <p className="mt-2 text-base leading-[1.5] text-[#333]">{o.whyChooseBody}</p>
      </div>
    </section>
  )
}
