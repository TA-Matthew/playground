import { useCallback, useRef, useState } from 'react'
import type { Stop, VariantId } from '../../data/variants'
import { LogisticsMap } from './LogisticsMap'
import { Timeline, type SelectSource } from './Timeline'

/** Match `LogisticsMap` mobile layout — used to avoid list scroll when interacting with the map. */
const MOBILE_MAP_MAX_WIDTH_PX = 768

type Props = {
  variantId: VariantId
  stops: Stop[]
  routeLngLat: [number, number][]
  mapKey: string
}

export function LogisticsBlock({ variantId, stops, routeLngLat, mapKey }: Props) {
  /** No stop selected on first paint (variant A + B). */
  const [selectedStopId, setSelectedStopId] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  /** Last interaction channel — used so mobile list/accordion selection does not drive map camera. */
  const [lastSelectSource, setLastSelectSource] = useState<SelectSource>('list')
  const expandedIdRef = useRef<string | null>(null)
  expandedIdRef.current = expandedId

  /** Expand/collapse POI row: collapsing clears map + list selection. */
  const handleRowHeaderClick = useCallback((id: string) => {
    if (expandedIdRef.current === id) {
      setSelectedStopId('')
      setExpandedId(null)
    } else {
      setLastSelectSource('list')
      setSelectedStopId(id)
      setExpandedId(id)
    }
  }, [])

  const handleSelectStop = useCallback((id: string, source: SelectSource) => {
    setLastSelectSource(source)
    setSelectedStopId(id)
    if (source === 'map') {
      setExpandedId(id)
      const scrollListToPoi =
        typeof globalThis !== 'undefined' &&
        !globalThis.matchMedia(`(max-width: ${MOBILE_MAP_MAX_WIDTH_PX}px)`).matches
      if (scrollListToPoi) {
        requestAnimationFrame(() => {
          document.getElementById(`poi-${id}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        })
      }
    }
  }, [])

  const handleRecentre = useCallback(() => {
    setSelectedStopId('')
    setExpandedId(null)
    setLastSelectSource('list')
  }, [])

  return (
    <div className="mt-8 flex flex-col gap-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] md:items-start md:gap-10">
      {/* Mobile: map first, then timeline; md+: timeline (left) | map (right) */}
      <div className="order-2 min-w-0 md:order-1">
        <Timeline
          variantId={variantId}
          stops={stops}
          selectedStopId={selectedStopId}
          expandedId={expandedId}
          onRowHeaderClick={handleRowHeaderClick}
          onSelectStop={handleSelectStop}
        />
      </div>
      <div className="order-1 min-h-0 min-w-0 w-full md:order-2 md:sticky md:top-8 md:z-[1] md:self-start">
        <LogisticsMap
          variantId={variantId}
          routeLngLat={routeLngLat}
          mapKey={mapKey}
          stops={stops}
          selectedStopId={selectedStopId}
          lastSelectSource={lastSelectSource}
          highlightSelectedPin={
            selectedStopId !== '' &&
            (lastSelectSource === 'mapModal' ||
              (expandedId !== null && expandedId === selectedStopId))
          }
          onSelectStop={handleSelectStop}
          onRecentre={handleRecentre}
        />
      </div>
    </div>
  )
}
