import { useState } from 'react'
import { viatorListing } from '../../../data/viatorListing'

export function PdpWhatsIncludedSection() {
  const w = viatorListing.whatsIncluded
  const [open, setOpen] = useState(true)

  return (
    <section
      className="border-t border-[#d9d9d9] pt-6"
      aria-labelledby="pdp-included-h"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="pdp-included-h"
          className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black"
        >
          What&apos;s included
        </h2>
        <button
          type="button"
          className="shrink-0 p-1 text-[#4d4d4d] transition hover:text-black"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className={`block text-lg transition ${open ? '' : 'rotate-180'}`} aria-hidden>
            ^
          </span>
        </button>
      </div>
      {open ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
          <ul className="space-y-3 text-base leading-[1.5] text-[#333]">
            {w.inclusions.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 text-black" aria-hidden>
                  ✓
                </span>
                <span>{t}</span>
              </li>
            ))}
            {w.hiddenInclusionCount > 0 ? (
              <li>
                <button
                  type="button"
                  className="text-sm font-medium text-[#0d0d0d] underline [text-decoration-skip-ink:none] decoration-[#0d0d0d] underline-offset-2"
                >
                  See {w.hiddenInclusionCount} more
                </button>
              </li>
            ) : null}
          </ul>
          <ul className="space-y-3 text-base leading-[1.5] text-[#333]">
            {w.exclusions.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 text-[#707070]" aria-hidden>
                  ✕
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
