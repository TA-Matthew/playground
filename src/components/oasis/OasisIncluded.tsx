import { viatorListing } from '../../data/viatorListing'

function CheckmarkIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="#ebfaf7" />
      <path d="M8 12.5l2.5 2.5 5.5-6" stroke="#00654e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * "What's included" checklist — Figma
 * [node 10033:21921](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-21921).
 * Bespoke to the Oasis desktop PDP. Figma shows the same 3 placeholder rows duplicated across two
 * columns; this uses the real `viatorListing.whatsIncluded` inclusion copy in a single column instead.
 */
export function OasisIncluded() {
  const { inclusions, exclusions, hiddenInclusionCount } = viatorListing.whatsIncluded
  const totalCount = inclusions.length + exclusions.length + hiddenInclusionCount

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <h2 className="text-[24px] font-medium leading-7 tracking-[0.2px] text-black">What&rsquo;s included</h2>

      <div className="flex w-full flex-col gap-4">
        {inclusions.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CheckmarkIcon />
            <p className="flex-1 text-[14px] leading-5 tracking-[0.05px] text-black">{item}</p>
          </div>
        ))}
      </div>

      <button type="button" className="pdp-neutral-outline-btn-md">
        See inclusions &amp; exclusions ({totalCount})
      </button>
    </div>
  )
}
