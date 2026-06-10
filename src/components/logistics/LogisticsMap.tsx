import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MutableRefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, LayoutGroup, motion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  isVariantB2TripleMeeting,
  isVariantBLayout,
  isVariantC2OrD2MapLayout,
  isVariantTripleMeetingMapPickup,
  type Stop,
  type VariantId,
} from '../../data/variants'
import {
  MW_SHELF_CARD_LAYOUT_EVENT,
  MW_SHELF_DESC_EASE,
  MW_SHELF_DESC_TRANSITION_MS,
  mwShelfLayoutTransition,
  TimelineStopDescription,
  OpenInGoogleMapsLink,
  type SelectSource,
} from './Timeline'
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
  mapD2MeetingDiscCommittedCheckBadgeHtml,
  mapSelectedTeardropMarkerHtml,
  itineraryStopUsesTeardropWhenSelected,
} from './logisticsTeardropMarkup'

type MobileMapB2MeetingHubShelfProps = Pick<
  ComponentProps<typeof MobileMapModalB2MeetingPanel>,
  | 'variantId'
  | 'stops'
  | 'meetings'
  | 'pickupId'
  | 'pendingPickupId'
  | 'reselectPickerOpen'
  | 'onPendingPickupChange'
  | 'onConfirmPickup'
  | 'onBeginReselect'
  | 'onDismiss'
>

/** MW map modal stop shelf: `ResizeObserver` writes this on the scroll track. Card width is `track − 32px` with `gap-[8px]` so each edge shows 8px of the neighbor card after the 8px gap (with `−16px`, `(track−card)/2` equaled the gap and the “peek” was empty gutter). */
const MW_MAP_SHELF_TRACK_PX_VAR = '--mw-map-shelf-track-px'

/** MW shelf card shell — track height matches the centered slide; cards bottom-align in the row (`self-end`). */
const MW_MAP_SHELF_CARD_CLASS =
  'flex w-[calc(var(--mw-map-shelf-track-px,100dvw)-32px)] shrink-0 snap-always snap-center self-end flex-col overflow-y-visible overscroll-y-contain touch-pan-x rounded-2xl border border-stone-200/90 bg-white/95 px-4 pt-3 pb-0 shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/80 backdrop-blur-md'

/** First MW shelf slide for B2 triple-meeting: list or “Meet at” (`MobileMapModalB2MeetingPanel` embedded). */
const MW_MAP_B2_SHELF_HUB_STOP_ID = '__mw_map_b2_shelf_hub__'
const MW_MAP_B2_SHELF_HUB_STOP: Stop = {
  id: MW_MAP_B2_SHELF_HUB_STOP_ID,
  title: 'Meeting points',
  durationLine: '',
  description: '',
  kind: 'meeting',
}

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

/** POI name label shown on desktop — opacity driven by JS class toggle so transitions always animate. */
function mapPinLabelHtml(title: string): string {
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return `<span data-pin-label-wrap class="pointer-events-none absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 [will-change:opacity] hidden md:block" aria-hidden="true"><span data-pin-label class="block max-w-[110px] truncate rounded-full border border-stone-200 bg-white px-2 py-0.5 text-center text-[14px] font-normal leading-5 tracking-[0.05px] text-black shadow-[0px_2px_4px_0px_rgba(2,44,69,0.25)]" style="font-family:var(--Typeface-Font-Brand,Aeonik)">${escaped}</span></span>`
}

/** White number on POI marker disc (same slot as former pin icon). */
function markerPoiNumberHtml(n: number): string {
  const fs = n >= 10 ? 10 : 12
  return `<span class="pointer-events-none flex h-[18px] min-w-[18px] items-center justify-center font-medium leading-none tracking-normal text-white tabular-nums" style="font-family:var(--font-sans);font-size:${fs}px;line-height:1" aria-hidden="true">${n}</span>`
}

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
  if ((isVariantBLayout(variantId) || isVariantC2OrD2MapLayout(variantId)) && stop?.kind === 'meeting') {
    if (overlapCompact) return MAP_PASSBY_DOT_HTML
    const showB2DiscCheck =
      isVariantTripleMeetingMapPickup(variantId) &&
      b2CommittedPickupId != null &&
      stop.id === b2CommittedPickupId
    if (showB2DiscCheck) {
      const checkBadge =
        variantId === 'd2'
          ? mapD2MeetingDiscCommittedCheckBadgeHtml()
          : mapB2MeetingCommittedCheckBadgeHtml()
      return `<span class="absolute inset-0 flex items-center justify-center overflow-visible">${MAP_MEETING_VIATOR_SVG}${checkBadge}</span>`
    }
    return MAP_MEETING_VIATOR_SVG
  }
  if ((isVariantBLayout(variantId) || isVariantC2OrD2MapLayout(variantId)) && stop?.kind === 'end') {
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
  return (
    (isVariantBLayout(variantId) || isVariantC2OrD2MapLayout(variantId)) &&
    (stop?.kind === 'meeting' || stop?.kind === 'end')
  )
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
  if (
    !isVariantTripleMeetingMapPickup(variantId) ||
    b2CommittedPickupId == null ||
    core.length < 1
  ) {
    return core
  }
  const idx = stops.findIndex((s) => s.id === b2CommittedPickupId)
  if (idx < 0 || idx > 2) return core
  if (stops[idx]?.kind !== 'meeting') return core
  const meetingVertex = routeLngLat[idx]
  if (!meetingVertex) return core
  return [meetingVertex, ...core]
}

function distLngLat(a: [number, number], b: [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

function pushDistinctLngLat(out: [number, number][], p: [number, number]) {
  const prev = out[out.length - 1]
  if (!prev || distLngLat(prev, p) > 1e-10) {
    out.push(p)
  }
}

/** Second-derivative M[i] for natural cubic spline (M[0]=M[n]=0). */
function naturalCubicSecondDerivatives(knots: number[], values: number[]): number[] {
  const n = knots.length - 1
  if (n < 1) return [0]
  if (n === 1) return [0, 0]

  const h: number[] = []
  for (let i = 0; i < n; i++) {
    const hi = knots[i + 1] - knots[i]
    h.push(hi > 1e-14 ? hi : 1e-14)
  }

  const alpha = new Array<number>(n + 1).fill(0)
  for (let i = 1; i < n; i++) {
    alpha[i] =
      (3 / h[i]) * (values[i + 1] - values[i]) -
      (3 / h[i - 1]) * (values[i] - values[i - 1])
  }

  const l = new Array<number>(n + 1).fill(0)
  const mu = new Array<number>(n + 1).fill(0)
  const z = new Array<number>(n + 1).fill(0)

  l[0] = 1
  mu[0] = 0
  z[0] = 0

  for (let i = 1; i < n; i++) {
    l[i] = 2 * (knots[i + 1] - knots[i - 1]) - h[i - 1] * mu[i - 1]
    mu[i] = h[i] / l[i]
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i]
  }

  l[n] = 1
  z[n] = 0
  const M = new Array<number>(n + 1).fill(0)

  for (let j = n - 1; j >= 0; j--) {
    M[j] = z[j] - mu[j] * M[j + 1]
  }

  return M
}

function evalNaturalCubic1D(
  knots: number[],
  values: number[],
  M: number[],
  tq: number,
): number {
  const n = knots.length - 1
  if (tq <= knots[0]) return values[0]
  if (tq >= knots[n]) return values[n]

  let i = 0
  while (i < n - 1 && tq > knots[i + 1]) i++

  const h = knots[i + 1] - knots[i]
  if (h < 1e-14) return values[i]

  const a = (knots[i + 1] - tq) / h
  const b = (tq - knots[i]) / h
  return (
    a * values[i] +
    b * values[i + 1] +
    (((a * a * a - a) * M[i] + (b * b * b - b) * M[i + 1]) * h * h) / 6
  )
}

/**
 * Natural cubic spline on cumulative chord length — passes through every stop;
 * C² at interior knots; zero end curvature (natural boundary).
 */
function buildCurvedRouteLngLat(
  points: [number, number][],
  samplesPerEdge = 22,
): [number, number][] {
  if (points.length < 2) return [...points]

  const knots: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    knots.push(knots[i - 1] + distLngLat(points[i - 1], points[i]))
  }

  const totalLength = knots[knots.length - 1]
  if (totalLength < 1e-14) return [...points]

  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const Mlng = naturalCubicSecondDerivatives(knots, lngs)
  const Mlat = naturalCubicSecondDerivatives(knots, lats)

  const totalSamples = (points.length - 1) * samplesPerEdge
  const out: [number, number][] = []

  for (let s = 0; s <= totalSamples; s++) {
    const tq = (s / totalSamples) * totalLength
    pushDistinctLngLat(out, [
      evalNaturalCubic1D(knots, lngs, Mlng, tq),
      evalNaturalCubic1D(knots, lats, Mlat, tq),
    ])
  }

  if (out.length > 0) {
    out[0] = [points[0][0], points[0][1]]
    const last = points[points.length - 1]
    out[out.length - 1] = [last[0], last[1]]
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

/** B2 desktop meeting pins: fixed hit target (tip at bottom) so hover can swap disc ↔ teardrop without flicker. */
function mapB2MeetingMarkerShellClass(): string {
  return 'relative flex min-h-[150px] w-20 cursor-pointer items-end justify-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-emerald-600'
}

function isB2DesktopMeetingMapPin(
  stop: Stop | undefined,
  variantId: VariantId,
  mapPinHeadSync: boolean,
  isMobileViewport: boolean,
): boolean {
  /** Desktop only — MW modal uses the same compact green discs as the inline PDP map. */
  return (
    variantId === 'b2' &&
    stop?.kind === 'meeting' &&
    mapPinHeadSync &&
    !isMobileViewport
  )
}

/** D2 MW inline preview: meeting discs are decorative — map canvas tap opens the full-screen modal. */
function isD2MobileInlineMeetingPinPassthrough(
  variantId: VariantId,
  stop: Stop | undefined,
  isMobileViewport: boolean,
  mobileSheetOpen: boolean,
): boolean {
  return (
    variantId === 'd2' &&
    isMobileViewport &&
    !mobileSheetOpen &&
    stop?.kind === 'meeting'
  )
}

/** Map-only marker chrome: selected → teardrop stack (photo optional on mobile inline); else disc / compact. */
function mapMarkerWrapperClass(
  stop: Stop | undefined,
  variantId: VariantId,
  active: boolean,
  poiOrder: number | null,
  overlapCompact: boolean,
  mapPinHeadSync: boolean,
  showPhotoThumbnail: boolean,
  isMobileViewport: boolean,
  discHighlighted: boolean = active,
  mobileSheetOpen: boolean = false,
  /** Ring color on discs — can differ from `discHighlighted` (e.g. D2 inline showcase keeps white ring). */
  discRingSelected: boolean = discHighlighted,
): string {
  if (
    isD2MobileInlineMeetingPinPassthrough(
      variantId,
      stop,
      isMobileViewport,
      mobileSheetOpen,
    )
  ) {
    return `${logisticsRailDiscClass(isVariantBMeetingOrEnd(variantId, stop), discRingSelected)} pointer-events-none cursor-default`
  }
  if (isB2DesktopMeetingMapPin(stop, variantId, mapPinHeadSync, isMobileViewport)) {
    return mapB2MeetingMarkerShellClass()
  }
  const teardrop = isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)
  const discSelected = teardrop ? active : discRingSelected
  if (teardrop) {
    const focusRing =
      isVariantBMeetingOrEnd(variantId, stop)
        ? 'focus-visible:ring-emerald-600'
        : 'focus-visible:ring-black'
    /** Literals keep Tailwind class detection; sizes match `logisticsTeardropMarkup` stack constants. */
    const minH = showPhotoThumbnail ? 'min-h-[150px]' : 'min-h-[86px]'
    return `group relative flex ${minH} w-20 cursor-pointer items-center justify-center overflow-visible border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0 ${focusRing}`
  }
  if (overlapCompact) {
    if (isVariantBMeetingOrEnd(variantId, stop)) {
      return logisticsCompactGreenPinButtonClass(discSelected)
    }
    if (stop?.kind === 'passby' || poiOrder != null) {
      return logisticsPassbyPinButtonClass(discSelected)
    }
  }
  if (stop?.kind === 'passby') {
    return logisticsPassbyPinButtonClass(discSelected)
  }
  return logisticsPinButtonClass(isVariantBMeetingOrEnd(variantId, stop), discSelected)
}

/** HTML markers share one layer; selected pin + popup stack above other pins. */
const MAP_MARKER_Z_SELECTED = '50'
/** Itinerary row hover preview — above other selected-style pins when stacked. */
const MAP_MARKER_Z_TIMELINE_HOVER = '55'
/**
 * Inactive pins: earlier itinerary legs stack **above** later legs (stop 0 on top of stop 1 …).
 * Band stays below {@link MAP_MARKER_Z_SELECTED} so selection/hover still wins.
 */
const MAP_MARKER_Z_CHRONO_BASE = 5

function mapMarkerInactiveChronoZIndex(markerIndex: number, stopCount: number): string {
  if (stopCount <= 0) return String(MAP_MARKER_Z_CHRONO_BASE)
  const clampedIdx = Math.min(Math.max(markerIndex, 0), stopCount - 1)
  const z = MAP_MARKER_Z_CHRONO_BASE + (stopCount - 1 - clampedIdx)
  return String(z)
}

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
  mapPinHeadSync: boolean,
  showPhotoThumbnail: boolean,
  isTimelineRowHoverPin = false,
  markerIndex = 0,
  stopCount = 1,
  /** Disc ring / z-index when MW B2 meeting picker keeps teardrop off (`active` false) but one row is highlighted. */
  discHighlighted: boolean = active,
  isMobileViewport = false,
  mobileSheetOpen = false,
  discRingSelected: boolean = discHighlighted,
  /** True only when this pin is the user-selected stop — keeps the label pinned visible (not timeline/hover active). */
  labelSelected = false,
  /** Override label text (e.g. meeting address instead of stop title). */
  labelTitle?: string,
) {
  /** MapLibre adds `maplibregl-marker` (position:absolute;inset 0) and anchor classes. Replacing
   * `className` wholesale removes them and breaks alignment with the GL route line. */
  const maplibreglClasses = [...el.classList].filter((c) => c.startsWith('maplibregl-'))
  const teardrop = isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)

  const wasActive = el.dataset.mapPinActive === '1'
  el.dataset.mapPinActive = discHighlighted ? '1' : '0'

  const b2ShowCommittedCheck =
    isVariantTripleMeetingMapPickup(variantId) &&
    stop?.kind === 'meeting' &&
    teardrop &&
    b2CommittedPickupId != null &&
    stop.id === b2CommittedPickupId

  const showB2MeetingDiscCheck =
    !teardrop &&
    isVariantTripleMeetingMapPickup(variantId) &&
    stop?.kind === 'meeting' &&
    !overlapCompact &&
    b2CommittedPickupId != null &&
    stop.id === b2CommittedPickupId

  /** Avoid replacing identical markup so teardrop CSS animation does not restart on every effect run. */
  const compactTag = overlapCompact ? ':c' : ':f'
  const imgKey = stop?.popupImageSrc ?? ''
  const photoTag = showPhotoThumbnail ? '' : ':noph'
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
      const title = labelTitle ?? stop.title
      const label = title ? mapPinLabelHtml(title) : ''
      el.innerHTML = mapSelectedTeardropMarkerHtml(stop, poiOrder, {
        b2ShowCommittedCheck,
        omitPhotoHead: !showPhotoThumbnail,
        variantId,
      }) + label
    } else {
      const svg = markerSvgForStop(stop, variantId, poiOrder, overlapCompact, b2CommittedPickupId)
      const title = labelTitle ?? stop?.title
      const label = title ? mapPinLabelHtml(title) : ''
      if (isB2DesktopMeetingMapPin(stop, variantId, mapPinHeadSync, isMobileViewport)) {
        el.innerHTML = `<span class="${logisticsPinButtonClass(true, discHighlighted)}">${svg}${label}</span>`
      } else {
        el.innerHTML = `${svg}${label}`
      }
    }
    el.setAttribute('data-marker-html-key', nextHtmlKey)
    // innerHTML was replaced — defer the class toggle so the browser paints
    // opacity-0 first, giving the CSS transition a starting point to animate from.
    if (labelSelected) {
      requestAnimationFrame(() => {
        const lw = el.querySelector<HTMLElement>('[data-pin-label-wrap]')
        if (lw) lw.classList.add('!opacity-100')
      })
    }
  } else {
    if (labelTitle) {
      const labelEl = el.querySelector<HTMLElement>('[data-pin-label]')
      if (labelEl) labelEl.textContent = labelTitle
    }
    // Key unchanged — DOM element persists, transition fires immediately
    const labelWrap = el.querySelector<HTMLElement>('[data-pin-label-wrap]')
    if (labelWrap) labelWrap.classList.toggle('!opacity-100', labelSelected)
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
    mapPinHeadSync,
    showPhotoThumbnail,
    isMobileViewport,
    discHighlighted,
    mobileSheetOpen,
    discRingSelected,
  )
  const d2InlineMeetingDecor = isD2MobileInlineMeetingPinPassthrough(
    variantId,
    stop,
    isMobileViewport,
    mobileSheetOpen,
  )
  if (d2InlineMeetingDecor) {
    el.style.pointerEvents = 'none'
    el.tabIndex = -1
    el.setAttribute('aria-hidden', 'true')
    el.removeAttribute('aria-label')
  } else {
    el.style.pointerEvents = ''
    if (el instanceof HTMLButtonElement) {
      el.tabIndex = 0
    }
    el.removeAttribute('aria-hidden')
    if (stop?.title) {
      el.setAttribute('aria-label', `${stop.title} — show on map`)
    }
  }
  if (teardrop && el.dataset.mapPinHeadCollapsed === '1') {
    cls += ' logistics-map-marker-head-collapsed'
  }
  if (discHighlighted && !wasActive && !teardrop) {
    cls += ' animate-logistics-map-pin-disc-in'
  }
  el.className = [...maplibreglClasses, cls].join(' ')
  el.style.zIndex = discHighlighted
    ? isTimelineRowHoverPin
      ? MAP_MARKER_Z_TIMELINE_HOVER
      : MAP_MARKER_Z_SELECTED
    : mapMarkerInactiveChronoZIndex(markerIndex, stopCount)
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
 * Places the POI focal point at the vertical midpoint between the **top of the map container** and the **top
 * of the bottom overlay card** (stop details or B2 meeting sheet). Achieved with `top: 0` and
 * `bottom = mapHeight - panelOffsetTop` so MapLibre’s padded inner band height equals the clear map strip above the card.
 */
function computeModalBandCenterPadding(
  mapHostEl: HTMLElement,
  panelEl: HTMLElement,
): maplibregl.PaddingOptions | null {
  const mapRect = mapHostEl.getBoundingClientRect()
  const H = mapRect.height
  if (!(H > 0)) return null

  const panelRect = panelEl.getBoundingClientRect()
  let panelTopFromMapTop = panelRect.top - mapRect.top
  if (!Number.isFinite(panelTopFromMapTop)) return null
  panelTopFromMapTop = Math.min(Math.max(0, panelTopFromMapTop), H)
  /** Avoid degenerate fits when the panel hasn’t laid out yet or nearly covers the map. */
  if (panelTopFromMapTop < 56) return null

  const bottom = Math.round(H - panelTopFromMapTop)
  return {
    top: 0,
    bottom,
    left: POI_VIEW_PADDING.left ?? 16,
    right: Math.max(POI_VIEW_PADDING.right ?? 0, 56),
  }
}

/**
 * Full-screen mobile map modal: expand bottom (and slightly right) so `fitBounds` / `easeTo` frame the pin in
 * the visible band above the POI overlay (`min(42vh,320px)` card + GPS row + safe area).
 *
 * Fallback when the overlay can’t be measured (e.g. panel dismissed). Top inset clears the **Re-centre** chip.
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
  /** ~`max(3rem,safe)` row + pill (~36–40px) + gap — extra slack scales slightly with viewport height (notch islands). */
  const topChrome = Math.round(
    Math.max(48, Math.min(56, h * 0.075)) + 36 + 14 + Math.min(24, h * 0.028),
  )
  return {
    ...POI_VIEW_PADDING,
    top: Math.max(POI_VIEW_PADDING.top ?? 0, topChrome),
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

/** Keeps the southern-most pin / teardrop clearly above the measured sheet top (sub-pixel / scroll layouts). */
const MODAL_OVERVIEW_BOTTOM_CUSHION_PX = 24

/**
 * `fitBounds` padding for modal **route overview**: reserves pixels from the measured bottom overlay top edge
 * (+ cushion). Fixes truncated southern meeting pins when the generic blend underestimated overlay height on short viewports.
 */
function computeModalOverviewFitPadding(
  mapHostEl: HTMLElement,
  panelEl: HTMLElement,
): maplibregl.PaddingOptions | null {
  const mapRect = mapHostEl.getBoundingClientRect()
  const H = mapRect.height
  if (!(H > 0)) return null

  const panelRect = panelEl.getBoundingClientRect()
  let panelTopFromMapTop = panelRect.top - mapRect.top
  if (!Number.isFinite(panelTopFromMapTop)) return null
  panelTopFromMapTop = Math.min(Math.max(0, panelTopFromMapTop), H)
  if (panelTopFromMapTop < 40) return null

  const base = OVERVIEW_FIT_PADDING_MOBILE
  const bottom = Math.round(H - panelTopFromMapTop + MODAL_OVERVIEW_BOTTOM_CUSHION_PX)
  return {
    top: base.top ?? 26,
    bottom,
    left: base.left ?? 8,
    right: Math.max(base.right ?? 0, 56),
  }
}

/**
 * Full-screen mobile map modal only (`mobileInlinePreview: false`): extra bottom / right for the POI + GPS stack.
 * Uses **full** heuristic overlay clearance (see {@link mobileModalPoiViewPadding}) — the old ~40% blend left the
 * route hull overlapping the bottom sheet on short viewports. Prefer {@link computeModalOverviewFitPadding} when DOM is available.
 */
function overviewFitPaddingMobileModal(): maplibregl.PaddingOptions {
  const pinPad = mobileModalPoiViewPadding()
  const base = OVERVIEW_FIT_PADDING_MOBILE
  const b0 = base.bottom ?? 22
  const b1 = pinPad.bottom ?? b0
  const bottom = Math.max(b0, b1)
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

/** MW map modal bottom shelf: meetings first (B-layout), then itinerary legs, then end. */
function getMobileMapModalShelfStops(variantId: VariantId, stops: Stop[]): Stop[] {
  if (stops.length === 0) return []
  if (!isVariantBLayout(variantId) && !isVariantC2OrD2MapLayout(variantId)) return stops
  const meetings: Stop[] = []
  const middle: Stop[] = []
  const ends: Stop[] = []
  let i = 0
  while (i < stops.length && stops[i]?.kind === 'meeting') {
    meetings.push(stops[i]!)
    i++
  }
  while (i < stops.length) {
    const s = stops[i]!
    if (s.kind === 'end') ends.push(s)
    else middle.push(s)
    i++
  }
  return [...meetings, ...middle, ...ends]
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

/** One stop card in the MW map modal horizontal shelf (same rail + copy as `Timeline` POI row). */
function MobileMapModalStopPanelCard({
  stop,
  variantId,
  stops,
  onDismiss,
  b2CommittedPickupId,
  b2MeetingHubProps,
  shelfCardIsSelected,
}: {
  stop: Stop
  variantId: VariantId
  stops: Stop[]
  onDismiss?: () => void
  /** B2 triple-meeting: meeting cards follow committed pickup copy. */
  b2CommittedPickupId?: string | null
  /** B2 MW shelf: first slide embeds `MobileMapModalB2MeetingPanel` (list or Meet at). */
  b2MeetingHubProps?: MobileMapB2MeetingHubShelfProps | null
  /** MW shelf: centered slide — off-slide descriptions reset to peek. */
  shelfCardIsSelected: boolean
}) {
  if (stop.id === MW_MAP_B2_SHELF_HUB_STOP_ID && b2MeetingHubProps != null) {
    return (
      <div
        data-shelf-card
        data-stop-id={stop.id}
        className={MW_MAP_SHELF_CARD_CLASS}
        role="group"
        aria-label="Meeting pickup — map modal"
      >
        <MobileMapModalB2MeetingPanel
          embedded
          {...b2MeetingHubProps}
          shelfDescriptionActive={shelfCardIsSelected}
        />
      </div>
    )
  }

  const logisticsB = isVariantBLayout(variantId) || isVariantC2OrD2MapLayout(variantId)
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
      data-shelf-card
      data-stop-id={stop.id}
      className={MW_MAP_SHELF_CARD_CLASS}
      role="group"
      aria-label={`${title} — itinerary details`}
    >
      <div className={desc ? 'flex gap-4' : 'flex gap-4 pb-3'}>
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
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h3 className="text-[15px] font-medium leading-snug text-stone-900 sm:text-base">{title}</h3>
              {displayStop.durationLine?.trim() ? (
                <p className="text-[13px] leading-snug text-stone-500">
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
          {meeting && displayStop.placeName ? (
            <div className="mt-2 px-1" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <OpenInGoogleMapsLink address={displayStop.placeName} />
            </div>
          ) : null}
          {desc ? (
            <div className="mt-4 px-1" onClick={(e) => e.stopPropagation()}>
              <TimelineStopDescription
                text={desc}
                shelfScrollFade
                shelfDescriptionActive={shelfCardIsSelected}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function findShelfCenterStopId(scrollEl: HTMLDivElement, shelfStops: Stop[]): string | null {
  const cx = scrollEl.scrollLeft + scrollEl.clientWidth / 2
  let bestId: string | null = null
  let bestDist = Infinity
  for (const s of shelfStops) {
    const el = scrollEl.querySelector(`[data-shelf-card][data-stop-id="${CSS.escape(s.id)}"]`) as HTMLElement | null
    if (!el) continue
    const mid = el.offsetLeft + el.offsetWidth / 2
    const d = Math.abs(mid - cx)
    if (d < bestDist) {
      bestDist = d
      bestId = s.id
    }
  }
  return bestId
}

function getShelfCardTargetScrollLeft(
  track: HTMLDivElement,
  card: HTMLElement,
): number {
  return Math.max(0, card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2)
}

/** Content height of one shelf card (shell + live description clip). */
function measureShelfCardContentHeight(card: HTMLElement): number {
  const clip = card.querySelector('[data-shelf-desc-clip]') as HTMLElement | null
  let contentH = Math.max(card.offsetHeight, card.scrollHeight)
  if (clip) {
    const clipH = Math.ceil(clip.getBoundingClientRect().height)
    const shellH = card.offsetHeight - clipH
    contentH = Math.ceil(shellH + clipH)
  }
  return contentH
}

/** Nudge scroll so the nearest shelf card is centered (after height / snap settle). */
function correctShelfSnapToCenter(
  track: HTMLDivElement,
  shelfStops: Stop[],
  stopId?: string | null,
): boolean {
  const id = stopId ?? findShelfCenterStopId(track, shelfStops)
  if (!id) return false
  const card = track.querySelector(
    `[data-shelf-card][data-stop-id="${CSS.escape(id)}"]`,
  ) as HTMLElement | null
  if (!card) return false
  const targetLeft = getShelfCardTargetScrollLeft(track, card)
  if (Math.abs(track.scrollLeft - targetLeft) < 2) return false
  track.scrollTo({ left: targetLeft, behavior: 'auto' })
  return true
}

/**
 * MW map modal: horizontal shelf of the same stop cards — meetings (B-layout), POIs, end; swipe changes
 * selection and map pin focus like tapping each pin.
 */
function MobileMapModalStopShelf({
  shelfStops,
  selectedStopId,
  variantId,
  stops,
  onDismiss,
  onShelfCommitStop,
  b2CommittedPickupId,
  shelfHubStopId = '',
  b2MeetingHubProps = null,
  onShelfCenterChange,
}: {
  shelfStops: Stop[]
  selectedStopId: string
  variantId: VariantId
  stops: Stop[]
  onDismiss?: () => void
  onShelfCommitStop: (stopId: string) => void
  b2CommittedPickupId?: string | null
  /** When set, snapping to this slide does not run `onShelfCommitStop` (B2 hub is not a map stop). */
  shelfHubStopId?: string
  b2MeetingHubProps?: MobileMapB2MeetingHubShelfProps | null
  /** Fired when the centered snap slide changes (scroll / settle) — C2 map pin preview. */
  onShelfCenterChange?: (stopId: string | null) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const suppressNextScrollIntoViewRef = useRef(false)
  const programmaticScrollRef = useRef(false)
  const programmaticScrollReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userShelfScrollingRef = useRef(false)
  /** Row height follows the **centered** snap slide so a tall off-screen slide does not stretch the shelf. */
  const [shelfTrackHeightPx, setShelfTrackHeightPx] = useState<number | null>(null)
  const [shelfTrackHeightInstant, setShelfTrackHeightInstant] = useState(false)
  const shelfTrackStyle = useMemo((): CSSProperties | undefined => {
    if (shelfTrackHeightPx == null) return undefined
    const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    return {
      height: shelfTrackHeightPx,
      transition:
        reduceMotion || shelfTrackHeightInstant
          ? undefined
          : `height ${MW_SHELF_DESC_TRANSITION_MS}ms ${MW_SHELF_DESC_EASE}`,
    }
  }, [shelfTrackHeightPx, shelfTrackHeightInstant])

  const syncShelfTrackHeight = useCallback((opts?: { instant?: boolean; animate?: boolean }) => {
    const track = scrollRef.current
    if (!track || shelfStops.length === 0) {
      setShelfTrackHeightPx(null)
      return
    }
    const centeredId =
      findShelfCenterStopId(track, shelfStops) ??
      (selectedStopId && shelfStops.some((s) => s.id === selectedStopId)
        ? selectedStopId
        : null)
    if (!centeredId) {
      setShelfTrackHeightPx(null)
      return
    }
    const centeredCard = track.querySelector(
      `[data-shelf-card][data-stop-id="${CSS.escape(centeredId)}"]`,
    ) as HTMLElement | null
    if (!centeredCard) {
      setShelfTrackHeightPx(null)
      return
    }
    for (const s of shelfStops) {
      if (s.id === centeredId) continue
      const c = track.querySelector(
        `[data-shelf-card][data-stop-id="${CSS.escape(s.id)}"]`,
      ) as HTMLElement | null
      if (c && c.scrollTop > 0) c.scrollTop = 0
    }
    const cs = getComputedStyle(track)
    const padY =
      (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
    const contentH = measureShelfCardContentHeight(centeredCard)
    const h = Math.ceil(contentH + padY)
    if (h > 0) {
      const instant = opts?.instant ?? false
      const animate = opts?.animate ?? !instant
      setShelfTrackHeightInstant(!animate)
      setShelfTrackHeightPx(h)
    }
  }, [shelfStops, selectedStopId])

  const reportShelfCenter = useCallback(() => {
    if (!onShelfCenterChange) return
    const el = scrollRef.current
    if (!el || shelfStops.length === 0) {
      onShelfCenterChange(null)
      return
    }
    onShelfCenterChange(findShelfCenterStopId(el, shelfStops))
  }, [onShelfCenterChange, shelfStops])

  const scheduleCommitFromScroll = useCallback(() => {
    if (programmaticScrollRef.current) return
    const el = scrollRef.current
    if (!el || shelfStops.length === 0) return
    const id = findShelfCenterStopId(el, shelfStops)
    if (id == null) return
    if (shelfHubStopId && id === shelfHubStopId) {
      suppressNextScrollIntoViewRef.current = true
      onShelfCommitStop(id)
      return
    }
    if (id === selectedStopId) return
    suppressNextScrollIntoViewRef.current = true
    onShelfCommitStop(id)
  }, [shelfStops, selectedStopId, onShelfCommitStop, shelfHubStopId])

  const settleUserShelfScroll = useCallback(() => {
    const track = scrollRef.current
    if (!track || shelfStops.length === 0) return
    userShelfScrollingRef.current = false
    programmaticScrollRef.current = true
    const centeredId = findShelfCenterStopId(track, shelfStops)
    syncShelfTrackHeight({ animate: true })
    correctShelfSnapToCenter(track, shelfStops, centeredId)
    requestAnimationFrame(() => {
      syncShelfTrackHeight({ animate: true })
      correctShelfSnapToCenter(track, shelfStops, centeredId)
      programmaticScrollRef.current = false
      reportShelfCenter()
      scheduleCommitFromScroll()
    })
  }, [shelfStops, syncShelfTrackHeight, scheduleCommitFromScroll, reportShelfCenter])

  const finishProgrammaticShelfScroll = useCallback(() => {
    const track = scrollRef.current
    programmaticScrollRef.current = false
    if (programmaticScrollReleaseTimerRef.current != null) {
      clearTimeout(programmaticScrollReleaseTimerRef.current)
      programmaticScrollReleaseTimerRef.current = null
    }
    syncShelfTrackHeight({ animate: true })
    if (track) {
      correctShelfSnapToCenter(track, shelfStops, selectedStopId)
    }
    reportShelfCenter()
  }, [syncShelfTrackHeight, shelfStops, selectedStopId, reportShelfCenter])

  const scrollShelfToStopId = useCallback(
    (stopId: string) => {
      const el = scrollRef.current
      if (!el) return
      const card = el.querySelector(
        `[data-shelf-card][data-stop-id="${CSS.escape(stopId)}"]`,
      ) as HTMLElement | null
      if (!card) return
      const behavior: ScrollBehavior = globalThis.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      )?.matches
        ? 'auto'
        : 'smooth'
      const targetLeft = getShelfCardTargetScrollLeft(el, card)
      programmaticScrollRef.current = true
      if (programmaticScrollReleaseTimerRef.current != null) {
        clearTimeout(programmaticScrollReleaseTimerRef.current)
        programmaticScrollReleaseTimerRef.current = null
      }
      let released = false
      const release = () => {
        if (released) return
        released = true
        el.removeEventListener('scrollend', release)
        if (programmaticScrollReleaseTimerRef.current != null) {
          clearTimeout(programmaticScrollReleaseTimerRef.current)
          programmaticScrollReleaseTimerRef.current = null
        }
        finishProgrammaticShelfScroll()
      }
      el.scrollTo({ left: Math.max(0, targetLeft), behavior })
      if (behavior === 'smooth') {
        el.addEventListener('scrollend', release, { once: true })
        programmaticScrollReleaseTimerRef.current = setTimeout(release, 520)
      } else {
        requestAnimationFrame(finishProgrammaticShelfScroll)
      }
    },
    [finishProgrammaticShelfScroll],
  )

  useLayoutEffect(() => {
    if (suppressNextScrollIntoViewRef.current) {
      suppressNextScrollIntoViewRef.current = false
      return
    }
    if (!selectedStopId || !shelfStops.some((s) => s.id === selectedStopId)) return
    scrollShelfToStopId(selectedStopId)
  }, [selectedStopId, shelfStops, scrollShelfToStopId])

  useLayoutEffect(() => {
    reportShelfCenter()
  }, [reportShelfCenter, shelfStops.length, selectedStopId])

  useEffect(() => {
    return () => {
      if (programmaticScrollReleaseTimerRef.current != null) {
        clearTimeout(programmaticScrollReleaseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let shelfCenterRaf = 0
    const onScrollEnd = () => {
      if (scrollIdleTimerRef.current != null) {
        clearTimeout(scrollIdleTimerRef.current)
        scrollIdleTimerRef.current = null
      }
      if (programmaticScrollRef.current) return
      reportShelfCenter()
      settleUserShelfScroll()
    }
    const onScroll = () => {
      if (shelfCenterRaf) cancelAnimationFrame(shelfCenterRaf)
      shelfCenterRaf = requestAnimationFrame(() => {
        shelfCenterRaf = 0
        reportShelfCenter()
      })
      if (programmaticScrollRef.current) return
      userShelfScrollingRef.current = true
      if (scrollIdleTimerRef.current != null) clearTimeout(scrollIdleTimerRef.current)
      scrollIdleTimerRef.current = setTimeout(() => {
        scrollIdleTimerRef.current = null
        settleUserShelfScroll()
      }, 280)
    }
    el.addEventListener('scrollend', onScrollEnd)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scrollend', onScrollEnd)
      el.removeEventListener('scroll', onScroll)
      if (scrollIdleTimerRef.current != null) clearTimeout(scrollIdleTimerRef.current)
      if (shelfCenterRaf) cancelAnimationFrame(shelfCenterRaf)
    }
  }, [settleUserShelfScroll, reportShelfCenter])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const sync = () => {
      const w = el.clientWidth
      if (w > 0) el.style.setProperty(MW_MAP_SHELF_TRACK_PX_VAR, `${w}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
      el.style.removeProperty(MW_MAP_SHELF_TRACK_PX_VAR)
    }
  }, [shelfStops.length])

  useLayoutEffect(() => {
    const track = scrollRef.current
    if (!track) return
    syncShelfTrackHeight({ animate: true })
    const ro = new ResizeObserver(() => {
      if (userShelfScrollingRef.current || programmaticScrollRef.current) return
      syncShelfTrackHeight({ instant: true })
    })
    const cards = track.querySelectorAll('[data-shelf-card]')
    cards.forEach((card) => ro.observe(card))
    return () => ro.disconnect()
  }, [syncShelfTrackHeight, shelfStops, b2MeetingHubProps])

  useEffect(() => {
    const track = scrollRef.current
    if (!track) return
    const onLayout = () => {
      if (userShelfScrollingRef.current) return
      syncShelfTrackHeight({ instant: true })
    }
    track.addEventListener(MW_SHELF_CARD_LAYOUT_EVENT, onLayout)
    return () => track.removeEventListener(MW_SHELF_CARD_LAYOUT_EVENT, onLayout)
  }, [syncShelfTrackHeight])

  return (
    <div
      className="w-full min-w-0 overflow-y-visible"
      role="region"
      aria-live="polite"
      aria-label="Itinerary stops — swipe sideways to see each stop"
    >
      <div
        ref={scrollRef}
        className="flex items-end snap-x snap-mandatory gap-[8px] overflow-x-auto overscroll-x-contain py-0.5 touch-pan-x pl-4 pr-4 scroll-pl-4 scroll-pr-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        style={shelfTrackStyle}
      >
        {shelfStops.map((s) => (
          <MobileMapModalStopPanelCard
            key={s.id}
            stop={s}
            variantId={variantId}
            stops={stops}
            onDismiss={onDismiss}
            b2CommittedPickupId={b2CommittedPickupId}
            b2MeetingHubProps={shelfHubStopId && s.id === shelfHubStopId ? b2MeetingHubProps : null}
            shelfCardIsSelected={selectedStopId === s.id}
          />
        ))}
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
 * B2 / C2 + committed pickup: overview framing uses only the chosen meeting plus POI / pass-by / end legs.
 * D2 keeps all three meeting coords in the overview (all meeting pins stay on the map).
 */
function routeCoordsForVariantOverview(
  variantId: VariantId,
  routeLngLat: [number, number][],
  stops: Stop[],
  b2CommittedPickupId: string | null,
): [number, number][] {
  if (
    !isVariantTripleMeetingMapPickup(variantId) ||
    variantId === 'd2' ||
    b2CommittedPickupId == null ||
    stops.length === 0 ||
    routeLngLat.length === 0
  ) {
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
  options: {
    duration: number
    isMobile?: boolean
    mobileInlinePreview?: boolean
    /** DOM-measured bottom overlay — use in MW modal so `fitBounds` clears the real sheet height. */
    paddingOverride?: maplibregl.PaddingOptions
  },
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

  const padMobileModal =
    mobile && !inlinePreview && options.paddingOverride != null
      ? options.paddingOverride
      : mobile && !inlinePreview
        ? overviewFitPaddingMobileModal()
        : null

  map.fitBounds(bounds, {
    padding:
      mobile && inlinePreview
        ? OVERVIEW_FIT_PADDING_MOBILE_INLINE
        : padMobileModal != null
          ? padMobileModal
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
  focusPadding?: maplibregl.PaddingOptions,
) {
  const pad = focusPadding ?? mobileModalPoiViewPadding()

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
  /** MW full-screen map: dismiss bottom POI shelf + clear map/list selection (chevron on each stop card). */
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
  /** C2 desktop: meeting pin tap — parent opens the inline meeting dropdown. */
  onC2MapMeetingPinClick?: (meetingStopId: string) => void
  /** Facilitator: hero image above teardrop on selected / hovered map pins (default on). */
  mapPinPhotoThumbnail?: boolean
  /** Meeting point address — shown as the pin label for meeting-kind stops instead of the stop title. */
  meetingAddress?: string
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
  onC2MapMeetingPinClick,
  mapPinPhotoThumbnail = true,
  meetingAddress,
}: Props) {
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
  const meetingAddressRef = useRef(meetingAddress)
  meetingAddressRef.current = meetingAddress
  /** After initial overview has settled — before this, `moveend` is ignored for “Re-centre” visibility. */
  const trackRecentreHintRef = useRef(false)
  /** Ignore `moveend` until this time (ms) so programmatic `fitBounds` does not reveal Re-centre. */
  const ignoreMoveEndForRecentreUntilRef = useRef(0)
  /** User panned/zoomed while `programmaticOverviewCameraDepthRef` was >0 — reveal after next idle once depth clears. */
  const userGesturePendingRecentreRef = useRef(false)

  const variantIdRef = useRef(variantId)
  const mapPinPhotoThumbnailRef = useRef(mapPinPhotoThumbnail)
  mapPinPhotoThumbnailRef.current = mapPinPhotoThumbnail
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

  /** Map modal: highlighted meeting for map preview; cleared after list tap commits pickup. */
  const [mobileB2MeetingPendingId, setMobileB2MeetingPendingId] = useState<string | null>(null)
  const mobileB2MeetingPendingIdRef = useRef(mobileB2MeetingPendingId)
  mobileB2MeetingPendingIdRef.current = mobileB2MeetingPendingId
  /**
   * While true, modal shows the meeting **list** even though `b2CommittedPickupId` is set — user is
   * changing meeting point; a list row tap commits (MW modal has no separate confirm button).
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
  /** B2 meeting picker hub on shelf — zoom out to all meeting pins (`runRecentreLikeButton` assigned after init). */
  const fitB2MeetingListOverviewOnMapRef = useRef<() => void>(() => {})
  const lastHubShelfCameraKeyRef = useRef<string | null>(null)
  /** C2 MW modal: centered shelf slide — temporarily reveals non-committed meeting pins on the map. */
  const mobileModalShelfCenteredStopIdRef = useRef<string | null>(null)
  const onB2MeetingHoverRef = useRef(onB2MeetingHover)
  onB2MeetingHoverRef.current = onB2MeetingHover
  const onB2PickupChangeRef = useRef(onB2PickupChange)
  onB2PickupChangeRef.current = onB2PickupChange
  const onC2MapMeetingPinClickRef = useRef(onC2MapMeetingPinClick)
  onC2MapMeetingPinClickRef.current = onC2MapMeetingPinClick

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

  /** B2 triple-meeting MW shelf (hub slide + itinerary cards) — C2 uses per-meeting shelf cards instead. */
  const b2TripleMeetingMwShelfActive = useMemo(
    () =>
      variantId === 'b2' &&
      isVariantB2TripleMeeting(variantId, stops) &&
      onB2PickupChange != null &&
      mobileSheetOpen &&
      !mobileModalStopPanelDismissed,
    [
      variantId,
      stops,
      onB2PickupChange,
      mobileSheetOpen,
      mobileModalStopPanelDismissed,
    ],
  )

  const getMobileModalPoiFocusPaddingRef = useRef<() => maplibregl.PaddingOptions>(() => mobileModalPoiViewPadding())

  const getMobileModalPoiFocusPadding = useCallback((): maplibregl.PaddingOptions => {
    if (!isMobile || !mobileSheetOpen) return mobileModalPoiViewPadding()
    const mapEl = sheetMapHostRef.current
    if (!mapEl) return mobileModalPoiViewPadding()

    const panelEl = mobileModalStopPanelMotionRef.current

    if (!panelEl) return mobileModalPoiViewPadding()

    const measured = computeModalBandCenterPadding(mapEl, panelEl)
    return measured ?? mobileModalPoiViewPadding()
  }, [isMobile, mobileSheetOpen])

  getMobileModalPoiFocusPaddingRef.current = getMobileModalPoiFocusPadding

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

  const mobileMapModalShelfStops = useMemo(() => {
    if (
      variantId !== 'b2' ||
      !isVariantB2TripleMeeting(variantId, stops) ||
      onB2PickupChange == null
    ) {
      return getMobileMapModalShelfStops(variantId, stops)
    }
    const middle: Stop[] = []
    const ends: Stop[] = []
    let i = 0
    while (i < stops.length && stops[i]?.kind === 'meeting') {
      i++
    }
    while (i < stops.length) {
      const s = stops[i]!
      if (s.kind === 'end') ends.push(s)
      else middle.push(s)
      i++
    }
    return [MW_MAP_B2_SHELF_HUB_STOP, ...middle, ...ends]
  }, [variantId, stops, onB2PickupChange])

  const mobileMapModalShelfSelectedStopId = useMemo(() => {
    if (!b2TripleMeetingMwShelfActive) {
      return selectedStopId
    }
    const tripleIds = stops.slice(0, 3).map((s) => s.id)
    const listMode = b2CommittedPickupId == null || mobileB2MeetingReselectPicker
    if (listMode) {
      if (!selectedStopId || tripleIds.includes(selectedStopId)) {
        return MW_MAP_B2_SHELF_HUB_STOP_ID
      }
      return selectedStopId
    }
    if (b2CommittedPickupId != null && selectedStopId === b2CommittedPickupId) {
      return MW_MAP_B2_SHELF_HUB_STOP_ID
    }
    return selectedStopId
  }, [
    b2TripleMeetingMwShelfActive,
    stops,
    selectedStopId,
    b2CommittedPickupId,
    mobileB2MeetingReselectPicker,
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
    /**
     * Hide non-chosen meeting pins once pickup is committed (B2 timeline / C2 card).
     * D2: keep all three meeting discs visible after selection.
     */
    let b2FocusMeetingId: string | null = null
    if (isVariantTripleMeetingMapPickup(vid) && vid !== 'd2') {
      if (committedPickup != null) {
        b2FocusMeetingId = committedPickup
      }
    }
    const rawB2HoverMeetingId =
      isVariantTripleMeetingMapPickup(variantIdRef.current)
        ? b2HoverMeetingIdRef.current
        : null
    /**
     * MW map-modal meeting sheet: pins follow **pending** selection only — ignore timeline/list hover
     * preview so the selected meeting stays highlighted on the map.
     */
    const b2MeetingModalHighlightId =
      showB2MeetingModalPanelRef.current &&
      isVariantTripleMeetingMapPickup(variantIdRef.current) &&
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

    /** Desktop + full-screen map modal: teardrops follow timeline / selection. Mobile inline PDP: fixed showcase only. */
    const mapPinHeadSync = !isMobileRef.current || mobileSheetOpenRef.current
    const showPhotoThumbnail = mapPinHeadSync && mapPinPhotoThumbnailRef.current

    /** Inline mobile web map: no screen-space cluster mode — always full-size circle pins (not 18px dots). */
    const useOverlapCompact = mapPinHeadSync

    /**
     * Mobile inline PDP: map pins stay fixed — timeline hover / list selection / B2 preview do not
     * restyle markers. Exception: one “showcase” pin (landing first POI) stays teardrop + does not follow selection.
     */
    const syncInlineMapPinsWithTimeline = mapPinHeadSync

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

    /**
     * MW B2 triple-meeting picker: all three stops stay **green discs** (overview) — not teardrops.
     * Teardrops defer on `logistics-map-pin-in-view` and read as “missing” on first modal open.
     */
    const mapModalMeetingPicker =
      showB2MeetingModalPanelRef.current &&
      variantIdRef.current === 'b2' &&
      (b2CommittedPickupIdRef.current == null ||
        mobileB2MeetingReselectPickerRef.current)

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
      const stopAt = stopsLocal[i]
      const isB2Meeting =
        isVariantTripleMeetingMapPickup(vid) && stopAt?.kind === 'meeting'
      const meetingPickerDiscOnly = mapModalMeetingPicker && isB2Meeting
      /** C2 MW modal: per-meeting shelf cards — keep compact green discs. D2 uses teardrop when selected. */
      const c2MobileMeetingDiscOnly =
        vid === 'c2' &&
        isMobileRef.current &&
        mobileSheetOpenRef.current &&
        isB2Meeting
      /** MW: same compact green discs as inline PDP — never overlap-shrink meeting pins. */
      const mobileB2MeetingDisc =
        isMobileRef.current && isB2Meeting && !meetingPickerDiscOnly && !c2MobileMeetingDiscOnly
      /** D2 MW inline PDP: landing first POI is a highlighted disc, not teardrop (modal unchanged). */
      const d2InlineShowcaseDiscOnly =
        vid === 'd2' &&
        isMobileRef.current &&
        !mobileSheetOpenRef.current &&
        landingShowcaseIdx >= 0 &&
        i === landingShowcaseIdx
      const teardropActive =
        active &&
        !meetingPickerDiscOnly &&
        !c2MobileMeetingDiscOnly &&
        !d2InlineShowcaseDiscOnly
      const discHighlighted = active
      const discRingSelected = discHighlighted && !d2InlineShowcaseDiscOnly
      const poiOrder = getPoiOrderForStopIndex(stopsLocal, vid, i)
      const oc = useOverlapCompact ? (overlap[i] ?? false) : false
      const isTimelineRowHoverPin = timelineHoverPinActive
      /** Map overlap → compact dots when clustered (`useOverlapCompact`). Active pin always full teardrop. MW inline skips compact. */
      const ocForMarker =
        meetingPickerDiscOnly || c2MobileMeetingDiscOnly || mobileB2MeetingDisc
          ? false
          : teardropActive
            ? false
            : oc
      const stopAt_ = stopsLocal[i]
      const labelTitle = stopAt_?.kind === 'meeting'
        ? (stopAt_.placeName ?? meetingAddressRef.current ?? stopAt_.title)
        : stopAt_?.title
      applyMarkerSelectedState(
        el,
        teardropActive,
        stopAt_,
        vid,
        poiOrder,
        ocForMarker,
        b2CommittedPickupIdRef.current,
        mapPinHeadSync,
        showPhotoThumbnail,
        isTimelineRowHoverPin,
        i,
        stopsLocal.length,
        discHighlighted,
        isMobileRef.current,
        mobileSheetOpenRef.current,
        discRingSelected,
        selectedPinActive || timelineHoverPinActive || b2MeetingHoverPinActive,
        labelTitle,
      )
      const teardrop = isMapTeardropPin(teardropActive, stopsLocal[i], vid, poiOrder, ocForMarker)
      const collapsed = el.dataset.mapPinHeadCollapsed === '1'
      const b2MeetingFixedShell = isB2DesktopMeetingMapPin(
        stopsLocal[i],
        vid,
        mapPinHeadSync,
        isMobileRef.current,
      )
      const offY = b2MeetingFixedShell
        ? 0
        : teardrop
          ? !showPhotoThumbnail
            ? MAP_MAP_TEARDROP_ONLY_OFFSET_Y
            : collapsed
              ? MAP_MAP_PIN_COLLAPSED_OFFSET_Y
              : MAP_POI_SELECTED_PIN_OFFSET_Y
          : 0
      markersRef.current[i]?.setOffset([0, offY])

      if (isVariantTripleMeetingMapPickup(vid) && stopAt?.kind === 'meeting') {
        /**
         * MW map-modal meeting sheet (pending choice, not yet committed): keep **all** meeting pins on
         * the canvas — selection vs dimming comes from `applyMarkerSelectedState` / active hover idx only.
         * `data-logistics-b2-meeting-hidden` is for B2/C2 committed pickup (hide non-chosen meetings; not D2).
         */
        if (mapModalMeetingPicker) {
          el.removeAttribute('data-logistics-b2-meeting-hidden')
          el.removeAttribute('aria-hidden')
        } else {
          const primaryMeetingFocusId: string | null = b2FocusMeetingId
          const c2CommittedShelfBrowse =
            vid === 'c2' &&
            isMobileRef.current &&
            mobileSheetOpenRef.current &&
            primaryMeetingFocusId != null
          const shelfCenterId = mobileModalShelfCenteredStopIdRef.current
          let c2ShelfPreviewMeetingId: string | null = null
          if (c2CommittedShelfBrowse && shelfCenterId) {
            const centerStop = stopsLocal.find((s) => s.id === shelfCenterId)
            if (centerStop?.kind === 'meeting') {
              c2ShelfPreviewMeetingId = shelfCenterId
            }
          }
          if (primaryMeetingFocusId != null) {
            const hoverId = b2MeetingModalHighlightId
            const isFocus =
              stopAt.id === primaryMeetingFocusId ||
              (hoverId != null && stopAt.id === hoverId) ||
              (c2ShelfPreviewMeetingId != null &&
                c2ShelfPreviewMeetingId !== primaryMeetingFocusId &&
                stopAt.id === c2ShelfPreviewMeetingId)
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
        if (
          isB2DesktopMeetingMapPin(
            stopsLocal[hoverIdx],
            vid,
            mapPinHeadSync,
            isMobileRef.current,
          )
        ) {
          expandMapPinHead(elH)
        } else {
          replayMapPinTeardropIntroAnimation(elH)
        }
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
      () => mapWrapInViewportRef.current || mobileSheetOpenRef.current,
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

  /** MW map modal: shelf swipe / snap — same camera + pin focus as tapping the map marker. */
  const focusMobileModalShelfStop = useCallback(
    (stopId: string, opts?: { alwaysRefocus?: boolean }) => {
      if (
        !opts?.alwaysRefocus &&
        selectedStopIdRef.current === stopId &&
        lastSelectSourceRef.current === 'mapModal'
      ) {
        return
      }
      const map = mapRef.current
      if (!map) return
      const i = stops.findIndex((s) => s.id === stopId)
      if (i < 0) return
      const coord = routeLngLat[i]
      if (!coord) return

      setMobileModalStopPanelDismissedRef.current(false)
      setMobileModalB2MeetingPanelOpenRef.current(false)
      setMobileB2MeetingPendingIdRef.current(null)
      onB2MeetingHoverRef.current?.(null)

      onSelectRef.current(stopId, 'mapModal')
      selectedStopIdRef.current = stopId
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
          runMobileModalPoiFocus(
            map,
            coord,
            routeLngLat,
            i,
            POI_FOCUS_DURATION_MS,
            getMobileModalPoiFocusPaddingRef.current(),
          )
        })
      })
    },
    [stops, routeLngLat],
  )

  const handleMobileModalShelfSelect = useCallback(
    (stopId: string) => {
      if (stopId === MW_MAP_B2_SHELF_HUB_STOP_ID) {
        const committedId = b2CommittedPickupIdRef.current
        const reselect = mobileB2MeetingReselectPickerRef.current
        if (committedId != null && !reselect) {
          focusMobileModalShelfStop(committedId, { alwaysRefocus: true })
          return
        }
        lastHubShelfCameraKeyRef.current = 'list'
        fitB2MeetingListOverviewOnMapRef.current()
        return
      }
      // Shelf snap is explicit navigation — refocus even if this stop was already selected (e.g. after hub overview).
      lastHubShelfCameraKeyRef.current = null
      focusMobileModalShelfStop(stopId, { alwaysRefocus: true })
    },
    [focusMobileModalShelfStop],
  )

  const handleMobileModalShelfCenterChange = useCallback((stopId: string | null) => {
    if (variantIdRef.current !== 'c2') return
    if (mobileModalShelfCenteredStopIdRef.current === stopId) return
    mobileModalShelfCenteredStopIdRef.current = stopId
    syncMarkersAppearanceRef.current()
  }, [])

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

  const confirmMobileB2MeetingPickup = useCallback(
    (meetingStopId?: string) => {
      const id = meetingStopId ?? mobileB2MeetingPendingId
      if (id == null) return
      onB2PickupChange?.(id)
      setMobileB2MeetingReselectPicker(false)
      setMobileB2MeetingPendingId(null)
      onB2MeetingHover?.(null)
    },
    [mobileB2MeetingPendingId, onB2PickupChange, onB2MeetingHover],
  )

  const b2MeetingHubProps = useMemo((): MobileMapB2MeetingHubShelfProps | null => {
    if (!b2TripleMeetingMwShelfActive) return null
    return {
      variantId,
      stops,
      meetings: stops.slice(0, 3),
      pickupId: b2CommittedPickupId ?? null,
      pendingPickupId: mobileB2MeetingPendingId,
      reselectPickerOpen: mobileB2MeetingReselectPicker,
      onPendingPickupChange: handleMobileB2PendingPickupChange,
      onConfirmPickup: confirmMobileB2MeetingPickup,
      onBeginReselect: handleBeginMobileB2ReselectPicker,
      onDismiss: dismissMobileModalStopPanelAnimated,
    }
  }, [
    b2TripleMeetingMwShelfActive,
    variantId,
    stops,
    b2CommittedPickupId,
    mobileB2MeetingPendingId,
    mobileB2MeetingReselectPicker,
    handleMobileB2PendingPickupChange,
    confirmMobileB2MeetingPickup,
    handleBeginMobileB2ReselectPicker,
    dismissMobileModalStopPanelAnimated,
  ])

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

  /**
   * MW full-screen map: iOS still scrolls / rubber-bands the page behind the modal with `overflow: hidden` alone.
   * Lock with `position: fixed` + restore `scrollY` (also used for the POI / meeting bottom sheets).
   */
  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return
    const scrollY = globalThis.scrollY
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyPosition = document.body.style.position
    const prevBodyTop = document.body.style.top
    const prevBodyLeft = document.body.style.left
    const prevBodyRight = document.body.style.right
    const prevBodyWidth = document.body.style.width
    const prevHtmlOverflow = document.documentElement.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.position = prevBodyPosition
      document.body.style.top = prevBodyTop
      document.body.style.left = prevBodyLeft
      document.body.style.right = prevBodyRight
      document.body.style.width = prevBodyWidth
      /**
       * `index.css` sets `html { scroll-behavior: smooth }` — two-arg `scrollTo(0, y)` animates from the top.
       * Restore the pre-modal offset **instantly** so closing the map doesn’t look like a page scroll animation.
       */
      const y = Math.max(0, scrollY)
      requestAnimationFrame(() => {
        globalThis.scrollTo({ top: y, left: 0, behavior: 'instant' })
      })
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
      mobileModalShelfCenteredStopIdRef.current = null
      onB2MeetingHover?.(null)
    }
  }, [mobileSheetOpen, onB2MeetingHover])

  /**
   * MW B2 meeting modal: default pending — first meeting when nothing committed; committed id when
   * re-select picker is open and pending was cleared.
   */
  useEffect(() => {
    if (!mobileSheetOpen || !showB2MeetingModalPanel) return
    if (!isVariantTripleMeetingMapPickup(variantId) || !isVariantB2TripleMeeting(variantId, stops)) return
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
    if (!isMobile) {
      /** Desktop: signal is a no-op here — consume so the effect doesn’t re-fire stale increments. */
      lastB2ModalOpenSignalHandledRef.current = b2OpenMeetingModalSignal
      return
    }
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
    /**
     * Timeline “Show meeting points on map” — shelf must land on the hub slide (meeting list), not
     * whatever POI `selectedStopId` was left from the inline map / accordion.
     */
    onSelectRef.current('', 'mapModal')
    selectedStopIdRef.current = ''
    lastSelectSourceRef.current = 'mapModal'
    highlightSelectedPinRef.current = false
    lastHubShelfCameraKeyRef.current = null
    lastHubShelfCameraMeetingRef.current = null
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
    syncMarkersAppearanceRef.current()
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

  /**
   * MW full-screen map modal: first open can mount while the dialog layout is still settling (0×0 → real size).
   * If we compute overlap-compaction during that window, meeting pins can render as compact dots until some
   * later interaction triggers a re-sync. Force a resize + marker refresh across two frames.
   */
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !isMobile || !mobileSheetOpen) return

    let raf1 = 0
    let raf2 = 0
    const run = () => {
      map.resize()
      syncMarkersAppearanceRef.current()
    }
    raf1 = requestAnimationFrame(() => {
      run()
      raf2 = requestAnimationFrame(run)
    })
    return () => {
      if (raf1) cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [mapReady, isMobile, mobileSheetOpen])

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
    mapPinPhotoThumbnail,
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
      /** Full attribution text (docs default) — source credits only; no compact / “i” toggle. */
      new maplibregl.AttributionControl({ compact: false }),
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

    /**
     * Programmatic `fitBounds` emits `moveend`/`zoomstart` without `originalEvent`. Only treat DOM-backed
     * events as user intent so landing fits don’t flash Re-centre; still reveal after idle if the user
     * interacted while a programmatic camera animation held `programmaticOverviewCameraDepthRef` > 0.
     */
    const flushRecentreWhenCameraFree = () => {
      if (cancelled) return
      if (!userGesturePendingRecentreRef.current) return
      if (!trackRecentreHintRef.current) {
        userGesturePendingRecentreRef.current = false
        return
      }
      if (Date.now() < ignoreMoveEndForRecentreUntilRef.current) {
        map.once('idle', flushRecentreWhenCameraFree)
        return
      }
      if (programmaticOverviewCameraDepthRef.current > 0) {
        map.once('idle', flushRecentreWhenCameraFree)
        return
      }
      userGesturePendingRecentreRef.current = false
      setShowRecentre(true)
    }

    const revealRecentreIfAllowed = (e: maplibregl.MapLibreEvent) => {
      if (cancelled || !trackRecentreHintRef.current) return
      if (Date.now() < ignoreMoveEndForRecentreUntilRef.current) return

      const userDriven = e.type === 'dragstart' || Boolean(e.originalEvent)
      if (!userDriven) return

      if (programmaticOverviewCameraDepthRef.current > 0) {
        userGesturePendingRecentreRef.current = true
        map.once('idle', flushRecentreWhenCameraFree)
        return
      }
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

      const mapPinHeadSyncAtInit = !initialMobile
      const showPhotoAtInit = mapPinHeadSyncAtInit && mapPinPhotoThumbnailRef.current

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
          mapPinHeadSyncAtInit,
          showPhotoAtInit,
          initialMobile,
          false,
          false,
        )
        const b2c = b2CommittedPickupIdRef.current
        const initialB2DiscChk =
          isVariantTripleMeetingMapPickup(variantId) &&
          stopAtI?.kind === 'meeting' &&
          b2c != null &&
          stopAtI.id === b2c
        const initialSvg = markerSvgForStop(stopAtI, variantId, poiOrder, false, b2c)
        const initialLabelTitle = stopAtI?.kind === 'meeting'
          ? (stopAtI.placeName ?? meetingAddressRef.current ?? stopAtI.title)
          : stopAtI?.title
        const initialLabel = initialLabelTitle ? mapPinLabelHtml(initialLabelTitle) : ''
        markerEl.innerHTML = isB2DesktopMeetingMapPin(
          stopAtI,
          variantId,
          mapPinHeadSyncAtInit,
          initialMobile,
        )
          ? `<span class="${logisticsPinButtonClass(true, false)}">${initialSvg}${initialLabel}</span>`
          : `${initialSvg}${initialLabel}`
        markerEl.setAttribute(
          'data-marker-html-key',
          `pl:${variantId}:${stopAtI?.id ?? ''}:${poiOrder ?? ''}:f${initialB2DiscChk ? ':b2chk' : ''}`,
        )
        markerEl.dataset.mapPinActive = '0'
        markerEl.style.zIndex = mapMarkerInactiveChronoZIndex(
          i,
          routeLngLat.length,
        )
        const stopTitle = stopsRef.current[i]?.title
        markerEl.setAttribute(
          'aria-label',
          stopTitle ? `${stopTitle} — show on map` : `Itinerary stop ${i + 1} on map`,
        )

        const stop = stopsRef.current[i]
        const d2InlineMeetingDecor =
          isD2MobileInlineMeetingPinPassthrough(
            variantId,
            stop,
            initialMobile,
            false,
          )
        if (d2InlineMeetingDecor) {
          markerEl.style.pointerEvents = 'none'
          markerEl.tabIndex = -1
          markerEl.setAttribute('aria-hidden', 'true')
          markerEl.removeAttribute('aria-label')
        }
        if (stop?.kind === 'meeting' && isVariantTripleMeetingMapPickup(variantId)) {
          markerEl.dataset.logisticsMeetingMapPin = '1'
        }
        if (stop) {
          /** B2 only: map hover syncs timeline list highlight (C2 uses list → map only). */
          if (stop.kind === 'meeting' && variantId === 'b2') {
            markerEl.addEventListener('mouseenter', () => {
              if (b2HoverMeetingIdRef.current === stop.id) return
              onB2MeetingHoverRef.current?.(stop.id)
            })
            markerEl.addEventListener('mouseleave', () => {
              if (b2HoverMeetingIdRef.current !== stop.id) return
              onB2MeetingHoverRef.current?.(null)
            })
          }

          markerEl.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const { isMobile: mobile, sheetOpen } = interactionRef.current

            const currentStop = stopsRef.current[i]
            const tripleMeeting =
              stopsRef.current.length >= 3 &&
              stopsRef.current[0]?.kind === 'meeting' &&
              stopsRef.current[1]?.kind === 'meeting' &&
              stopsRef.current[2]?.kind === 'meeting'

            /** Mobile inline map: pins only open the sheet (same as tapping the basemap) — no zoom / no selection. */
            if (mobile && !sheetOpen) {
              setMobileSheetOpen(true)
              return
            }

            /** B2: triple meeting — full-screen modal shows the same picker as the timeline; inline preview map still no-op. */
            if (
              variantIdRef.current === 'b2' &&
              i < 3 &&
              currentStop?.kind === 'meeting' &&
              tripleMeeting
            ) {
              if (mobile && sheetOpen) {
                const committedId = b2CommittedPickupIdRef.current
                const reselectPickerActive = mobileB2MeetingReselectPickerRef.current
                /**
                 * Committed pin alone → bottom MW shelf with Meet-at hub first. During “change meeting”, same pin
                 * keeps the hub slide (embedded list / Meet at) instead of the generic stop panel.
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
                  /**
                   * No committed pickup: snap the shelf to the hub slide (meeting list / picker).
                   * `mobileMapModalShelfSelectedStopId` maps meeting ids → hub while in list mode.
                   */
                  if (committedId == null) {
                    onSelectRef.current(stop.id, 'mapModal')
                    selectedStopIdRef.current = stop.id
                    lastSelectSourceRef.current = 'mapModal'
                    highlightSelectedPinRef.current = true
                    syncMarkersAppearanceRef.current()
                  }
                  poiPopupRef.current?.remove()
                  poiPopupRef.current = null
                  return
                }
              } else if (!mobile) {
                onB2MeetingHoverRef.current?.(null)
                onB2PickupChangeRef.current?.(stop.id)
                syncMarkersAppearanceRef.current()
                return
              } else {
                return
              }
            }

            /** C2 / D2 desktop: meeting pins open the inline meeting dropdown. */
            if (
              isVariantC2OrD2MapLayout(variantIdRef.current) &&
              !mobile &&
              i < 3 &&
              currentStop?.kind === 'meeting' &&
              tripleMeeting
            ) {
              onSelectRef.current(stop.id, 'map')
              selectedStopIdRef.current = stop.id
              lastSelectSourceRef.current = 'map'
              highlightSelectedPinRef.current = true
              onC2MapMeetingPinClickRef.current?.(stop.id)
              syncMarkersAppearanceRef.current()
              return
            }

            /**
             * C2 / D2 MW modal: meeting tap — shelf card; overview stays (no tight POI zoom).
             * C2 keeps green discs; D2 selected meeting renders teardrop via sync (not disc-only).
             */
            if (
              (variantIdRef.current === 'c2' || variantIdRef.current === 'd2') &&
              mobile &&
              sheetOpen &&
              tripleMeeting &&
              i < 3 &&
              currentStop?.kind === 'meeting'
            ) {
              setMobileModalStopPanelDismissedRef.current(false)
              setMobileModalB2MeetingPanelOpenRef.current(false)
              setMobileB2MeetingReselectPickerRef.current(false)
              setMobileB2MeetingPendingIdRef.current(null)
              onB2MeetingHoverRef.current?.(null)
              onSelectRef.current(stop.id, 'mapModal')
              selectedStopIdRef.current = stop.id
              lastSelectSourceRef.current = 'mapModal'
              highlightSelectedPinRef.current = true
              mobileModalShelfCenteredStopIdRef.current = stop.id
              syncMarkersAppearanceRef.current()
              overviewModeRef.current = true
              setShowRecentre(true)
              poiPopupRef.current?.remove()
              poiPopupRef.current = null
              return
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
                  runMobileModalPoiFocus(
                    map,
                    coord,
                    routeCoordsRef.current,
                    i,
                    POI_FOCUS_DURATION_MS,
                    getMobileModalPoiFocusPaddingRef.current(),
                  )
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
          anchor:
            isB2DesktopMeetingMapPin(
              stopAtI,
              variantId,
              mapPinHeadSyncAtInit,
              initialMobile,
            )
              ? 'bottom'
              : 'center',
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
          /** C2 desktop: show Re-centre once overview has settled (not only after the user pans). */
          if (variantId === 'c2' && !initialMobile) {
            setShowRecentre(true)
          }
          syncMarkersAppearanceRef.current()
        })
      })

      if (!cancelled) setMapReady(true)
    }

    map.on('load', onLoad)

    return () => {
      cancelled = true
      overviewModeRef.current = true
      trackRecentreHintRef.current = false
      userGesturePendingRecentreRef.current = false
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
      syncMarkersAppearanceRef.current()
      if (openingMobileSheet) {
        overviewModeRef.current = true
        setShowRecentre(false)
        if (
          variantIdRef.current === 'c2' &&
          b2CommittedPickupIdRef.current != null &&
          isVariantB2TripleMeeting(variantIdRef.current, stopsRef.current)
        ) {
          const committedId = b2CommittedPickupIdRef.current
          setMobileModalStopPanelDismissedRef.current(false)
          onSelectRef.current(committedId, 'mapModal')
          selectedStopIdRef.current = committedId
          lastSelectSourceRef.current = 'mapModal'
          highlightSelectedPinRef.current = true
          mobileModalShelfCenteredStopIdRef.current = committedId
        }
        /** Long enough to cover `fitRouteOverview` (~480ms) + resize idle so landing doesn’t flash Re-centre. */
        ignoreMoveEndForRecentreUntilRef.current = Math.max(
          ignoreMoveEndForRecentreUntilRef.current,
          Date.now() + OVERVIEW_ZOOM_ANIM_MS_MOBILE + 550,
        )
        const ovCoords = routeCoordsForVariantOverview(
          variantIdRef.current,
          routeCoordsRef.current,
          stopsRef.current,
          mobileB2MeetingReselectPickerRef.current
            ? null
            : b2CommittedPickupIdRef.current,
        )
        const mapEl = sheetHost
        const panelEl = mobileModalStopPanelMotionRef.current
        const measuredOverviewPad =
          mapEl && panelEl ? computeModalOverviewFitPadding(mapEl, panelEl) : undefined
        fitRouteOverview(
          map,
          ovCoords,
          {
            duration: OVERVIEW_ZOOM_ANIM_MS_MOBILE,
            isMobile: true,
            mobileInlinePreview: false,
            ...(measuredOverviewPad ? { paddingOverride: measuredOverviewPad } : {}),
          },
          programmaticOverviewCameraDepthRef,
        )
        const refreshMarkersAfterModalOpen = () => {
          map.resize()
          syncMarkersAppearanceRef.current()
          deferredPinIntroFlushRef.current?.()
        }
        requestAnimationFrame(refreshMarkersAfterModalOpen)
        map.once('idle', refreshMarkersAfterModalOpen)
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

  /**
   * Runs **after** the sheet-host swap effect above: refit overview when the bottom sheet resizes so B2 meeting
   * pins stay above {@link MobileMapModalB2MeetingPanel} on short viewports.
   */
  useLayoutEffect(() => {
    if (!mapReady || !isMobile || !mobileSheetOpen) return
    const map = mapRef.current
    const mapHost = sheetMapHostRef.current
    if (!map || !mapHost) return

    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    const fitMeasuredModalOverview = () => {
      /**
       * `runMobileModalPoiFocus` / list selection set `overviewModeRef` to `false`. Refitting the full route here
       * (on panel `ResizeObserver`) was fighting the POI camera — zoom in → sheet reflow → overview fit (zoom out)
       * → overlap chain (zoom in), felt like a stutter.
       */
      if (!overviewModeRef.current) return
      const m = mapRef.current
      const host = sheetMapHostRef.current
      if (!m || !host) return
      const panelEl = mobileModalStopPanelMotionRef.current
      if (!panelEl) return
      const pad = computeModalOverviewFitPadding(host, panelEl)
      if (!pad) return
      /** During B2 reselect, committed id must not tighten overview (matches reselect-camera `null`). */
      const ovCoords = routeCoordsForVariantOverview(
        variantIdRef.current,
        routeCoordsRef.current,
        stopsRef.current,
        mobileB2MeetingReselectPickerRef.current ? null : b2CommittedPickupIdRef.current,
      )
      fitRouteOverview(
        m,
        ovCoords,
        {
          duration: OVERVIEW_ZOOM_ANIM_MS_MOBILE,
          isMobile: true,
          mobileInlinePreview: false,
          paddingOverride: pad,
        },
        programmaticOverviewCameraDepthRef,
      )
    }

    const panelEl = mobileModalStopPanelMotionRef.current
    if (!panelEl || typeof ResizeObserver === 'undefined') {
      return () => {
        if (debounceTimer) clearTimeout(debounceTimer)
      }
    }

    const ro = new ResizeObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fitMeasuredModalOverview()
        debounceTimer = undefined
      }, 72)
    })
    ro.observe(panelEl)
    queueMicrotask(fitMeasuredModalOverview)
    return () => {
      ro.disconnect()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [mapReady, isMobile, mobileSheetOpen, showB2MeetingModalPanel])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !isMobile || mobileSheetOpen) return
    const onMapClick = () => setMobileSheetOpen(true)
    map.on('click', onMapClick)
    return () => {
      map.off('click', onMapClick)
    }
  }, [mapReady, isMobile, mobileSheetOpen])

  /** C2 desktop: tap empty map — clear meeting pin preview (not committed pickup in the card). */
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || isMobile) return

    const clearC2MeetingMapSelection = () => {
      if (variantIdRef.current !== 'c2') return
      if (!isVariantB2TripleMeeting(variantIdRef.current, stopsRef.current)) return

      const meetingIds = stopsRef.current.slice(0, 3).map((s) => s.id)
      const meetingSelected = meetingIds.includes(selectedStopIdRef.current)
      const hasMeetingHover = b2HoverMeetingIdRef.current != null
      if (!meetingSelected && !hasMeetingHover) return

      onB2MeetingHoverRef.current?.(null)
      onSelectRef.current('', 'map')
      selectedStopIdRef.current = ''
      lastSelectSourceRef.current = 'map'
      highlightSelectedPinRef.current = false
      poiPopupRef.current?.remove()
      poiPopupRef.current = null
      overviewModeRef.current = true
      setShowRecentre(true)
      syncMarkersAppearanceRef.current()
    }

    map.on('click', clearC2MeetingMapSelection)
    return () => {
      map.off('click', clearC2MeetingMapSelection)
    }
  }, [mapReady, isMobile])

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
          mobileB2MeetingReselectPickerRef.current ? null : b2CommittedPickupId,
        )
        let paddingOverride: maplibregl.PaddingOptions | undefined
        if (fitIsMobile && mobileSheetOpenRef.current) {
          const host = sheetMapHostRef.current
          const panel =
            mobileModalStopPanelMotionRef.current
          if (host && panel) {
            paddingOverride = computeModalOverviewFitPadding(host, panel) ?? undefined
          }
        }
        fitRouteOverview(
          m,
          ovCoords,
          {
            duration: 800,
            isMobile: fitIsMobile,
            mobileInlinePreview: fitIsMobile && !mobileSheetOpenRef.current,
            ...(paddingOverride ? { paddingOverride } : {}),
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

  fitB2MeetingListOverviewOnMapRef.current = () => {
    if (
      (variantIdRef.current !== 'b2' && !isVariantC2OrD2MapLayout(variantIdRef.current)) ||
      !isVariantB2TripleMeeting(variantIdRef.current, stopsRef.current)
    ) {
      return
    }
    runRecentreLikeButton(true)
  }

  /**
   * Hub shelf: committed → POI zoom; meeting list (no pickup / re-select) → full-route overview with all meetings.
   */
  const lastHubShelfCameraMeetingRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isMobile || !mobileSheetOpen || !b2TripleMeetingMwShelfActive) {
      lastHubShelfCameraMeetingRef.current = null
      lastHubShelfCameraKeyRef.current = null
      return
    }
    if (mobileMapModalShelfSelectedStopId !== MW_MAP_B2_SHELF_HUB_STOP_ID) {
      lastHubShelfCameraMeetingRef.current = null
      lastHubShelfCameraKeyRef.current = null
      return
    }
    const listMode = b2CommittedPickupId == null || mobileB2MeetingReselectPicker
    if (listMode) {
      if (lastHubShelfCameraKeyRef.current === 'list') return
      lastHubShelfCameraKeyRef.current = 'list'
      lastHubShelfCameraMeetingRef.current = null
      fitB2MeetingListOverviewOnMapRef.current()
      return
    }
    const committedId = b2CommittedPickupId
    if (committedId == null) return
    const key = `committed:${committedId}`
    if (lastHubShelfCameraKeyRef.current === key) return
    lastHubShelfCameraKeyRef.current = key
    lastHubShelfCameraMeetingRef.current = committedId
    focusMobileModalShelfStop(committedId, { alwaysRefocus: true })
  }, [
    isMobile,
    mobileSheetOpen,
    b2TripleMeetingMwShelfActive,
    mobileMapModalShelfSelectedStopId,
    b2CommittedPickupId,
    mobileB2MeetingReselectPicker,
    focusMobileModalShelfStop,
    runRecentreLikeButton,
  ])

  /**
   * MW map modal: after confirming a meeting then tapping “See other meeting points”, zoom back
   * out so all meeting pins + route are in view (`routeCoordsForVariantOverview` with no committed id).
   */
  useEffect(() => {
    const prev = prevB2CommittedPickupIdForModalCameraRef.current
    prevB2CommittedPickupIdForModalCameraRef.current = b2CommittedPickupId
    if (prev === undefined) return

    const map = mapRef.current
    if (!mapReady || !map) return
    if (!isMobile || !mobileSheetOpen || !showB2MeetingModalPanel) return
    if (!isVariantTripleMeetingMapPickup(variantId) || !isVariantB2TripleMeeting(variantId, stops)) return
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
    const host = sheetMapHostRef.current
    const panel =
      mobileModalStopPanelMotionRef.current
    const measuredPad =
      host && panel ? computeModalOverviewFitPadding(host, panel) : undefined
    fitRouteOverview(
      map,
      ovCoords,
      {
        duration: 800,
        isMobile: true,
        mobileInlinePreview: false,
        ...(measuredPad ? { paddingOverride: measuredPad } : {}),
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
   * MW map modal: “See other meeting points” (timeline or sheet) turns on reselect **without**
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
        isVariantTripleMeetingMapPickup(variantId) &&
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
          const host = sheetMapHostRef.current
          const panel =
            mobileModalStopPanelMotionRef.current
          const measuredPad =
            host && panel ? computeModalOverviewFitPadding(host, panel) : undefined
          fitRouteOverview(
            map,
            ovCoords,
            {
              duration: 800,
              isMobile: true,
              mobileInlinePreview: false,
              ...(measuredPad ? { paddingOverride: measuredPad } : {}),
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
        /**
         * MW B2 shelf: hub-slide effect already runs `focusMobileModalShelfStop` on commit.
         * Overview `runRecentreLikeButton` here stacked on top and read as 2–3 jumps.
         */
        const mwShelfHandlesCamera =
          isMobile && mobileSheetOpen && b2TripleMeetingMwShelfActive
        if (!mwShelfHandlesCamera) {
          runRecentreLikeButton(isMobile)
        }
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
        if (variantId !== 'c2') {
          setShowRecentre(false)
        }
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
        if (variantId === 'c2') {
          setShowRecentre(true)
        }
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
          isVariantTripleMeetingMapPickup(variantId) &&
          selStop?.kind === 'meeting' &&
          b2CommittedPickupId != null &&
          selStop.id === b2CommittedPickupId
        ) {
          overviewModeRef.current = true
          setShowRecentre(false)
          return
        }
        /** C2: meeting pin tap — teardrop + dropdown only; keep route overview (no `fitPoiInView`). */
        if (
          variantId === 'c2' &&
          selStop?.kind === 'meeting' &&
          lastSelectSource === 'map'
        ) {
          overviewModeRef.current = true
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
    b2TripleMeetingMwShelfActive,
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
        className={`relative h-[300px] w-full overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-50 md:h-[480px] [&_.maplibregl-ctrl-bottom-right]:!p-0 [&_.maplibregl-ctrl-attrib]:!m-0 [&_.maplibregl-ctrl-attrib]:!border-0 [&_.maplibregl-ctrl-attrib]:!bg-transparent [&_.maplibregl-ctrl-attrib]:!p-0 [&_.maplibregl-ctrl-attrib]:!shadow-none [&_.maplibregl-ctrl-attrib-inner]:text-[10px] [&_.maplibregl-ctrl-attrib-inner]:leading-snug [&_.maplibregl-ctrl-attrib]:text-[10px] [&_.maplibregl-ctrl-attrib]:leading-snug [&_.maplibregl-ctrl-attrib_a]:text-[10px] ${mobilePreviewCursor}`}
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
        {isMobile && !mobileSheetOpen ? (
          <button
            type="button"
            className={`absolute right-2.5 top-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-800 shadow-md shadow-stone-900/10 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 ${MAP_CHROME_ABOVE_MARKERS_CLASS}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMobileSheetOpen(true)
            }}
            aria-label="Open full screen map"
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden
            >
              <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        ) : null}
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <>
      <AnimatePresence>
        {isMobile && mobileSheetOpen ? (
            <motion.div
              key="map-modal-sheet"
              className="fixed inset-0 z-[101] flex min-h-0 flex-col overscroll-none bg-stone-50"
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
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-0 overflow-hidden">
                <div ref={sheetMapHostRef} className="absolute inset-0 min-h-0 bg-stone-50" />
              </div>
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
              <LayoutGroup id="mw-map-bottom-chrome">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[55] flex flex-col-reverse gap-4 overscroll-none px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                {b2TripleMeetingMwShelfActive || mobileModalDetailStop ? (
                  <motion.div
                    ref={mobileModalStopPanelMotionRef}
                    key="mobile-map-stop-shelf"
                    layout
                    className="pointer-events-auto w-[calc(100%_+_1.5rem)] max-w-none origin-bottom overflow-visible -mx-3"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.24,
                      ease: [0.4, 0, 0.2, 1],
                      layout: mwShelfLayoutTransition,
                    }}
                  >
                    <MobileMapModalStopShelf
                      shelfStops={mobileMapModalShelfStops}
                      selectedStopId={
                        mobileMapModalShelfSelectedStopId ||
                        mobileModalDetailStop?.id ||
                        mobileMapModalShelfStops[0]?.id ||
                        selectedStopId ||
                        ''
                      }
                      variantId={variantId}
                      stops={stops}
                      onDismiss={dismissMobileModalStopPanelAnimated}
                      onShelfCommitStop={handleMobileModalShelfSelect}
                      b2CommittedPickupId={b2CommittedPickupId}
                      shelfHubStopId={
                        b2TripleMeetingMwShelfActive ? MW_MAP_B2_SHELF_HUB_STOP_ID : ''
                      }
                      b2MeetingHubProps={b2MeetingHubProps}
                      onShelfCenterChange={
                        variantId === 'c2' ? handleMobileModalShelfCenterChange : undefined
                      }
                    />
                  </motion.div>
                ) : null}
              </div>
              </LayoutGroup>
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
            </>,
            document.body,
          )
        : null}
    </>
  )
}
