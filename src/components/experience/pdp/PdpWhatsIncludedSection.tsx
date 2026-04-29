import { CollapsibleSection } from '../../common/CollapsibleSection'
import { viatorListing } from '../../../data/viatorListing'

export function PdpWhatsIncludedSection() {
  const w = viatorListing.whatsIncluded

  return (
    <CollapsibleSection
      title="What's included"
      defaultOpen
      headingId="pdp-included-h"
      disableLastBorderReset
      dividerTop
    >
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
    </CollapsibleSection>
  )
}
