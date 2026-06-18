import { type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AvailabilityMetaDisplayId } from '../../../data/availabilityShortcutMeta'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
import { totalTravelers } from '../../../data/availabilityShortcutTravelers'
import { AVAILABILITY_SHORTCUTS } from '../../../data/availabilityShortcuts'
import { AvailabilityShortcutCard } from './AvailabilityShortcutCard'
import { AvailabilityShortcutsSkeleton } from './AvailabilityShortcutsSkeleton'
import { PdpAvailabilityOptionsPanel } from './PdpAvailabilityOptionsPanel'
import { PdpAvailabilityOptionsSkeleton } from './PdpAvailabilityOptionsSkeleton'
import { AvailabilityTravelersControl } from './AvailabilityTravelersControl'
import { AvailabilityDateControl } from './AvailabilityDateControl'
import { AvailabilityInlineMetaTrigger } from './AvailabilityInlineMetaTrigger'

export const AVAILABILITY_OPTIONS_LOAD_MS = 900
export const UPCOMING_AVAILABILITY_SECTION_ID = 'pdp-upcoming-availability'
const AVAILABILITY_FADE_MS = 0.25

type Props = {
  readonly metaDisplay?: AvailabilityMetaDisplayId
  /** Same label as {@link BookingSidebar} date field (`booking.dateLabel`). */
  readonly dateLabel: string
  readonly onDateLabelChange?: (dateLabel: string) => void
  readonly travelerCounts?: AvailabilityTravelerCounts
  readonly onTravelerCountsChange?: (counts: AvailabilityTravelerCounts) => void
  readonly showOptionsPanel?: boolean
  readonly selectedOptionId?: string
  readonly onSelectOption?: (optionId: string) => void
  readonly onOpenOptions?: (optionId: string) => void
  readonly optionsLoading?: boolean
}

/**
 * Desktop-only upcoming availability shortcut — below icon rail, above “Why travelers loved this”.
 * @see https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23780-27683
 * Filter chips: https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23778-113391
 */
export function PdpUpcomingAvailabilitySection({
  metaDisplay = 'chips',
  dateLabel,
  onDateLabelChange,
  travelerCounts = { adults: 2, children: 0, infants: 0 },
  onTravelerCountsChange,
  showOptionsPanel = false,
  selectedOptionId = 'english',
  onSelectOption,
  onOpenOptions,
  optionsLoading = false,
}: Props) {
  const travelerTotal = totalTravelers(travelerCounts)

  return (
    <section
      id={UPCOMING_AVAILABILITY_SECTION_ID}
      className="hidden scroll-mt-8 py-8 lg:block"
      aria-labelledby="pdp-upcoming-availability-h"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2
            id="pdp-upcoming-availability-h"
            className="text-[28px] font-medium leading-8 tracking-[0.2px] text-black"
          >
            Upcoming availability
          </h2>
          {metaDisplay === 'inline' ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[#737373]">
              {onDateLabelChange ? (
                <AvailabilityDateControl
                  dateLabel={dateLabel}
                  onDateLabelChange={onDateLabelChange}
                  variant="inline"
                />
              ) : (
                <AvailabilityInlineMetaTrigger icon={<CalendarIcon />}>
                  {dateLabel}
                </AvailabilityInlineMetaTrigger>
              )}
              <span aria-hidden className="select-none text-[#bdbdbd]">
                ·
              </span>
              {onTravelerCountsChange ? (
                <AvailabilityTravelersControl
                  travelerCounts={travelerCounts}
                  onTravelerCountsChange={onTravelerCountsChange}
                  variant="inline"
                />
              ) : (
                <AvailabilityInlineMetaTrigger icon={<PersonIcon />}>
                  {travelerTotal}
                </AvailabilityInlineMetaTrigger>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {onDateLabelChange ? (
                <AvailabilityDateControl
                  dateLabel={dateLabel}
                  onDateLabelChange={onDateLabelChange}
                  variant="chip"
                />
              ) : (
                <AvailabilityFilterChip icon={<CalendarIcon />} label={dateLabel} />
              )}
              {onTravelerCountsChange ? (
                <AvailabilityTravelersControl
                  travelerCounts={travelerCounts}
                  onTravelerCountsChange={onTravelerCountsChange}
                  variant="chip"
                />
              ) : (
                <AvailabilityFilterChip icon={<PersonIcon />} label={String(travelerTotal)} />
              )}
            </div>
          )}
        </div>

        <AvailabilityContentStage
          showOptionsPanel={showOptionsPanel}
          optionsLoading={optionsLoading}
          selectedOptionId={selectedOptionId}
          travelerCounts={travelerCounts}
          dateLabel={dateLabel}
          onSelectOption={onSelectOption}
          onOpenOptions={onOpenOptions}
        />
      </div>
    </section>
  )
}

function getAvailabilityViewKey(
  showOptionsPanel: boolean,
  optionsLoading: boolean,
  selectedOptionId: string,
): string {
  if (optionsLoading) {
    return showOptionsPanel ? 'skeleton-panel' : 'skeleton-shortcuts'
  }
  if (!showOptionsPanel) return 'shortcuts'
  return `panel-${selectedOptionId}`
}

function AvailabilityContentStage({
  showOptionsPanel,
  optionsLoading,
  selectedOptionId,
  travelerCounts,
  dateLabel,
  onSelectOption,
  onOpenOptions,
}: {
  readonly showOptionsPanel: boolean
  readonly optionsLoading: boolean
  readonly selectedOptionId: string
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly dateLabel: string
  readonly onSelectOption?: (optionId: string) => void
  readonly onOpenOptions?: (optionId: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const viewKey = getAvailabilityViewKey(showOptionsPanel, optionsLoading, selectedOptionId)
  const fadeDuration = reduceMotion ? 0 : AVAILABILITY_FADE_MS

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: fadeDuration } }}
        exit={{ opacity: 0, transition: { duration: fadeDuration } }}
      >
        {viewKey === 'shortcuts' ? (
          <ul className="grid grid-cols-3 gap-4" data-availability-shortcuts>
            {AVAILABILITY_SHORTCUTS.map((shortcut) => (
              <li key={shortcut.id}>
                <AvailabilityShortcutCard
                  shortcut={shortcut}
                  onSelect={() => onOpenOptions?.(shortcut.id)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {viewKey === 'skeleton-shortcuts' ? <AvailabilityShortcutsSkeleton /> : null}

        {viewKey === 'skeleton-panel' ? <PdpAvailabilityOptionsSkeleton /> : null}

        {viewKey.startsWith('panel-') ? (
          <PdpAvailabilityOptionsPanel
            selectedOptionId={selectedOptionId}
            travelerCounts={travelerCounts}
            dateLabel={dateLabel}
            onSelectedOptionChange={onSelectOption ?? (() => {})}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

function AvailabilityFilterChip({
  icon,
  label,
}: {
  readonly icon: ReactNode
  readonly label: string
}) {
  return (
    <button
      type="button"
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d9d9d9] bg-white px-4 text-sm font-medium leading-5 tracking-[0.05px] text-[#4d4d4d] transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d8564]"
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
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
