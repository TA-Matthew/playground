/** Date helpers for availability shortcut calendar (Q3 Decide 2026). */

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
const MONTH_NAMES_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const AVAILABILITY_CALENDAR_YEAR = 2026
export const AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL = 'Fri, Jun 19'
export const AVAILABILITY_FIRST_SELECTABLE_DATE = new Date(AVAILABILITY_CALENDAR_YEAR, 5, 18)

/** Left month when the calendar first opens (June 2026 in the study). */
export const AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH = {
  year: AVAILABILITY_CALENDAR_YEAR,
  month: 5,
} as const

export function formatAvailabilityDateLabel(date: Date): string {
  const day = DAY_NAMES_SHORT[date.getDay()]
  const month = MONTH_NAMES_SHORT[date.getMonth()]
  return `${day}, ${month} ${date.getDate()}`
}

export function parseAvailabilityDateLabel(
  label: string,
  year = AVAILABILITY_CALENDAR_YEAR,
): Date | null {
  const match = /^(\w+),\s+(\w+)\s+(\d+)$/.exec(label.trim())
  if (!match) return null

  const monthIndex = MONTH_NAMES_SHORT.indexOf(match[2] as (typeof MONTH_NAMES_SHORT)[number])
  if (monthIndex === -1) return null

  const day = Number.parseInt(match[3], 10)
  if (!Number.isFinite(day)) return null

  return new Date(year, monthIndex, day)
}

export function formatMonthYearLabel(year: number, month: number): string {
  return `${MONTH_NAMES_LONG[month]} ${year}`
}

export function isSameAvailabilityCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isAvailabilityDateLabelSelected(label: string, date: Date): boolean {
  const parsed = parseAvailabilityDateLabel(label)
  return parsed ? isSameAvailabilityCalendarDay(parsed, date) : false
}

export function isAvailabilityDateSelectable(date: Date): boolean {
  const normalized = startOfDay(date)
  return normalized >= startOfDay(AVAILABILITY_FIRST_SELECTABLE_DATE)
}

export function addCalendarMonths(
  year: number,
  month: number,
  delta: number,
): { readonly year: number; readonly month: number } {
  const next = new Date(year, month + delta, 1)
  return { year: next.getFullYear(), month: next.getMonth() }
}

export function getCalendarMonthWeeks(year: number, month: number): readonly (Date | null)[][] {
  const weeks: (Date | null)[][] = []
  const cursor = new Date(year, month, 1)
  cursor.setDate(cursor.getDate() - cursor.getDay())

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: (Date | null)[] = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(cursor.getMonth() === month ? new Date(cursor) : null)
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (weekIndex >= 4 && cursor.getMonth() !== month) break
  }

  return weeks
}

export function getInitialCalendarLeftMonth(dateLabel: string): {
  readonly year: number
  readonly month: number
} {
  const selected = parseAvailabilityDateLabel(dateLabel)
  if (selected) {
    return { year: selected.getFullYear(), month: selected.getMonth() }
  }
  return AVAILABILITY_CALENDAR_INITIAL_LEFT_MONTH
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
