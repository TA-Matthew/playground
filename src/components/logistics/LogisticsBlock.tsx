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

/** Desktop (≥769px): B2 opens the meeting row first; B and MW keep first POI expanded. */
function getLandingStateForBlock(
  stops: Stop[],
  variantId: VariantId,
  controlledB2PickupId: string | null | undefined,
): {
  landingDefaultExpandedStopId: string
  selectedStopId: string
  expandedId: string | null
} {
  const poiDefault = landingDefaultExpandedStopIdForVariant(stops, variantId)
  const desktop =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia(`(min-width: ${MOBILE_MAP_MAX_WIDTH_PX + 1}px)`).matches

  if (!desktop || variantId !== 'b2') {
    return {
      landingDefaultExpandedStopId: poiDefault,
      selectedStopId: poiDefault,
      expandedId: poiDefault || null,
    }
  }

  const pick =
    controlledB2PickupId !== undefined && controlledB2PickupId !== null
      ? controlledB2PickupId
      : null
  const sid = pick ?? ''
  return {
    landingDefaultExpandedStopId: sid,
    selectedStopId: sid,
    expandedId: B2_MEETING_TIMELINE_ROW_ID,
  }
}

/** True for legs that show as numbered POI pins — Re-centre must only refit the camera, not clear selection. */
function isNumberedItineraryPoiStop(s: Stop | undefined): boolean {
  if (!s) return false
  if (s.kind === 'meeting' || s.kind === 'end' || s.kind === 'passby') return false
  return true
}

type Props = {
  variantId: VariantId
  stops: Stop[]
  routeLngLat: [number, number][]
  routePolylineLngLat?: [number, number][]
  mapKey: string
  /** Embedded PDP map: show image-only pin popup (no title / duration in the card). */
  poiPopupContent?: 'full' | 'image-only'
  /**
   * B2: when provided with `onControlledB2PickupChange`, pickup + hover are controlled by the parent
   * (e.g. Meeting and Pickup card search) so map/timeline stay in sync.
   */
  controlledB2PickupId?: string | null
  onControlledB2PickupChange?: (id: string | null) => void
  controlledB2HoverMeetingId?: string | null
  onControlledB2MeetingHover?: (id: string | null) => void
  /** Registers `handleB2PickupChange` so Meeting & Pickup can call the same path as the timeline. */
  onExposeB2PickupApply?: (handler: ((id: string | null) => void) | null) => void
}

export function LogisticsBlock({
  variantId,
  stops,
  routeLngLat,
  routePolylineLngLat,
  mapKey,
  poiPopupContent = 'full',
  controlledB2PickupId,
  onControlledB2PickupChange,
  controlledB2HoverMeetingId,
  onControlledB2MeetingHover,
  onExposeB2PickupApply,
}: Props) {
  const [landingDefaultExpandedStopId] = useState(() =>
    getLandingStateForBlock(stops, variantId, controlledB2PickupId).landingDefaultExpandedStopId,
  )
  const [selectedStopId, setSelectedStopId] = useState(() =>
    getLandingStateForBlock(stops, variantId, controlledB2PickupId).selectedStopId,
  )
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    getLandingStateForBlock(stops, variantId, controlledB2PickupId).expandedId,
  )
  /** Last interaction channel — used so mobile list/accordion selection does not drive map camera. */
  const [lastSelectSource, setLastSelectSource] = useState<SelectSource>('list')
  const expandedIdRef = useRef<string | null>(null)
  expandedIdRef.current = expandedId

  const [internalB2PickupId, setInternalB2PickupId] = useState<string | null>(null)
  /** B2 MW: increment so `LogisticsMap` opens full-screen map + meeting picker (timeline “Show meeting points on map”). */
  const [b2OpenMeetingModalNonce, setB2OpenMeetingModalNonce] = useState(0)
  /** B2: dropdown hover previews that meeting pin on the map (selected styling). */
  const [internalB2HoverMeetingId, setInternalB2HoverMeetingId] = useState<string | null>(null)
  /** Itinerary row hover — map pin shows full teardrop + image like the selected stop. */
  const [timelineHoverStopId, setTimelineHoverStopId] = useState<string | null>(null)

  const b2PickupControlled =
    variantId === 'b2' && onControlledB2PickupChange != null
  const b2PickupId =
    variantId === 'b2'
      ? b2PickupControlled
        ? controlledB2PickupId ?? null
        : internalB2PickupId
      : null
  const b2HoverMeetingId =
    variantId === 'b2'
      ? b2PickupControlled
        ? controlledB2HoverMeetingId ?? null
        : internalB2HoverMeetingId
      : null

  const setB2PickupId = useCallback(
    (id: string | null) => {
      if (b2PickupControlled) {
        onControlledB2PickupChange?.(id)
      } else {
        setInternalB2PickupId(id)
      }
    },
    [b2PickupControlled, onControlledB2PickupChange],
  )

  const setB2HoverMeetingId = useCallback(
    (id: string | null) => {
      if (b2PickupControlled) {
        onControlledB2MeetingHover?.(id)
      } else {
        setInternalB2HoverMeetingId(id)
      }
    },
    [b2PickupControlled, onControlledB2MeetingHover],
  )

  const b2PickupIdRef = useRef<string | null>(null)
  b2PickupIdRef.current = b2PickupId
  useEffect(() => {
    if (variantId !== 'b2') {
      setInternalB2PickupId(null)
      setInternalB2HoverMeetingId(null)
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
  }, [setB2PickupId, setB2HoverMeetingId])

  useEffect(() => {
    if (variantId !== 'b2' || !onExposeB2PickupApply) return
    onExposeB2PickupApply(handleB2PickupChange)
    return () => onExposeB2PickupApply(null)
  }, [variantId, onExposeB2PickupApply, handleB2PickupChange])

  const handleB2MeetingHover = useCallback((id: string | null) => {
    setB2HoverMeetingId(id)
  }, [setB2HoverMeetingId])

  const bumpOpenB2MeetingMobileMap = useCallback(() => {
    setB2OpenMeetingModalNonce((n) => n + 1)
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
      /**
       * B2: embedded map taps on the triple-meeting row do not move list selection (pickup stays timeline-driven).
       * Full-screen MW map modal uses `mapModal` — allow those taps so the bottom card matches the selected pin.
       */
      if (
        variantId === 'b2' &&
        stops.length >= 3 &&
        stops.slice(0, 3).some((s) => s.id === id) &&
        source === 'map'
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

    const sel = stops.find((s) => s.id === selectedStopId)
    if (selectedStopId !== '' && isNumberedItineraryPoiStop(sel)) {
      return
    }

    /** B2: snap timeline to meeting row when focus isn’t on a numbered POI — Re-centre only reframes the map. */
    if (variantId === 'b2' && b2PickupId != null) {
      setLastSelectSource('list')
      setSelectedStopId(b2PickupId)
      setExpandedId(B2_MEETING_TIMELINE_ROW_ID)
      return
    }

    /** MW map modal: keep meeting / end / pass-by selection when the pin came from the map. */
    if (lastSelectSource === 'mapModal' && selectedStopId !== '') {
      return
    }

    setLastSelectSource('list')
    setSelectedStopId('')
    setExpandedId(null)
  }, [variantId, b2PickupId, lastSelectSource, selectedStopId, stops])

  /** MW full-screen map: chevron on POI card — collapse timeline selection + clear selected pin state. */
  const handleDismissMobileMapStopPanel = useCallback(() => {
    setTimelineHoverStopId(null)
    setB2HoverMeetingId(null)
    setSelectedStopId('')
    setExpandedId(null)
    setLastSelectSource('list')
  }, [])

  return (
    <div className="mt-8 flex flex-col gap-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] md:items-start md:gap-6">
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
          onOpenB2MeetingMobileMap={
            variantId === 'b2' ? bumpOpenB2MeetingMobileMap : undefined
          }
        />
      </div>
      <div className="order-1 min-h-0 min-w-0 w-full md:order-2 md:sticky md:top-8 md:z-[1] md:self-start">
        <LogisticsMap
          variantId={variantId}
          routeLngLat={routeLngLat}
          routePolylineLngLat={routePolylineLngLat}
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
          onB2PickupChange={variantId === 'b2' ? handleB2PickupChange : undefined}
          onB2MeetingHover={variantId === 'b2' ? handleB2MeetingHover : undefined}
          timelineHoverStopId={timelineHoverStopId}
          expandedStopId={expandedId}
          onSelectStop={handleSelectStop}
          onRecentre={handleRecentre}
          onDismissMobileMapStopPanel={handleDismissMobileMapStopPanel}
          poiPopupContent={poiPopupContent}
          b2OpenMeetingModalSignal={
            variantId === 'b2' ? b2OpenMeetingModalNonce : 0
          }
        />
      </div>
    </div>
  )
}
