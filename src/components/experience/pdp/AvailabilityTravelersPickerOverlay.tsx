import { useEffect, useState, type ReactNode } from 'react'
import {
  AVAILABILITY_MAX_TRAVELERS_TOTAL,
  type AvailabilityTravelerCounts,
} from '../../../data/availabilityShortcutTravelers'

type Props = {
  readonly value: AvailabilityTravelerCounts
  readonly onApply: (counts: AvailabilityTravelerCounts) => void
}

/**
 * Pax picker overlay — Q3 Decide 2026 (Figma 23785:27995).
 * @see https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23785-27995
 */
export function AvailabilityTravelersPickerOverlay({ value, onApply }: Props) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const total = draft.adults + draft.children + draft.infants

  const step = (field: keyof AvailabilityTravelerCounts, delta: number) => {
    const next = { ...draft, [field]: draft[field] + delta }
    if (field === 'adults' && next.adults < 1) return
    if (field !== 'adults' && next[field] < 0) return
    if (next.adults + next.children + next.infants > AVAILABILITY_MAX_TRAVELERS_TOTAL) return
    setDraft(next)
    onApply(next)
  }

  return (
    <div
      role="dialog"
      aria-label="Select travelers"
      className="w-[min(100vw-2rem,360px)] rounded-2xl border border-[#d9d9d9] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <p className="text-sm font-medium leading-5 text-[#333]">
        Select up to {AVAILABILITY_MAX_TRAVELERS_TOTAL} travelers in total.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <TravelerRow
          title="Adult (Age 19–99)"
          limits="Minimum: 1, Maximum: 15"
          value={draft.adults}
          onDecrement={() => step('adults', -1)}
          onIncrement={() => step('adults', 1)}
          decrementDisabled={draft.adults <= 1}
          incrementDisabled={total >= AVAILABILITY_MAX_TRAVELERS_TOTAL}
        />
        <TravelerRow
          title="Child (Age 7–18)"
          badge="-6%*"
          limits="Minimum: 0, Maximum: 15"
          value={draft.children}
          onDecrement={() => step('children', -1)}
          onIncrement={() => step('children', 1)}
          decrementDisabled={draft.children <= 0}
          incrementDisabled={total >= AVAILABILITY_MAX_TRAVELERS_TOTAL}
        />
        <TravelerRow
          title="Infant (Age 0–6)"
          badge="FREE*"
          limits="Minimum: 0, Maximum: 15"
          value={draft.infants}
          onDecrement={() => step('infants', -1)}
          onIncrement={() => step('infants', 1)}
          decrementDisabled={draft.infants <= 0}
          incrementDisabled={total >= AVAILABILITY_MAX_TRAVELERS_TOTAL}
        />
      </div>

      <p className="mt-6 text-center text-xs leading-4 text-[#4d4d4d]">
        Price varies by group size. *Maximum discount rates shown may vary by date.
      </p>
    </div>
  )
}

function TravelerRow({
  title,
  badge,
  limits,
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: {
  readonly title: string
  readonly badge?: string
  readonly limits: string
  readonly value: number
  readonly onDecrement: () => void
  readonly onIncrement: () => void
  readonly decrementDisabled: boolean
  readonly incrementDisabled: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold leading-6 text-black">{title}</p>
          {badge ? (
            <span className="inline-flex rounded bg-[#eafbf7] px-1.5 py-0.5 text-xs font-bold leading-4 text-[#008768]">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-4 text-[#737373]">{limits}</p>
      </div>
      <Stepper
        value={value}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        decrementDisabled={decrementDisabled}
        incrementDisabled={incrementDisabled}
      />
    </div>
  )
}

function Stepper({
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: {
  readonly value: number
  readonly onDecrement: () => void
  readonly onIncrement: () => void
  readonly decrementDisabled: boolean
  readonly incrementDisabled: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <StepperButton label="Decrease" disabled={decrementDisabled} onClick={onDecrement}>
        <MinusIcon active={!decrementDisabled} />
      </StepperButton>
      <span className="min-w-[1.25rem] text-center text-base font-medium tabular-nums text-black">
        {value}
      </span>
      <StepperButton label="Increase" disabled={incrementDisabled} onClick={onIncrement}>
        <PlusIcon active={!incrementDisabled} />
      </StepperButton>
    </div>
  )
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  readonly label: string
  readonly disabled: boolean
  readonly onClick: () => void
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`inline-flex size-9 items-center justify-center rounded-full border bg-white transition ${
        disabled
          ? 'cursor-not-allowed border-[#d9d9d9]'
          : 'border-[#008768] hover:bg-[#008768]/5'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function MinusIcon({ active }: { readonly active: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 8h8"
        stroke={active ? '#008768' : '#b0b2b5'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon({ active }: { readonly active: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 4v8M4 8h8"
        stroke={active ? '#008768' : '#b0b2b5'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
