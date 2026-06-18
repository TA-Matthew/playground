import { useEffect, useId, useRef, useState } from 'react'
import { AvailabilityDatePickerOverlay } from './AvailabilityDatePickerOverlay'
import { AvailabilityInlineMetaTrigger } from './AvailabilityInlineMetaTrigger'

type Props = {
  readonly dateLabel: string
  readonly onDateLabelChange: (dateLabel: string) => void
  readonly variant: 'chip' | 'inline'
}

/** Date chip / inline control — opens dual-month calendar overlay. */
export function AvailabilityDateControl({ dateLabel, onDateLabelChange, variant }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

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
    <div id={popoverId} className="absolute left-0 top-[calc(100%+8px)] z-20">
      <AvailabilityDatePickerOverlay
        dateLabel={dateLabel}
        onSelect={onDateLabelChange}
        onClose={() => setOpen(false)}
      />
    </div>
  ) : null

  if (variant === 'inline') {
    return (
      <div ref={rootRef} className="relative">
        <AvailabilityInlineMetaTrigger
          icon={<CalendarIcon />}
          interactive
          expanded={open}
          ariaLabel={`Change date, currently ${dateLabel}`}
          ariaExpanded={open}
          ariaControls={popoverId}
          onClick={() => setOpen((value) => !value)}
        >
          {dateLabel}
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
        aria-label={`Change date, currently ${dateLabel}`}
        onClick={() => setOpen((value) => !value)}
      >
        <CalendarIcon />
        <span className="whitespace-nowrap">{dateLabel}</span>
        <ChevronDown className={open ? 'rotate-180' : ''} />
      </button>
      {overlay}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.333 1.333a.667.667 0 0 1 .667.667V3h4V2a.667.667 0 1 1 1.333 0V3h.667A1.333 1.333 0 0 1 13.333 4.333v9.334A1.333 1.333 0 0 1 12 15H4a1.333 1.333 0 0 1-1.333-1.333V4.333A1.333 1.333 0 0 1 4 3h.667V2a.667.667 0 0 1 .666-.667ZM4 4.667v8.666h8V4.667H4Zm2 2.666a.667.667 0 0 0 0 1.334h4a.667.667 0 0 0 0-1.334H6Z"
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
