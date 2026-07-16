import { AvailabilityDateControl } from '../experience/pdp/AvailabilityDateControl'
import { AvailabilityTravelersControl } from '../experience/pdp/AvailabilityTravelersControl'
import type { AvailabilityTravelerCounts } from '../../data/availabilityShortcutTravelers'
import type { BookingContent } from '../../data/variants'

function FlameIcon() {
  return (
    <span aria-hidden className="text-[24px] leading-none">
      🔥
    </span>
  )
}

function InfoIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#008768]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DialIcon() {
  return (
    <svg width={20} height={10} viewBox="0 0 20 10" fill="none" aria-hidden className="shrink-0">
      <path d="M10 0.5A9.5 9.5 0 0 1 19.5 9.5h-19A9.5 9.5 0 0 1 10 0.5Z" fill="#D9D9D9" />
      <path d="M10 9.5L5 1.3A9.5 9.5 0 0 0 0.5 9.5H10Z" fill="#00C295" />
      <path d="M10 9.5L15 1.3A9.5 9.5 0 0 1 19.5 9.5H10Z" fill="#D9D9D9" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <span aria-hidden className="text-[16px] leading-none">
      📈
    </span>
  )
}

function TagIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <path d="M12 3l8 8-9 9-8-8 9-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="1.2" fill="currentColor" />
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
  availabilitySearchActive: boolean
  searchTotalAmount?: string
  searchTotalLoading?: boolean
}

/**
 * Commerce sidebar — Figma
 * [node 10033:23361](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-23361):
 * "typically booked" alert card, price + exceptional-deal tag, date/traveler filter chips, CTA, tertiary
 * callout, and a "questions? call us now" footer line. Bespoke to the Oasis desktop PDP — replaces the
 * shared `BookingSidebar`. Reuses the `AvailabilityDateControl` / `AvailabilityTravelersControl` chip
 * primitives (interaction only — those already render as filter chips, matching Figma's `Filter chip`).
 */
export function OasisBookingSidebar({
  booking,
  dateLabel,
  onDateLabelChange,
  travelerCounts,
  onTravelerCountsChange,
  onCheckAvailability,
  availabilitySearchActive,
  searchTotalAmount,
  searchTotalLoading,
}: Props) {
  const priceLabel = availabilitySearchActive ? searchTotalAmount ?? booking.priceAmount : booking.priceAmount

  return (
    <div className="flex w-[419px] flex-col items-start gap-4">
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-[0px_4px_12px_rgba(2,44,69,0.15)]">
        <FlameIcon />
        <p className="text-[14px] font-medium leading-5 text-[#333]">{booking.bookAheadSubtitle}</p>
      </div>

      <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-[0px_4px_12px_rgba(2,44,69,0.15)]">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col items-start">
            <p className="flex items-baseline gap-1">
              <span className="text-[12px] leading-[1.5] text-[#707070]">From</span>
              <span className="text-[18px] font-bold leading-[22px] tracking-[0.2px] text-black">
                {availabilitySearchLoadingLabel(searchTotalLoading, priceLabel)}
              </span>
              <span className="text-[12px] leading-[1.5] text-[#707070]">/person</span>
            </p>
            <div className="flex items-center gap-1">
              <p className="text-[12px] leading-[1.5] text-[#008768]">Free cancellation • Pay $0 today</p>
              <InfoIcon />
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-md border border-[#d9d9d9] p-1 text-[12px] font-medium text-[#4d4d4d]">
            <DialIcon />
            {booking.badgeExceptionalDeal}
          </span>
        </div>

        <div className="flex w-full items-start gap-2">
          <AvailabilityDateControl dateLabel={dateLabel} onDateLabelChange={onDateLabelChange} variant="chip" fullWidth />
          <AvailabilityTravelersControl
            travelerCounts={travelerCounts}
            onTravelerCountsChange={onTravelerCountsChange}
            variant="chip"
            className="shrink-0"
          />
        </div>

        <button
          type="button"
          onClick={onCheckAvailability}
          className="w-full rounded-xl bg-[#008768] py-3.5 text-center text-[16px] font-bold text-white transition hover:bg-[#00654e]"
        >
          {availabilitySearchActive ? 'Update search' : 'Check availability'}
        </button>

        <div className="flex w-full items-center justify-center gap-2">
          <TrendingIcon />
          <p className="text-[13px] leading-[1.5] text-[#333]">
            {booking.bookAheadTitle} {booking.bookAheadSubtitle}
          </p>
        </div>
      </div>

      <div className="flex w-full items-start justify-center gap-2 py-4">
        <TagIcon />
        <p className="text-[12px] leading-4 tracking-[0.05px] text-[#4d4d4d]">questions? call us now</p>
      </div>
    </div>
  )
}

function availabilitySearchLoadingLabel(loading: boolean | undefined, label: string): string {
  return loading ? '…' : label
}
