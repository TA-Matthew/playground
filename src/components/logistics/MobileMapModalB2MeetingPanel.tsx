import { type MouseEvent, type PointerEvent } from 'react'
import type { Stop, VariantId } from '../../data/variants'
import { TimelineStopDescription } from './Timeline'
import { getPoiOrderForStopIndex } from './poiOrder'
import { buildTimelineSelectedTeardropHtml } from './logisticsTeardropMarkup'

const PICKUP_LABELS = ['Prati north', 'Ottaviano', 'Via Plauto'] as const

type Props = {
  variantId: VariantId
  /** Full itinerary — used for teardrop parity with `MobileMapModalStopPanel`. */
  stops: Stop[]
  meetings: Stop[]
  /** Committed pickup (timeline + confirmed in this modal). */
  pickupId: string | null
  /** Map modal only: highlighted list row / pin target for map preview. */
  pendingPickupId: string | null
  /** When true, show the meeting list even though `pickupId` is set (user is changing meeting). */
  reselectPickerOpen?: boolean
  onPendingPickupChange: (meetingStopId: string | null) => void
  /** Commit pickup; pass `meetingStopId` from list taps (MW modal has no separate Select CTA). */
  onConfirmPickup: (meetingStopId?: string) => void
  /** Enter list UI again without clearing `pickupId` — keeps previous meeting until a list row is tapped. */
  onBeginReselect?: () => void
  /** MW map modal: chevron — same dismiss pipeline as `MobileMapModalStopPanel`. */
  onDismiss?: () => void
  /**
   * When true, render without the floating card chrome and without pointer/click capture on the shell —
   * used inside `MobileMapModalStopPanelCard` on the MW horizontal shelf so sideways swipes reach the shelf.
   */
  embedded?: boolean
}

function PickupChosenCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Matches `LogisticsMap` `MobileMapModalChevronDown` — dismiss affordance for MW bottom sheets. */
function MobileMapModalChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChangeMeetingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Full-screen map modal bottom meeting box — list row tap sets pickup (MW modal; no separate Select CTA).
 */
export function MobileMapModalB2MeetingPanel({
  variantId,
  stops,
  meetings,
  pickupId,
  pendingPickupId,
  reselectPickerOpen = false,
  onPendingPickupChange,
  onConfirmPickup,
  onBeginReselect,
  onDismiss,
  embedded = false,
}: Props) {
  const activeMeeting = pickupId ? meetings.find((m) => m.id === pickupId) : undefined
  const idx =
    activeMeeting != null ? meetings.findIndex((m) => m.id === activeMeeting.id) : -1
  const meetAtHeadingActive = pickupId != null && idx >= 0
  const selectedPickupLabel =
    pickupId != null && idx >= 0 ? PICKUP_LABELS[idx] ?? `Pickup ${idx + 1}` : ''

  const showPickerList = pickupId == null || reselectPickerOpen

  const regionAriaLabel = showPickerList ? 'Show meeting points on map' : 'Selected meeting point'

  const openPickerAgain = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onBeginReselect?.()
  }

  const showCommittedDetailTeardrop = !showPickerList && activeMeeting != null
  const selectedTeardropHtml = (() => {
    if (!showCommittedDetailTeardrop || !activeMeeting) return null
    const stopIndex = stops.findIndex((s) => s.id === activeMeeting.id)
    const poiOrder =
      stopIndex >= 0 ? getPoiOrderForStopIndex(stops, variantId, stopIndex) : null
    return buildTimelineSelectedTeardropHtml(activeMeeting, variantId, poiOrder)
  })()

  const shellClass = embedded
    ? 'flex min-h-0 min-w-0 flex-col pb-3'
    : 'rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-3 shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/80 backdrop-blur-md'

  return (
    <div
      className={shellClass}
      role={embedded ? 'group' : 'region'}
      aria-live="polite"
      aria-label={regionAriaLabel}
      {...(embedded
        ? {}
        : {
            onClick: (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(),
            onPointerDown: (e: PointerEvent<HTMLDivElement>) => e.stopPropagation(),
          })}
    >
      <div
        className={selectedTeardropHtml != null ? 'flex gap-4' : undefined}
      >
        {selectedTeardropHtml != null ? (
          <div className="flex w-10 shrink-0 flex-col items-center sm:w-11" aria-hidden>
            <div
              className="relative z-10 flex h-[54px] w-10 shrink-0 items-center justify-center overflow-visible"
              dangerouslySetInnerHTML={{ __html: selectedTeardropHtml }}
            />
          </div>
        ) : null}
      <div className="min-w-0 flex-1 pr-0 pt-0.5 sm:pr-1">
        <div className="px-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {!showPickerList && meetAtHeadingActive ? (
                <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">
                  <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                    <span className="min-w-0">Meet at — {selectedPickupLabel}</span>
                    <PickupChosenCheckIcon className="h-[18px] w-[18px] shrink-0 text-emerald-600" />
                  </span>
                </h3>
              ) : (
                <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">
                  3 meeting point options
                </h3>
              )}
              {showPickerList ? (
                <p className="mt-1.5 text-[13px] leading-snug text-stone-500">Tap a meeting point to read more</p>
              ) : activeMeeting?.durationLine?.trim() ? (
                <p
                  className="mt-1.5 min-w-0 truncate text-[13px] leading-snug text-stone-500"
                  title={activeMeeting.durationLine.trim()}
                >
                  {activeMeeting.durationLine.trim()}
                </p>
              ) : null}
            </div>
            {onDismiss ? (
              <button
                type="button"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDismiss()
                }}
                aria-label="Close meeting details"
              >
                <MobileMapModalChevronDown />
              </button>
            ) : null}
          </div>

          {showPickerList ? (
            <>
              <p id="b2-map-modal-meeting-options-label" className="sr-only">
                Pickup location — tap an option to select it
              </p>
              <ul
                role="listbox"
                aria-labelledby="b2-map-modal-meeting-options-label"
                className="mt-2 rounded-md border border-stone-200 bg-white py-1"
              >
                {meetings.map((m, i) => {
                  const isCommittedChoice = pickupId != null && m.id === pickupId
                  const isPendingPreview = pendingPickupId === m.id
                  return (
                    <li key={m.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isPendingPreview}
                        className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 px-3 text-left text-[13px] leading-snug transition ${
                          isPendingPreview
                            ? 'bg-emerald-50 text-emerald-950'
                            : 'text-stone-900 hover:bg-stone-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onPendingPickupChange(m.id)
                          onConfirmPickup(m.id)
                        }}
                      >
                        <span
                          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                          aria-hidden
                        >
                          {isCommittedChoice ? (
                            <PickupChosenCheckIcon className="h-[18px] w-[18px] text-emerald-600" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">{PICKUP_LABELS[i] ?? `Pickup ${i + 1}`}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <div className="mt-4 px-0 sm:px-0">
                {activeMeeting ? (
                  <TimelineStopDescription
                    key={activeMeeting.id}
                    text={activeMeeting.description ?? ''}
                    shelfScrollFade
                  />
                ) : null}
                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center gap-1.5 text-left text-[13px] leading-snug text-stone-500 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-600 hover:decoration-stone-400 sm:w-auto"
                  onClick={openPickerAgain}
                >
                  <ChangeMeetingIcon className="h-4 w-4 shrink-0 text-stone-500" />
                  See other meeting points
                </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
