/** Q3 Decide 2026 — desktop “Upcoming availability” shortcut cards (Figma 23780:27683). */
import {
  formatRoundedFromPrice,
  TOUR_GRADE_OPTIONS,
} from './availabilityShortcutOptions'

export type AvailabilityShortcut = {
  readonly id: string
  readonly title: string
  readonly timesAvailableLabel: string
  readonly priceAmount: string
  readonly scarcityLabel?: string
}

function shortcutFromOption(
  option: (typeof TOUR_GRADE_OPTIONS)[number],
  timesAvailableLabel: string,
): AvailabilityShortcut {
  return {
    id: option.id,
    title: option.title,
    timesAvailableLabel,
    priceAmount: formatRoundedFromPrice(option.perPersonPrice),
    scarcityLabel: option.scarcityLabel,
  }
}

export const AVAILABILITY_SHORTCUTS: readonly AvailabilityShortcut[] = [
  shortcutFromOption(TOUR_GRADE_OPTIONS[0], '3 times available'),
  {
    ...shortcutFromOption(TOUR_GRADE_OPTIONS[1], '3 times available'),
    scarcityLabel: undefined,
  },
  shortcutFromOption(TOUR_GRADE_OPTIONS[2], '3 times available'),
]
