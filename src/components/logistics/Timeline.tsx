import { useState } from 'react'
import type { Stop, VariantId } from '../../data/variants'
import { getPoiOrderForStopIndex } from './poiOrder'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'
import { logisticsPassbyPinButtonClass, logisticsPinButtonClass } from './logisticsPinButtonClass'

const PREVIEW_CHARS = 220

/** `mapModal` = pin tap in the mobile full-screen map sheet — updates selection without expanding the list accordion. */
export type SelectSource = 'list' | 'map' | 'mapModal'

type Props = {
  /** Meeting/end rail icons apply only when `'b'`. */
  variantId: VariantId
  stops: Stop[]
  selectedStopId: string
  /** At most one POI expanded at a time (accordion); owned by parent so map pins can open a row. */
  expandedId: string | null
  /** List row title click: toggles expand; closing clears selection in parent. */
  onRowHeaderClick: (id: string) => void
  onSelectStop: (id: string, source: SelectSource) => void
}

/** Reference UI: dark rail + charcoal disc with white pin; meta in muted gray; chevron for expand. */
export function Timeline({
  variantId,
  stops,
  selectedStopId,
  expandedId,
  onRowHeaderClick,
  onSelectStop,
}: Props) {
  const logisticsB = variantId === 'b'

  return (
    <div className="flex flex-col gap-4">
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1
        const selected = stop.id === selectedStopId
        const isOpen = expandedId === stop.id
        const meeting = logisticsB && stop.kind === 'meeting'
        const end = logisticsB && stop.kind === 'end'
        const passby = stop.kind === 'passby'
        const greenRail = meeting || end
        const poiOrder = getPoiOrderForStopIndex(stops, variantId, index)

        return (
          <div
            key={stop.id}
            className="flex gap-4"
          >
            {/* Rail: circle + thick vertical segment (stretches with row height) */}
            <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
              {/* Figma 24767:59450 — Location icon 24px inside 4px padding = 32px circle */}
              <button
                type="button"
                className={
                  passby
                    ? logisticsPassbyPinButtonClass(selected)
                    : logisticsPinButtonClass(greenRail, selected)
                }
                aria-label={`Highlight ${stop.title} on map`}
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelectStop(stop.id, 'list')}
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
                    className="min-w-[1.1rem] text-center text-[13px] font-semibold leading-none text-white tabular-nums sm:text-[14px]"
                    aria-hidden
                  >
                    {poiOrder}
                  </span>
                ) : null}
              </button>
              {!isLast ? (
                <div
                  className="mt-0 w-1 flex-1 min-h-[36px] rounded-full bg-stone-900 sm:w-[5px]"
                  aria-hidden
                />
              ) : null}
            </div>

            <article
              id={`poi-${stop.id}`}
              className={`min-w-0 flex-1 border-b border-stone-200/90 pb-0 last:border-b-0 ${
                selected ? 'bg-white' : ''
              }`}
            >
              <div className="pr-0 pt-0.5 sm:pr-1">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-lg px-1 py-1 text-left transition hover:bg-stone-50/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-expanded={isOpen}
                  aria-controls={`poi-details-${stop.id}`}
                  aria-label={`${stop.title}. ${isOpen ? 'Collapse' : 'Expand'} details and show on map`}
                  onClick={() => onRowHeaderClick(stop.id)}
                >
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
                  <p className="mt-1.5 text-[13px] leading-snug text-stone-500">
                    {stop.durationLine}
                  </p>
                </button>

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
                    >
                      <DescriptionBlock text={stop.description} />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )
      })}
    </div>
  )
}

/** Flag icon for end point (matches reference card) */
function FlagGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 3h2v18H5zm3 3h12v7H8z" />
    </svg>
  )
}

function DescriptionBlock({ text }: { text: string }) {
  const [readOpen, setReadOpen] = useState(false)
  const needsToggle = text.length > PREVIEW_CHARS
  const shown =
    readOpen || !needsToggle ? text : `${text.slice(0, PREVIEW_CHARS).trim()}…`

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
