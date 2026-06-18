import { useEffect, useId, useRef, useState } from 'react'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
import { totalTravelers } from '../../../data/availabilityShortcutTravelers'
import { AvailabilityInlineMetaTrigger } from './AvailabilityInlineMetaTrigger'
import { AvailabilityTravelersPickerOverlay } from './AvailabilityTravelersPickerOverlay'

type Props = {
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly onTravelerCountsChange: (counts: AvailabilityTravelerCounts) => void
  readonly variant: 'chip' | 'inline'
}

/** Travelers chip / inline control — opens Figma pax picker overlay. */
export function AvailabilityTravelersControl({
  travelerCounts,
  onTravelerCountsChange,
  variant,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()
  const displayTotal = totalTravelers(travelerCounts)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const overlay = open ? (
    <div
      id={popoverId}
      className="absolute left-0 top-[calc(100%+8px)] z-20"
    >
      <AvailabilityTravelersPickerOverlay
        value={travelerCounts}
        onApply={onTravelerCountsChange}
      />
    </div>
  ) : null

  if (variant === 'inline') {
    return (
      <div ref={rootRef} className="relative">
        <AvailabilityInlineMetaTrigger
          icon={<PersonIcon />}
          interactive
          expanded={open}
          ariaLabel={`Change travelers, currently ${displayTotal}`}
          ariaExpanded={open}
          ariaControls={popoverId}
          onClick={() => setOpen((value) => !value)}
        >
          {displayTotal}
        </AvailabilityInlineMetaTrigger>
        {overlay}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d9d9d9] bg-white px-4 text-sm font-medium leading-5 tracking-[0.05px] text-[#4d4d4d] transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d8564]"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={`Change travelers, currently ${displayTotal}`}
        onClick={() => setOpen((value) => !value)}
      >
        <PersonIcon />
        <span className="whitespace-nowrap">{displayTotal}</span>
        <ChevronDown className={open ? 'rotate-180' : ''} />
      </button>
      {overlay}
    </div>
  )
}

function PersonIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 8a2.667 2.667 0 1 0 0-5.333A2.667 2.667 0 0 0 8 8ZM3.333 13.333c0-2.577 2.09-4.666 4.667-4.666s4.667 2.09 4.667 4.666H3.333Z"
        fill="#4D4D4D"
      />
    </svg>
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
