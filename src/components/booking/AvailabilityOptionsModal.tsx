import { useCallback, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { AvailabilityTravelerCounts } from '../../data/availabilityShortcutTravelers'
import { AvailabilityDateControl } from '../experience/pdp/AvailabilityDateControl'
import { AvailabilityTravelersControl } from '../experience/pdp/AvailabilityTravelersControl'
import { PdpAvailabilityOptionsPanel } from '../experience/pdp/PdpAvailabilityOptionsPanel'
import { PdpAvailabilityOptionsSkeleton } from '../experience/pdp/PdpAvailabilityOptionsSkeleton'

type Props = {
  readonly onClose: () => void
  readonly dateLabel: string
  readonly onDateLabelChange: (dateLabel: string) => void
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly onTravelerCountsChange: (counts: AvailabilityTravelerCounts) => void
  readonly selectedOptionId: string
  readonly onSelectedOptionChange: (optionId: string) => void
  readonly optionsLoading: boolean
}

/**
 * Availability options modal — date/traveler chips + full tour-grade options panel.
 * Portaled to `document.body` so sticky sidebar stacking cannot bleed through.
 */
export function AvailabilityOptionsModal({
  onClose,
  dateLabel,
  onDateLabelChange,
  travelerCounts,
  onTravelerCountsChange,
  selectedOptionId,
  onSelectedOptionChange,
  optionsLoading,
}: Props) {
  const titleId = useId()

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/40"
        aria-label="Close availability options"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-[min(100%,52rem)] max-h-[min(100dvh-2rem,900px)] flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white text-stone-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e0e0e0] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-medium leading-7 tracking-[0.2px] text-black">
              Upcoming availability
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#4d4d4d] transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            aria-label="Close"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-b border-[#e0e0e0] px-5 py-4 sm:px-6">
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="min-w-[min(100%,220px)] flex-1">
              <AvailabilityDateControl
                dateLabel={dateLabel}
                onDateLabelChange={onDateLabelChange}
                variant="chip"
                fullWidth
              />
            </div>
            <AvailabilityTravelersControl
              travelerCounts={travelerCounts}
              onTravelerCountsChange={onTravelerCountsChange}
              variant="chip"
              className="shrink-0"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {optionsLoading ? (
            <PdpAvailabilityOptionsSkeleton />
          ) : (
            <PdpAvailabilityOptionsPanel
              selectedOptionId={selectedOptionId}
              travelerCounts={travelerCounts}
              dateLabel={dateLabel}
              onSelectedOptionChange={onSelectedOptionChange}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function CloseIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
