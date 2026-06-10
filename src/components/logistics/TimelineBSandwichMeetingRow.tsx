import type { Stop } from '../../data/variants'
import { buildTimelineSelectedTeardropHtml } from './logisticsTeardropMarkup'
import { logisticsRailDiscClass } from './logisticsPinButtonClass'
import { OpenInGoogleMapsLink, TimelineStopDescription } from './Timeline'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'

type Props = {
  readonly stop: Stop
  readonly selectedStopId: string
  readonly expandedId: string | null
  readonly onRowHeaderClick: (id: string) => void
  readonly onTimelineRowHover: (id: string | null) => void
}

/**
 * Variant B — MW only: single meeting block above the inline map (D2 sandwich pattern).
 * Desktop keeps the meeting row in the timeline list.
 */
export function TimelineBSandwichMeetingRow({
  stop,
  selectedStopId,
  expandedId,
  onRowHeaderClick,
  onTimelineRowHover,
}: Props) {
  const selected = selectedStopId === stop.id
  const isOpen = expandedId === stop.id
  const selectedTeardropHtml = selected
    ? buildTimelineSelectedTeardropHtml(stop, 'b', null)
    : null

  return (
    <div
      id={`poi-${stop.id}`}
      className="w-full text-left"
      aria-label={`${stop.title}. ${isOpen ? 'Collapse' : 'Expand'} details`}
      onMouseEnter={() => onTimelineRowHover(stop.id)}
      onMouseLeave={() => onTimelineRowHover(null)}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex w-10 shrink-0 flex-col items-center sm:w-11" aria-hidden>
          {selectedTeardropHtml != null ? (
            <div
              key={`timeline-teardrop-b-meeting-${isOpen}`}
              className="relative z-10 flex h-[54px] w-10 shrink-0 items-center justify-center overflow-visible"
              dangerouslySetInnerHTML={{ __html: selectedTeardropHtml }}
            />
          ) : (
            <div className={logisticsRailDiscClass(true, selected)}>
              <span
                className="inline-flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: viatorMeetingMarkSvgHtml('pointer-events-none h-[14px] w-[14px] shrink-0'),
                }}
              />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="px-1 py-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <button
                type="button"
                className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-lg border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0"
                aria-expanded={isOpen}
                aria-controls={`poi-details-${stop.id}`}
                onClick={() => onRowHeaderClick(stop.id)}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-4">
                  <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">
                    {stop.title}
                  </h3>
                  <p className="text-[13px] leading-snug text-stone-500">
                    {stop.placeName ? (
                      <>
                        <span className="font-medium">{stop.placeName}</span>
                        {`, ${stop.durationLine}`}
                      </>
                    ) : (
                      stop.durationLine
                    )}
                  </p>
                </span>
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400"
                  aria-hidden
                >
                  <ChevronRow up={isOpen} />
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                  isOpen ? 'mt-4 grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    id={`poi-details-${stop.id}`}
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                  >
                    {isOpen ? (
                      <OpenInGoogleMapsLink address={stop.durationLine} className="mb-3 block" />
                    ) : null}
                    <TimelineStopDescription text={stop.description} clampLines={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRow({ up }: { readonly up: boolean }) {
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
