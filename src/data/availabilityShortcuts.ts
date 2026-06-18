/** Q3 Decide 2026 — desktop “Upcoming availability” shortcut cards (Figma 23780:27683). */
export type AvailabilityShortcut = {
  readonly id: string
  readonly title: string
  readonly timesAvailableLabel: string
  readonly priceAmount: string
  readonly scarcityLabel?: string
}

export const AVAILABILITY_SHORTCUTS: readonly AvailabilityShortcut[] = [
  {
    id: 'english',
    title: 'Vatican Group - English',
    timesAvailableLabel: '3 times available',
    priceAmount: '$50',
    scarcityLabel: 'Only 2 spots left',
  },
  {
    id: 'spanish',
    title: 'Vatican Group - Spanish',
    timesAvailableLabel: '3 times available',
    priceAmount: '$50',
  },
  {
    id: 'chinese',
    title: 'Vatican Group - Chinese',
    timesAvailableLabel: '3 times available',
    priceAmount: '$50',
  },
]
