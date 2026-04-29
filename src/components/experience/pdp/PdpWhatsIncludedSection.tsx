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
      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-10 md:mt-4">
        <ul className="space-y-3 text-base leading-[1.5] text-black">
          {w.inclusions.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-0.5 shrink-0" aria-hidden>
                ✓
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-3 text-base leading-[1.5] text-black">
          {w.exclusions.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-0.5 shrink-0" aria-hidden>
                ✕
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        {w.hiddenInclusionCount > 0 ? (
          <button type="button" className="pdp-body-link-underline w-fit text-left">
            See {w.hiddenInclusionCount} more
          </button>
        ) : null}
      </div>
    </CollapsibleSection>
  )
}
