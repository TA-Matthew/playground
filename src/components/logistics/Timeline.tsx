import { memo, useState } from 'react'
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
  /** B2: open MW full-screen map meeting picker from timeline helper (“Choose a meeting point”). */
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

/** Shared with map modal POI overlay — inline read more/less (220-char preview by default, or `clampLines` CSS ellipsis). */
export function TimelineStopDescription({
  text,
  clampLines,
}: {
  text: string
  /** MW map modal: truncate visually with `line-clamp-*` instead of character slice. */
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
