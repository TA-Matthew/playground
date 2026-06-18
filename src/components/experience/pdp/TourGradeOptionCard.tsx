import { useMemo, useState } from 'react'
import { BenefitCheckIcon } from '../../icons/BenefitCheckIcon'
import {
  formatAvailabilitySearchTotal,
  type AvailabilityTimeSlot,
  type TourGradeOption,
} from '../../../data/availabilityShortcutOptions'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'

type Props = {
  readonly option: TourGradeOption
  readonly variant: 'expanded' | 'collapsed'
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly dateLabel?: string
  readonly onSelect?: () => void
}

/** Tour grade option card — expanded (selected) or collapsed row in the options panel. */
export function TourGradeOptionCard({
  option,
  variant,
  travelerCounts,
  dateLabel,
  onSelect,
}: Props) {
  if (variant === 'collapsed') {
    return (
      <CollapsedTourGradeOptionCard
        option={option}
        travelerCounts={travelerCounts}
        onSelect={onSelect ?? (() => {})}
      />
    )
  }

  return (
    <ExpandedTourGradeOptionCard
      option={option}
      travelerCounts={travelerCounts}
      dateLabel={dateLabel ?? ''}
    />
  )
}

function ExpandedTourGradeOptionCard({
  option,
  travelerCounts,
  dateLabel,
}: {
  readonly option: TourGradeOption
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly dateLabel: string
}) {
  const [selectedTimeId, setSelectedTimeId] = useState(
    () => option.timeSlots?.find((slot) => slot.status === 'selected')?.id ?? '1030',
  )
  const [readMoreOpen, setReadMoreOpen] = useState(false)

  const totalPrice = useMemo(
    () => formatAvailabilitySearchTotal(travelerCounts),
    [travelerCounts],
  )

  const priceDetailLine = useMemo(() => {
    const parts: string[] = []
    if (travelerCounts.adults > 0) {
      parts.push(
        `${travelerCounts.adults} ${travelerCounts.adults === 1 ? 'Adult' : 'Adults'} x ${option.perPersonPrice}`,
      )
    }
    if (travelerCounts.children > 0) {
      parts.push(`${travelerCounts.children} ${travelerCounts.children === 1 ? 'Child' : 'Children'}`)
    }
    if (travelerCounts.infants > 0) {
      parts.push(`${travelerCounts.infants} ${travelerCounts.infants === 1 ? 'Infant' : 'Infants'}`)
    }
    return parts.join(', ')
  }, [travelerCounts, option.perPersonPrice])

  return (
    <article
      data-tour-grade-option-card
      data-variant="expanded"
      className="relative flex w-full overflow-hidden rounded-2xl border border-[#008768] bg-white"
    >
      <div className="flex min-w-0 flex-1 gap-4 p-6">
        <RadioButton selected aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <h3 className="text-lg font-bold leading-[1.2] text-black">{option.expandedTitle}</h3>

          {option.description ? (
            <div className="flex flex-col gap-1">
              <p
                className={`text-base leading-normal text-black ${readMoreOpen ? '' : 'line-clamp-2'}`}
              >
                {option.description}
              </p>
              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 text-base leading-normal text-black"
                onClick={() => setReadMoreOpen((open) => !open)}
              >
                {readMoreOpen ? 'Read less' : 'Read more'}
                <ChevronDown className={readMoreOpen ? 'rotate-180' : ''} />
              </button>
            </div>
          ) : null}

          {option.timeSlots && option.timeSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {option.timeSlots.map((slot) => (
                <TimeSlotChip
                  key={slot.id}
                  slot={slot.id === selectedTimeId ? { ...slot, status: 'selected' } : slot}
                  onSelect={() => {
                    if (slot.status !== 'sold-out') setSelectedTimeId(slot.id)
                  }}
                />
              ))}
            </div>
          ) : null}

          <div className="rounded-lg bg-[#eafbf7] px-4 py-3">
            <ul className="flex flex-col gap-4 text-sm leading-normal text-black">
              <li className="flex gap-3">
                <BenefitCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="font-bold underline decoration-solid underline-offset-2">
                    Free cancellation
                  </span>{' '}
                  before 3:00 PM (local time) on {dateLabel}
                </span>
              </li>
              <li className="flex gap-3">
                <BenefitCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="font-bold underline decoration-solid underline-offset-2">
                    Reserve now, pay nothing
                  </span>{' '}
                  until Feb 19
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex w-[min(100%,280px)] shrink-0 flex-col justify-between border-l border-[#d9d9d9] p-6">
        <div className="text-right">
          <p className="text-base font-bold leading-normal text-black">{totalPrice}</p>
          <p className="text-sm leading-normal text-black">{priceDetailLine}</p>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <button
            type="button"
            className="w-full rounded-lg border-[1.5px] border-[#0d0d0d] bg-white px-6 py-2.5 text-base font-medium leading-6 text-[#0d0d0d] transition hover:bg-neutral-50"
          >
            Reserve Now &amp; Pay Later
          </button>
          <button
            type="button"
            className="w-full rounded-lg bg-[#008768] px-6 py-2.5 text-base font-medium leading-6 text-white transition hover:bg-[#007058]"
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  )
}

function CollapsedTourGradeOptionCard({
  option,
  travelerCounts,
  onSelect,
}: {
  readonly option: TourGradeOption
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly onSelect: () => void
}) {
  const total = useMemo(
    () => formatAvailabilitySearchTotal(travelerCounts),
    [travelerCounts],
  )

  const priceDetailLine = useMemo(() => {
    if (travelerCounts.adults > 0) {
      return `${travelerCounts.adults} ${travelerCounts.adults === 1 ? 'Adult' : 'Adults'} x ${option.perPersonPrice}`
    }
    return `${option.perPersonPrice} /person`
  }, [travelerCounts.adults, option.perPersonPrice])

  return (
    <button
      type="button"
      data-tour-grade-option-card
      data-variant="collapsed"
      className="flex w-full overflow-hidden rounded-lg border border-[#d9d9d9] bg-white text-left transition hover:bg-neutral-50/80"
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 p-6">
        <RadioButton selected={false} />
        <p className="text-lg font-bold leading-[1.2] text-black">{option.title}</p>
      </div>
      <div className="flex w-[min(100%,220px)] shrink-0 flex-col justify-center border-l border-[#d9d9d9] p-6 text-right">
        <p className="text-base font-bold leading-normal text-black">{total}</p>
        <p className="text-sm leading-normal text-black">{priceDetailLine}</p>
      </div>
    </button>
  )
}

function TimeSlotChip({
  slot,
  onSelect,
}: {
  readonly slot: AvailabilityTimeSlot
  readonly onSelect: () => void
}) {
  if (slot.status === 'sold-out') {
    return (
      <span className="relative inline-flex h-11 min-w-[92px] items-center justify-center rounded-lg border border-[#b0b2b5] bg-white px-4 text-sm font-semibold text-[#7b7e84]">
        {slot.label}
        <span
          className="pointer-events-none absolute inset-[3px_2px] rounded-md border border-transparent"
          aria-hidden
          style={{
            background:
              'linear-gradient(to top right, transparent calc(50% - 0.5px), #b0b2b5 calc(50% - 0.5px), #b0b2b5 calc(50% + 0.5px), transparent calc(50% + 0.5px))',
          }}
        />
      </span>
    )
  }

  const selected = slot.status === 'selected'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex h-11 min-w-[92px] items-center justify-center rounded-lg px-4 text-sm font-medium transition ${
        selected
          ? 'bg-[#008768] text-white'
          : 'border border-[#008768] bg-white text-[#008768] hover:bg-[#008768]/5'
      }`}
    >
      {slot.label}
    </button>
  )
}

function RadioButton({ selected }: { readonly selected: boolean }) {
  return (
    <span
      className="relative inline-flex size-6 shrink-0 items-center justify-center"
      aria-hidden
    >
      {selected ? (
        <>
          <span className="absolute size-[18px] rounded-full border-2 border-[#008768]" />
          <span className="size-2.5 rounded-full bg-[#008768]" />
        </>
      ) : (
        <span className="size-[18px] rounded-full border-2 border-[#737373]" />
      )}
    </span>
  )
}

function ChevronDown({ className = '' }: { readonly className?: string }) {
  return (
    <svg
      className={`size-4 shrink-0 transition-transform ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
