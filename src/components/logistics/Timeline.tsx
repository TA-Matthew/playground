import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  isVariantB2TripleMeeting,
  isVariantBLayout,
  type Stop,
  type VariantId,
} from '../../data/variants'
import { getPoiOrderForStopIndex } from './poiOrder'
import { TimelineB2MeetingRow } from './TimelineB2MeetingRow'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'
import { logisticsPassbyRailDiscClass, logisticsRailDiscClass } from './logisticsPinButtonClass'
import { buildTimelineSelectedTeardropHtml } from './logisticsTeardropMarkup'

const PREVIEW_CHARS = 220

const noop = () => {}

/** `mapModal` = pin tap in the mobile full-screen map sheet — updates selection without expanding the list accordion. */
/** `b2MeetingPick` = B2 inline meeting list — pickup chosen; map fits full-route overview. */
export type SelectSource = 'list' | 'map' | 'mapModal' | 'b2MeetingPick'

type Props = {
  /** Meeting/end rail icons apply only when `'b'`. */
  variantId: VariantId
  stops: Stop[]
  selectedStopId: string
  /** At most one POI expanded at a time (accordion); owned by parent so map pins can open a row. */
  expandedId: string | null
  /** List row title click: toggles expand; closing clears selection in parent. */
  onRowHeaderClick: (id: string) => void
  /** B2: pickup chosen in dropdown (`null` until chosen). */
  b2PickupId?: string | null
  onB2PickupChange?: (meetingStopId: string | null) => void
  /** B2: hover preview on map while pointing at a dropdown option */
  onB2MeetingHover?: (meetingStopId: string | null) => void
  /** List row hover — map pin matches selected teardrop + image */
  onTimelineRowHover?: (stopId: string | null) => void
  /** B2: open MW full-screen map meeting picker from timeline helper (“Show meeting points on map”). */
  onOpenB2MeetingMobileMap?: () => void
}

/** Reference UI: dark rail + charcoal disc with white pin; meta in muted gray; chevron for expand. */
function TimelineComponent({
  variantId,
  stops,
  selectedStopId,
  expandedId,
  onRowHeaderClick,
  b2PickupId = null,
  onB2PickupChange = noop,
  onB2MeetingHover = noop,
  onTimelineRowHover = noop,
  onOpenB2MeetingMobileMap,
}: Props) {
  const logisticsB = isVariantBLayout(variantId)
  const b2Triple = isVariantB2TripleMeeting(variantId, stops)
  const b2Meetings = b2Triple ? stops.slice(0, 3) : []
  const listStops = b2Triple ? stops.slice(3) : stops
  const listIndexOffset = b2Triple ? 3 : 0

  return (
    <div className="flex flex-col gap-0">
      {b2Triple ? (
        <TimelineB2MeetingRow
          variantId={variantId}
          stops={stops}
          meetings={b2Meetings}
          pickupId={b2PickupId}
          onPickupChange={onB2PickupChange}
          selectedStopId={selectedStopId}
          expandedId={expandedId}
          onRowHeaderClick={onRowHeaderClick}
          onMeetingHover={onB2MeetingHover}
          onOpenMobileMap={onOpenB2MeetingMobileMap}
        />
      ) : null}
      {listStops.map((stop, i) => {
        const index = listIndexOffset + i
        const isLast = index === stops.length - 1
        const selected = stop.id === selectedStopId
        const isOpen = expandedId === stop.id
        const meeting = logisticsB && stop.kind === 'meeting'
        const end = logisticsB && stop.kind === 'end'
        const passby = stop.kind === 'passby'
        const greenRail = meeting || end
        const poiOrder = getPoiOrderForStopIndex(stops, variantId, index)
        const selectedTeardropHtml =
          selected ? buildTimelineSelectedTeardropHtml(stop, variantId, poiOrder) : null

        return (
          <div
            key={stop.id}
            id={`poi-${stop.id}`}
            className={`flex w-full cursor-pointer gap-4 rounded-lg py-2 text-left transition hover:bg-stone-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 ${
              selected ? 'bg-white' : ''
            }`}
            tabIndex={0}
            aria-expanded={isOpen}
            aria-controls={`poi-details-${stop.id}`}
            aria-label={`${stop.title}. ${isOpen ? 'Collapse' : 'Expand'} details and show on map`}
            onMouseEnter={() => onTimelineRowHover(stop.id)}
            onMouseLeave={() => onTimelineRowHover(null)}
            onClick={() => onRowHeaderClick(stop.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRowHeaderClick(stop.id)
              }
            }}
          >
            {/* Rail: circle + thick vertical segment (stretches with row height) */}
            <div className="flex w-10 shrink-0 flex-col items-center sm:w-11" aria-hidden>
              {/* Figma 24767:59450 — Location icon 24px inside 4px padding = 32px circle; map selection is marker-only */}
              {selectedTeardropHtml != null ? (
                <div
                  key={`timeline-teardrop-${stop.id}-${isOpen}`}
                  className="relative z-10 flex h-[54px] w-10 shrink-0 items-center justify-center overflow-visible"
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: selectedTeardropHtml }}
                />
              ) : (
                <div
                  className={
                    passby
                      ? logisticsPassbyRailDiscClass(selected)
                      : logisticsRailDiscClass(greenRail, selected)
                  }
                >
                  {meeting ? (
                    <span
                      className="inline-flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: viatorMeetingMarkSvgHtml('pointer-events-none h-[14px] w-[14px] shrink-0'),
                      }}
                    />
                  ) : end ? (
                    <FlagGlyph className="size-6 text-white" />
                  ) : passby ? (
                    <svg
                      className="pointer-events-none block h-[18px] w-[18px] shrink-0"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <circle cx="9" cy="9" r="2.5" fill="#fff" />
                    </svg>
                  ) : poiOrder != null ? (
                    <span
                      className="min-w-[1.1rem] text-center text-[13px] font-medium leading-none tracking-normal text-white tabular-nums [font-family:var(--font-sans)] sm:text-[14px]"
                      aria-hidden
                    >
                      {poiOrder}
                    </span>
                  ) : null}
                </div>
              )}
              {!isLast ? (
                <div
                  className="mt-0 min-h-[36px] w-1 flex-1 rounded-full bg-stone-900 sm:w-[5px]"
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="pr-0 pt-0.5 sm:pr-1">
                <div className="px-1 py-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">
                      {stop.title}
                    </h3>
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400"
                      aria-hidden
                    >
                      <ChevronRow up={isOpen} />
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-stone-500">{stop.durationLine}</p>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                      <div
                        id={`poi-details-${stop.id}`}
                        className="mt-4"
                        aria-hidden={!isOpen}
                        inert={!isOpen}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <TimelineStopDescription text={stop.description} clampLines={3} />
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Parent may re-render for B2 map-hover only — memo keeps itinerary rows from replaying teardrop CSS. */
export const Timeline = memo(TimelineComponent)

/** Flag icon for end point (matches reference card) */
function FlagGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 3h2v18H5zm3 3h12v7H8z" />
    </svg>
  )
}

/** ~8.75rem at 16px — initial description peek before drag-to-expand. */
const SHELF_DESC_PEEK_PX = 140
/** Pointer: min vertical travel (px) on release to snap open / closed. */
const SHELF_DESC_SNAP_POINTER_DY = 28

/**
 * MW map horizontal shelf: **snap** description height — wheel / vertical drag up → full copy,
 * wheel / drag down → peek. No continuous height adjustment. Gradient only while peek-clipped.
 */
function TimelineShelfScrollFadeDescription({ text }: { text: string }) {
  const clipRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLParagraphElement>(null)
  const naturalHRef = useRef(0)
  const peekRef = useRef(0)
  const revealRef = useRef(SHELF_DESC_PEEK_PX)

  const [naturalH, setNaturalH] = useState(0)
  const [revealPx, setRevealPx] = useState(SHELF_DESC_PEEK_PX)

  useLayoutEffect(() => {
    const p = measureRef.current
    if (!p) return
    const h = Math.ceil(p.scrollHeight)
    naturalHRef.current = h
    const peek = Math.min(h, SHELF_DESC_PEEK_PX)
    peekRef.current = peek
    const next = h <= peek ? h : peek
    revealRef.current = next
    setNaturalH(h)
    setRevealPx(next)
  }, [text])

  const recalcNaturalFromResize = useCallback(() => {
    const p = measureRef.current
    if (!p) return
    const h = Math.ceil(p.scrollHeight)
    naturalHRef.current = h
    const peek = Math.min(h, SHELF_DESC_PEEK_PX)
    peekRef.current = peek
    setNaturalH(h)
    setRevealPx((prev) => {
      if (h <= peek) {
        revealRef.current = h
        return h
      }
      const wasFull = prev >= h - 2
      const next = wasFull ? h : peek
      revealRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    const p = measureRef.current
    if (!p) return
    const ro = new ResizeObserver(() => recalcNaturalFromResize())
    ro.observe(p)
    return () => ro.disconnect()
  }, [text, recalcNaturalFromResize])

  useEffect(() => {
    const clip = clipRef.current
    if (!clip) return
    const card = clip.closest('[data-shelf-card]') as HTMLElement | null
    if (!card) return

    const isInteractiveTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null
      if (!el || !card.contains(el)) return true
      return !!el.closest(
        'button, a, input, textarea, select, [role="listbox"], [role="option"], [contenteditable="true"]',
      )
    }

    const setRevealExact = (value: number) => {
      const n = naturalHRef.current
      const peek = peekRef.current
      if (n <= 0) return
      const v = n <= peek ? n : Math.min(n, Math.max(peek, value))
      if (v === revealRef.current) return
      revealRef.current = v
      setRevealPx(v)
    }

    const snapFull = () => {
      const n = naturalHRef.current
      if (n <= peekRef.current) return
      setRevealExact(n)
    }

    const snapPeek = () => {
      const n = naturalHRef.current
      const peek = peekRef.current
      if (n <= 0) return
      setRevealExact(n <= peek ? n : peek)
    }

    type Pending = { ox: number; oy: number; pointerId: number }
    let pending: Pending | null = null
    let dragging = false
    let sheetGestureLocked = false

    const unlockSheetGesture = () => {
      if (!sheetGestureLocked) return
      sheetGestureLocked = false
      card.style.touchAction = ''
      card.style.userSelect = ''
      card.style.setProperty('-webkit-user-select', '')
    }

    const lockSheetGesture = () => {
      if (sheetGestureLocked) return
      sheetGestureLocked = true
      card.style.touchAction = 'none'
      card.style.userSelect = 'none'
      card.style.setProperty('-webkit-user-select', 'none')
    }

    const clearWindow = () => {
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', onPointerEnd, true)
      window.removeEventListener('pointercancel', onPointerEnd, true)
    }

    const onPointerEnd = (e: PointerEvent) => {
      if (!pending || e.pointerId !== pending.pointerId) return
      if (dragging) {
        unlockSheetGesture()

        const n = naturalHRef.current
        const netDy = pending.oy - e.clientY
        const atFull = revealRef.current >= n - 2
        const canCardScroll = card.scrollHeight > card.clientHeight + 2

        if (netDy >= SHELF_DESC_SNAP_POINTER_DY) {
          if (!(atFull && canCardScroll)) snapFull()
        } else if (netDy <= -SHELF_DESC_SNAP_POINTER_DY) {
          snapPeek()
          card.scrollTop = 0
        }

        try {
          card.releasePointerCapture(e.pointerId)
        } catch {
          /* noop */
        }
      }
      clearWindow()
      pending = null
      dragging = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pending || e.pointerId !== pending.pointerId) return
      const dx = e.clientX - pending.ox
      const dy = pending.oy - e.clientY

      if (!dragging) {
        if (Math.abs(dx) > Math.abs(dy) + 12 && Math.abs(dx) > 12) {
          onPointerEnd(e)
          return
        }
        if (Math.abs(dy) < 10) return
        if (Math.abs(dy) <= Math.abs(dx)) return

        const n = naturalHRef.current
        const atFull = revealRef.current >= n - 2
        const canCardScroll = card.scrollHeight > card.clientHeight + 2
        if (atFull && dy > 0 && canCardScroll) {
          onPointerEnd(e)
          return
        }

        dragging = true
        lockSheetGesture()
        if (e.cancelable) e.preventDefault()
        try {
          card.setPointerCapture(e.pointerId)
        } catch {
          /* noop */
        }
      }

      if (dragging && e.cancelable) {
        e.preventDefault()
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (naturalHRef.current <= peekRef.current) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (isInteractiveTarget(e.target)) return

      pending = {
        ox: e.clientX,
        oy: e.clientY,
        pointerId: e.pointerId,
      }
      dragging = false
      window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
      window.addEventListener('pointerup', onPointerEnd, { capture: true })
      window.addEventListener('pointercancel', onPointerEnd, { capture: true })
      if (e.cancelable) e.preventDefault()
    }

    const onWheel = (e: WheelEvent) => {
      if (naturalHRef.current <= peekRef.current) return
      if (isInteractiveTarget(e.target)) return
      const n = naturalHRef.current
      const atFull = revealRef.current >= n - 2

      if (e.deltaY < 0) {
        if (!atFull) {
          e.preventDefault()
          snapFull()
        }
      } else if (e.deltaY > 0 && atFull) {
        e.preventDefault()
        snapPeek()
        card.scrollTop = 0
      }
    }

    card.addEventListener('pointerdown', onPointerDown, { passive: false })
    card.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      card.removeEventListener('pointerdown', onPointerDown)
      unlockSheetGesture()
      card.removeEventListener('wheel', onWheel)
      if (dragging && pending) {
        try {
          card.releasePointerCapture(pending.pointerId)
        } catch {
          /* noop */
        }
      }
      clearWindow()
      pending = null
      dragging = false
    }
  }, [text])

  const showFade = naturalH > revealPx + 2

  return (
    <div
      ref={clipRef}
      style={{
        maxHeight: `${revealPx}px`,
        overflow: 'hidden',
      }}
      className="relative isolate text-[14px] leading-relaxed text-stone-600 transition-[max-height] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none motion-reduce:duration-0"
    >
      <div ref={measureRef} className="pb-3">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
      {showFade ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 49.52%, #FFF 100%)',
          }}
          aria-hidden
        />
      ) : null}
    </div>
  )
}

/** Inline read more/less (220-char preview by default, or `line-clamp-*`). Not used when `shelfScrollFade`. */
function TimelineStopDescriptionClampOrPreview({
  text,
  clampLines,
}: {
  text: string
  clampLines?: 3
}) {
  const [readOpen, setReadOpen] = useState(false)
  const needsToggle = clampLines
    ? text.trim().length > 96
    : text.length > PREVIEW_CHARS
  const shown =
    clampLines || readOpen || !needsToggle
      ? text
      : `${text.slice(0, PREVIEW_CHARS).trim()}…`

  return (
    <div className="text-[14px] leading-relaxed text-stone-600">
      <p
        className={`whitespace-pre-wrap ${clampLines && !readOpen ? 'line-clamp-3' : ''}`}
      >
        {shown}
      </p>
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
          <ChevronTiny down={!readOpen} />
        </button>
      ) : null}
    </div>
  )
}

/** Shared with map modal POI overlay — default: read more/less; MW shelf: snap peek/full description. */
export function TimelineStopDescription({
  text,
  clampLines,
  shelfScrollFade,
}: {
  text: string
  clampLines?: 3
  /** MW map modal shelf: snap peek ↔ full on wheel or vertical drag (no in-between heights). */
  shelfScrollFade?: boolean
}) {
  if (shelfScrollFade) {
    return <TimelineShelfScrollFadeDescription text={text} />
  }
  return <TimelineStopDescriptionClampOrPreview text={text} clampLines={clampLines} />
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

function ChevronTiny({ down }: { down: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${down ? '' : 'rotate-180'}`}
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
