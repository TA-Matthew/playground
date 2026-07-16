function CheckCircleIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#008768]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12.5l2.2 2.2 4.8-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Props = {
  priceAmount: string
  durationLabel: string
  averageRating: number
  onCheckAvailability: () => void
}

/**
 * Mobile-web sticky booking bar — Figma [node 9937:8620](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620),
 * "Frame 2147230554": free-cancellation strip + price/quick-facts + Check Availability CTA, pinned to the viewport bottom.
 */
export function OasisMobileStickyBar({
  priceAmount,
  durationLabel,
  averageRating,
  onCheckAvailability,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white md:hidden">
      <div className="flex items-center justify-center gap-1.5 border-b border-stone-100 py-2 text-xs font-medium text-stone-700">
        <CheckCircleIcon />
        Free cancellation up to 24 hours in advance
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1 text-sm text-stone-600">
            <span>{durationLabel}</span>
            <span aria-hidden>·</span>
            <span>{averageRating.toFixed(1)}★</span>
          </div>
          <div className="text-lg font-semibold text-stone-900">
            {priceAmount}
            <span className="ml-1 text-xs font-normal text-stone-500">per person</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCheckAvailability}
          className="shrink-0 rounded-lg bg-[#008768] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00755a]"
        >
          Check Availability
        </button>
      </div>
    </div>
  )
}
