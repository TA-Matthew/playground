import { useMemo, useState } from 'react'
import { LogisticsMap } from '../logistics/LogisticsMap'
import type { Stop } from '../../data/variants'

function ChevronIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-black">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 3v18M6 4h11l-3 4 3 4H6" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function VLogoIcon() {
  return (
    <span className="text-[11px] font-bold text-white" aria-hidden>
      V
    </span>
  )
}

function ExpandIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3H3v6M15 21h6v-6M3 15v6h6M21 9V3h-6"
        stroke="black"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type RowKind = 'meeting' | 'passby' | 'poi' | 'end'

type Row = {
  id: string
  kind: RowKind
  number?: number
  title: string
  subtitle: string
}

type Props = {
  stops: Stop[]
  routeLngLat: [number, number][]
  meetingAddress?: string
}

const COLLAPSED_ROW_COUNT = 4

/**
 * Mobile-web itinerary — Figma
 * [node 10144:18719](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18719):
 * a 300px map card (with an "open map" expand affordance + Mapbox attribution) stacked ABOVE a numbered
 * stop timeline, collapsed to the first 4 rows behind a bottom scrim + "View all N stops" button. Distinct
 * from the desktop {@link OasisItinerary}, which puts the list and map side-by-side and shows every stop.
 * Reuses `LogisticsMap` as-is for the interactive canvas.
 */
export function OasisMobileItinerary({ stops, routeLngLat, meetingAddress }: Props) {
  const rows: Row[] = useMemo(() => {
    const result: Row[] = []
    let poiCount = 0
    for (const stop of stops) {
      if (stop.kind === 'meeting') {
        result.push({ id: stop.id, kind: 'meeting', title: 'Meeting point', subtitle: stop.durationLine })
        continue
      }
      if (stop.kind === 'end') {
        result.push({
          id: stop.id,
          kind: 'end',
          title: 'End point',
          subtitle: meetingAddress ? `Same as meeting point — ${meetingAddress}` : stop.durationLine,
        })
        continue
      }
      if (stop.kind === 'passby') {
        result.push({ id: stop.id, kind: 'passby', title: stop.title, subtitle: stop.durationLine })
        continue
      }
      poiCount += 1
      result.push({ id: stop.id, kind: 'poi', number: poiCount, title: stop.title, subtitle: stop.durationLine })
    }
    return result
  }, [stops, meetingAddress])

  const [selectedId, setSelectedId] = useState('')
  const [showAll, setShowAll] = useState(false)

  const visibleRows = showAll ? rows : rows.slice(0, COLLAPSED_ROW_COUNT)

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <p className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black">Itinerary</p>

      <div className="flex w-full flex-col items-start gap-4">
        <div className="relative h-[300px] w-full overflow-hidden rounded-3xl border border-[#d9d9d9]">
          <LogisticsMap
            variantId="a"
            routeLngLat={routeLngLat}
            mapKey="oasis-mobile-itinerary"
            stops={stops}
            selectedStopId={selectedId}
            lastSelectSource="list"
            highlightSelectedPin
            onSelectStop={setSelectedId}
            poiPopupContent="image-only"
          />
          <button
            type="button"
            aria-label="Open map"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-[#d9d9d9] bg-white"
          >
            <ExpandIcon />
          </button>
        </div>

        <div className="flex w-full flex-col items-start">
          {visibleRows.map((row, i) => {
            const isLast = i === visibleRows.length - 1
            const isSelected = selectedId === row.id
            const showScrim = !showAll && i === visibleRows.length - 1 && rows.length > COLLAPSED_ROW_COUNT

            return (
              <div key={row.id} className="relative w-full">
                <div
                  className={`flex w-full items-start gap-4 rounded p-1 ${isSelected ? 'bg-[#f9f9f9]' : ''}`}
                >
                  <div className="flex flex-col items-center gap-1 self-stretch">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] border-white text-xs font-medium text-white ${
                        row.kind === 'meeting' || row.kind === 'end' ? 'bg-[#00ad86]' : 'bg-black'
                      }`}
                    >
                      {row.kind === 'meeting' ? <VLogoIcon /> : row.kind === 'end' ? <FlagIcon /> : row.number}
                    </span>
                    {!isLast ? <span className="w-1 flex-1 rounded-full bg-black" /> : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className="flex flex-1 flex-col items-start gap-2 py-1 text-left"
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span className="text-[16px] font-medium leading-6 tracking-[0.05px] text-black">
                        {row.title}
                      </span>
                      <span className="flex items-center p-2">
                        <ChevronIcon />
                      </span>
                    </span>
                    <p className="w-full text-[14px] leading-5 tracking-[0.05px] text-[#707070]">{row.subtitle}</p>
                  </button>
                </div>
                {showScrim ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-b from-white/0 via-white/80 to-white"
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        {!showAll && rows.length > COLLAPSED_ROW_COUNT ? (
          <button type="button" onClick={() => setShowAll(true)} className="pdp-neutral-outline-btn-md w-full">
            View all {rows.length} stops
          </button>
        ) : null}
      </div>
    </div>
  )
}
