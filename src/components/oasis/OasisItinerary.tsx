import { useMemo, useState } from 'react'
import { LogisticsMap } from '../logistics/LogisticsMap'
import type { Stop } from '../../data/variants'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 text-black transition-transform ${open ? 'rotate-180' : ''}`}
    >
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

/**
 * Itinerary section — Figma
 * [node 10033:21988](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-21988):
 * a numbered stop timeline (black pins, meeting/end use teal) next to a 342×457 map card.
 * Bespoke to the Oasis desktop PDP — replaces `CollapsibleSection` + `LogisticsBlock`'s shared
 * accordion/timeline chrome. The interactive map canvas itself (`LogisticsMap`) is reused as-is —
 * rebuilding the Mapbox/maplibre pin + camera logic from scratch was out of scope for a visual redesign.
 */
export function OasisItinerary({ stops, routeLngLat, meetingAddress }: Props) {
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setSelectedId('')
    } else {
      setExpandedId(id)
      setSelectedId(id)
    }
  }

  const stopById = useMemo(() => new Map(stops.map((s) => [s.id, s])), [stops])

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <h2 className="text-[24px] font-medium leading-7 tracking-[0.2px] text-black">Itinerary</h2>

      <div className="flex w-full items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col items-start">
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1
            const isSelected = selectedId === row.id
            const isOpen = expandedId === row.id
            const description = stopById.get(row.id)?.description

            return (
              <div
                key={row.id}
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

                <div className="flex flex-1 flex-col items-start gap-2 py-1">
                  <button
                    type="button"
                    onClick={() => toggleRow(row.id)}
                    className="flex w-full items-start justify-between gap-2 text-left"
                  >
                    <span className="text-[16px] font-medium leading-6 tracking-[0.05px] text-black">
                      {row.title}
                    </span>
                    <span className="flex items-center p-2">
                      <ChevronIcon open={isOpen} />
                    </span>
                  </button>
                  <p className="w-full text-[14px] leading-5 tracking-[0.05px] text-[#707070]">{row.subtitle}</p>
                  {isOpen && description ? (
                    <p className="w-full whitespace-pre-line text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-[457px] w-[342px] shrink-0 overflow-hidden rounded-[24px] border border-[#d9d9d9]">
          <LogisticsMap
            variantId="b"
            routeLngLat={routeLngLat}
            mapKey="oasis-itinerary"
            stops={stops}
            selectedStopId={selectedId}
            lastSelectSource="list"
            highlightSelectedPin
            onSelectStop={(id) => {
              setSelectedId(id)
              setExpandedId(id)
            }}
            poiPopupContent="image-only"
          />
        </div>
      </div>
    </div>
  )
}
