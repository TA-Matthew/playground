import { useCallback, useEffect, useRef, useState } from 'react'
import {
  B2_MEETING_TIMELINE_ROW_ID,
  isVariantBLayout,
  type Stop,
  type VariantId,
} from '../../data/variants'
import { LogisticsMap } from './LogisticsMap'
import { Timeline, type SelectSource } from './Timeline'

/** Match `LogisticsMap` mobile layout — used to avoid list scroll when interacting with the map. */
const MOBILE_MAP_MAX_WIDTH_PX = 768

/** Stable callback so `React.memo(Timeline)` skips re-render when only map hover state updates. */
function noopMeetingHover() {}

/** First expanded itinerary row on load: A = first stop; B/C = first numbered POI (skip meeting / pass-by legs). */
function landingDefaultExpandedStopIdForVariant(stops: Stop[], variantId: VariantId): string {
  if (!isVariantBLayout(variantId)) {
    return stops[0]?.id ?? ''
  }
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i]
    if (!s) continue
    if (s.kind === 'meeting' || s.kind === 'end') continue
    if (s.kind === 'passby') continue
    return s.id
  }
  return stops[0]?.id ?? ''
}

type Props = {
  variantId: VariantId
  stops: Stop[]
  routeLngLat: [number, number][]
  routePolylineLngLat?: [number, number][]
  mapKey: string
  /** Embedded PDP map: show image-only pin popup (no title / duration in the card). */
  poiPopupContent?: 'full' | 'image-only'
}

export function LogisticsBlock({
  variantId,
  stops,
  routeLngLat,
  routePolylineLngLat,
  mapKey,
  poiPopupContent = 'full',
}: Props) {
  /** First itinerary row expanded on load (A: Borgo; B/C: POI #1 Borgo — not the meeting row). Map overview zoom follows `LogisticsMap` landing rules. */
  const landingDefaultExpandedStopId = landingDefaultExpandedStopIdForVariant(stops, variantId)
  const [selectedStopId, setSelectedStopId] = useState(landingDefaultExpandedStopId)
  const [expandedId, setExpandedId] = useState<string | null>(
    landingDefaultExpandedStopId || null,
  )
  /** Last interaction channel — used so mobile list/accordion selection does not drive map camera. */
  const [lastSelectSource, setLastSelectSource] = useState<SelectSource>('list')
  const expandedIdRef = useRef<string | null>(null)
  expandedIdRef.current = expandedId

  /** B2: dashed route hidden until a pickup is chosen in the timeline dropdown. */
  const [b2PickupId, setB2PickupId] = useState<string | null>(null)
  /** B2: dropdown hover previews that meeting pin on the map (selected styling). */
  const [b2HoverMeetingId, setB2HoverMeetingId] = useState<string | null>(null)
  /** Itinerary row hover — map pin shows full teardrop + image like the selected stop. */
  const [timelineHoverStopId, setTimelineHoverStopId] = useState<string | null>(null)
  const b2PickupIdRef = useRef<string | null>(null)
  b2PickupIdRef.current = b2PickupId
  useEffect(() => {
    if (variantId !== 'b2') {
      setB2PickupId(null)
      setB2HoverMeetingId(null)
    }
    setTimelineHoverStopId(null)
  }, [variantId])

  const handleTimelineRowHover = useCallback((id: string | null) => {
    setTimelineHoverStopId(id)
  }, [])

  const handleB2PickupChange = useCallback((id: string | null) => {
    setB2PickupId(id)
    setB2HoverMeetingId(null)
    if (id != null) {
      setLastSelectSource('b2MeetingPick')
      setSelectedStopId(id)
      /** Same timeline focus as map “Re-centre” for B2 — keeps meeting row expanded after pickup. */
      setExpandedId(B2_MEETING_TIMELINE_ROW_ID)
    } else {
      setLastSelectSource('list')
      setSelectedStopId('')
    }
  }, [])

  const handleB2MeetingHover = useCallback((id: string | null) => {
    setB2HoverMeetingId(id)
  }, [])

  /** Expand/collapse POI row: collapsing clears map + list selection. */
  const handleRowHeaderClick = useCallback(
    (id: string) => {
      if (expandedIdRef.current === id) {
        setSelectedStopId('')
        setExpandedId(null)
      } else {
        setLastSelectSource('list')
        if (variantId === 'b2' && id === B2_MEETING_TIMELINE_ROW_ID) {
          setExpandedId(id)
          const pick = b2PickupIdRef.current
          setSelectedStopId(pick ?? '')
        } else {
          setSelectedStopId(id)
          setExpandedId(id)
        }
      }
    },
    [variantId],
  )

  const handleSelectStop = useCallback(
    (id: string, source: SelectSource) => {
      /** B2: map / mobile sheet map taps do not set the meeting point (timeline dropdown only). */
      if (
        variantId === 'b2' &&
        stops.length >= 3 &&
        stops.slice(0, 3).some((s) => s.id === id) &&
        (source === 'map' || source === 'mapModal')
      ) {
        return
      }
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
    },
    [stops, variantId],
  )

  const handleRecentre = useCallback(() => {
    setTimelineHoverStopId(null)
    setB2HoverMeetingId(null)
    setLastSelectSource('list')
    /** B2: keep committed pickup + timeline focus — Re-centre only reframes the map. */
    if (variantId === 'b2' && b2PickupId != null) {
      setSelectedStopId(b2PickupId)
      setExpandedId(B2_MEETING_TIMELINE_ROW_ID)
      return
    }
    setSelectedStopId('')
    setExpandedId(null)
  }, [variantId, b2PickupId])

  return (
    <div className="mt-8 flex flex-col gap-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] md:items-start md:gap-6">
      {/* Mobile: map first, then timeline; md+: timeline (left) | map (right) */}
      <div className="order-2 min-w-0 md:order-1">
        <Timeline
          variantId={variantId}
          stops={stops}
          selectedStopId={selectedStopId}
          expandedId={expandedId}
          onRowHeaderClick={handleRowHeaderClick}
          b2PickupId={variantId === 'b2' ? b2PickupId : null}
          onB2PickupChange={handleB2PickupChange}
          onB2MeetingHover={variantId === 'b2' ? handleB2MeetingHover : noopMeetingHover}
          onTimelineRowHover={handleTimelineRowHover}
        />
      </div>
      <div className="order-1 min-h-0 min-w-0 w-full md:order-2 md:sticky md:top-8 md:z-[1] md:self-start">
        <LogisticsMap
          variantId={variantId}
          routeLngLat={routeLngLat}
          routePolylineLngLat={routePolylineLngLat}
          showItineraryPolyline={variantId !== 'b2' || b2PickupId != null}
          mapKey={mapKey}
          stops={stops}
          landingDefaultExpandedStopId={landingDefaultExpandedStopId}
          selectedStopId={selectedStopId}
          lastSelectSource={lastSelectSource}
          highlightSelectedPin={
            selectedStopId !== '' &&
            (lastSelectSource === 'mapModal' ||
              (expandedId !== null && expandedId === selectedStopId) ||
              (variantId === 'b2' &&
                expandedId === B2_MEETING_TIMELINE_ROW_ID &&
                stops.slice(0, 3).some((s) => s.id === selectedStopId)))
          }
          b2HoverMeetingId={variantId === 'b2' ? b2HoverMeetingId : null}
          b2CommittedPickupId={variantId === 'b2' ? b2PickupId : null}
          timelineHoverStopId={timelineHoverStopId}
          expandedStopId={expandedId}
          onSelectStop={handleSelectStop}
          onRecentre={handleRecentre}
          poiPopupContent={poiPopupContent}
        />
      </div>
    </div>
  )
}
