import bookAheadFlame from '../../assets/book-ahead-flame.png'
import type { BookingContent, VariantId } from '../../data/variants'

type Props = {
  booking: BookingContent
  variantId: VariantId
}

export function BookingSidebar({ booking, variantId }: Props) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-stone-100">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-[13px] font-medium text-rose-800 ring-1 ring-rose-100">
          <ClockIcon className="h-4 w-4 shrink-0 text-rose-700" />
          {booking.dealEndsLabel}
        </div>

        <div className="space-y-1">
          <p className="text-[13px] font-medium uppercase tracking-wider text-stone-500">
            From
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-medium text-rose-700">{booking.discountPct}</span>
            <span className="text-[1.65rem] font-bold tracking-tight text-stone-900">
              {booking.priceDisplay}
            </span>
          </div>
          <p className="text-sm text-stone-500 line-through">Was {booking.wasPrice}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 shadow-inner">
          <button
            type="button"
            className="flex flex-col items-start gap-0.5 bg-white px-3 py-3 text-left transition hover:bg-stone-50"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Date
            </span>
            <span className="flex w-full items-center justify-between gap-2 text-[15px] font-medium text-stone-900">
              {booking.dateLabel}
              <ChevronDown />
            </span>
          </button>
          <button
            type="button"
            className="flex flex-col items-start gap-0.5 bg-white px-3 py-3 text-left transition hover:bg-stone-50"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Travellers
            </span>
            <span className="flex w-full items-center justify-between gap-2 text-[15px] font-medium text-stone-900">
              <span className="inline-flex items-center gap-1.5">
                <PersonIcon />
                {booking.travellers}
              </span>
              <ChevronDown />
            </span>
          </button>
        </div>

        {variantId !== 'b' ? (
          <button
            type="button"
            className="mt-5 flex w-full items-start gap-2.5 rounded-lg text-left text-[15px] text-stone-800 transition hover:bg-stone-50"
          >
            <span className="mt-0.5 shrink-0 text-stone-700">
              <MapPinSmall />
            </span>
            <span className="font-medium underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500">
              {booking.meetingPoint}
            </span>
          </button>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-xl border-2 border-stone-900 bg-white py-3.5 text-center text-[15px] font-medium text-stone-900 shadow-sm transition hover:bg-stone-50 active:scale-[0.99]"
          >
            Reserve Now & Pay Later
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-center text-[15px] font-medium text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.99]"
          >
            Book now
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3.5 text-[13px] leading-snug text-stone-700">
          <ul className="space-y-2.5">
            <li className="flex gap-2.5">
              <CheckIcon />
              <span>
                Free cancellation up to 24 hours before the experience starts (local time)
              </span>
            </li>
            <li className="flex gap-2.5">
              <CheckIcon />
              <span>Reserve Now & Pay Later - Secure your spot while staying flexible</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-stone-200/90 bg-white px-4 py-3.5 text-[13px] leading-relaxed text-stone-700 shadow-sm">
        <img
          src={bookAheadFlame}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 object-contain"
          aria-hidden
        />
        <p>{booking.bookAheadNote}</p>
      </div>
    </aside>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v6l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 1116 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapPinSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        fill="currentColor"
      />
      <circle cx="12" cy="11" r="2" fill="white" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

