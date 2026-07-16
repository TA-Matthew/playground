import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  addCalendarMonths,
  AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH,
  formatAvailabilityDateLabel,
  formatMonthYearLabel,
  getCalendarMonthWeeks,
  getInitialCalendarLeftMonth,
  isAvailabilityDateLabelSelected,
  isAvailabilityDateSelectable,
} from '../../../data/availabilityShortcutDates'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

type Props = {
  readonly dateLabel: string
  readonly onSelect: (dateLabel: string) => void
  readonly onClose: () => void
}

/** MW-only bottom-sheet date picker — single month, portaled to `document.body`. */
export function AvailabilityDateSheet({ dateLabel, onSelect, onClose }: Props) {
  const titleId = useId()
  const [month, setMonth] = useState(() => getInitialCalendarLeftMonth(dateLabel))
  const weeks = useMemo(() => getCalendarMonthWeeks(month.year, month.month), [month.month, month.year])

  const canGoBack =
    month.year > AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.year ||
    (month.year === AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.year &&
      month.month > AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.month)

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

  const selectDate = (date: Date) => {
    if (!isAvailabilityDateSelectable(date)) return
    onSelect(formatAvailabilityDateLabel(date))
    handleClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/40"
        aria-label="Close date picker"
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
          <h2 id={titleId} className="text-xl font-bold leading-7 tracking-[0.2px] text-black">
            Select date
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

        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-center">
            {canGoBack ? (
              <button
                type="button"
                aria-label="Previous month"
                className="inline-flex size-4 shrink-0 items-center justify-center text-[#0d0d0d] transition hover:opacity-70"
                onClick={() => setMonth((current) => addCalendarMonths(current.year, current.month, -1))}
              >
                <ChevronIcon direction="left" />
              </button>
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}

            <p className="min-w-0 flex-1 text-center text-lg font-medium leading-[22px] tracking-[0.2px] text-[#0d0d0d]">
              {formatMonthYearLabel(month.year, month.month)}
            </p>

            <button
              type="button"
              aria-label="Next month"
              className="inline-flex size-4 shrink-0 items-center justify-center text-[#0d0d0d] transition hover:opacity-70"
              onClick={() => setMonth((current) => addCalendarMonths(current.year, current.month, 1))}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="grid w-full grid-cols-7 gap-y-1 text-center text-xs leading-4 tracking-[0.05px] text-[#707070]">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="shrink-0">
                {label}
              </span>
            ))}

            {weeks.map((week) =>
              week.map((date, dayIndex) => {
                if (!date) {
                  return <span key={dayIndex} className="h-11 shrink-0" aria-hidden />
                }

                const selectable = isAvailabilityDateSelectable(date)
                const selected = isAvailabilityDateLabelSelected(dateLabel, date)

                if (!selectable) {
                  return (
                    <span
                      key={dayIndex}
                      className="flex h-11 shrink-0 items-center justify-center text-sm leading-normal text-[#b3b3b3]"
                    >
                      {date.getDate()}
                    </span>
                  )
                }

                return (
                  <button
                    key={dayIndex}
                    type="button"
                    aria-label={formatAvailabilityDateLabel(date)}
                    aria-pressed={selected}
                    className={`flex h-11 shrink-0 items-center justify-center rounded text-sm font-medium leading-5 tracking-[0.05px] transition ${
                      selected ? 'bg-[#008768] text-white' : 'text-[#0d0d0d] hover:bg-neutral-50'
                    }`}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ChevronIcon({ direction }: { readonly direction: 'left' | 'right' }) {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M10 4L6 8l4 4' : 'M6 4l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
