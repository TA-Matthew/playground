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
  readonly isBestSeller?: boolean
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
  { ...shortcutFromOption(TOUR_GRADE_OPTIONS[0], '3 times available'), isBestSeller: true },
  {
    ...shortcutFromOption(TOUR_GRADE_OPTIONS[1], '3 times available'),
    scarcityLabel: undefined,
  },
  shortcutFromOption(TOUR_GRADE_OPTIONS[2], '3 times available'),
]

/** Sticky commerce / modal sidebar — first N shortcuts before “Show more”. */
export const COMMERCE_SIDEBAR_SHORTCUT_COUNT = 2

export const COMMERCE_SIDEBAR_SCARCITY_LABEL = '3 left'

export const COMMERCE_SIDEBAR_SHORTCUTS: readonly AvailabilityShortcut[] =
  AVAILABILITY_SHORTCUTS.slice(0, COMMERCE_SIDEBAR_SHORTCUT_COUNT).map((shortcut, index) =>
    index === 0 && shortcut.scarcityLabel
      ? { ...shortcut, scarcityLabel: COMMERCE_SIDEBAR_SCARCITY_LABEL }
      : shortcut,
  )

export const COMMERCE_SIDEBAR_HIDDEN_OPTION_COUNT =
  TOUR_GRADE_OPTIONS.length - COMMERCE_SIDEBAR_SHORTCUT_COUNT
