import { AvailabilityDateControl } from '../experience/pdp/AvailabilityDateControl'
import { AvailabilityTravelersControl } from '../experience/pdp/AvailabilityTravelersControl'
import {
  formatCommerceTimesPreview,
  formatRoundedFromPrice,
  TOUR_GRADE_OPTIONS,
} from '../../data/availabilityShortcutOptions'
import type { AvailabilityTravelerCounts } from '../../data/availabilityShortcutTravelers'
import type { BookingContent } from '../../data/variants'

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
  booking: BookingContent
  dateLabel: string
  onDateLabelChange: (label: string) => void
  travelerCounts: AvailabilityTravelerCounts
  onTravelerCountsChange: (counts: AvailabilityTravelerCounts) => void
  onCheckAvailability: () => void
  onOpenAvailabilityOptions: (optionId: string) => void
  availabilitySearchActive: boolean
  searchTotalAmount?: string
  searchTotalLoading?: boolean
}

/**
 * Mobile-web "Master Commerce Module" — Figma
 * [node 10144:18921](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18921):
 * discount + exceptional-deal tags, price, date/traveler filter chips, a horizontally-scrolling row of
 * tour-grade option cards, and a full-width "Check availability" button. Reuses the same
 * `AvailabilityDateControl` / `AvailabilityTravelersControl` chip primitives and `TOUR_GRADE_OPTIONS`
 * data as the desktop {@link OasisBookingSidebar} — only the layout/markup is bespoke to this frame.
 */
export function OasisMobileCommerceModule({
  booking,
  dateLabel,
  onDateLabelChange,
  travelerCounts,
  onTravelerCountsChange,
  onCheckAvailability,
  onOpenAvailabilityOptions,
  availabilitySearchActive,
  searchTotalAmount,
  searchTotalLoading,
}: Props) {
  const priceLabel = availabilitySearchActive ? searchTotalAmount ?? booking.priceAmount : booking.priceAmount

  return (
    <div className="flex w-full flex-col items-start gap-6 rounded-lg bg-white">
      <div className="flex w-full flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#fcedf0] px-1 py-[2.5px] text-[12px] font-medium leading-4 tracking-[0.05px] text-[#c81e3a]">
            Ends May 24
          </span>
          <span className="flex items-center gap-1 rounded-md border border-[#d9d9d9] p-1 text-[12px] font-medium leading-4 tracking-[0.05px] text-[#4d4d4d]">
            <DialIcon />
            {booking.badgeExceptionalDeal}
          </span>
        </div>
        <p className="flex items-end gap-1">
          <span className="text-[24px] font-bold leading-[1.2] text-black">From</span>
          <span className="text-[24px] font-bold leading-[1.2] text-black">
            {searchTotalLoading ? '…' : priceLabel}
          </span>
          <span className="text-[14px] leading-[1.5] text-black">per person</span>
        </p>
      </div>

      <div className="flex w-full items-start gap-2">
        <AvailabilityDateControl dateLabel={dateLabel} onDateLabelChange={onDateLabelChange} variant="chip" />
        <AvailabilityTravelersControl travelerCounts={travelerCounts} onTravelerCountsChange={onTravelerCountsChange} variant="chip" />
      </div>

      <div className="flex w-full gap-4 overflow-x-auto pb-1">
        {TOUR_GRADE_OPTIONS.slice(0, 3).map((option, i) => {
          const timesPreview = formatCommerceTimesPreview(option.timeSlots)
          return (
            <div
              key={option.id}
              className="relative flex h-[152px] w-[280px] shrink-0 flex-col justify-between rounded-2xl border border-[#d9d9d9] bg-white px-4 py-4"
            >
              {i === 0 ? (
                <div className="absolute left-4 top-0 flex -translate-y-1/2 items-center gap-1.5">
                  <span className="rounded bg-[#d3f6ee] px-1 py-[2.5px] text-[11px] font-medium leading-4 tracking-[0.05px] text-[#004d3b]">
                    Best seller
                  </span>
                  {option.scarcityLabel ? (
                    <span className="whitespace-nowrap rounded bg-[#fcedf0] px-1 py-[2.5px] text-[11px] font-medium leading-4 tracking-[0.05px] text-[#c81e3a]">
                      Likely to sell out
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <p className="text-[16px] font-medium leading-6 tracking-[0.05px] text-[#333]">{option.title}</p>
                <p className="text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">
                  {timesPreview?.text ?? `${option.timeSlots?.length ?? 0} times available`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="flex items-baseline gap-1 whitespace-nowrap text-black">
                  <span className="text-[12px] leading-4">from</span>
                  <span className="text-[16px] font-bold leading-6">{formatRoundedFromPrice(option.perPersonPrice)}</span>
                  <span className="text-[12px] leading-4">/person</span>
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAvailabilityOptions(option.id)}
                  className="shrink-0 rounded-full bg-[#008768] px-4 py-2 text-[14px] font-bold leading-5 text-white transition hover:bg-[#00654e]"
                >
                  Book
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onCheckAvailability}
        className="w-full rounded-xl bg-[#008768] py-3.5 text-center text-[16px] font-bold text-white transition hover:bg-[#00654e]"
      >
        {availabilitySearchActive ? 'Update search' : 'Check availability'}
      </button>
    </div>
  )
}
