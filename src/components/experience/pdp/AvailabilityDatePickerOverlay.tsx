import { useMemo, useState } from 'react'
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

/**
 * Dual-month date picker overlay — Q3 Decide 2026 (Figma 23786:24378).
 * @see https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23786-24378
 */
export function AvailabilityDatePickerOverlay({ dateLabel, onSelect, onClose }: Props) {
  const [leftMonth, setLeftMonth] = useState(() => getInitialCalendarLeftMonth(dateLabel))
  const rightMonth = useMemo(
    () => addCalendarMonths(leftMonth.year, leftMonth.month, 1),
    [leftMonth.month, leftMonth.year],
  )

  const canGoBack =
    leftMonth.year > AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.year ||
    (leftMonth.year === AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.year &&
      leftMonth.month > AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH.month)

  const selectDate = (date: Date) => {
    if (!isAvailabilityDateSelectable(date)) return
    onSelect(formatAvailabilityDateLabel(date))
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-label="Select date"
      className="w-[min(100vw-2rem,720px)] overflow-hidden rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]"
    >
      <div className="flex">
        <MonthPanel
          year={leftMonth.year}
          month={leftMonth.month}
          dateLabel={dateLabel}
          showPrevious={canGoBack}
          showNext={false}
          onPrevious={() => setLeftMonth((current) => addCalendarMonths(current.year, current.month, -1))}
          onSelect={selectDate}
        />
        <MonthPanel
          year={rightMonth.year}
          month={rightMonth.month}
          dateLabel={dateLabel}
          showPrevious={false}
          showNext
          onNext={() => setLeftMonth((current) => addCalendarMonths(current.year, current.month, 1))}
          onSelect={selectDate}
        />
      </div>
    </div>
  )
}

function MonthPanel({
  year,
  month,
  dateLabel,
  showPrevious,
  showNext,
  onPrevious,
  onNext,
  onSelect,
}: {
  readonly year: number
  readonly month: number
  readonly dateLabel: string
  readonly showPrevious: boolean
  readonly showNext: boolean
  readonly onPrevious?: () => void
  readonly onNext?: () => void
  readonly onSelect: (date: Date) => void
}) {
  const weeks = useMemo(() => getCalendarMonthWeeks(year, month), [month, year])

  return (
    <div className="flex w-[min(50%,360px)] min-w-[300px] flex-col items-center gap-6 px-6 py-8">
      <div className="flex w-full max-w-[330px] items-center justify-center">
        {showPrevious ? (
          <button
            type="button"
            aria-label="Previous month"
            className="inline-flex size-4 shrink-0 items-center justify-center text-[#0d0d0d] transition hover:opacity-70"
            onClick={onPrevious}
          >
            <ChevronIcon direction="left" />
          </button>
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}

        <p className="min-w-0 flex-1 text-center text-lg font-medium leading-[22px] tracking-[0.2px] text-[#0d0d0d]">
          {formatMonthYearLabel(year, month)}
        </p>

        {showNext ? (
          <button
            type="button"
            aria-label="Next month"
            className="inline-flex size-4 shrink-0 items-center justify-center text-[#0d0d0d] transition hover:opacity-70"
            onClick={onNext}
          >
            <ChevronIcon direction="right" />
          </button>
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
      </div>

      <div className="flex w-full max-w-[320px] justify-between gap-6 text-center text-xs leading-4 tracking-[0.05px] text-[#707070]">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="w-[25px] shrink-0">
            {label}
          </span>
        ))}
      </div>

      <div className="flex w-full max-w-[343px] flex-col">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex h-12 items-center">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <span key={dayIndex} className="h-12 w-[49px] shrink-0" aria-hidden />
              }

              const selectable = isAvailabilityDateSelectable(date)
              const selected = isAvailabilityDateLabelSelected(dateLabel, date)

              if (!selectable) {
                return (
                  <span
                    key={dayIndex}
                    className="flex h-12 w-[49px] shrink-0 items-center justify-center text-sm leading-normal text-[#b3b3b3]"
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
                  className={`flex h-12 w-[49px] shrink-0 items-center justify-center rounded text-sm font-medium leading-5 tracking-[0.05px] transition ${
                    selected
                      ? 'bg-[#00654e] text-white'
                      : 'text-[#0d0d0d] hover:bg-neutral-50'
                  }`}
                  onClick={() => onSelect(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
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
