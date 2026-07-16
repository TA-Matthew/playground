import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  AVAILABILITY_MAX_TRAVELERS_TOTAL,
  type AvailabilityTravelerCounts,
} from '../../../data/availabilityShortcutTravelers'

type Props = {
  readonly value: AvailabilityTravelerCounts
  readonly onApply: (counts: AvailabilityTravelerCounts) => void
  readonly onClose: () => void
}

/** MW-only bottom-sheet travelers picker — draft state, applied on tap of Apply. */
export function AvailabilityTravelersSheet({ value, onApply, onClose }: Props) {
  const titleId = useId()
  const [draft, setDraft] = useState(value)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  const total = draft.adults + draft.children + draft.infants

  const step = (field: keyof AvailabilityTravelerCounts, delta: number) => {
    const next = { ...draft, [field]: draft[field] + delta }
    if (next[field] < 0) return
    if (next.adults + next.children + next.infants > AVAILABILITY_MAX_TRAVELERS_TOTAL) return
    setDraft(next)
  }

  const handleApply = () => {
    onApply(draft)
    handleClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/40"
        aria-label="Close travelers picker"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-medium leading-7 tracking-[0.2px] text-black">
            Select travelers
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[#4d4d4d] transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="mt-4 text-sm font-medium leading-5 text-[#333]">
          Select up to {AVAILABILITY_MAX_TRAVELERS_TOTAL} travelers in total.
        </p>

        <div className="mt-6 flex flex-col gap-6">
          <TravelerRow
            title="Adult (16-99)"
            limits="Minimum: 1, Maximum: 15"
            value={draft.adults}
            onDecrement={() => step('adults', -1)}
            onIncrement={() => step('adults', 1)}
            decrementDisabled={draft.adults <= 1}
            incrementDisabled={total >= AVAILABILITY_MAX_TRAVELERS_TOTAL}
          />
          <TravelerRow
            title="Child (4-15)"
            badge="-48%*"
            limits="Minimum: 1, Maximum: 15"
            value={draft.children}
            onDecrement={() => step('children', -1)}
            onIncrement={() => step('children', 1)}
            decrementDisabled={draft.children <= 0}
            incrementDisabled={total >= AVAILABILITY_MAX_TRAVELERS_TOTAL}
          />
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-[#008768] px-6 py-3 text-base font-medium leading-6 text-white transition hover:bg-[#007058]"
          onClick={handleApply}
        >
          Apply
        </button>

        <p className="mt-3 text-center text-xs leading-4 text-[#4d4d4d]">
          *Maximum discount rates shown may vary by date
        </p>
      </div>
    </div>,
    document.body,
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
          <p className="text-base font-medium leading-6 text-black">{title}</p>
          {badge ? (
            <span className="inline-flex rounded bg-[#eafbf7] px-1.5 py-0.5 text-xs font-medium leading-4 text-[#008768]">
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
        disabled ? 'cursor-not-allowed border-[#d9d9d9]' : 'border-[#008768] hover:bg-[#008768]/5'
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
      <path d="M4 8h8" stroke={active ? '#008768' : '#b0b2b5'} strokeWidth="1.5" strokeLinecap="round" />
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

function CloseIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
