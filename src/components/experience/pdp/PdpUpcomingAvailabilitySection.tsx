import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AvailabilityCommerceModeId } from '../../../data/availabilityShortcutCommerce'
import {
  loadsAvailabilityOptionsInModal,
  usesStickyCommerceSidebar,
} from '../../../data/availabilityShortcutCommerce'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
import { AVAILABILITY_SHORTCUTS } from '../../../data/availabilityShortcuts'
import { AvailabilityShortcutCard } from './AvailabilityShortcutCard'
import { AvailabilityShortcutsSkeleton } from './AvailabilityShortcutsSkeleton'
import { PdpAvailabilityOptionsPanel } from './PdpAvailabilityOptionsPanel'
import { PdpAvailabilityOptionsSkeleton } from './PdpAvailabilityOptionsSkeleton'

export const AVAILABILITY_OPTIONS_LOAD_MS = 900
export const UPCOMING_AVAILABILITY_SECTION_ID = 'pdp-upcoming-availability'
const AVAILABILITY_FADE_MS = 0.25

type Props = {
  /** Same label as {@link BookingSidebar} date field (`booking.dateLabel`). */
  readonly dateLabel: string
  readonly travelerCounts?: AvailabilityTravelerCounts
  readonly showOptionsPanel?: boolean
  readonly selectedOptionId?: string
  readonly onSelectOption?: (optionId: string) => void
  readonly onOpenOptions?: (optionId: string) => void
  readonly optionsLoading?: boolean
  /** When placed after the review shelf — top divider on desktop. */
  readonly showTopDivider?: boolean
  /** Availability shortcut — shortcuts in sticky commerce vs main column (`asCommerce`). */
  readonly availabilityCommerceMode?: AvailabilityCommerceModeId
}

/**
 * Desktop-only upcoming availability shortcut — below icon rail, above “Why travelers loved this”.
 * @see https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23780-27683
 */
export function PdpUpcomingAvailabilitySection({
  dateLabel,
  travelerCounts = { adults: 2, children: 0, infants: 0 },
  showOptionsPanel = false,
  selectedOptionId = 'english',
  onSelectOption,
  onOpenOptions,
  optionsLoading = false,
  showTopDivider = false,
  availabilityCommerceMode = 'main-column',
}: Props) {
  const sidebarCommerce = usesStickyCommerceSidebar(availabilityCommerceMode)
  const optionsInModal = loadsAvailabilityOptionsInModal(availabilityCommerceMode)
  if (optionsInModal) {
    return null
  }

  if (sidebarCommerce && !showOptionsPanel) {
    return null
  }

  return (
    <section
      id={UPCOMING_AVAILABILITY_SECTION_ID}
      className={`hidden scroll-mt-8 py-8 lg:block ${
        showTopDivider ? 'border-t border-[#d9d9d9]' : ''
      }`}
      aria-labelledby={!sidebarCommerce && !showOptionsPanel ? 'pdp-upcoming-availability-h' : undefined}
    >
      <div className="flex flex-col gap-4">
        {!sidebarCommerce && !showOptionsPanel ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="pdp-upcoming-availability-h"
              className="text-[28px] font-medium leading-8 tracking-[0.2px] text-black"
            >
              Upcoming availability
            </h2>
            <span aria-hidden className="select-none text-[#bdbdbd]">
              •
            </span>
            <span className="text-base font-medium leading-6 tracking-[0.05px] text-[#4d4d4d]">
              {dateLabel}
            </span>
          </div>
        ) : null}

        <AvailabilityContentStage
          showOptionsPanel={showOptionsPanel}
          optionsLoading={optionsLoading}
          selectedOptionId={selectedOptionId}
          travelerCounts={travelerCounts}
          dateLabel={dateLabel}
          onSelectOption={onSelectOption}
          onOpenOptions={onOpenOptions}
          sidebarCommerce={sidebarCommerce}
        />
      </div>
    </section>
  )
}

function getAvailabilityViewKey(
  showOptionsPanel: boolean,
  optionsLoading: boolean,
  selectedOptionId: string,
  sidebarCommerce: boolean,
): string {
  if (optionsLoading) {
    if (sidebarCommerce) return showOptionsPanel ? 'skeleton-panel' : 'skeleton-shortcuts'
    return showOptionsPanel ? 'skeleton-panel' : 'skeleton-shortcuts'
  }
  if (!showOptionsPanel) return sidebarCommerce ? 'empty' : 'shortcuts'
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
  sidebarCommerce,
}: {
  readonly showOptionsPanel: boolean
  readonly optionsLoading: boolean
  readonly selectedOptionId: string
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly dateLabel: string
  readonly onSelectOption?: (optionId: string) => void
  readonly onOpenOptions?: (optionId: string) => void
  readonly sidebarCommerce: boolean
}) {
  const reduceMotion = useReducedMotion()
  const viewKey = getAvailabilityViewKey(
    showOptionsPanel,
    optionsLoading,
    selectedOptionId,
    sidebarCommerce,
  )
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
          <ul className="grid grid-cols-3 gap-4 pt-3" data-availability-shortcuts>
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
