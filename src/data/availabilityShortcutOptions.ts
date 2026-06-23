/** Expanded availability options — B2C page templates (Figma 17670:82160). */
import type { AvailabilityTravelerCounts } from './availabilityShortcutTravelers'

export type AvailabilityTimeSlot = {
  readonly id: string
  readonly label: string
  readonly status: 'available' | 'selected' | 'sold-out'
}

export type TourGradeOption = {
  readonly id: string
  readonly title: string
  /** Expanded card headline when selected. */
  readonly expandedTitle: string
  readonly description?: string
  readonly scarcityLabel?: string
  readonly timeSlots?: readonly AvailabilityTimeSlot[]
  readonly perPersonPrice: string
}

export const TOUR_GRADE_OPTIONS: readonly TourGradeOption[] = [
  {
    id: 'english',
    title: 'Vatican Group - English',
    expandedTitle: 'Vatican Group - English',
    description:
      'Vatican Museums, Sistine Chapel & St. Peter\'s Basilica tour with English-speaking guide & small group of 20 people or less.',
    scarcityLabel: 'Only 3 spots left',
    perPersonPrice: '$108.31',
    timeSlots: [
      { id: '800', label: '8:00 AM', status: 'sold-out' },
      { id: '830', label: '8:30 AM', status: 'sold-out' },
      { id: '900', label: '9:00 AM', status: 'selected' },
      { id: '930', label: '9:30 AM', status: 'available' },
      { id: '1000', label: '10:00 AM', status: 'available' },
      { id: '1030', label: '10:30 AM', status: 'available' },
      { id: '1430', label: '2:30 PM', status: 'available' },
    ],
  },
  {
    id: 'semi-private',
    title: 'Vatican Semi Private - English',
    expandedTitle: 'Vatican Semi Private - English',
    scarcityLabel: 'Only 2 spots left',
    perPersonPrice: '$124.61',
    timeSlots: [
      { id: '800', label: '8:00 AM', status: 'available' },
      { id: '900', label: '9:00 AM', status: 'available' },
      { id: '1000', label: '10:00 AM', status: 'available' },
      { id: '1100', label: '11:00 AM', status: 'available' },
      { id: '1300', label: '1:00 PM', status: 'available' },
      { id: '1400', label: '2:00 PM', status: 'available' },
      { id: '1500', label: '3:00 PM', status: 'available' },
    ],
  },
  {
    id: 'express',
    title: 'Vatican Express Group Tour',
    expandedTitle: 'Vatican Express Group Tour',
    perPersonPrice: '$78.61',
    timeSlots: [
      { id: '730', label: '7:30 AM', status: 'available' },
      { id: '830', label: '8:30 AM', status: 'available' },
      { id: '1200', label: '12:00 PM', status: 'available' },
    ],
  },
  {
    id: 'private',
    title: 'Private Tour up to 4 guests',
    expandedTitle: 'Private Tour up to 4 guests',
    scarcityLabel: 'Only 4 spots left',
    perPersonPrice: '$320.26',
  },
]

export function formatAvailabilitySearchTotal(
  counts: AvailabilityTravelerCounts,
  perPersonPrice: string = TOUR_GRADE_OPTIONS[0].perPersonPrice,
): string {
  const perPerson = Number.parseFloat(perPersonPrice.replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(perPerson)) return perPersonPrice
  const total =
    counts.adults * perPerson +
    counts.children * perPerson * 0.94 +
    counts.infants * 0
  return `$${total.toFixed(2)}`
}

export function formatRoundedFromPrice(perPersonPrice: string): string {
  const perPerson = Number.parseFloat(perPersonPrice.replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(perPerson)) return perPersonPrice
  return `$${Math.round(perPerson)}`
}

const COMMERCE_TIMES_PREVIEW_COUNT = 1

/** Sticky commerce — first N bookable times, then "+M" for the rest. */
export function formatCommerceTimesPreview(
  timeSlots: readonly AvailabilityTimeSlot[] | undefined,
  maxVisible = COMMERCE_TIMES_PREVIEW_COUNT,
): { readonly text: string; readonly ariaLabel: string } | undefined {
  if (!timeSlots?.length) return undefined

  const bookable = timeSlots.filter((slot) => slot.status !== 'sold-out')
  if (bookable.length === 0) return undefined

  const visible = bookable.slice(0, maxVisible)
  const remaining = bookable.length - visible.length
  const visibleLabels = visible.map((slot) => slot.label).join(', ')

  if (remaining > 0) {
    return {
      text: `${visibleLabels} + ${remaining}`,
      ariaLabel: `${visibleLabels}, and ${remaining} more times`,
    }
  }

  return {
    text: visibleLabels,
    ariaLabel: visibleLabels,
  }
}

export function getTourGradeOption(id: string): TourGradeOption | undefined {
  return TOUR_GRADE_OPTIONS.find((option) => option.id === id)
}
