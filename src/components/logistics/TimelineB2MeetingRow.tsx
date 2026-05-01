import { useEffect, useRef, useState, type MouseEvent } from 'react'
import '../ai-review/ai-review-animations.css'
import {
  B2_MEETING_TIMELINE_ROW_ID,
  type Stop,
  type VariantId,
} from '../../data/variants'
import { getPoiOrderForStopIndex } from './poiOrder'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'
import { logisticsRailDiscClass } from './logisticsPinButtonClass'
import { buildTimelineSelectedTeardropHtml } from './logisticsTeardropMarkup'

const PREVIEW_CHARS = 220

/** Same ms for list fade-out (pick option) and fade-in (“Select a different meeting point”). */
const MEETING_LIST_FADE_MS = 300

const PICKUP_LABELS = ['Prati north', 'Ottaviano', 'Via Plauto'] as const

/** Align with `LogisticsBlock` / map mobile sheet breakpoint. */
const MW_MAX_WIDTH_PX = 768

type Props = {
  variantId: VariantId
  stops: Stop[]
  meetings: Stop[]
  /** Currently chosen pickup (`null` until user selects an option). */
  pickupId: string | null
  /** Pass `null` when reopening the picker — clears committed pickup so no row looks selected. */
  onPickupChange: (meetingStopId: string | null) => void
  selectedStopId: string
  expandedId: string | null
  onRowHeaderClick: (id: string) => void
  /** Highlight matching map pin while pointer is over a menu option */
  onMeetingHover: (meetingStopId: string | null) => void
  /** MW: open full-screen map with meeting picker (collapsed row, no pickup yet). */
  onOpenMobileMap?: () => void
}

/** One itinerary row (same chrome as variant B meeting) + inline meeting list; hover previews pins on the map. */
export function TimelineB2MeetingRow({
  variantId,
  stops,
  meetings,
  pickupId,
  onPickupChange,
  selectedStopId,
  expandedId,
  onRowHeaderClick,
  onMeetingHover,
  onOpenMobileMap,
}: Props) {
  const activeMeeting = pickupId ? meetings.find((m) => m.id === pickupId) : undefined
  const isOpen = expandedId === B2_MEETING_TIMELINE_ROW_ID

  const [isMw, setIsMw] = useState(false)
  useEffect(() => {
    const mq = globalThis.matchMedia(`(max-width: ${MW_MAX_WIDTH_PX}px)`)
    const sync = () => setIsMw(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /**
   * MW + map-picker flow: collapsed with no pickup — don’t expand the row from the header/chevron;
   * only “Choose a meeting point” opens the full-screen map.
   */
  const mwDisableHeaderExpand =
    isMw &&
    onOpenMobileMap != null &&
    !isOpen &&
    pickupId == null

  /** After choosing a pickup, list fades out and stays hidden until “Select a different…”. */
  const [meetingListDismissed, setMeetingListDismissed] = useState(false)
  const [listFadeOut, setListFadeOut] = useState(false)
  /** Fade-in when reopening the picker (skip on first paint). */
  const [listRevealOpacity, setListRevealOpacity] = useState(true)

  /** When clearing pickup via “Select a different…”, skip syncing list reveal so fade-in can run. */
  const skipPickupNullRevealSyncRef = useRef(false)

  useEffect(() => {
    if (pickupId == null) {
      setMeetingListDismissed(false)
      setListFadeOut(false)
      if (!skipPickupNullRevealSyncRef.current) {
        setListRevealOpacity(true)
      }
    }
  }, [pickupId])

  useEffect(() => {
    if (!isOpen) {
      onMeetingHover(null)
    }
  }, [isOpen, onMeetingHover])
  const rowSelected =
    expandedId === B2_MEETING_TIMELINE_ROW_ID ||
    meetings.some((m) => m.id === selectedStopId)
  const idx =
    activeMeeting != null ? meetings.findIndex((m) => m.id === activeMeeting.id) : -1
  const selectedPickupLabel =
    pickupId != null && idx >= 0 ? PICKUP_LABELS[idx] ?? `Pickup ${idx + 1}` : ''
  const poiOrder = idx >= 0 ? getPoiOrderForStopIndex(stops, variantId, idx) : null

  /** Whenever a pickup is committed, title reads “Meet at — …” (also while row collapsed or list is fading). */
  const meetAtHeadingActive = pickupId != null && idx >= 0
  /**
   * Picker list: show while choosing (`pickupId == null`) or during fade-out after a choice (`listFadeOut`).
   * Once a pickup exists and we’re not fading the list away, hide it — avoids stacking list + long description.
   */
  const showMeetingList =
    isOpen &&
    (pickupId == null || listFadeOut) &&
    (!meetingListDismissed || listFadeOut)
  /** Don’t mount meeting copy until the picker is gone — prevents huge height while list still fades. */
  const revealPickupDetails = pickupId != null && !showMeetingList

  /** Replay AI-summary-style entrance when switching between “3 meeting…” and “Meet at — …”. */
  const prevMeetAtHeadingRef = useRef(meetAtHeadingActive)
  const [headingSwapKey, setHeadingSwapKey] = useState(0)
  useEffect(() => {
    if (prevMeetAtHeadingRef.current !== meetAtHeadingActive) {
      prevMeetAtHeadingRef.current = meetAtHeadingActive
      setHeadingSwapKey((k) => k + 1)
    }
  }, [meetAtHeadingActive])

  const openPickerAgain = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    /** MW: open map modal only — keep committed pickup until user confirms a change in the modal. */
    if (isMw && onOpenMobileMap) {
      onOpenMobileMap()
      return
    }
    skipPickupNullRevealSyncRef.current = true
    onPickupChange(null)
    setMeetingListDismissed(false)
    setListFadeOut(false)
    setListRevealOpacity(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setListRevealOpacity(true)
        skipPickupNullRevealSyncRef.current = false
      })
    })
  }

  const finishListFadeOut = () => {
    setMeetingListDismissed(true)
    setListFadeOut(false)
  }

  const rowAriaTitle = meetAtHeadingActive
    ? `Meet at — ${selectedPickupLabel}, selected`
    : '3 meeting point options'
  const selectedTeardropHtml =
    activeMeeting && selectedStopId === activeMeeting.id
      ? buildTimelineSelectedTeardropHtml(activeMeeting, variantId, poiOrder)
      : null

  const rowHeaderHint = mwDisableHeaderExpand
    ? `${rowAriaTitle}. Use “Choose a meeting point” to open the map.`
    : `${rowAriaTitle}. ${isOpen ? 'Collapse' : 'Expand'} details`

  return (
    <div
      id={`poi-${B2_MEETING_TIMELINE_ROW_ID}`}
      className={`flex w-full gap-4 rounded-lg py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 ${
        mwDisableHeaderExpand
          ? 'cursor-default hover:bg-transparent'
          : 'cursor-pointer hover:bg-stone-50/90'
      } ${rowSelected ? 'bg-white' : ''}`}
      tabIndex={mwDisableHeaderExpand ? -1 : 0}
      aria-expanded={isOpen}
      aria-controls={`poi-details-${B2_MEETING_TIMELINE_ROW_ID}`}
      aria-label={rowHeaderHint}
      onClick={() => {
        if (mwDisableHeaderExpand) return
        onRowHeaderClick(B2_MEETING_TIMELINE_ROW_ID)
      }}
      onKeyDown={(e) => {
        if (mwDisableHeaderExpand) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRowHeaderClick(B2_MEETING_TIMELINE_ROW_ID)
        }
      }}
    >
      <div className="flex w-10 shrink-0 flex-col items-center sm:w-11" aria-hidden>
        {selectedTeardropHtml != null ? (
          <div
            key={`timeline-teardrop-b2-${pickupId}-${isOpen}`}
            className="relative z-10 flex h-[54px] w-10 shrink-0 items-center justify-center overflow-visible"
            dangerouslySetInnerHTML={{ __html: selectedTeardropHtml }}
          />
        ) : (
          <div className={logisticsRailDiscClass(true, pickupId != null && selectedStopId === pickupId)}>
            <span
              className="inline-flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: viatorMeetingMarkSvgHtml('pointer-events-none h-[14px] w-[14px] shrink-0'),
              }}
            />
          </div>
        )}
        <div className="mt-0 min-h-[36px] w-1 flex-1 rounded-full bg-stone-900 sm:w-[5px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="pr-0 pt-0.5 sm:pr-1">
          <div className="px-1 py-1">
            <div className="flex items-start justify-between gap-3">
              <div
                key={headingSwapKey}
                className={`min-w-0 flex-1 ${headingSwapKey > 0 ? 'ai-summary-body-fade-in' : ''}`}
              >
                {meetAtHeadingActive ? (
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
              </div>
              <span
                className={`mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400 md:flex ${
                  mwDisableHeaderExpand ? 'hidden' : 'flex'
                }`}
                aria-hidden
              >
                <ChevronRow up={isOpen} />
              </span>
            </div>

            {isOpen ? (
              <>
                {showMeetingList ? (
                  <div
                    className={`relative mt-2 transition-opacity ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                      listFadeOut || !listRevealOpacity ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ transitionDuration: `${MEETING_LIST_FADE_MS}ms` }}
                    onTransitionEnd={(e) => {
                      if (e.propertyName !== 'opacity' || !listFadeOut) return
                      const reduce =
                        typeof globalThis.matchMedia === 'function' &&
                        globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
                      if (reduce || e.target !== e.currentTarget) return
                      finishListFadeOut()
                    }}
                  >
                    <p id="b2-meeting-options-label" className="sr-only">
                      Pickup location — choose one option
                    </p>
                    <ul
                      role="listbox"
                      aria-labelledby="b2-meeting-options-label"
                      className="rounded-md border border-stone-200 bg-white py-1"
                      onMouseLeave={() => onMeetingHover(null)}
                    >
                      {meetings.map((m, i) => (
                        <li key={m.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={pickupId === m.id}
                            className={`flex w-full cursor-pointer px-3 py-2 text-left text-[13px] leading-snug transition ${
                              pickupId === m.id ? 'bg-emerald-50 text-emerald-950' : 'text-stone-900 hover:bg-stone-50'
                            }`}
                            onMouseEnter={() => onMeetingHover(m.id)}
                            onFocus={() => onMeetingHover(m.id)}
                            onClick={(e) => {
                              e.stopPropagation()
                              onPickupChange(m.id)
                              onMeetingHover(null)
                              const reduce =
                                typeof globalThis.matchMedia === 'function' &&
                                globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
                              if (reduce) {
                                finishListFadeOut()
                              } else {
                                setListFadeOut(true)
                              }
                            }}
                          >
                            {PICKUP_LABELS[i] ?? `Pickup ${i + 1}`}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-1.5 text-[13px] leading-snug text-stone-500">
                  {activeMeeting?.durationLine ?? 'Hover to show on map'}
                </p>
              </>
            ) : pickupId != null && activeMeeting ? (
              <p className="mt-1.5 text-[13px] leading-snug text-stone-500">
                {activeMeeting.durationLine}
              </p>
            ) : onOpenMobileMap ? (
              <button
                type="button"
                className="mt-1.5 flex min-h-[44px] w-full cursor-pointer items-center text-left text-[14px] leading-snug text-stone-900 underline decoration-stone-900 underline-offset-[3px] transition hover:decoration-stone-900 md:min-h-0 md:items-start md:text-[13px] md:text-stone-500 md:decoration-stone-300 md:underline-offset-2 md:hover:text-stone-600 md:hover:decoration-stone-400"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenMobileMap()
                }}
                aria-label="Open map to choose a meeting point"
              >
                Choose a meeting point
              </button>
            ) : (
              <p className="mt-1.5 text-[13px] leading-snug text-stone-500">Choose a meeting point</p>
            )}
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
              isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                id={`poi-details-${B2_MEETING_TIMELINE_ROW_ID}`}
                className="mt-4 px-1 sm:px-1"
                aria-hidden={!isOpen}
                inert={!isOpen}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MeetingBody meeting={activeMeeting ?? meetings[0]} pickupChosen={revealPickupDetails} />
                {isOpen && meetAtHeadingActive && revealPickupDetails ? (
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center gap-1.5 text-left text-[13px] leading-snug text-stone-500 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-600 hover:decoration-stone-400 sm:w-auto"
                    onClick={openPickerAgain}
                  >
                    <ChangeMeetingIcon className="h-4 w-4 shrink-0 text-stone-500" />
                    Select a different meeting point
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MeetingBody({ meeting, pickupChosen }: { meeting: Stop; pickupChosen: boolean }) {
  const [readOpen, setReadOpen] = useState(false)
  if (!pickupChosen) {
    return null
  }
  const text = meeting.description
  const needsToggle = text.length > PREVIEW_CHARS
  const shown = readOpen || !needsToggle ? text : `${text.slice(0, PREVIEW_CHARS).trim()}…`

  return (
    <div className="text-[14px] leading-relaxed text-stone-600">
      <p className="whitespace-pre-wrap">{shown}</p>
      {needsToggle ? (
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-[14px] font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-500"
          onClick={(e) => {
            e.stopPropagation()
            setReadOpen((o) => !o)
          }}
        >
          {readOpen ? 'Read less' : 'Read more'}
        </button>
      ) : null}
    </div>
  )
}

/** Confirmed pickup — green check after location name. */
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

/** Swap / change — pairs with “Select a different meeting point”. */
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

function ChevronRow({ up }: { up: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${up ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
