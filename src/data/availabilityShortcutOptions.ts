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
    expandedTitle: 'English includes all entries',
    description:
      'Tour with an English speaking guide. Please make sure to contact the supplier no later than 24h prior to your tour in order to confirm exact pickup time.',
    scarcityLabel: 'Only 5 spots left',
    perPersonPrice: '$50',
    timeSlots: [
      { id: '830', label: '8:30 AM', status: 'available' },
      { id: '930', label: '9:30 AM', status: 'available' },
      { id: '1030', label: '10:30 AM', status: 'selected' },
      { id: '1130', label: '11:30 AM', status: 'sold-out' },
    ],
  },
  {
    id: 'spanish',
    title: 'Vatican Group - Spanish',
    expandedTitle: 'Spanish includes all entries',
    perPersonPrice: '$50',
  },
  {
    id: 'chinese',
    title: 'Vatican Group - Chinese',
    expandedTitle: 'Chinese includes all entries',
    perPersonPrice: '$50',
  },
]

export function formatAvailabilitySearchTotal(counts: AvailabilityTravelerCounts): string {
  const perPerson = Number.parseFloat(
    TOUR_GRADE_OPTIONS[0].perPersonPrice.replace(/[^0-9.]/g, ''),
  )
  if (!Number.isFinite(perPerson)) return TOUR_GRADE_OPTIONS[0].perPersonPrice
  const total =
    counts.adults * perPerson +
    counts.children * perPerson * 0.94 +
    counts.infants * 0
  return `$${total.toFixed(2)}`
}

export function getTourGradeOption(id: string): TourGradeOption | undefined {
  return TOUR_GRADE_OPTIONS.find((option) => option.id === id)
}
