function DialIcon() {
  return (
    <svg width={20} height={10} viewBox="0 0 20 10" fill="none" aria-hidden className="shrink-0">
      <path d="M10 0.5A9.5 9.5 0 0 1 19.5 9.5h-19A9.5 9.5 0 0 1 10 0.5Z" fill="#D9D9D9" />
      <path d="M10 9.5L5 1.3A9.5 9.5 0 0 0 0.5 9.5H10Z" fill="#00C295" />
      <path d="M10 9.5L15 1.3A9.5 9.5 0 0 1 19.5 9.5H10Z" fill="#D9D9D9" />
    </svg>
  )
}

type Props = {
  priceAmount: string
  exceptionalDealLabel: string
  onCheckAvailability: () => void
  /** Shows the "Typically booked" strip docked above the price row, once it's animated in from the gallery. */
  showBookedBanner?: boolean
}

/**
 * Mobile-web sticky booking bar — Figma
 * [node 10144:18906](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18906),
 * "Frame 2147230554": a green "Free cancellation up to 24 hours" strip, then a price + exceptional-deal
 * tag on the left and a "Check availability" pill CTA on the right, pinned to the viewport bottom.
 */
export function OasisMobileStickyBar({
  priceAmount,
  exceptionalDealLabel,
  onCheckAvailability,
  showBookedBanner = false,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white drop-shadow-[0px_0px_6px_rgba(0,0,0,0.25)] md:hidden">
      <div
        aria-hidden={!showBookedBanner}
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
          showBookedBanner ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex items-center justify-center gap-2 border-b border-[#d9d9d9] px-4 py-2.5">
          <span aria-hidden className="text-[16px] leading-none">
            🔥
          </span>
          <p className="whitespace-nowrap text-[13px] font-medium leading-[1.3] text-[#333]">
            Typically booked 8 days in advance
          </p>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 px-6 pb-6 pt-4">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">From</span>
            <span className="text-[20px] font-bold leading-[22px] tracking-[0.2px] text-black">{priceAmount}</span>
            <span className="text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">/person</span>
          </p>
          <span className="flex items-center gap-1 rounded-md border border-[#d9d9d9] p-1 text-[12px] font-medium leading-4 tracking-[0.05px] text-[#4d4d4d]">
            <DialIcon />
            {exceptionalDealLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckAvailability}
          className="shrink-0 rounded-xl bg-[#008768] px-6 py-[13px] text-[16px] font-bold leading-[1.2] text-white transition hover:bg-[#00654e]"
        >
          Check availability
        </button>
      </div>
    </div>
  )
}
