import { viatorListing } from '../../data/viatorListing'

function CheckmarkIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-black">
      <path d="M5 13l4 4 10-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-black">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Mobile-web "What's included" checklist — Figma
 * [node 10144:18702](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18702):
 * plain check/cross line icons (not the desktop's filled teal-circle checkmark) since the mobile frame
 * also surfaces exclusions inline with a cross, not just a separate "See exclusions" link.
 */
export function OasisMobileIncluded() {
  const { inclusions, exclusions, hiddenInclusionCount } = viatorListing.whatsIncluded
  const totalCount = inclusions.length + exclusions.length + hiddenInclusionCount

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <p className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black">What&rsquo;s included</p>

      <div className="flex w-full flex-col items-start gap-4">
        {inclusions.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CheckmarkIcon />
            <p className="flex-1 text-[14px] leading-5 tracking-[0.05px] text-black">{item}</p>
          </div>
        ))}
        {exclusions.slice(0, 1).map((item) => (
          <div key={item} className="flex items-start gap-2">
            <CrossIcon />
            <p className="flex-1 text-[14px] leading-5 tracking-[0.05px] text-black">{item}</p>
          </div>
        ))}
      </div>

      <button type="button" className="pdp-neutral-outline-btn-md w-full">
        See inclusions &amp; exclusions ({totalCount})
      </button>
    </div>
  )
}
