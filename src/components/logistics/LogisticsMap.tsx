import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
} from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  isVariantB2TripleMeeting,
  isVariantBLayout,
  type Stop,
  type VariantId,
} from '../../data/variants'
import { TimelineStopDescription, type SelectSource } from './Timeline'
import { getPoiOrderForStopIndex } from './poiOrder'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'
import {
  logisticsCompactGreenPinButtonClass,
  logisticsPassbyPinButtonClass,
  logisticsPassbyRailDiscClass,
  logisticsPinButtonClass,
  logisticsRailDiscClass,
} from './logisticsPinButtonClass'
import { MobileMapModalB2MeetingPanel } from './MobileMapModalB2MeetingPanel'
import {
  MAP_MAP_PIN_COLLAPSED_OFFSET_Y,
  MAP_MAP_SELECTED_STACK_HEIGHT_PX,
  MAP_MAP_TEARDROP_ONLY_OFFSET_Y,
  MAP_POI_SELECTED_PIN_OFFSET_Y,
  buildTimelineSelectedTeardropHtml,
  mapB2MeetingCommittedCheckBadgeHtml,
  mapSelectedTeardropMarkerHtml,
  itineraryStopUsesTeardropWhenSelected,
} from './logisticsTeardropMarkup'

/** Persistent on the marker `<button>`: teardrop bounce intro at most once per marker element. */
const MAP_PIN_DS_INTRO_SEEN = 'mapPinHeadIntroSeen'

/** After the map block **intersects** the viewport and the pin intersects, wait this long before playing the intro. */
const MAP_PIN_TEARDROP_INTRO_DELAY_MS = 500

/** Fallback if POI order is missing (should not happen for itinerary POIs). */
const MAP_PIN_SVG = `<svg class="pointer-events-none h-[18px] w-[18px] shrink-0 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.15 9.27 6.24 11.47.42.45 1.1.45 1.52 0C14.85 18.27 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>`

/** Variant B meeting — Viator mark (white on green marker) */
const MAP_MEETING_VIATOR_SVG = viatorMeetingMarkSvgHtml(
  'pointer-events-none h-[13px] w-[13px] shrink-0',
)

/** Variant B end — flag icon (white on green marker) */
const MAP_FLAG_SVG = `<svg class="pointer-events-none h-[18px] w-[18px] shrink-0 text-white" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h2v18H5zm3 3h12v7H8z"/></svg>`

/**
 * Approximate half-extent (px) of a full-size marker on screen for overlap checks.
 * If two markers’ projected centers are closer than ~2×R×0.82, both render in compact (pass-by size).
 */
const MAP_FULL_MARKER_COLLISION_RADIUS_PX = 18

/** Modal POI focus: step zoom until overlap-compact clears for the focused stop (full-size pins again). */
const MODAL_UNCOMPACT_MAX_ZOOM = 22
const MODAL_UNCOMPACT_ZOOM_STEP = 0.85
const MODAL_UNCOMPACT_MAX_STEPS = 20

function computeOverlapCompactByIndex(
  coords: [number, number][],
  map: maplibregl.Map,
): boolean[] {
  const n = coords.length
  const compact = new Array<boolean>(n).fill(false)
  if (n < 2) return compact
  const pts = coords.map((c) => map.project(c))
  const R = MAP_FULL_MARKER_COLLISION_RADIUS_PX
  const minSep = 2 * R * 0.82
  const minSepSq = minSep * minSep
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pts[i].x - pts[j].x
      const dy = pts[i].y - pts[j].y
      if (dx * dx + dy * dy < minSepSq) {
        compact[i] = true
        compact[j] = true
      }
    }
  }
  return compact
}

/**
 * Pass-by leg — SVG dot at (9,9) in 18×18 viewBox so the highlight stays geometrically centred in the
 * charcoal disc (avoids flex/grid subpixel drift with MapLibre’s marker `transform`).
 */
const MAP_PASSBY_DOT_HTML = `<svg class="pointer-events-none block h-[18px] w-[18px] shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="2.5" fill="#fff"/></svg>`

/** White number on POI marker disc (same slot as former pin icon). */
function markerPoiNumberHtml(n: number): string {
  const fs = n >= 10 ? 10 : 12
  return `<span class="pointer-events-none flex h-[18px] min-w-[18px] items-center justify-center font-medium leading-none tracking-normal text-white tabular-nums" style="font-family:var(--font-sans);font-size:${fs}px;line-height:1" aria-hidden="true">${n}</span>`
}

/** Quadratic route bulge: control point offset as a fraction of segment length. Higher = deeper arch. */
const MAP_ROUTE_CURVE_BULGE = 0.4

/** Selected map marker uses the large teardrop when active (POI, pass-by, or variant B meeting/end), unless overlap forces compact. */
function isMapTeardropPin(
  active: boolean,
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
): boolean {
  if (overlapCompact || !active) return false
  return itineraryStopUsesTeardropWhenSelected(stop, variantId, poiOrder)
}

function markerSvgForStop(
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
  b2CommittedPickupId: string | null,
): string {
  if (isVariantBLayout(variantId) && stop?.kind === 'meeting') {
    if (overlapCompact) return MAP_PASSBY_DOT_HTML
    const showB2DiscCheck =
      variantId === 'b2' &&
      b2CommittedPickupId != null &&
      stop.id === b2CommittedPickupId
    if (showB2DiscCheck) {
      return `<span class="absolute inset-0 flex items-center justify-center overflow-visible">${MAP_MEETING_VIATOR_SVG}${mapB2MeetingCommittedCheckBadgeHtml()}</span>`
    }
    return MAP_MEETING_VIATOR_SVG
  }
  if (isVariantBLayout(variantId) && stop?.kind === 'end') {
    if (overlapCompact) return MAP_PASSBY_DOT_HTML
    return MAP_FLAG_SVG
  }
  if (stop?.kind === 'passby') return MAP_PASSBY_DOT_HTML
  if (poiOrder != null) {
    /** Overlap cluster: hide POI index — same dot-only mark as pass-by until zoom separates pins. */
    if (overlapCompact) return MAP_PASSBY_DOT_HTML
    return markerPoiNumberHtml(poiOrder)
  }
  return MAP_PIN_SVG
}

function isVariantBMeetingOrEnd(variantId: VariantId, stop: Stop | undefined): boolean {
  return isVariantBLayout(variantId) && (stop?.kind === 'meeting' || stop?.kind === 'end')
}

/**
 * B2: once a meeting pickup is chosen, the dashed itinerary should begin at that meeting pin and
 * connect into the core POI polyline (first vertex = Borgo / POI 1).
 */
function dashedItineraryLineCoords(
  variantId: VariantId,
  routeLngLat: [number, number][],
  routePolylineLngLat: [number, number][] | undefined,
  stops: readonly Stop[],
  b2CommittedPickupId: string | null,
): [number, number][] {
  const core = routePolylineLngLat ?? routeLngLat
  if (variantId !== 'b2' || b2CommittedPickupId == null || core.length < 1) {
    return core
  }
  const idx = stops.findIndex((s) => s.id === b2CommittedPickupId)
  if (idx < 0 || idx > 2) return core
  if (stops[idx]?.kind !== 'meeting') return core
  const meetingVertex = routeLngLat[idx]
  if (!meetingVertex) return core
  return [meetingVertex, ...core]
}

/**
 * Smooth curved path through ordered stops (quadratic Bézier per edge, alternating lateral offset).
 * Renders as a dotted connector on the map similar to illustrated itinerary lines in design.
 */
function buildCurvedRouteLngLat(
  points: [number, number][],
  samplesPerEdge = 22,
  bulgeFactor = MAP_ROUTE_CURVE_BULGE,
): [number, number][] {
  if (points.length < 2) return [...points]

  const pushDistinct = (out: [number, number][], p: [number, number]) => {
    const prev = out[out.length - 1]
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-10) {
      out.push(p)
    }
  }

  const out: [number, number][] = []

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const sign = i % 2 === 0 ? 1 : -1
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    const ctrl: [number, number] = [
      mid[0] + nx * len * bulgeFactor * sign,
      mid[1] + ny * len * bulgeFactor * sign,
    ]

    for (let s = 0; s <= samplesPerEdge; s++) {
      const t = s / samplesPerEdge
      const omt = 1 - t
      const lng = omt * omt * a[0] + 2 * omt * t * ctrl[0] + t * t * b[0]
      const lat = omt * omt * a[1] + 2 * omt * t * ctrl[1] + t * t * b[1]
      pushDistinct(out, [lng, lat])
    }
    // Snap segment end to exact vertex so the line meets HTML markers at setLngLat (no float drift).
    if (out.length > 0) {
      const end = out[out.length - 1]
      end[0] = b[0]
      end[1] = b[1]
    }
  }

  if (out.length > 0 && points.length > 0) {
    out[0][0] = points[0][0]
    out[0][1] = points[0][1]
  }

  return out
}

/** Carto Positron — light, low-contrast basemap so routes/markers stay primary in the UI */
const LIGHT_BASEMAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    positron: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [
    {
      id: 'positron',
      type: 'raster',
      source: 'positron',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

/**
 * In-view: bounce photo + teardrop once (see `index.css`). Head photo stays until the pin is deselected
 * — no timed dismiss; selection sync calls `expandMapPinHead` so the image returns on tap.
 *
 * Pin intros wait until `getMapInViewport()` is true (map wrapper intersects the viewport); until then the pin
 * stays deferred — see `flushDeferred` when the map scrolls into view. After that, `MAP_PIN_TEARDROP_INTRO_DELAY_MS`
 * runs before the bounce (skipped when `prefers-reduced-motion`).
 */
function attachMarkerTeardropInViewAnimation(
  markerElsRef: MutableRefObject<HTMLButtonElement[]>,
  getMapInViewport: () => boolean,
): { cleanup: () => void; flushDeferred: () => void } {
  const reduceMotion =
    typeof globalThis !== 'undefined' &&
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const introDelayMs = reduceMotion ? 0 : MAP_PIN_TEARDROP_INTRO_DELAY_MS

  /**
   * `root: null` = **browser viewport** (not the map div). Otherwise a pin that is only
   * “in view” of the map canvas can still be off-screen when the map is scrolled away.
   */
  const pinIoByEl = new Map<HTMLButtonElement, IntersectionObserver>()
  const introTimers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>()
  const cleanups: (() => void)[] = []

  const runIntroForEl = (el: HTMLButtonElement) => {
    const pendingTimer = introTimers.get(el)
    if (pendingTimer) clearTimeout(pendingTimer)
    introTimers.delete(el)

    const stack = el.querySelector('.logistics-map-selected-pin-stack')
    if (!stack || el.dataset[MAP_PIN_DS_INTRO_SEEN] === '1') return
    delete el.dataset.mapPinIntroDeferred
    el.dataset[MAP_PIN_DS_INTRO_SEEN] = '1'
    stack.classList.add('logistics-map-pin-in-view')
    stack.setAttribute('data-map-pin-view-done', '1')
    pinIoByEl.get(el)?.disconnect()
    pinIoByEl.delete(el)
  }

  const scheduleIntroForEl = (el: HTMLButtonElement) => {
    const stack = el.querySelector('.logistics-map-selected-pin-stack')
    if (!stack || el.dataset[MAP_PIN_DS_INTRO_SEEN] === '1') return

    const prev = introTimers.get(el)
    if (prev) clearTimeout(prev)

    if (introDelayMs <= 0) {
      runIntroForEl(el)
      return
    }

    introTimers.set(
      el,
      window.setTimeout(() => {
        introTimers.delete(el)
        if (el.dataset[MAP_PIN_DS_INTRO_SEEN] === '1') return
        if (!getMapInViewport()) {
          el.dataset.mapPinIntroDeferred = '1'
          return
        }
        runIntroForEl(el)
      }, introDelayMs),
    )
  }

  const flushDeferred = () => {
    if (!getMapInViewport()) return
    for (const el of markerElsRef.current) {
      if (!el || el.dataset.mapPinIntroDeferred !== '1') continue
      scheduleIntroForEl(el)
    }
  }

  for (const el of markerElsRef.current) {
    const stack = el.querySelector('.logistics-map-selected-pin-stack')
    if (!stack || el.dataset[MAP_PIN_DS_INTRO_SEEN] === '1') continue

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== el) continue
          if (entry.isIntersecting) {
            if (getMapInViewport()) {
              scheduleIntroForEl(el)
            } else {
              el.dataset.mapPinIntroDeferred = '1'
            }
          } else {
            const t = introTimers.get(el)
            if (t) clearTimeout(t)
            introTimers.delete(el)
            delete el.dataset.mapPinIntroDeferred
          }
        }
      },
      { root: null, rootMargin: '0px', threshold: [0, 0.1, 0.25] },
    )
    io.observe(el)
    pinIoByEl.set(el, io)
    cleanups.push(() => io.disconnect())
  }

  queueMicrotask(() => {
    if (getMapInViewport()) flushDeferred()
  })

  const cleanup = () => {
    for (const t of introTimers.values()) clearTimeout(t)
    introTimers.clear()
    cleanups.forEach((c) => c())
    pinIoByEl.clear()
  }

  return { cleanup, flushDeferred }
}

/** Re-run teardrop bounce (`logistics-map-pin-teardrop-in`) when the selected pin changes — IO only fires once per marker. */
function replayMapPinTeardropIntroAnimation(el: HTMLButtonElement) {
  const reduceMotion =
    typeof globalThis !== 'undefined' &&
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  const stack = el.querySelector('.logistics-map-selected-pin-stack')
  if (!stack) return

  stack.classList.remove('logistics-map-pin-in-view')
  void (stack as HTMLElement).offsetWidth
  stack.classList.add('logistics-map-pin-in-view')
}

/** Map-only marker chrome: selected → teardrop stack (photo optional on mobile inline); else disc / compact. */
function mapMarkerWrapperClass(
  stop: Stop | undefined,
  variantId: VariantId,
  active: boolean,
  poiOrder: number | null,
  overlapCompact: boolean,
  showMapPinPhotoHead: boolean,
): string {
  if (isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)) {
    const focusRing =
      isVariantBLayout(variantId) && (stop?.kind === 'meeting' || stop?.kind === 'end')
        ? 'focus-visible:ring-emerald-600'
        : 'focus-visible:ring-black'
    /** Literals keep Tailwind class detection; sizes match `logisticsTeardropMarkup` stack constants. */
    const minH = showMapPinPhotoHead ? 'min-h-[150px]' : 'min-h-[86px]'
    return `relative flex ${minH} w-20 cursor-pointer items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0 ${focusRing}`
  }
  if (overlapCompact) {
    if (isVariantBMeetingOrEnd(variantId, stop)) {
      return logisticsCompactGreenPinButtonClass(active)
    }
    if (stop?.kind === 'passby' || poiOrder != null) {
      return logisticsPassbyPinButtonClass(active)
    }
  }
  if (stop?.kind === 'passby') {
    return logisticsPassbyPinButtonClass(active)
  }
  return logisticsPinButtonClass(isVariantBMeetingOrEnd(variantId, stop), active)
}

/** HTML markers share one layer; selected pin + popup stack above other pins. */
const MAP_MARKER_Z_INACTIVE = '1'
const MAP_MARKER_Z_SELECTED = '50'
/** Itinerary row hover preview — above other selected-style pins when stacked. */
const MAP_MARKER_Z_TIMELINE_HOVER = '55'

/**
 * First time the user list-hovers a POI, wait before teardrop intro replays; after that,
 * every hover change replays immediately until the next page / variant.
 */
const HOVER_TEARDROP_FIRST_ANIM_DWELL_MS = 2000

const MAP_POI_POPUP_Z_INDEX = '100'
/** Re-centre / zoom controls sit above selected pins (`MAP_MARKER_Z_SELECTED`) but under popups. */
const MAP_CHROME_ABOVE_MARKERS_CLASS = 'z-[60]'

/** Full photo + teardrop stack — keeps image visible while this marker stays selected (clears timed-dismiss styling). */
function expandMapPinHead(el: HTMLElement) {
  const stack = el.querySelector('.logistics-map-selected-pin-stack')
  if (!stack) return
  /**
   * `index.css` hides `.logistics-map-pin-motion-wrap` until this class exists. Map marker HTML from
   * `mapSelectedTeardropMarkerHtml` does not include it (IO used to add it after viewport delay); without
   * it here, list-hover innerHTML swaps leave the teardrop invisible until the next IO tick — feels like
   * the pin vanishes during dwell / repeated sync.
   */
  stack.classList.add('logistics-map-pin-in-view')
  stack.classList.remove('logistics-map-pin-stack--head-collapsed')
  stack.querySelector('.logistics-map-pin-head-photo')?.classList.remove('logistics-map-pin-head-photo--dismiss')
  delete el.dataset.mapPinHeadCollapsed
  el.classList.remove('logistics-map-marker-head-collapsed')
}

function applyMarkerSelectedState(
  el: HTMLElement,
  active: boolean,
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
  b2CommittedPickupId: string | null,
  showMapPinPhotoHead: boolean,
  isTimelineRowHoverPin = false,
) {
  /** MapLibre adds `maplibregl-marker` (position:absolute;inset 0) and anchor classes. Replacing
   * `className` wholesale removes them and breaks alignment with the GL route line. */
  const maplibreglClasses = [...el.classList].filter((c) => c.startsWith('maplibregl-'))
  const teardrop = isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)

  const wasActive = el.dataset.mapPinActive === '1'
  el.dataset.mapPinActive = active ? '1' : '0'

  const b2ShowCommittedCheck =
    variantId === 'b2' &&
    stop?.kind === 'meeting' &&
    teardrop &&
    b2CommittedPickupId != null &&
    stop.id === b2CommittedPickupId

  const showB2MeetingDiscCheck =
    !teardrop &&
    variantId === 'b2' &&
    stop?.kind === 'meeting' &&
    !overlapCompact &&
    b2CommittedPickupId != null &&
    stop.id === b2CommittedPickupId

  /** Avoid replacing identical markup so teardrop CSS animation does not restart on every effect run. */
  const compactTag = overlapCompact ? ':c' : ':f'
  const imgKey = stop?.popupImageSrc ?? ''
  const photoTag = showMapPinPhotoHead ? '' : ':noph'
  const nextHtmlKey = teardrop
    ? stop?.kind === 'passby'
      ? `td:passby:${imgKey}${photoTag}`
      : stop?.kind === 'meeting'
        ? `td:meeting:${imgKey}${b2ShowCommittedCheck ? ':chk' : ''}${photoTag}`
        : stop?.kind === 'end'
          ? `td:end:${imgKey}${photoTag}`
          : `td:${poiOrder}:${imgKey}${photoTag}`
    : `pl:${variantId}:${stop?.id ?? ''}:${poiOrder ?? ''}${compactTag}${showB2MeetingDiscCheck ? ':b2chk' : ''}`
  const prevHtmlKey = el.getAttribute('data-marker-html-key') ?? ''
  if (prevHtmlKey !== nextHtmlKey) {
    delete el.dataset.mapPinHeadCollapsed
    if (teardrop && stop) {
      el.innerHTML = mapSelectedTeardropMarkerHtml(stop, poiOrder, {
        b2ShowCommittedCheck,
        omitPhotoHead: !showMapPinPhotoHead,
      })
    } else {
      el.innerHTML = markerSvgForStop(stop, variantId, poiOrder, overlapCompact, b2CommittedPickupId)
    }
    el.setAttribute('data-marker-html-key', nextHtmlKey)
  }

  if (!active || !teardrop) {
    delete el.dataset.mapPinHeadCollapsed
  }

  if (teardrop && active) {
    expandMapPinHead(el)
  }

  let cls = mapMarkerWrapperClass(
    stop,
    variantId,
    active,
    poiOrder,
    overlapCompact,
    showMapPinPhotoHead,
  )
  if (teardrop && el.dataset.mapPinHeadCollapsed === '1') {
    cls += ' logistics-map-marker-head-collapsed'
  }
  if (active && !wasActive && !teardrop) {
    cls += ' animate-logistics-map-pin-disc-in'
  }
  el.className = [...maplibreglClasses, cls].join(' ')
  el.style.zIndex = active
    ? isTimelineRowHoverPin
      ? MAP_MARKER_Z_TIMELINE_HOVER
      : MAP_MARKER_Z_SELECTED
    : MAP_MARKER_Z_INACTIVE
}

const POI_FOCUS_DURATION_MS = 900

/**
 * Insets when focusing a POI (zoom stack on the right). Kept closer to symmetric top/bottom now that
 * the bottom caption is removed — heavy bottom inset skewed the padded “center” and southern stops looked off-axis.
 */
const POI_VIEW_PADDING: maplibregl.PaddingOptions = {
  top: 24,
  bottom: 28,
  left: 16,
  right: 52,
}

/**
 * Full-screen mobile map modal: expand bottom (and slightly right) so `fitBounds` / `easeTo` frame the pin in
 * the visible band above the POI overlay (`min(42vh,320px)` card + GPS row + safe area).
 */
function mobileModalPoiViewPadding(): maplibregl.PaddingOptions {
  const h =
    typeof globalThis !== 'undefined' && 'innerHeight' in globalThis
      ? globalThis.innerHeight
      : 812
  const panelMax = Math.min(320, h * 0.42)
  const gpsAndGap = 44 + 8
  const safe = Math.max(12, Math.min(40, h * 0.05))
  const bottom = Math.max(
    POI_VIEW_PADDING.bottom ?? 0,
    Math.round(panelMax + gpsAndGap + safe),
  )
  return {
    ...POI_VIEW_PADDING,
    bottom,
    right: Math.max(POI_VIEW_PADDING.right ?? 0, 56),
  }
}

/** Clears transform padding so `fitBounds` uses the full canvas (see overview fit below). */
const ZERO_PADDING: maplibregl.PaddingOptions = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

/**
 * Extra top inset on default-route overview so the selected pin’s photo+teardrop stack clears the map edge
 * (`MAP_MAP_SELECTED_STACK_HEIGHT_PX` — anchor sits near the bottom of the stack).
 */
const OVERVIEW_FIT_TOP_PIN_HEADROOM_PX = Math.round(MAP_MAP_SELECTED_STACK_HEIGHT_PX * 0.35)

/**
 * Inset from canvas edges for `fitBounds` only (top: Re-centre + photo headroom, right: zoom stack).
 * Do not combine with `setPadding(POI_VIEW_PADDING)` here — that double-count was clipping pins.
 */
const OVERVIEW_FIT_PADDING: maplibregl.PaddingOptions = {
  top: 56 + OVERVIEW_FIT_TOP_PIN_HEADROOM_PX,
  bottom: 52,
  left: 32,
  right: 80,
}

/**
 * Narrow viewports (inline preview + full-screen sheet). Tighter than desktop so the default overview
 * sits closer to the route. **Decrease** to zoom in further (leave room for Re-centre + zoom stack).
 */
const OVERVIEW_FIT_PADDING_MOBILE: maplibregl.PaddingOptions = {
  top: 26 + OVERVIEW_FIT_TOP_PIN_HEADROOM_PX,
  bottom: 22,
  left: 8,
  right: 34,
}

/**
 * PDP inline map only (~300px tall). Balanced L/R keeps stops centred horizontally; balanced top/bottom
 * avoids the route riding high (previous tiny bottom inset). The full-screen sheet uses {@link overviewFitPaddingMobileModal}.
 */
const OVERVIEW_FIT_PADDING_MOBILE_INLINE: maplibregl.PaddingOptions = {
  /** Room for teardrop / pin chrome without dominating vertical centre — slightly less than desktop headroom. */
  top: 20 + Math.round(OVERVIEW_FIT_TOP_PIN_HEADROOM_PX * 0.55),
  bottom: 32,
  left: 14,
  right: 14,
}

/**
 * Full-screen mobile map modal only (`mobileInlinePreview: false`): extra bottom / right for the POI + GPS stack,
 * but **lighter than** {@link mobileModalPoiViewPadding} so route overview isn’t shoved to the top of the viewport.
 */
function overviewFitPaddingMobileModal(): maplibregl.PaddingOptions {
  const pinPad = mobileModalPoiViewPadding()
  const base = OVERVIEW_FIT_PADDING_MOBILE
  const b0 = base.bottom ?? 22
  const b1 = pinPad.bottom ?? b0
  /** Blend toward overlay clearance (~40%) — tight POI zoom uses full `b1`; overview stays more vertically centred. */
  const bottom = Math.round(b0 + (b1 - b0) * 0.4)
  return {
    top: base.top,
    bottom,
    left: base.left,
    right: Math.max(base.right ?? 0, pinPad.right ?? 0),
  }
}

/** Upper bound for zoom when fitting tight areas; keep high so we don’t force an overly wide world view. */
const OVERVIEW_MAX_ZOOM = 22

/** Optional tighter cap for mobile overview (lower = never zoom in past this level). Usually padding drives zoom. */
const OVERVIEW_MAX_ZOOM_MOBILE = OVERVIEW_MAX_ZOOM

/** Route overview readjustments use animated `fitBounds` (MapLibre `duration`), not instant jumps. */
const OVERVIEW_ZOOM_ANIM_MS_DESKTOP = 650
const OVERVIEW_ZOOM_ANIM_MS_MOBILE = 480

/** Viewport width at or below this value uses the mobile map pattern (locked preview + sheet). */
const MOBILE_COOPERATIVE_MAX_WIDTH_PX = 768

/** Compact attribution starts expanded; collapse after this delay so credits stay discoverable via the (i) control. */
const ATTRIBUTION_AUTO_COLLAPSE_MS = 4000
/** Opacity transition before programmatic collapse. */
const ATTRIBUTION_FADE_MS = 380

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Split `durationLine` (e.g. "15 min • Admission Included") for popup layout. */
function parseDurationAndAdmission(durationLine: string): {
  duration: string
  admission: string
} | null {
  const parts = durationLine.split('•').map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return {
      duration: parts[0],
      admission: parts.slice(1).join(' • '),
    }
  }
  return null
}

function MobileMapModalChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** MW map modal overlay — same rail pin + copy stack as `Timeline` POI row.
 * Description always matches the itinerary (`TimelineStopDescription`); unlike inline PDP popups, `poiPopupContent`
 * image-only does not strip body copy here. */
function MobileMapModalStopPanel({
  stop,
  variantId,
  stops,
  onDismiss,
  b2CommittedPickupId,
}: {
  stop: Stop
  variantId: VariantId
  stops: Stop[]
  onDismiss?: () => void
  /** B2 triple-meeting: bottom card copy follows committed pickup, not landing pin resolution. */
  b2CommittedPickupId?: string | null
}) {
  const logisticsB = isVariantBLayout(variantId)
  const selectionIsMeeting = logisticsB && stop.kind === 'meeting'
  const displayStop =
    variantId === 'b2' &&
    isVariantB2TripleMeeting(variantId, stops) &&
    selectionIsMeeting &&
    b2CommittedPickupId != null
      ? stops.find((s) => s.id === b2CommittedPickupId) ?? stop
      : stop

  const title = displayStop.title?.trim() || 'Stop'
  const desc = displayStop.description?.trim()
  const stopIndex = stops.findIndex((s) => s.id === displayStop.id)
  const poiOrder =
    stopIndex >= 0 ? getPoiOrderForStopIndex(stops, variantId, stopIndex) : null
  const selectedTeardropHtml =
    stopIndex >= 0 ? buildTimelineSelectedTeardropHtml(displayStop, variantId, poiOrder) : null

  const meeting = logisticsB && displayStop.kind === 'meeting'
  const end = logisticsB && displayStop.kind === 'end'
  const passby = displayStop.kind === 'passby'
  const greenRail = meeting || end

  return (
    <div
      className="rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-3 shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/80 backdrop-blur-md"
      role="region"
      aria-live="polite"
      aria-label="Details for the selected map stop"
    >
      <div className="flex gap-4">
        <div className="flex w-10 shrink-0 flex-col items-center sm:w-11" aria-hidden>
          {selectedTeardropHtml != null ? (
            <div
              className="relative z-10 flex h-[54px] w-10 shrink-0 items-center justify-center overflow-visible"
              dangerouslySetInnerHTML={{ __html: selectedTeardropHtml }}
            />
          ) : (
            <div
              className={
                passby
                  ? logisticsPassbyRailDiscClass(true)
                  : logisticsRailDiscClass(greenRail, true)
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
                <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M5 3h2v18H5zm3 3h12v7H8z" />
                </svg>
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
                <span className="min-w-[1.1rem] text-center text-[13px] font-medium leading-none tracking-normal text-white tabular-nums [font-family:var(--font-sans)] sm:text-[14px]">
                  {poiOrder}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pr-0 pt-0.5 sm:pr-1">
          <div className="flex items-start justify-between gap-2 px-1 py-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">{title}</h3>
              {displayStop.durationLine?.trim() ? (
                <p className="mt-1.5 text-[13px] leading-snug text-stone-500">
                  {displayStop.durationLine.trim()}
                </p>
              ) : null}
            </div>
            {onDismiss ? (
              <button
                type="button"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDismiss()
                }}
                aria-label="Close stop details"
              >
                <MobileMapModalChevronDown />
              </button>
            ) : null}
          </div>
          {desc ? (
            <div
              className="mt-4 px-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <TimelineStopDescription text={desc} clampLines={3} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type MapInteractionMode = 'desktop' | 'mobile-preview' | 'mobile-sheet'

function syncMapInteractions(map: maplibregl.Map, mode: MapInteractionMode) {
  const coop = map.cooperativeGestures
  coop.disable()
  // Never wheel-zoom — keeps document scroll when the cursor is over the embedded map.
  map.scrollZoom.disable()
  if (mode === 'desktop' || mode === 'mobile-sheet') {
    map.dragPan.enable()
    map.doubleClickZoom.enable()
    map.touchZoomRotate.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
  } else {
    map.dragPan.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()
    map.boxZoom.disable()
    map.keyboard.disable()
  }
}

const ICON_CLOCK = `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`
const ICON_TICKET = `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1.5a1.5 1.5 0 010 3 1.5 1.5 0 010 3V18a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.5a1.5 1.5 0 010-3 1.5 1.5 0 010-3V9z" stroke-linejoin="round"/></svg>`

type OpenPoiPopupOptions = {
  /** When true, show 2-line description preview + Read more (mobile map sheet only). */
  isMobile?: boolean
  /** PDP / DW: square image only — no title, duration, or description (see `LogisticsBlock`). */
  content?: 'full' | 'image-only'
}

const POI_POPUP_EDGE_PAD_PX = 12
/** Vertical gap (px) between map anchor and popup card — larger so the card clears the teardrop pin. */
const POI_POPUP_OFFSET_FROM_ANCHOR_PX = 64
/** Approx. marker span for pin–popup union (`panMapToCenterPoiGroup`). Selected teardrop uses `w-20` (80px). */
const MAP_MARKER_SCREEN_PX = 80

/**
 * Pans the map so the POI popup’s bounding box stays inside the map container (with padding).
 */
function panMapToFitPopup(map: maplibregl.Map, popup: maplibregl.Popup, paddingPx: number) {
  const el = popup.getElement()
  if (!el) return
  const mapRect = map.getContainer().getBoundingClientRect()
  const popupRect = el.getBoundingClientRect()
  const p = paddingPx
  const offsetX =
    Math.max(0, mapRect.left + p - popupRect.left) + Math.min(0, mapRect.right - p - popupRect.right)
  const offsetY =
    Math.max(0, mapRect.top + p - popupRect.top) + Math.min(0, mapRect.bottom - p - popupRect.bottom)
  if (offsetX === 0 && offsetY === 0) return
  map.panBy([offsetX, offsetY], { duration: 280, essential: true })
}

/**
 * Pans so the **pin + popup** are centered together in the map viewport. The anchor lng/lat is the
 * pin center; the popup sits above it, so centering only the coordinate leaves the group too high.
 */
function panMapToCenterPoiGroup(
  map: maplibregl.Map,
  popup: maplibregl.Popup,
  lngLat: [number, number],
): boolean {
  const el = popup.getElement()
  if (!el) return false
  const mapRect = map.getContainer().getBoundingClientRect()
  const popupRect = el.getBoundingClientRect()
  const pt = map.project(lngLat)
  const half = MAP_MARKER_SCREEN_PX / 2
  const pinLeft = mapRect.left + pt.x - half
  const pinRight = mapRect.left + pt.x + half
  const pinTop = mapRect.top + pt.y - half
  const pinBottom = mapRect.top + pt.y + half

  const unionLeft = Math.min(popupRect.left, pinLeft)
  const unionRight = Math.max(popupRect.right, pinRight)
  const unionTop = Math.min(popupRect.top, pinTop)
  const unionBottom = Math.max(popupRect.bottom, pinBottom)

  const cx = (unionLeft + unionRight) / 2
  const cy = (unionTop + unionBottom) / 2
  const mapCx = mapRect.left + mapRect.width / 2
  const mapCy = mapRect.top + mapRect.height / 2

  const dx = cx - mapCx
  const dy = cy - mapCy
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return false

  map.panBy([dx, dy], { duration: 280, essential: true })
  return true
}

function schedulePanMapToCenterPoiGroup(map: maplibregl.Map, popup: maplibregl.Popup, lngLat: [number, number]) {
  const run = () => {
    const moved = panMapToCenterPoiGroup(map, popup, lngLat)
    const edgeNudge = () => {
      if (!popup.isOpen()) return
      panMapToFitPopup(map, popup, POI_POPUP_EDGE_PAD_PX)
    }
    if (moved) {
      map.once('moveend', edgeNudge)
    } else {
      requestAnimationFrame(edgeNudge)
    }
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(run)
  })
}

function openPoiPopup(
  map: maplibregl.Map,
  lngLat: [number, number],
  stop: Stop,
  popupHolder: { current: maplibregl.Popup | null },
  options?: OpenPoiPopupOptions,
) {
  popupHolder.current?.remove()
  const isMobilePopup = options?.isMobile ?? false
  const contentMode = options?.content ?? 'full'
  const title = stop.title?.trim() || 'Stop'
  const meta = stop.durationLine ? parseDurationAndAdmission(stop.durationLine.trim()) : null

  const imgSrcEarly = stop.popupImageSrc?.trim()
  if (contentMode === 'image-only' && !imgSrcEarly) {
    return
  }

  const descPreview =
    contentMode === 'image-only'
      ? ''
      : isMobilePopup && stop.description?.trim()
      ? `<div class="border-t border-stone-100/90 bg-white px-4 pb-3 pt-2.5">
          <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">About</p>
          <div class="relative">
            <p class="line-clamp-2 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-600">${escapeHtml(stop.description.trim())}</p>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white from-20% via-white/70 to-transparent" aria-hidden="true"></div>
          </div>
          <button type="button" class="poi-popup-read-more pointer-events-auto mt-2.5 text-left text-[13px] font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500" data-stop-id="${escapeHtml(stop.id)}">Read more</button>
        </div>`
      : ''

  const rows =
    contentMode === 'image-only'
      ? ''
      : meta != null
      ? `<div class="flex flex-wrap items-center gap-x-2 gap-y-1 bg-white px-4 py-2 text-[12px] leading-snug text-stone-500 [&_svg]:h-3 [&_svg]:w-3">
          <span class="inline-flex min-w-0 items-center gap-1.5">
            <span class="shrink-0 text-current" aria-hidden="true">${ICON_CLOCK}</span>
            <span class="min-w-0 font-medium">${escapeHtml(meta.duration)}</span>
          </span>
          <span class="shrink-0 text-stone-400" aria-hidden="true">·</span>
          <span class="inline-flex min-w-0 items-center gap-1.5">
            <span class="shrink-0 text-current" aria-hidden="true">${ICON_TICKET}</span>
            <span class="min-w-0 font-medium">${escapeHtml(meta.admission)}</span>
          </span>
        </div>`
      : stop.durationLine
        ? `<div class="bg-white px-4 py-2 text-stone-500">
            <p class="text-[12px] leading-snug">${escapeHtml(stop.durationLine.trim())}</p>
          </div>`
        : ''

  /** Square hero — matches PDP gallery primary tile (`PdpViatorHeroGallery` / Figma DW): `aspect-square` + cover. */
  const imgSrc = stop.popupImageSrc?.trim()
  const imageOnlyFrame = contentMode === 'image-only' ? 'rounded-2xl' : 'rounded-t-2xl border-b border-stone-100/90'
  const imageBlock = imgSrc
    ? `<div class="relative aspect-square w-full shrink-0 overflow-hidden bg-stone-100 ${imageOnlyFrame}">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml((stop.popupImageAlt ?? title).trim())}" class="absolute inset-0 size-full object-cover" loading="lazy" width="256" height="256" decoding="async" />
      </div>`
    : ''

  const html =
    contentMode === 'image-only'
      ? `<div class="min-w-0 overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/90">
    ${imageBlock}
  </div>`
      : `<div class="flex max-h-[min(56svh,380px)] min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/90">
    ${imageBlock}
    <div class="shrink-0 bg-gradient-to-br from-stone-50 via-white to-stone-50/80 px-4 pb-3 pt-4">
      <h3 class="text-[15px] font-medium leading-snug tracking-tight text-stone-900">${escapeHtml(title)}</h3>
    </div>
    <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
    ${rows}
    ${descPreview}
    </div>
  </div>`

  const p = new maplibregl.Popup({
    /** Bottom of the popup sits on the coordinate — card stays above the pin (no auto-flip). */
    anchor: 'bottom',
    offset: POI_POPUP_OFFSET_FROM_ANCHOR_PX,
    /** Prefer map width over full viewport so embedded maps aren’t capped by 100vw. */
    maxWidth: 'min(256px, calc(100% - 24px))',
    padding: { top: POI_POPUP_EDGE_PAD_PX, bottom: POI_POPUP_EDGE_PAD_PX, left: POI_POPUP_EDGE_PAD_PX, right: POI_POPUP_EDGE_PAD_PX },
    className:
      '[&_.maplibregl-popup]:!max-w-[min(256px,calc(100%-1rem))] [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!rounded-2xl [&_.maplibregl-popup-tip]:!hidden rounded-2xl !border-0 !bg-transparent !shadow-none',
    closeButton: false,
    closeOnClick: true,
  })
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map)
  const popupEl = p.getElement()
  if (popupEl) popupEl.style.zIndex = MAP_POI_POPUP_Z_INDEX
  schedulePanMapToCenterPoiGroup(map, p, lngLat)
  popupHolder.current = p
}

/** Expand bbox so pins and the curved route aren’t flush to the inset frame. */
function expandBoundsGeographic(bounds: maplibregl.LngLatBounds, padFactor = 0.26): maplibregl.LngLatBounds {
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  const latSpan = Math.max(ne.lat - sw.lat, 1e-8)
  const lngSpan = Math.max(ne.lng - sw.lng, 1e-8)
  const latPad = Math.max(latSpan * padFactor, 0.00075)
  const lngPad = Math.max(lngSpan * padFactor, 0.00075)
  return new maplibregl.LngLatBounds(
    [sw.lng - lngPad, sw.lat - latPad],
    [ne.lng + lngPad, ne.lat + latPad],
  )
}

/**
 * B2 + committed pickup: overview framing uses only the chosen meeting plus POI / pass-by / end legs —
 * not the two alternate meeting locations (they’re hidden on the map anyway).
 */
function routeCoordsForVariantOverview(
  variantId: VariantId,
  routeLngLat: [number, number][],
  stops: Stop[],
  b2CommittedPickupId: string | null,
): [number, number][] {
  if (variantId !== 'b2' || b2CommittedPickupId == null || stops.length === 0 || routeLngLat.length === 0) {
    return routeLngLat
  }
  const out: [number, number][] = []
  const n = Math.min(stops.length, routeLngLat.length)
  for (let i = 0; i < n; i++) {
    const s = stops[i]
    if (s?.kind === 'meeting') {
      if (s.id === b2CommittedPickupId) {
        out.push(routeLngLat[i])
      }
    } else {
      out.push(routeLngLat[i])
    }
  }
  return out.length > 0 ? out : routeLngLat
}

/** Union of all stop coordinates and the curved itinerary polyline (bulges can sit outside stop hull). */
function computeOverviewBounds(
  stopCoords: [number, number][],
  mobile?: boolean,
  mobileInlinePreview?: boolean,
): maplibregl.LngLatBounds {
  const b = new maplibregl.LngLatBounds(stopCoords[0], stopCoords[0])
  for (const c of stopCoords) {
    b.extend(c)
  }
  const path = buildCurvedRouteLngLat(stopCoords)
  for (const c of path) {
    b.extend(c)
  }
  let padFactor = 0.26
  if (mobile) {
    /** Inline preview: a touch more geographic slack than 0.13 so the hull isn’t edge-tight when centred in the short map. */
    padFactor = mobileInlinePreview ? 0.155 : 0.19
  }
  return expandBoundsGeographic(b, padFactor)
}

/** Default / “Show all stops”: full canvas for fitting, single padding pass, no POI chrome inset. */
function fitRouteOverview(
  map: maplibregl.Map,
  coords: [number, number][],
  options: { duration: number; isMobile?: boolean; mobileInlinePreview?: boolean },
  /** When set, incremented during programmatic `fitBounds` so `zoomend` handlers can ignore those moves. */
  programmaticCameraDepth?: MutableRefObject<number>,
) {
  if (coords.length === 0) return
  map.resize()
  map.setPadding(ZERO_PADDING)
  const mobile = options.isMobile === true
  const inlinePreview = mobile && options.mobileInlinePreview === true
  const bounds = computeOverviewBounds(coords, mobile, inlinePreview)

  if (programmaticCameraDepth) {
    programmaticCameraDepth.current++
    map.once('idle', () => {
      programmaticCameraDepth.current = Math.max(0, programmaticCameraDepth.current - 1)
    })
  }

  map.fitBounds(bounds, {
    padding: mobile
      ? inlinePreview
        ? OVERVIEW_FIT_PADDING_MOBILE_INLINE
        : overviewFitPaddingMobileModal()
      : OVERVIEW_FIT_PADDING,
    maxZoom: mobile ? OVERVIEW_MAX_ZOOM_MOBILE : OVERVIEW_MAX_ZOOM,
    duration: options.duration,
    essential: true,
  })
}

/**
 * Tight frame on one stop — uses `fitBounds` on a micro-bbox (desktop: timeline + map pin selection).
 */
function fitPoiInView(
  map: maplibregl.Map,
  center: [number, number],
  duration: number,
) {
  map.stop()
  map.resize()
  map.setPadding(ZERO_PADDING)
  const [lng, lat] = center
  const d = 0.00018
  const bounds = new maplibregl.LngLatBounds([lng - d, lat - d], [lng + d, lat + d])
  map.fitBounds(bounds, {
    padding: POI_VIEW_PADDING,
    maxZoom: 16,
    duration,
    linear: true,
    essential: true,
  })
}

/**
 * Mobile full-screen map: zoom to a stop, then if it is still overlap-shrunk, ease in until screen-space
 * separation clears compact mode (or max zoom / step cap). Popup opens on tap separately so it matches the teardrop timing.
 */
function runMobileModalPoiFocus(
  map: maplibregl.Map,
  center: [number, number],
  routeCoords: [number, number][],
  focusIndex: number,
  initialDuration: number,
) {
  const pad = mobileModalPoiViewPadding()

  const onIdleChain = (step: number) => {
    map.once('idle', () => {
      /** Keep modal overlay reserved during overlap-compensation zooms (`easeTo` uses transform padding). */
      map.setPadding(pad)
      const overlap = computeOverlapCompactByIndex(routeCoords, map)
      const stillCompact = overlap[focusIndex] ?? false
      const z = map.getZoom()
      if (!stillCompact || z >= MODAL_UNCOMPACT_MAX_ZOOM - 0.02 || step >= MODAL_UNCOMPACT_MAX_STEPS) {
        return
      }
      map.easeTo({
        center,
        zoom: Math.min(z + MODAL_UNCOMPACT_ZOOM_STEP, MODAL_UNCOMPACT_MAX_ZOOM),
        duration: 240,
        essential: true,
      })
      onIdleChain(step + 1)
    })
  }

  /**
   * Don’t `map.stop()` here — interrupting the prior camera with a hard stop reads as a jump (e.g. after a
   * meeting zoom / overview). `easeTo` replaces the in-flight animation with a smooth blend from the current view.
   */
  map.resize()
  /**
   * Apply modal bottom overlay padding **before** the camera move, not on the first `idle` after the zoom.
   * Otherwise MapLibre frames with zero persistent padding during the animation, then `setPadding` in
   * `onIdleChain` shifts the transform center — reads as a jump / pin sliding out of view.
   */
  map.setPadding(pad)
  const overlap0 = computeOverlapCompactByIndex(routeCoords, map)
  const startTight = overlap0[focusIndex] ?? false
  const [lng, lat] = center
  const d = startTight ? 0.000055 : 0.00018
  const maxZoom = startTight ? 17.25 : 16
  const bounds = new maplibregl.LngLatBounds([lng - d, lat - d], [lng + d, lat + d])
  /**
   * Same end framing as `fitBounds` on this micro-bbox, but `easeTo` interpolates center+zoom from the **current**
   * camera (default easing). `fitBounds` + `linear: true` tended to feel like a teleport when crossing large
   * distances (meeting focus → POI) even though it was animated.
   */
  const cam = map.cameraForBounds(bounds, {
    padding: ZERO_PADDING,
    maxZoom,
  })
  if (
    cam != null &&
    cam.center != null &&
    cam.zoom !== undefined &&
    Number.isFinite(cam.zoom)
  ) {
    map.easeTo({
      center: cam.center,
      zoom: cam.zoom,
      bearing: cam.bearing ?? map.getBearing(),
      duration: initialDuration,
      essential: true,
    })
  } else {
    map.fitBounds(bounds, {
      padding: ZERO_PADDING,
      maxZoom,
      duration: initialDuration,
      essential: true,
    })
  }
  onIdleChain(0)
}

type Props = {
  variantId: VariantId
  routeLngLat: [number, number][]
  /** When set, dashed line uses these coords (else `routeLngLat`). B2: Borgo → … → end pin (meetings prepended when chosen). */
  routePolylineLngLat?: [number, number][]
  /** When `false`, dashed itinerary is hidden (default: visible). */
  showItineraryPolyline?: boolean
  mapKey: string
  stops: Stop[]
  selectedStopId: string
  /** Last channel used to change selection — list/accordion must not move the map on mobile. */
  lastSelectSource: SelectSource
  /**
   * First timeline row expanded on load — desktop keeps initial route overview zoom for that selection only;
   * user collapse/reopen or another list selection uses normal POI zoom.
   */
  landingDefaultExpandedStopId?: string
  /** When false, all pins stay the default black style until the user has selected a POI once. */
  highlightSelectedPin: boolean
  onSelectStop: (id: string, source: SelectSource) => void
  /** Called when Re-centre is used — parent may sync timeline; numbered POI selection stays on camera-only refits. */
  onRecentre?: () => void
  /** MW full-screen map: dismiss bottom POI card + clear map/list selection (chevron on `MobileMapModalStopPanel`). */
  onDismissMobileMapStopPanel?: () => void
  /** Map pin popup: `image-only` drops title/duration/body (PDP embedded map). */
  poiPopupContent?: 'full' | 'image-only'
  /** B2: meeting pin id while dropdown option is hovered (preview = same styling as selected). */
  b2HoverMeetingId?: string | null
  /** B2: chosen pickup — other meeting pins render dimmed until changed. */
  b2CommittedPickupId?: string | null
  /** B2: commit pickup from the full-screen map meeting panel (same handler as the timeline row). */
  onB2PickupChange?: (meetingStopId: string | null) => void
  /** B2: highlight a meeting pin while the modal list is hovered or a meeting pin was just tapped. */
  onB2MeetingHover?: (meetingStopId: string | null) => void
  /** Itinerary list row hover — map pin uses full teardrop + image like the selected stop. */
  timelineHoverStopId?: string | null
  /**
   * Open timeline accordion row id (if any). On mobile with list-originated selection, the map shows
   * the selected teardrop only while a row is expanded (or when selection came from the map/modal).
   */
  expandedStopId?: string | null
  /**
   * B2: parent increments this to open the MW full-screen map with the triple-meeting bottom sheet
   * (same as tapping a meeting pin). No-op on desktop or when not triple-meeting B2.
   */
  b2OpenMeetingModalSignal?: number
}

export function LogisticsMap({
  variantId,
  routeLngLat,
  routePolylineLngLat,
  showItineraryPolyline = true,
  mapKey,
  stops,
  selectedStopId,
  lastSelectSource,
  landingDefaultExpandedStopId = '',
  highlightSelectedPin,
  onSelectStop,
  onRecentre,
  onDismissMobileMapStopPanel,
  poiPopupContent = 'full',
  b2HoverMeetingId = null,
  b2CommittedPickupId = null,
  onB2PickupChange,
  onB2MeetingHover,
  timelineHoverStopId = null,
  expandedStopId = null,
  b2OpenMeetingModalSignal = 0,
}: Props) {
  /** Unique clipPath id for modal GPS icon SVG (avoid duplicate ids if multiple instances). */
  const mobileModalGpsIconClipId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const previewMapHostRef = useRef<HTMLDivElement>(null)
  const sheetMapHostRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const markerElsRef = useRef<HTMLButtonElement[]>([])
  const markerInViewAnimCleanupRef = useRef<(() => void) | null>(null)
  /** Map chrome wrapper (`wrapRef`) intersects the viewport — pins defer intro until then. */
  const mapWrapInViewportRef = useRef(false)
  /** Latest `flushDeferred` from `attachMarkerTeardropInViewAnimation` — invoked when map scrolls into range. */
  const deferredPinIntroFlushRef = useRef<(() => void) | null>(null)
  const stopsRef = useRef(stops)
  const onSelectRef = useRef(onSelectStop)
  /** After map ready, first run only syncs markers — no camera move so landing keeps `fitBounds` overview. */
  const previousSelectionForCameraRef = useRef<string | undefined>(undefined)
  /** Desktop: skip auto-opening the POI popup once for the same landing default-expanded row as the no-zoom rule. */
  const previousListSelectionForPopupRef = useRef<string | undefined>(undefined)
  /** Detect `highlightSelectedPin` false → true so zoom runs when user first engages the default-selected POI. */
  const prevHighlightForCameraRef = useRef(false)
  /** When true, debounced resize refits the route overview; false after POI focus or manual zoom. */
  const overviewModeRef = useRef(true)
  /** >0 while `fitRouteOverview` is animating the camera — suppresses mistaking that for user zoom in `zoomend`. */
  const programmaticOverviewCameraDepthRef = useRef(0)
  const routeCoordsRef = useRef(routeLngLat)
  /** After initial overview has settled — before this, `moveend` is ignored for “Re-centre” visibility. */
  const trackRecentreHintRef = useRef(false)
  /** Ignore `moveend` until this time (ms) so programmatic `fitBounds` does not reveal Re-centre. */
  const ignoreMoveEndForRecentreUntilRef = useRef(0)

  const variantIdRef = useRef(variantId)
  const selectedStopIdRef = useRef(selectedStopId)
  const highlightSelectedPinRef = useRef(highlightSelectedPin)
  const lastSelectSourceRef = useRef(lastSelectSource)
  const b2HoverMeetingIdRef = useRef<string | null>(null)
  const b2CommittedPickupIdRef = useRef<string | null>(null)
  const timelineHoverStopIdRef = useRef<string | null>(null)
  const expandedStopIdRef = useRef<string | null>(null)
  const landingDefaultExpandedStopIdRef = useRef(landingDefaultExpandedStopId)
  landingDefaultExpandedStopIdRef.current = landingDefaultExpandedStopId
  /** Re-applies marker HTML/classes/offset from current selection + screen-space overlap. */
  const syncMarkersAppearanceRef = useRef<() => void>(() => {})
  /** Replays teardrop entrance when `selectedStopId` changes (IntersectionObserver only adds class once per marker). */
  const previousSelectedStopIdForTeardropAnimRef = useRef<string | undefined>(undefined)
  /** B2: replay bounce when dropdown/map hover target changes (same animation as selection). */
  const previousB2HoverMeetingIdForTeardropAnimRef = useRef<string | null>(null)
  const previousTimelineHoverStopIdForTeardropAnimRef = useRef<string | null>(null)
  const hoverTeardropAnimPrimedRef = useRef(false)
  const hoverTeardropDwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const interactionRef = useRef({ isMobile: false, sheetOpen: false })
  const poiPopupRef = useRef<maplibregl.Popup | null>(null)
  const poiPopupContentRef = useRef(poiPopupContent)
  poiPopupContentRef.current = poiPopupContent
  /** Detect sheet close so we can reset the camera to the locked overview on the inline map. */
  const prevMobileSheetOpenRef = useRef(false)

  const [mapReady, setMapReady] = useState(false)
  const [showRecentre, setShowRecentre] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof globalThis !== 'undefined' &&
      globalThis.matchMedia(`(max-width: ${MOBILE_COOPERATIVE_MAX_WIDTH_PX}px)`).matches,
  )
  const isMobileRef = useRef(isMobile)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const mobileSheetOpenRef = useRef(mobileSheetOpen)
  mobileSheetOpenRef.current = mobileSheetOpen
  /** Mobile: full description sheet stacked above the map modal. */
  const [poiDescriptionSheet, setPoiDescriptionSheet] = useState<Stop | null>(null)
  /** B2: bottom sheet shows the triple-meeting picker (parity with `TimelineB2MeetingRow`) after a meeting pin tap. */
  const [mobileModalB2MeetingPanelOpen, setMobileModalB2MeetingPanelOpen] = useState(false)
  const setMobileModalB2MeetingPanelOpenRef = useRef(setMobileModalB2MeetingPanelOpen)
  setMobileModalB2MeetingPanelOpenRef.current = setMobileModalB2MeetingPanelOpen
  /** Map modal: list/pin selection before Confirm — does not commit until `onB2PickupChange` from confirm. */
  const [mobileB2MeetingPendingId, setMobileB2MeetingPendingId] = useState<string | null>(null)
  const mobileB2MeetingPendingIdRef = useRef(mobileB2MeetingPendingId)
  mobileB2MeetingPendingIdRef.current = mobileB2MeetingPendingId
  /**
   * While true, modal shows the meeting **list** even though `b2CommittedPickupId` is set — user is
   * changing meeting point; commit only on Select (timeline “Select different” no longer clears pickup first).
   */
  const [mobileB2MeetingReselectPicker, setMobileB2MeetingReselectPicker] = useState(false)
  const mobileB2MeetingReselectPickerRef = useRef(mobileB2MeetingReselectPicker)
  mobileB2MeetingReselectPickerRef.current = mobileB2MeetingReselectPicker
  const setMobileB2MeetingReselectPickerRef = useRef(setMobileB2MeetingReselectPicker)
  setMobileB2MeetingReselectPickerRef.current = setMobileB2MeetingReselectPicker
  /** Detect committed pickup cleared while MW modal meeting sheet open → zoom out to full route (all meetings). */
  const prevB2CommittedPickupIdForModalCameraRef = useRef<string | null | undefined>(undefined)
  /** Reselect picker opens while pickup still committed → zoom out so all meeting points are visible. */
  const prevB2ReselectPickerForModalCameraRef = useRef<boolean | undefined>(undefined)
  const setMobileB2MeetingPendingIdRef = useRef(setMobileB2MeetingPendingId)
  setMobileB2MeetingPendingIdRef.current = setMobileB2MeetingPendingId
  /** True when B2 meeting sheet UI is shown (explicit picker or automatic meeting landing). Read in `syncMarkersAppearance`. */
  const showB2MeetingModalPanelRef = useRef(false)
  /** Hide POI bottom card until another pin tap — otherwise landing POI would replace it immediately. */
  const [mobileModalStopPanelDismissed, setMobileModalStopPanelDismissed] = useState(false)
  const setMobileModalStopPanelDismissedRef = useRef(setMobileModalStopPanelDismissed)
  setMobileModalStopPanelDismissedRef.current = setMobileModalStopPanelDismissed
  /** Read in `syncMarkersAppearanceRef` — skip landing POI “showcase” teardrop after chevron-dismiss in MW modal. */
  const mobileModalStopPanelDismissedRef = useRef(mobileModalStopPanelDismissed)
  mobileModalStopPanelDismissedRef.current = mobileModalStopPanelDismissed
  /** Exit animation runs imperatively so entrance can stay declarative (controls retained opacity 0 after dismiss). */
  const mobileModalStopPanelMotionRef = useRef<HTMLDivElement | null>(null)
  const dismissingMobileModalStopPanelRef = useRef(false)
  const mobileModalB2MeetingPanelMotionRef = useRef<HTMLDivElement | null>(null)
  const dismissingMobileModalB2MeetingPanelRef = useRef(false)
  const onB2MeetingHoverRef = useRef(onB2MeetingHover)
  onB2MeetingHoverRef.current = onB2MeetingHover

  interactionRef.current = { isMobile, sheetOpen: mobileSheetOpen }

  variantIdRef.current = variantId
  selectedStopIdRef.current = selectedStopId
  highlightSelectedPinRef.current = highlightSelectedPin
  lastSelectSourceRef.current = lastSelectSource
  isMobileRef.current = isMobile
  b2HoverMeetingIdRef.current = b2HoverMeetingId
  b2CommittedPickupIdRef.current = b2CommittedPickupId
  timelineHoverStopIdRef.current = timelineHoverStopId ?? null
  expandedStopIdRef.current = expandedStopId ?? null

  const mobileModalEffectiveStop = useMemo(() => {
    if (!isMobile || !mobileSheetOpen) return null
    if (mobileModalStopPanelDismissed) return null

    const selIdx = stops.findIndex((s) => s.id === selectedStopId)
    const mobileListSelection = lastSelectSource === 'list'
    const showMapPinSelected =
      highlightSelectedPin && (!mobileListSelection || expandedStopId != null)
    const selectionActiveIdx =
      selIdx >= 0 && showMapPinSelected ? selIdx : -1

    const landingShowcaseIdx = (() => {
      const id = landingDefaultExpandedStopId
      if (id) {
        const j = stops.findIndex((s) => s.id === id)
        if (j >= 0) return j
      }
      for (let idx = 0; idx < stops.length; idx++) {
        const s = stops[idx]
        if (!s) continue
        const po = getPoiOrderForStopIndex(stops, variantId, idx)
        if (itineraryStopUsesTeardropWhenSelected(s, variantId, po)) return idx
      }
      return -1
    })()

    const effectiveSelectionIdx =
      selectionActiveIdx >= 0
        ? selectionActiveIdx
        : landingShowcaseIdx >= 0
          ? landingShowcaseIdx
          : -1

    if (effectiveSelectionIdx < 0) return null
    return stops[effectiveSelectionIdx] ?? null
  }, [
    isMobile,
    mobileSheetOpen,
    mobileModalStopPanelDismissed,
    stops,
    selectedStopId,
    highlightSelectedPin,
    lastSelectSource,
    expandedStopId,
    landingDefaultExpandedStopId,
    variantId,
  ])

  const showB2MeetingModalPanel = useMemo(
    () =>
      variantId === 'b2' &&
      isVariantB2TripleMeeting(variantId, stops) &&
      onB2PickupChange != null &&
      mobileSheetOpen &&
      !mobileModalStopPanelDismissed &&
      (mobileModalB2MeetingPanelOpen || mobileModalEffectiveStop?.kind === 'meeting'),
    [
      variantId,
      stops,
      onB2PickupChange,
      mobileSheetOpen,
      mobileModalStopPanelDismissed,
      mobileModalB2MeetingPanelOpen,
      mobileModalEffectiveStop,
    ],
  )
  showB2MeetingModalPanelRef.current = showB2MeetingModalPanel

  const mobileModalDetailStop = useMemo(() => {
    if (!mobileModalEffectiveStop) return null
    if (
      mobileModalB2MeetingPanelOpen &&
      variantId === 'b2' &&
      isVariantB2TripleMeeting(variantId, stops) &&
      onB2PickupChange != null
    ) {
      return null
    }
    if (
      variantId === 'b2' &&
      isVariantB2TripleMeeting(variantId, stops) &&
      onB2PickupChange != null &&
      mobileModalEffectiveStop.kind === 'meeting'
    ) {
      return null
    }
    return mobileModalEffectiveStop
  }, [
    mobileModalEffectiveStop,
    mobileModalB2MeetingPanelOpen,
    variantId,
    stops,
    onB2PickupChange,
  ])

  syncMarkersAppearanceRef.current = () => {
    const map = mapRef.current
    if (!map || markerElsRef.current.length === 0) return
    const coords = routeCoordsRef.current
    if (coords.length === 0) return
    const overlap = computeOverlapCompactByIndex(coords, map)
    const stopsLocal = stopsRef.current
    const vid = variantIdRef.current
    const selId = selectedStopIdRef.current
    const selIdx = stopsLocal.findIndex((s) => s.id === selId)
    const committedPickup = b2CommittedPickupIdRef.current
    const selectedStopForFocus = selIdx >= 0 ? stopsLocal[selIdx] : undefined
    /** Dim non-focused meeting pins when a pickup is committed or the current list/map selection is a meeting. */
    let b2FocusMeetingId: string | null = null
    if (vid === 'b2') {
      if (committedPickup != null) {
        b2FocusMeetingId = committedPickup
      } else if (selectedStopForFocus?.kind === 'meeting') {
        b2FocusMeetingId = selectedStopForFocus.id
      }
    }
    const rawB2HoverMeetingId =
      variantIdRef.current === 'b2' ? b2HoverMeetingIdRef.current : null
    /**
     * MW map-modal meeting sheet: pins follow **pending** selection only — ignore timeline/list hover
     * preview so the selected meeting stays highlighted on the map.
     */
    const b2MeetingModalHighlightId =
      showB2MeetingModalPanelRef.current &&
      variantIdRef.current === 'b2' &&
      mobileB2MeetingPendingIdRef.current != null
        ? mobileB2MeetingPendingIdRef.current
        : rawB2HoverMeetingId
    const hoverIdx = b2MeetingModalHighlightId
      ? stopsLocal.findIndex((s) => s.id === b2MeetingModalHighlightId)
      : -1
    const timelineHoverId = timelineHoverStopIdRef.current
    const timelineHoverIdx = timelineHoverId
      ? stopsLocal.findIndex((s) => s.id === timelineHoverId)
      : -1
    const timelineHoverActive =
      timelineHoverIdx >= 0 && timelineHoverId != null
    const mobileListSelection =
      isMobileRef.current && lastSelectSourceRef.current === 'list'
    /**
     * Show teardrop+image for the current selection when `highlightSelectedPin` says so. On mobile
     * with list-originated selection, only while a timeline row is expanded (or not list) so
     * collapsed list browsing does not light up the map; list hover can still take over below.
     */
    const showMapPinSelected =
      highlightSelectedPinRef.current &&
      (!mobileListSelection || expandedStopIdRef.current != null)
    const selectionActiveIdx =
      selIdx >= 0 && showMapPinSelected ? selIdx : -1

    /** Desktop + full-screen map modal: square image above teardrop. Mobile inline PDP map: teardrop only. */
    const showMapPinPhotoHead =
      !isMobileRef.current || mobileSheetOpenRef.current

    /** Inline mobile web map: no screen-space cluster mode — always full-size circle pins (not 18px dots). */
    const useOverlapCompact = showMapPinPhotoHead

    /**
     * Mobile inline PDP: map pins stay fixed — timeline hover / list selection / B2 preview do not
     * restyle markers. Exception: one “showcase” pin (landing first POI) stays teardrop + does not follow selection.
     */
    const syncInlineMapPinsWithTimeline = showMapPinPhotoHead

    const landingShowcaseIdx = (() => {
      const id = landingDefaultExpandedStopIdRef.current
      if (id) {
        const j = stopsLocal.findIndex((s) => s.id === id)
        if (j >= 0) return j
      }
      for (let idx = 0; idx < stopsLocal.length; idx++) {
        const po = getPoiOrderForStopIndex(stopsLocal, vid, idx)
        if (itineraryStopUsesTeardropWhenSelected(stopsLocal[idx], vid, po)) return idx
      }
      return -1
    })()

    /**
     * MW full-screen map: `highlightSelectedPin` is often false on open (list source + collapsed rows),
     * so no pin would be “selected”. Fall back to the same landing first POI as the inline showcase —
     * unless the user dismissed the POI card (chevron): then keep **no** pin highlighted.
     * B2 meeting-picker sheet: no landing POI teardrop — only meeting pins / hover preview matter.
     */
    const modalLandingFallbackOk =
      mobileSheetOpenRef.current &&
      landingShowcaseIdx >= 0 &&
      !mobileModalStopPanelDismissedRef.current &&
      !showB2MeetingModalPanelRef.current

    const effectiveSelectionIdx =
      selectionActiveIdx >= 0
        ? selectionActiveIdx
        : modalLandingFallbackOk
          ? landingShowcaseIdx
          : -1

    /** B2 meeting-picker modal: never keep a route POI teardrop “selected” — only meetings + hover/preview. */
    let pinSelectionIdx = effectiveSelectionIdx
    if (
      showB2MeetingModalPanelRef.current &&
      variantIdRef.current === 'b2' &&
      pinSelectionIdx >= 0
    ) {
      const st = stopsLocal[pinSelectionIdx]
      if (st?.kind !== 'meeting') {
        pinSelectionIdx = -1
      }
    }

    markerElsRef.current.forEach((el, i) => {
      /** Modal/desktop: selection drives teardrops; MW modal uses `pinSelectionIdx` (with landing fallback). MW inline: only `landingShowcaseIdx` is active (fixed). */
      const selectedPinActive = syncInlineMapPinsWithTimeline
        ? pinSelectionIdx >= 0 && i === pinSelectionIdx
        : landingShowcaseIdx >= 0 && i === landingShowcaseIdx
      const timelineHoverPinActive =
        syncInlineMapPinsWithTimeline &&
        timelineHoverActive &&
        i === timelineHoverIdx
      const b2MeetingHoverPinActive =
        syncInlineMapPinsWithTimeline && hoverIdx >= 0 && i === hoverIdx
      const active =
        selectedPinActive || timelineHoverPinActive || b2MeetingHoverPinActive
      const poiOrder = getPoiOrderForStopIndex(stopsLocal, vid, i)
      const oc = useOverlapCompact ? (overlap[i] ?? false) : false
      const isTimelineRowHoverPin = timelineHoverPinActive
      /** Map overlap → compact dots when clustered (`useOverlapCompact`). Active pin always full teardrop. MW inline skips compact. */
      const ocForMarker = active ? false : oc
      applyMarkerSelectedState(
        el,
        active,
        stopsLocal[i],
        vid,
        poiOrder,
        ocForMarker,
        b2CommittedPickupIdRef.current,
        showMapPinPhotoHead,
        isTimelineRowHoverPin,
      )
      const teardrop = isMapTeardropPin(active, stopsLocal[i], vid, poiOrder, ocForMarker)
      const collapsed = el.dataset.mapPinHeadCollapsed === '1'
      const offY = teardrop
        ? !showMapPinPhotoHead
          ? MAP_MAP_TEARDROP_ONLY_OFFSET_Y
          : collapsed
            ? MAP_MAP_PIN_COLLAPSED_OFFSET_Y
            : MAP_POI_SELECTED_PIN_OFFSET_Y
        : 0
      markersRef.current[i]?.setOffset([0, offY])

      const stopAt = stopsLocal[i]
      if (vid === 'b2' && stopAt?.kind === 'meeting') {
        /**
         * MW map-modal meeting sheet (pending choice, not yet committed): keep **all** meeting pins on
         * the canvas — selection vs dimming comes from `applyMarkerSelectedState` / active hover idx only.
         * `data-logistics-b2-meeting-hidden` is for timeline-committed pickup (hide non-chosen meetings).
         */
        const mapModalMeetingPicker =
          showB2MeetingModalPanelRef.current &&
          (b2CommittedPickupIdRef.current == null ||
            mobileB2MeetingReselectPickerRef.current)

        if (mapModalMeetingPicker) {
          el.removeAttribute('data-logistics-b2-meeting-hidden')
          el.removeAttribute('aria-hidden')
        } else {
          const primaryMeetingFocusId: string | null = b2FocusMeetingId
          if (primaryMeetingFocusId != null) {
            const hoverId = b2MeetingModalHighlightId
            const isFocus =
              stopAt.id === primaryMeetingFocusId ||
              (hoverId != null && stopAt.id === hoverId)
            if (isFocus) {
              el.removeAttribute('data-logistics-b2-meeting-hidden')
              el.removeAttribute('aria-hidden')
            } else {
              el.setAttribute('data-logistics-b2-meeting-hidden', 'true')
              el.setAttribute('aria-hidden', 'true')
            }
          } else {
            el.removeAttribute('data-logistics-b2-meeting-hidden')
            el.removeAttribute('aria-hidden')
          }
        }
      } else {
        el.removeAttribute('data-logistics-b2-meeting-hidden')
        el.removeAttribute('aria-hidden')
      }
    })

    const hoverMeetingIdForAnim =
      !timelineHoverActive && hoverIdx >= 0 && stopsLocal[hoverIdx]
        ? b2MeetingModalHighlightId
        : null
    const hoverMeetingAnimChanged =
      previousB2HoverMeetingIdForTeardropAnimRef.current !== hoverMeetingIdForAnim
    previousB2HoverMeetingIdForTeardropAnimRef.current = hoverMeetingIdForAnim

    if (
      syncInlineMapPinsWithTimeline &&
      !timelineHoverActive &&
      hoverIdx >= 0 &&
      hoverMeetingAnimChanged &&
      stopsLocal[hoverIdx] &&
      !(selectionActiveIdx >= 0 && hoverIdx === selectionActiveIdx)
    ) {
      const poiOrderH = getPoiOrderForStopIndex(stopsLocal, vid, hoverIdx)
      const ocH = useOverlapCompact ? (overlap[hoverIdx] ?? false) : false
      const elH = markerElsRef.current[hoverIdx]
      const teardropH = isMapTeardropPin(
        true,
        stopsLocal[hoverIdx],
        vid,
        poiOrderH,
        ocH,
      )
      if (teardropH && elH) {
        replayMapPinTeardropIntroAnimation(elH)
      }
    }

    const timelineHoverIdForAnim =
      timelineHoverActive && stopsLocal[timelineHoverIdx] ? timelineHoverId : null
    const timelineHoverAnimChanged =
      previousTimelineHoverStopIdForTeardropAnimRef.current !== timelineHoverIdForAnim

    if (
      syncInlineMapPinsWithTimeline &&
      hoverTeardropAnimPrimedRef.current &&
      timelineHoverIdx >= 0 &&
      timelineHoverAnimChanged &&
      stopsLocal[timelineHoverIdx] &&
      !(selectionActiveIdx >= 0 && timelineHoverIdx === selectionActiveIdx)
    ) {
      const poiOrderT = getPoiOrderForStopIndex(stopsLocal, vid, timelineHoverIdx)
      const elT = markerElsRef.current[timelineHoverIdx]
      const teardropT = isMapTeardropPin(
        true,
        stopsLocal[timelineHoverIdx],
        vid,
        poiOrderT,
        false,
      )
      if (teardropT && elT) {
        replayMapPinTeardropIntroAnimation(elT)
      }
    }

    /** Keep in sync every pass so `animChanged` is not stuck true during unprimed dwell (avoids marker churn / disc flash). */
    previousTimelineHoverStopIdForTeardropAnimRef.current = timelineHoverIdForAnim

    const selChangedForAnim = previousSelectedStopIdForTeardropAnimRef.current !== selId
    if (
      syncInlineMapPinsWithTimeline &&
      showMapPinSelected &&
      selIdx >= 0 &&
      selChangedForAnim &&
      stopsLocal[selIdx]
    ) {
      const poiOrderSel = getPoiOrderForStopIndex(stopsLocal, vid, selIdx)
      const ocSel = useOverlapCompact ? (overlap[selIdx] ?? false) : false
      const activeEl = markerElsRef.current[selIdx]
      const teardropSel = isMapTeardropPin(
        true,
        stopsLocal[selIdx],
        vid,
        poiOrderSel,
        ocSel,
      )
      if (teardropSel && activeEl) {
        replayMapPinTeardropIntroAnimation(activeEl)
      }
    }
    previousSelectedStopIdForTeardropAnimRef.current = selId

    markerInViewAnimCleanupRef.current?.()
    const { cleanup, flushDeferred } = attachMarkerTeardropInViewAnimation(
      markerElsRef,
      () => mapWrapInViewportRef.current,
    )
    deferredPinIntroFlushRef.current = flushDeferred
    markerInViewAnimCleanupRef.current = () => {
      cleanup()
      deferredPinIntroFlushRef.current = null
    }
  }

  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false)
  }, [])

  const dismissMobileModalStopPanel = useCallback(() => {
    setMobileModalStopPanelDismissed(true)
    onDismissMobileMapStopPanel?.()
  }, [onDismissMobileMapStopPanel])

  /** Fade out + slide down the POI card (then clear selection). Imperative `animate` avoids stale control state. */
  const dismissMobileModalStopPanelAnimated = useCallback(async () => {
    const el = mobileModalStopPanelMotionRef.current
    if (!el || dismissingMobileModalStopPanelRef.current) return
    dismissingMobileModalStopPanelRef.current = true
    try {
      await animate(
        el,
        { opacity: 0, y: 56 },
        {
          duration: 0.26,
          ease: [0.4, 0, 0.2, 1],
        },
      )
      dismissMobileModalStopPanel()
    } finally {
      dismissingMobileModalStopPanelRef.current = false
    }
  }, [dismissMobileModalStopPanel])

  /** Same exit motion as `MobileMapModalStopPanel` — targets the B2 meeting wrapper ref. */
  const dismissMobileModalB2MeetingPanelAnimated = useCallback(async () => {
    const el = mobileModalB2MeetingPanelMotionRef.current
    if (!el || dismissingMobileModalB2MeetingPanelRef.current) return
    dismissingMobileModalB2MeetingPanelRef.current = true
    try {
      await animate(
        el,
        { opacity: 0, y: 56 },
        {
          duration: 0.26,
          ease: [0.4, 0, 0.2, 1],
        },
      )
      dismissMobileModalStopPanel()
    } finally {
      dismissingMobileModalB2MeetingPanelRef.current = false
    }
  }, [dismissMobileModalStopPanel])

  const handleMobileB2PendingPickupChange = useCallback(
    (id: string | null) => {
      setMobileB2MeetingPendingId(id)
      onB2MeetingHover?.(id)
    },
    [onB2MeetingHover],
  )

  const handleBeginMobileB2ReselectPicker = useCallback(() => {
    setMobileB2MeetingReselectPicker(true)
    const cid = b2CommittedPickupIdRef.current
    if (cid != null) {
      setMobileB2MeetingPendingId(cid)
      onB2MeetingHover?.(cid)
    }
  }, [onB2MeetingHover])

  const confirmMobileB2MeetingPickup = useCallback(() => {
    if (mobileB2MeetingPendingId == null) return
    onB2PickupChange?.(mobileB2MeetingPendingId)
    setMobileB2MeetingReselectPicker(false)
    setMobileB2MeetingPendingId(null)
    onB2MeetingHover?.(null)
  }, [mobileB2MeetingPendingId, onB2PickupChange, onB2MeetingHover])

  const closePoiDescriptionSheet = useCallback(() => {
    setPoiDescriptionSheet(null)
  }, [])

  useEffect(() => {
    const mq = globalThis.matchMedia(`(max-width: ${MOBILE_COOPERATIVE_MAX_WIDTH_PX}px)`)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isMobile && mobileSheetOpen) setMobileSheetOpen(false)
  }, [isMobile, mobileSheetOpen])

  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (poiDescriptionSheet) {
        setPoiDescriptionSheet(null)
      } else {
        closeMobileSheet()
      }
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [isMobile, mobileSheetOpen, poiDescriptionSheet, closeMobileSheet])

  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobile, mobileSheetOpen])

  useEffect(() => {
    if (!mobileSheetOpen) setPoiDescriptionSheet(null)
  }, [mobileSheetOpen])

  useEffect(() => {
    if (!mobileSheetOpen) {
      setMobileModalB2MeetingPanelOpen(false)
      setMobileB2MeetingPendingId(null)
      setMobileB2MeetingReselectPicker(false)
      setMobileModalStopPanelDismissed(false)
      onB2MeetingHover?.(null)
    }
  }, [mobileSheetOpen, onB2MeetingHover])

  /**
   * MW B2 meeting modal: default pending — first meeting when nothing committed; committed id when
   * re-select picker is open and pending was cleared.
   */
  useEffect(() => {
    if (!mobileSheetOpen || !showB2MeetingModalPanel) return
    if (variantId !== 'b2' || !isVariantB2TripleMeeting(variantId, stops)) return
    if (mobileB2MeetingPendingId != null) return
    if (mobileB2MeetingReselectPicker && b2CommittedPickupId != null) {
      setMobileB2MeetingPendingId(b2CommittedPickupId)
      onB2MeetingHover?.(b2CommittedPickupId)
      return
    }
    if (b2CommittedPickupId != null) return
    const first = stops[0]
    if (first?.kind !== 'meeting') return
    setMobileB2MeetingPendingId(first.id)
    onB2MeetingHover?.(first.id)
  }, [
    mobileSheetOpen,
    showB2MeetingModalPanel,
    variantId,
    stops,
    b2CommittedPickupId,
    mobileB2MeetingPendingId,
    mobileB2MeetingReselectPicker,
    onB2MeetingHover,
  ])

  const lastB2ModalOpenSignalHandledRef = useRef(0)
  useEffect(() => {
    if (!b2OpenMeetingModalSignal) {
      lastB2ModalOpenSignalHandledRef.current = 0
      return
    }
    if (b2OpenMeetingModalSignal <= lastB2ModalOpenSignalHandledRef.current) return
    if (!isMobile) return
    if (!isVariantB2TripleMeeting(variantId, stops)) {
      lastB2ModalOpenSignalHandledRef.current = b2OpenMeetingModalSignal
      return
    }
    if (onB2PickupChange == null) {
      lastB2ModalOpenSignalHandledRef.current = b2OpenMeetingModalSignal
      return
    }
    lastB2ModalOpenSignalHandledRef.current = b2OpenMeetingModalSignal
    const firstMeeting = stops[0]
    setMobileModalStopPanelDismissed(false)
    setMobileSheetOpen(true)
    setMobileModalB2MeetingPanelOpen(true)
    const committed = b2CommittedPickupIdRef.current
    if (committed != null) {
      setMobileB2MeetingReselectPicker(true)
      setMobileB2MeetingPendingId(committed)
      onB2MeetingHover?.(committed)
    } else {
      setMobileB2MeetingReselectPicker(false)
      setMobileB2MeetingPendingId(firstMeeting?.id ?? null)
      onB2MeetingHover?.(firstMeeting?.id ?? null)
    }
  }, [
    b2OpenMeetingModalSignal,
    isMobile,
    variantId,
    stops,
    onB2PickupChange,
    onB2MeetingHover,
  ])

  /** Full-screen map sheet uses the bottom React panel for POI copy — never stack a MapLibre popup on top. */
  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return
    poiPopupRef.current?.remove()
    poiPopupRef.current = null
  }, [isMobile, mobileSheetOpen])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return
    const root = map.getContainer()
    const onReadMore = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.('.poi-popup-read-more')
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      const id = el.getAttribute('data-stop-id')
      if (!id) return
      const stop = stopsRef.current.find((s) => s.id === id)
      if (stop) setPoiDescriptionSheet(stop)
    }
    root.addEventListener('click', onReadMore, true)
    return () => root.removeEventListener('click', onReadMore, true)
  }, [mapReady])

  useEffect(() => {
    routeCoordsRef.current = routeLngLat
  }, [routeLngLat])

  useEffect(() => {
    if (!mapReady) return
    syncMarkersAppearanceRef.current()
  }, [
    mapReady,
    selectedStopId,
    highlightSelectedPin,
    lastSelectSource,
    b2HoverMeetingId,
    b2CommittedPickupId,
    isMobile,
    mobileSheetOpen,
    variantId,
    timelineHoverStopId,
    expandedStopId,
    mobileModalStopPanelDismissed,
    mobileModalB2MeetingPanelOpen,
    showB2MeetingModalPanel,
    mobileB2MeetingPendingId,
    mobileB2MeetingReselectPicker,
  ])

  useEffect(() => {
    hoverTeardropAnimPrimedRef.current = false
  }, [variantId])

  /** First list-hover session: wait `HOVER_TEARDROP_FIRST_ANIM_DWELL_MS` before priming instant hover replays. */
  useEffect(() => {
    if (hoverTeardropDwellTimerRef.current) {
      clearTimeout(hoverTeardropDwellTimerRef.current)
      hoverTeardropDwellTimerRef.current = null
    }
    /** Leaving the row clears the dwell timer; next hover starts the 2s window again (until primed). */
    if (timelineHoverStopId == null || timelineHoverStopId === '') {
      return
    }
    if (hoverTeardropAnimPrimedRef.current) {
      return
    }
    const id = timelineHoverStopId
    hoverTeardropDwellTimerRef.current = setTimeout(() => {
      hoverTeardropDwellTimerRef.current = null
      if (timelineHoverStopIdRef.current !== id) return
      hoverTeardropAnimPrimedRef.current = true
      /** Force one `animChanged` so the first intro replay runs after dwell (steady hover tracks id above). */
      previousTimelineHoverStopIdForTeardropAnimRef.current = null
      syncMarkersAppearanceRef.current()
    }, HOVER_TEARDROP_FIRST_ANIM_DWELL_MS)
    return () => {
      if (hoverTeardropDwellTimerRef.current) {
        clearTimeout(hoverTeardropDwellTimerRef.current)
        hoverTeardropDwellTimerRef.current = null
      }
    }
  }, [timelineHoverStopId])

  /** When the embedded map block intersects the viewport (any amount), allow deferred pin teardrop intros. */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !mapReady) return

    const applyEntries = (entries: IntersectionObserverEntry[]) => {
      let ok = false
      for (const e of entries) {
        if (e.target !== wrap) continue
        ok = e.isIntersecting && e.intersectionRatio > 0
      }
      mapWrapInViewportRef.current = ok
      if (ok) deferredPinIntroFlushRef.current?.()
    }

    const io = new IntersectionObserver(applyEntries, {
      root: null,
      threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
    })
    io.observe(wrap)
    const pending = io.takeRecords()
    if (pending.length) applyEntries(pending)

    return () => {
      io.disconnect()
    }
  }, [mapReady])

  useEffect(() => {
    stopsRef.current = stops
    onSelectRef.current = onSelectStop
  }, [stops, onSelectStop])

  useEffect(() => {
    if (!mapReady) {
      previousSelectionForCameraRef.current = undefined
      prevHighlightForCameraRef.current = false
    }
  }, [mapReady])

  useEffect(() => {
    const el = containerRef.current
    if (!el || routeLngLat.length === 0) return

    let cancelled = false
    /** Marker overlap → compact mode; cleaned up with the map. */
    let onMarkerOverlapSync: (() => void) | undefined
    /** Throttled overlap refresh — `move` fires every frame during zoom/pan animations (unlike `zoomend`/`moveend`). */
    let onMoveForOverlap: (() => void) | undefined
    let overlapRaf = 0

    const map = new maplibregl.Map({
      container: el,
      style: LIGHT_BASEMAP_STYLE,
      center: routeLngLat[0],
      zoom: 13,
      attributionControl: false,
      dragPan: true,
      scrollZoom: false,
      doubleClickZoom: true,
      touchZoomRotate: true,
      boxZoom: true,
      dragRotate: false,
      keyboard: true,
      cooperativeGestures: false,
    })

    const initialMobile =
      typeof globalThis !== 'undefined' &&
      globalThis.matchMedia(`(max-width: ${MOBILE_COOPERATIVE_MAX_WIDTH_PX}px)`).matches
    syncMapInteractions(map, initialMobile ? 'mobile-preview' : 'desktop')

    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: 'MapLibre' }),
      'bottom-right',
    )

    mapRef.current = map
    trackRecentreHintRef.current = false

    const bumpIgnoreMoveEnd = (ms: number) => {
      ignoreMoveEndForRecentreUntilRef.current = Math.max(
        ignoreMoveEndForRecentreUntilRef.current,
        Date.now() + ms,
      )
    }

    /** Same guards as moveend — show Re-centre as soon as the user pans/zooms, not only after gesture ends. */
    const revealRecentreIfAllowed = () => {
      if (cancelled || !trackRecentreHintRef.current) return
      if (Date.now() < ignoreMoveEndForRecentreUntilRef.current) return
      /** Programmatic `fitRouteOverview` / overview fits — don’t treat as “user moved map”. */
      if (programmaticOverviewCameraDepthRef.current > 0) return
      setShowRecentre(true)
    }
    map.on('moveend', revealRecentreIfAllowed)
    map.on('dragstart', revealRecentreIfAllowed)
    map.on('zoomstart', revealRecentreIfAllowed)

    /**
     * True user zoom (wheel, pinch, double-click, trackpad) — not our `fitRouteOverview` camera.
     * `fitRouteOverview` bumps `programmaticOverviewCameraDepthRef` until `idle` so we don’t clear overview during route fits.
     */
    const clearOverviewModeOnUserZoom = (e: maplibregl.MapLibreEvent) => {
      if (cancelled) return
      if (programmaticOverviewCameraDepthRef.current > 0) return
      if (e.originalEvent) overviewModeRef.current = false
    }
    map.on('zoomend', clearOverviewModeOnUserZoom)

    const resize = () => {
      map.resize()
    }

    let attributionCollapseTimer: ReturnType<typeof setTimeout> | undefined
    let attributionFadeFallbackTimer: ReturnType<typeof setTimeout> | undefined

    /** Only update GL canvas size — do not refit bounds here (was undoing user zoom). */
    const ro = new ResizeObserver(() => {
      resize()
    })
    if (wrapRef.current) ro.observe(wrapRef.current)

    /** Update canvas size only — do not `fitBounds` here; window `resize` was fighting user zoom. */
    const onWindowResizeOrOrientation = () => {
      resize()
    }
    window.addEventListener('resize', onWindowResizeOrOrientation)
    window.addEventListener('orientationchange', onWindowResizeOrOrientation)

    requestAnimationFrame(() => {
      resize()
      requestAnimationFrame(resize)
    })

    const onLoad = () => {
      if (cancelled) return
      const safeKey = mapKey.replace(/[^a-zA-Z0-9_-]/g, '')
      const idRoute = `route-${safeKey}`
      const idLine = `route-line-${safeKey}`

      const baseLineCoords = routePolylineLngLat ?? routeLngLat
      const curvedCoords =
        baseLineCoords.length >= 2 ? buildCurvedRouteLngLat(baseLineCoords) : []
      const lineVisible =
        showItineraryPolyline !== false && curvedCoords.length >= 2

      map.addSource(idRoute, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: curvedCoords.length >= 2 ? curvedCoords : [],
          },
        },
      })

      map.addLayer({
        id: idLine,
        type: 'line',
        source: idRoute,
        layout: {
          visibility: lineVisible ? 'visible' : 'none',
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#b5b5b5',
          /** Dash lengths are in line-width multiples — short dash + tight gap = dense grey dots. */
          'line-width': 2.5,
          'line-opacity': 0.95,
          /** Round caps + very short dashes read as many small dots along the path */
          'line-dasharray': [0.45, 1.15],
        },
      })

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerElsRef.current = []

      routeLngLat.forEach((coord, i) => {
        const markerEl = document.createElement('button')
        markerEl.type = 'button'
        markerEl.style.touchAction = 'manipulation'
        const stopAtI = stopsRef.current[i]
        const poiOrder = getPoiOrderForStopIndex(stopsRef.current, variantId, i)
        markerEl.className = mapMarkerWrapperClass(
          stopAtI,
          variantId,
          false,
          poiOrder,
          false,
          true,
        )
        const b2c = b2CommittedPickupIdRef.current
        const initialB2DiscChk =
          variantId === 'b2' &&
          stopAtI?.kind === 'meeting' &&
          b2c != null &&
          stopAtI.id === b2c
        markerEl.innerHTML = markerSvgForStop(stopAtI, variantId, poiOrder, false, b2c)
        markerEl.setAttribute(
          'data-marker-html-key',
          `pl:${variantId}:${stopAtI?.id ?? ''}:${poiOrder ?? ''}:f${initialB2DiscChk ? ':b2chk' : ''}`,
        )
        markerEl.dataset.mapPinActive = '0'
        markerEl.style.zIndex = MAP_MARKER_Z_INACTIVE
        const stopTitle = stopsRef.current[i]?.title
        markerEl.setAttribute(
          'aria-label',
          stopTitle ? `${stopTitle} — show on map` : `Itinerary stop ${i + 1} on map`,
        )

        const stop = stopsRef.current[i]
        if (stop) {
          markerEl.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const { isMobile: mobile, sheetOpen } = interactionRef.current

            // Mobile inline map: pins only open the sheet (same as tapping the basemap) — no zoom / no selection.
            if (mobile && !sheetOpen) {
              setMobileSheetOpen(true)
              return
            }

            /** B2: triple meeting — full-screen modal shows the same picker as the timeline; inline preview map still no-op. */
            const currentStop = stopsRef.current[i]
            if (
              variantIdRef.current === 'b2' &&
              i < 3 &&
              currentStop?.kind === 'meeting'
            ) {
              const tripleMeeting =
                stopsRef.current.length >= 3 &&
                stopsRef.current[0]?.kind === 'meeting' &&
                stopsRef.current[1]?.kind === 'meeting' &&
                stopsRef.current[2]?.kind === 'meeting'
              if (mobile && sheetOpen && tripleMeeting) {
                const committedId = b2CommittedPickupIdRef.current
                const reselectPickerActive = mobileB2MeetingReselectPickerRef.current
                /**
                 * Committed pin alone → bottom POI detail card only. During “change meeting”, same pin
                 * keeps `MobileMapModalB2MeetingPanel` (list / Meet at copy) instead of the generic stop panel.
                 */
                if (
                  committedId == null ||
                  stop.id !== committedId ||
                  reselectPickerActive
                ) {
                  setMobileModalStopPanelDismissedRef.current(false)
                  setMobileModalB2MeetingPanelOpenRef.current(true)
                  setMobileB2MeetingReselectPickerRef.current(committedId != null)
                  setMobileB2MeetingPendingIdRef.current(stop.id)
                  onB2MeetingHoverRef.current?.(stop.id)
                  poiPopupRef.current?.remove()
                  poiPopupRef.current = null
                  return
                }
              } else {
                return
              }
            }

            // Mobile sheet: teardrop + bottom detail panel (no floating popup — avoids duplicate with overlay).
            if (mobile && sheetOpen) {
              setMobileModalStopPanelDismissedRef.current(false)
              setMobileModalB2MeetingPanelOpenRef.current(false)
              setMobileB2MeetingPendingIdRef.current(null)
              onB2MeetingHoverRef.current?.(null)
              onSelectRef.current(stop.id, 'mapModal')
              selectedStopIdRef.current = stop.id
              lastSelectSourceRef.current = 'mapModal'
              highlightSelectedPinRef.current = true
              syncMarkersAppearanceRef.current()
              overviewModeRef.current = false
              setShowRecentre(true)
              ignoreMoveEndForRecentreUntilRef.current = Math.max(
                ignoreMoveEndForRecentreUntilRef.current,
                Date.now() + 150,
              )
              poiPopupRef.current?.remove()
              poiPopupRef.current = null
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  runMobileModalPoiFocus(map, coord, routeCoordsRef.current, i, POI_FOCUS_DURATION_MS)
                })
              })
              return
            }

            onSelectRef.current(stop.id, 'map')
            if (poiPopupContentRef.current === 'image-only') {
              poiPopupRef.current?.remove()
              poiPopupRef.current = null
            } else {
              openPoiPopup(map, coord, stop, poiPopupRef, {
                isMobile: false,
                content: poiPopupContentRef.current,
              })
            }
          })
        }

        const marker = new maplibregl.Marker({
          element: markerEl,
          /** Align HTML overlay with GL line layer (avoids integer rounding vs vector path). */
          subpixelPositioning: true,
        })
          .setLngLat(coord)
          .addTo(map)
        markersRef.current.push(marker)
        markerElsRef.current.push(markerEl)
      })

      onMarkerOverlapSync = () => {
        if (cancelled) return
        syncMarkersAppearanceRef.current()
      }
      onMoveForOverlap = () => {
        if (cancelled) return
        if (overlapRaf) cancelAnimationFrame(overlapRaf)
        overlapRaf = requestAnimationFrame(() => {
          overlapRaf = 0
          syncMarkersAppearanceRef.current()
        })
      }
      map.on('moveend', onMarkerOverlapSync)
      map.on('zoomend', onMarkerOverlapSync)
      map.on('move', onMoveForOverlap)
      requestAnimationFrame(() => {
        if (!cancelled) syncMarkersAppearanceRef.current()
      })

      overviewModeRef.current = true

      const applyOverview = () => {
        if (cancelled) return
        /** Fast stabilizing passes while layout settles; animated fit happens on `idle` below. */
        fitRouteOverview(
          map,
          routeLngLat,
          {
            duration: 0,
            isMobile: initialMobile,
            mobileInlinePreview: initialMobile,
          },
          programmaticOverviewCameraDepthRef,
        )
      }
      applyOverview()
      requestAnimationFrame(() => {
        applyOverview()
        requestAnimationFrame(applyOverview)
      })
      map.once('idle', () => {
        if (cancelled) return
        bumpIgnoreMoveEnd(80)
        fitRouteOverview(
          map,
          routeLngLat,
          {
            duration: initialMobile ? OVERVIEW_ZOOM_ANIM_MS_MOBILE : OVERVIEW_ZOOM_ANIM_MS_DESKTOP,
            isMobile: initialMobile,
            mobileInlinePreview: initialMobile,
          },
          programmaticOverviewCameraDepthRef,
        )
        syncMarkersAppearanceRef.current()
        map.once('idle', () => {
          if (cancelled) return
          trackRecentreHintRef.current = true
          syncMarkersAppearanceRef.current()
        })
      })

      if (!cancelled) setMapReady(true)

      attributionCollapseTimer = window.setTimeout(() => {
        if (cancelled) return
        const root = map.getContainer()
        const details = root.querySelector<HTMLDetailsElement>(
          'details.maplibregl-ctrl-attrib',
        )
        if (!details?.hasAttribute('open')) return

        const fadeTarget =
          details.querySelector<HTMLElement>('.maplibregl-ctrl-attrib-inner') ??
          details

        let finished = false
        const finishCollapse = () => {
          if (cancelled || finished) return
          finished = true
          window.clearTimeout(attributionFadeFallbackTimer)
          fadeTarget.removeEventListener('transitionend', onFadeEnd)
          root.querySelector<HTMLElement>('.maplibregl-ctrl-attrib-button')?.click()
          fadeTarget.style.transition = ''
          fadeTarget.style.opacity = ''
        }

        const onFadeEnd = (e: TransitionEvent) => {
          if (e.propertyName !== 'opacity') return
          finishCollapse()
        }

        fadeTarget.style.transition = `opacity ${ATTRIBUTION_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
        fadeTarget.style.opacity = '0'
        fadeTarget.addEventListener('transitionend', onFadeEnd)
        attributionFadeFallbackTimer = window.setTimeout(finishCollapse, ATTRIBUTION_FADE_MS + 100)
      }, ATTRIBUTION_AUTO_COLLAPSE_MS)
    }

    map.on('load', onLoad)

    return () => {
      cancelled = true
      window.clearTimeout(attributionCollapseTimer)
      window.clearTimeout(attributionFadeFallbackTimer)
      overviewModeRef.current = true
      trackRecentreHintRef.current = false
      map.off('moveend', revealRecentreIfAllowed)
      map.off('dragstart', revealRecentreIfAllowed)
      map.off('zoomstart', revealRecentreIfAllowed)
      map.off('zoomend', clearOverviewModeOnUserZoom)
      if (onMarkerOverlapSync) {
        map.off('moveend', onMarkerOverlapSync)
        map.off('zoomend', onMarkerOverlapSync)
      }
      if (onMoveForOverlap) map.off('move', onMoveForOverlap)
      cancelAnimationFrame(overlapRaf)
      map.off('load', onLoad)
      ro.disconnect()
      window.removeEventListener('resize', onWindowResizeOrOrientation)
      window.removeEventListener('orientationchange', onWindowResizeOrOrientation)
      poiPopupRef.current?.remove()
      poiPopupRef.current = null
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerElsRef.current = []
      markerInViewAnimCleanupRef.current?.()
      markerInViewAnimCleanupRef.current = null
      previousSelectedStopIdForTeardropAnimRef.current = undefined
      previousB2HoverMeetingIdForTeardropAnimRef.current = null
      map.remove()
      mapRef.current = null
      setMapReady(false)
      setShowRecentre(false)
    }
  /**
   * Do not depend on `showItineraryPolyline` on this effect — visibility + GeoJSON are updated in the
   * following effect so toggling the dashed line does not `map.remove()` (flash).
   */
  }, [mapKey, routeLngLat, routePolylineLngLat, variantId])

  /** Dashed itinerary GeoJSON (B2 prepends chosen meeting → POI 1 when a pickup is committed). */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const safeKey = mapKey.replace(/[^a-zA-Z0-9_-]/g, '')
    const idLine = `route-line-${safeKey}`
    if (!map.getLayer(idLine)) return
    const baseCoords = dashedItineraryLineCoords(
      variantId,
      routeLngLat,
      routePolylineLngLat,
      stops,
      b2CommittedPickupId,
    )
    const curved =
      baseCoords.length >= 2 ? buildCurvedRouteLngLat(baseCoords) : []
    const visible = showItineraryPolyline !== false && curved.length >= 2
    map.setLayoutProperty(idLine, 'visibility', visible ? 'visible' : 'none')
    const idRoute = `route-${safeKey}`
    const src = map.getSource(idRoute) as maplibregl.GeoJSONSource | undefined
    if (src && curved.length >= 2) {
      src.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: curved,
        },
      })
    }
  }, [
    mapReady,
    mapKey,
    routeLngLat,
    routePolylineLngLat,
    showItineraryPolyline,
    variantId,
    stops,
    b2CommittedPickupId,
  ])

  useLayoutEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const wasSheetOpen = prevMobileSheetOpenRef.current
    const closingMobileSheet = isMobile && wasSheetOpen && !mobileSheetOpen
    const openingMobileSheet = isMobile && !wasSheetOpen && mobileSheetOpen

    const preview = previewMapHostRef.current
    const sheetHost = sheetMapHostRef.current
    const container = map.getContainer()

    if (!isMobile) {
      if (preview && container.parentElement !== preview) {
        preview.appendChild(container)
      }
      syncMapInteractions(map, 'desktop')
      map.resize()
      prevMobileSheetOpenRef.current = mobileSheetOpen
      return
    }

    if (mobileSheetOpen) {
      if (!sheetHost) {
        prevMobileSheetOpenRef.current = mobileSheetOpen
        return
      }
      if (container.parentElement !== sheetHost) {
        sheetHost.appendChild(container)
      }
      syncMapInteractions(map, 'mobile-sheet')
      map.resize()
      if (openingMobileSheet) {
        overviewModeRef.current = true
        setShowRecentre(false)
        /** Long enough to cover `fitRouteOverview` (~480ms) + resize idle so landing doesn’t flash Re-centre. */
        ignoreMoveEndForRecentreUntilRef.current = Math.max(
          ignoreMoveEndForRecentreUntilRef.current,
          Date.now() + OVERVIEW_ZOOM_ANIM_MS_MOBILE + 550,
        )
        const ovCoords = routeCoordsForVariantOverview(
          variantIdRef.current,
          routeCoordsRef.current,
          stopsRef.current,
          b2CommittedPickupIdRef.current,
        )
        fitRouteOverview(
          map,
          ovCoords,
          {
            duration: OVERVIEW_ZOOM_ANIM_MS_MOBILE,
            isMobile: true,
            mobileInlinePreview: false,
          },
          programmaticOverviewCameraDepthRef,
        )
      }
      prevMobileSheetOpenRef.current = mobileSheetOpen
      return
    }

    poiPopupRef.current?.remove()
    poiPopupRef.current = null
    if (preview && container.parentElement !== preview) {
      preview.appendChild(container)
    }
    syncMapInteractions(map, 'mobile-preview')
    map.resize()

    if (closingMobileSheet) {
      map.stop()
      overviewModeRef.current = true
      setShowRecentre(false)
      ignoreMoveEndForRecentreUntilRef.current = Math.max(
        ignoreMoveEndForRecentreUntilRef.current,
        Date.now() + 150,
      )
      const ovCoords = routeCoordsForVariantOverview(
        variantIdRef.current,
        routeCoordsRef.current,
        stopsRef.current,
        b2CommittedPickupIdRef.current,
      )
      fitRouteOverview(
        map,
        ovCoords,
        {
          duration: OVERVIEW_ZOOM_ANIM_MS_MOBILE,
          isMobile: true,
          mobileInlinePreview: true,
        },
        programmaticOverviewCameraDepthRef,
      )
    }

    prevMobileSheetOpenRef.current = mobileSheetOpen
  }, [isMobile, mobileSheetOpen, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !isMobile || mobileSheetOpen) return
    const onMapClick = () => setMobileSheetOpen(true)
    map.on('click', onMapClick)
    return () => {
      map.off('click', onMapClick)
    }
  }, [mapReady, isMobile, mobileSheetOpen])

  /**
   * Same framing as the visible “Re-centre” control (`routeCoordsForVariantOverview` + 800ms overview).
   * Optional `syncParent: 'after'` defers `onRecentre` until after `fitRouteOverview` starts (rare debugging).
   */
  const runRecentreLikeButton = useCallback(
    (fitIsMobile: boolean, opts?: { syncParent?: 'before' | 'after' }) => {
      const syncParent = opts?.syncParent ?? 'before'
      poiPopupRef.current?.remove()
      poiPopupRef.current = null
      setPoiDescriptionSheet(null)
      const applyFit = () => {
        const m = mapRef.current
        if (!m) return
        m.stop()
        overviewModeRef.current = true
        setShowRecentre(false)
        ignoreMoveEndForRecentreUntilRef.current = Math.max(
          ignoreMoveEndForRecentreUntilRef.current,
          Date.now() + 950,
        )
        const ovCoords = routeCoordsForVariantOverview(
          variantId,
          routeLngLat,
          stops,
          b2CommittedPickupId,
        )
        fitRouteOverview(
          m,
          ovCoords,
          {
            duration: 800,
            isMobile: fitIsMobile,
            mobileInlinePreview: fitIsMobile && !mobileSheetOpenRef.current,
          },
          programmaticOverviewCameraDepthRef,
        )
      }
      if (syncParent === 'before') {
        onRecentre?.()
        applyFit()
      } else {
        applyFit()
        onRecentre?.()
      }
    },
    [onRecentre, variantId, routeLngLat, stops, b2CommittedPickupId],
  )

  /**
   * MW map modal: after confirming a meeting then tapping “Select a different meeting point”, zoom back
   * out so all meeting pins + route are in view (`routeCoordsForVariantOverview` with no committed id).
   */
  useEffect(() => {
    const prev = prevB2CommittedPickupIdForModalCameraRef.current
    prevB2CommittedPickupIdForModalCameraRef.current = b2CommittedPickupId
    if (prev === undefined) return

    const map = mapRef.current
    if (!mapReady || !map) return
    if (!isMobile || !mobileSheetOpen || !showB2MeetingModalPanel) return
    if (variantId !== 'b2' || !isVariantB2TripleMeeting(variantId, stops)) return
    if (prev == null || b2CommittedPickupId != null) return

    map.stop()
    overviewModeRef.current = true
    setShowRecentre(false)
    ignoreMoveEndForRecentreUntilRef.current = Math.max(
      ignoreMoveEndForRecentreUntilRef.current,
      Date.now() + 950,
    )
    const ovCoords = routeCoordsForVariantOverview(
      variantId,
      routeLngLat,
      stops,
      null,
    )
    fitRouteOverview(
      map,
      ovCoords,
      {
        duration: 800,
        isMobile: true,
        mobileInlinePreview: false,
      },
      programmaticOverviewCameraDepthRef,
    )
  }, [
    b2CommittedPickupId,
    mapReady,
    isMobile,
    mobileSheetOpen,
    showB2MeetingModalPanel,
    variantId,
    stops,
    routeLngLat,
  ])

  /**
   * MW map modal: “Select a different meeting point” (timeline or sheet) turns on reselect **without**
   * clearing `b2CommittedPickupId` — fit full-route overview so every meeting pin is in frame.
   */
  useEffect(() => {
    const prev = prevB2ReselectPickerForModalCameraRef.current
    if (prev !== undefined) {
      const becameReselectPicker =
        mobileB2MeetingReselectPicker &&
        !prev &&
        b2CommittedPickupId != null &&
        isMobile &&
        mobileSheetOpen &&
        showB2MeetingModalPanel
      if (
        becameReselectPicker &&
        mapReady &&
        variantId === 'b2' &&
        isVariantB2TripleMeeting(variantId, stops)
      ) {
        const map = mapRef.current
        if (map) {
          map.stop()
          overviewModeRef.current = true
          setShowRecentre(false)
          ignoreMoveEndForRecentreUntilRef.current = Math.max(
            ignoreMoveEndForRecentreUntilRef.current,
            Date.now() + 950,
          )
          const ovCoords = routeCoordsForVariantOverview(
            variantId,
            routeLngLat,
            stops,
            null,
          )
          fitRouteOverview(
            map,
            ovCoords,
            {
              duration: 800,
              isMobile: true,
              mobileInlinePreview: false,
            },
            programmaticOverviewCameraDepthRef,
          )
        }
      }
    }
    prevB2ReselectPickerForModalCameraRef.current = mobileB2MeetingReselectPicker
  }, [
    mobileB2MeetingReselectPicker,
    b2CommittedPickupId,
    mapReady,
    isMobile,
    mobileSheetOpen,
    showB2MeetingModalPanel,
    variantId,
    stops,
    routeLngLat,
  ])

  /** MW modal: GPS / my-location — fly to device position, or Re-centre itinerary if unavailable. */
  const handleMobileModalGpsClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const map = mapRef.current
      if (!map) return
      overviewModeRef.current = false
      setShowRecentre(true)
      ignoreMoveEndForRecentreUntilRef.current = Math.max(
        ignoreMoveEndForRecentreUntilRef.current,
        Date.now() + 200,
      )
      const geo = globalThis.navigator?.geolocation
      if (geo) {
        geo.getCurrentPosition(
          (pos) => {
            const m = mapRef.current
            if (!m) return
            m.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: Math.max(m.getZoom(), 15),
              duration: 700,
              essential: true,
            })
          },
          () => {
            runRecentreLikeButton(true)
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
        )
      } else {
        runRecentreLikeButton(true)
      }
    },
    [runRecentreLikeButton],
  )

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    /**
     * Must run before the `idx` / `routeLngLat[idx]` guard below. That guard can return early when coords
     * and stops are temporarily misaligned or a vertex is missing — meeting picks would otherwise skip
     * `runRecentreLikeButton` entirely (user sees no re-centre).
     */
    if (lastSelectSource === 'b2MeetingPick') {
      syncMarkersAppearanceRef.current()
      previousSelectionForCameraRef.current = selectedStopId
      try {
        runRecentreLikeButton(isMobile)
      } finally {
        prevHighlightForCameraRef.current = highlightSelectedPin
      }
      return
    }

    const idx = stops.findIndex((s) => s.id === selectedStopId)
    if (idx < 0 || !routeLngLat[idx]) {
      syncMarkersAppearanceRef.current()
      const prevSel = previousSelectionForCameraRef.current
      previousSelectionForCameraRef.current = selectedStopId
      prevHighlightForCameraRef.current = highlightSelectedPin

      // Desktop: clear selection — drop popup and return to the default route overview.
      if (!isMobile && prevSel) {
        map.stop()
        poiPopupRef.current?.remove()
        poiPopupRef.current = null
        overviewModeRef.current = true
        setShowRecentre(false)
        ignoreMoveEndForRecentreUntilRef.current = Math.max(
          ignoreMoveEndForRecentreUntilRef.current,
          Date.now() + 850,
        )
        const ovCoords = routeCoordsForVariantOverview(
          variantId,
          routeLngLat,
          stops,
          b2CommittedPickupId,
        )
        fitRouteOverview(
          map,
          ovCoords,
          {
            duration: OVERVIEW_ZOOM_ANIM_MS_DESKTOP,
            isMobile: false,
          },
          programmaticOverviewCameraDepthRef,
        )
      }
      return
    }

    syncMarkersAppearanceRef.current()

    const previous = previousSelectionForCameraRef.current
    previousSelectionForCameraRef.current = selectedStopId

    const highlightJustEnabled =
      highlightSelectedPin && !prevHighlightForCameraRef.current

    try {
      // Landing: mobile preview keeps overview. Desktop: default-expanded first row keeps overview until user changes list selection.
      if (previous === undefined) {
        if (isMobile) return
        if (
          lastSelectSource === 'list' &&
          landingDefaultExpandedStopId !== '' &&
          selectedStopId === landingDefaultExpandedStopId
        ) {
          return
        }
      } else if (previous === selectedStopId && !highlightJustEnabled) {
        return
      }

      // Locked mobile preview: no programmatic camera moves until the full-screen sheet is open.
      if (isMobile && !mobileSheetOpen) {
        return
      }

      // Itinerary list / accordion (anything but map pins) must not move the camera on mobile.
      if (isMobile && lastSelectSource === 'list') {
        return
      }

      // Mobile sheet: POI zoom/focus runs from the marker handler only (pin tap), not this effect.
      if (isMobile && mobileSheetOpen) {
        return
      }

      // Desktop: zoom to the selected POI when choosing from the timeline or from a map pin.
      if (!isMobile) {
        const selStop = stops[idx]
        /** B2: committed meeting is framed by overview fits — never tight zoom here (avoids zoom-in then overview). */
        if (
          variantId === 'b2' &&
          selStop?.kind === 'meeting' &&
          b2CommittedPickupId != null &&
          selStop.id === b2CommittedPickupId
        ) {
          overviewModeRef.current = true
          setShowRecentre(false)
          return
        }
        const center = routeLngLat[idx]
        overviewModeRef.current = false
        setShowRecentre(true)
        const focusOnStop = () => {
          fitPoiInView(map, center, POI_FOCUS_DURATION_MS)
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(focusOnStop)
        })
      }
    } finally {
      prevHighlightForCameraRef.current = highlightSelectedPin
    }
  }, [
    selectedStopId,
    mapReady,
    stops,
    routeLngLat,
    highlightSelectedPin,
    isMobile,
    mobileSheetOpen,
    lastSelectSource,
    landingDefaultExpandedStopId,
    variantId,
    b2CommittedPickupId,
    runRecentreLikeButton,
  ])

  /** Desktop: opening a stop from the timeline also opens the map popup (with hero image), mirroring pin taps. */
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || isMobile) return
    if (lastSelectSource !== 'list') return

    const idx = stops.findIndex((s) => s.id === selectedStopId)
    if (idx < 0 || !routeLngLat[idx]) {
      previousListSelectionForPopupRef.current = selectedStopId
      return
    }

    const skipLandingDefaultPopup =
      previousListSelectionForPopupRef.current === undefined &&
      landingDefaultExpandedStopId !== '' &&
      selectedStopId === landingDefaultExpandedStopId

    previousListSelectionForPopupRef.current = selectedStopId

    if (skipLandingDefaultPopup) return

    const stop = stops[idx]
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (poiPopupContentRef.current === 'image-only') {
          poiPopupRef.current?.remove()
          poiPopupRef.current = null
        } else {
          openPoiPopup(map, routeLngLat[idx], stop, poiPopupRef, {
            isMobile: false,
            content: poiPopupContentRef.current,
          })
        }
      })
    })
  }, [
    selectedStopId,
    lastSelectSource,
    mapReady,
    isMobile,
    stops,
    routeLngLat,
    landingDefaultExpandedStopId,
    poiPopupContent,
  ])

  const showDesktopChrome = !isMobile

  /** Inline mobile preview: tap opens sheet — use pointer cursor, not grab/pan. */
  const mobilePreviewCursor =
    isMobile && !mobileSheetOpen
      ? '[&_.maplibregl-canvas-container.maplibregl-interactive]:!cursor-pointer [&_.maplibregl-canvas-container.maplibregl-interactive:active]:!cursor-pointer [&_canvas.maplibregl-canvas]:!cursor-pointer'
      : ''

  return (
    <>
      <div
        ref={wrapRef}
        className={`relative h-[300px] w-full overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-50 md:h-[480px] [&_.maplibregl-ctrl-attrib]:text-[10px] [&_.maplibregl-ctrl-attrib]:leading-snug [&_.maplibregl-ctrl-attrib_a]:text-[10px] ${mobilePreviewCursor}`}
      >
        <div ref={previewMapHostRef} className="absolute inset-0 min-h-0">
          <div
            key={mapKey}
            ref={containerRef}
            className="absolute inset-0 h-full w-full min-h-0 [&_.maplibregl-canvas]:outline-none [&_.maplibregl-map]:!h-full [&_.maplibregl-map]:!w-full [&_.maplibregl-canvas-container]:!h-full [&_.maplibregl-canvas-container]:!w-full [&_canvas.maplibregl-canvas]:!h-full [&_canvas.maplibregl-canvas]:!w-full"
            role="application"
            aria-label="Interactive map: synced with itinerary stops"
            tabIndex={0}
          />
        </div>
        {showDesktopChrome && showRecentre ? (
          <div
            className={`pointer-events-none absolute left-1/2 top-2.5 flex -translate-x-1/2 justify-center ${MAP_CHROME_ABOVE_MARKERS_CLASS}`}
          >
            <button
              type="button"
              disabled={!mapReady}
              className="pointer-events-auto rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-[12px] font-medium text-stone-800 shadow-md shadow-stone-900/5 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                runRecentreLikeButton(false)
              }}
              aria-label="Re-centre map on the full itinerary"
            >
              Re-centre
            </button>
          </div>
        ) : null}
        {showDesktopChrome ? (
          <div
            className={`absolute right-2.5 top-2.5 flex flex-col gap-0.5 overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-md backdrop-blur-sm ${MAP_CHROME_ABOVE_MARKERS_CLASS}`}
          >
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-lg font-medium text-stone-700 transition hover:bg-stone-50 active:bg-stone-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                overviewModeRef.current = false
                mapRef.current?.zoomIn({ duration: 200 })
              }}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center border-t border-stone-100 text-lg font-medium text-stone-700 transition hover:bg-stone-50 active:bg-stone-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                overviewModeRef.current = false
                mapRef.current?.zoomOut({ duration: 200 })
              }}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isMobile && mobileSheetOpen ? (
            <motion.div
              key="map-modal-sheet"
              className="fixed inset-0 z-[101] flex min-h-0 flex-col bg-stone-50"
              style={{ height: '100dvh', maxHeight: '100dvh' }}
              role="dialog"
              aria-modal="true"
              aria-label="Full screen map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  closeMobileSheet()
                }}
                className="pointer-events-auto absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[75] flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-800 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100"
                aria-label="Close map"
              >
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="shrink-0"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div ref={sheetMapHostRef} className="absolute inset-0 min-h-0 bg-stone-50" />
              {showRecentre ? (
                <div
                  className={`pointer-events-none absolute left-1/2 top-[max(3rem,env(safe-area-inset-top))] flex -translate-x-1/2 justify-center ${MAP_CHROME_ABOVE_MARKERS_CLASS}`}
                >
                  <button
                    type="button"
                    disabled={!mapReady}
                    className="pointer-events-auto rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-[12px] font-medium text-stone-800 shadow-md shadow-stone-900/5 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      runRecentreLikeButton(true)
                    }}
                    aria-label="Re-centre map on the full itinerary"
                  >
                    Re-centre
                  </button>
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[55] flex flex-col-reverse gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                {showB2MeetingModalPanel ? (
                  <motion.div
                    ref={mobileModalB2MeetingPanelMotionRef}
                    key="b2-meeting-modal-panel"
                    className="pointer-events-auto w-full max-w-full origin-bottom"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="max-h-[min(42vh,320px)] w-full overflow-y-auto overscroll-contain">
                      <MobileMapModalB2MeetingPanel
                        variantId={variantId}
                        stops={stops}
                        meetings={stops.slice(0, 3)}
                        pickupId={b2CommittedPickupId}
                        pendingPickupId={mobileB2MeetingPendingId}
                        reselectPickerOpen={mobileB2MeetingReselectPicker}
                        onPendingPickupChange={handleMobileB2PendingPickupChange}
                        onConfirmPickup={confirmMobileB2MeetingPickup}
                        onBeginReselect={handleBeginMobileB2ReselectPicker}
                        onDismiss={dismissMobileModalB2MeetingPanelAnimated}
                      />
                    </div>
                  </motion.div>
                ) : mobileModalDetailStop ? (
                  <motion.div
                    ref={mobileModalStopPanelMotionRef}
                    key={mobileModalDetailStop.id}
                    className="pointer-events-auto w-full max-w-full origin-bottom"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="max-h-[min(42vh,320px)] w-full overflow-y-auto overscroll-contain">
                      <MobileMapModalStopPanel
                        stop={mobileModalDetailStop}
                        variantId={variantId}
                        stops={stops}
                        onDismiss={dismissMobileModalStopPanelAnimated}
                        b2CommittedPickupId={b2CommittedPickupId}
                      />
                    </div>
                  </motion.div>
                ) : null}
                <div className="flex w-full shrink-0 justify-end">
                  <button
                    type="button"
                    disabled={!mapReady}
                    className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-900 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 ${MAP_CHROME_ABOVE_MARKERS_CLASS}`}
                    onClick={handleMobileModalGpsClick}
                    aria-label="My location"
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0"
                      aria-hidden
                    >
                      <g clipPath={`url(#${mobileModalGpsIconClipId})`}>
                        <path
                          d="M10 15.9466C13.2841 15.9466 15.9464 13.2843 15.9464 10.0001C15.9464 6.71602 13.2841 4.05371 10 4.05371C6.7159 4.05371 4.05359 6.71602 4.05359 10.0001C4.05359 13.2843 6.7159 15.9466 10 15.9466Z"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 10.6608C10.3649 10.6608 10.6607 10.365 10.6607 10.0001C10.6607 9.63517 10.3649 9.33936 10 9.33936C9.63511 9.33936 9.33929 9.63517 9.33929 10.0001C9.33929 10.365 9.63511 10.6608 10 10.6608Z"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 4.0535V1.41064"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 18.5891V15.9463"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.9464 10H18.5893"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M1.41071 10H4.05356"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id={mobileModalGpsIconClipId}>
                          <rect width={20} height={20} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && poiDescriptionSheet ? (
          <>
            <motion.button
              key="poi-desc-scrim"
              type="button"
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[1px]"
              aria-label="Close description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={closePoiDescriptionSheet}
            />
            <motion.div
              key="poi-desc-panel"
              className="fixed inset-x-0 bottom-0 z-[111] flex w-full max-h-[min(85vh,90dvh)] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-200/80"
              role="dialog"
              aria-modal="true"
              aria-labelledby="poi-desc-sheet-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 32,
                stiffness: 380,
                mass: 0.85,
              }}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200/90 px-4 py-3">
                <h2
                  id="poi-desc-sheet-title"
                  className="min-w-0 flex-1 text-base font-medium leading-snug tracking-tight text-stone-900"
                >
                  {poiDescriptionSheet.title}
                </h2>
                <button
                  type="button"
                  onClick={closePoiDescriptionSheet}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 active:bg-stone-200"
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700">
                  {poiDescriptionSheet.description}
                </p>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
