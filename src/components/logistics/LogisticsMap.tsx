import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Stop, VariantId } from '../../data/variants'
import type { SelectSource } from './Timeline'
import { getPoiOrderForStopIndex } from './poiOrder'
import { viatorMeetingMarkSvgHtml } from './viatorMeetingMark'
import {
  logisticsCompactGreenPinButtonClass,
  logisticsPassbyPinButtonClass,
  logisticsPinButtonClass,
} from './logisticsPinButtonClass'

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
  return `<span class="pointer-events-none flex h-[18px] min-w-[18px] items-center justify-center font-semibold leading-none text-white tabular-nums" style="font-size:${fs}px;line-height:1" aria-hidden="true">${n}</span>`
}

/**
 * Selected POI on the map: classic teardrop pin (black fill, white outline), number in the head — like a
 * standard map marker. Display size must stay in sync with wrapper / SVG / `setOffset` below.
 */
const MAP_POI_SELECTED_PIN_WIDTH_PX = 40
const MAP_POI_SELECTED_PIN_HEIGHT_PX = 54
/** Center-anchored marker: shift up so the tip stays on lng/lat (half of pin height). */
const MAP_POI_SELECTED_PIN_OFFSET_Y = -Math.round(MAP_POI_SELECTED_PIN_HEIGHT_PX / 2)

/**
 * White border in SVG **user units** (path coordinate space). The artboard is ~32 units wide for
 * ~32px CSS width, so values track ~px on screen. Previously `stroke-width="2"` (~2px) — too subtle.
 */
const MAP_POI_TEARDROP_STROKE_USER = 4
/** Padding so the stroke isn’t clipped (stroke is centered on the path outline). */
const MAP_POI_TEARDROP_VIEWBOX = `-4 -4 35 44`
/** MapLibre-style pin silhouette (viewBox 27×36 user units) — shared by numbered + pass-by teardrops. */
const MAP_POI_TEARDROP_PATH_D =
  'M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z'

/** Quadratic route bulge: control point offset as a fraction of segment length. Higher = deeper arch. */
const MAP_ROUTE_CURVE_BULGE = 0.4

function mapPoiSelectedTeardropHtml(n: number): string {
  const fs = n >= 10 ? 11 : 13
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="pointer-events-none block h-[54px] w-10 shrink-0 overflow-visible drop-shadow-xl animate-logistics-map-pin-teardrop-in" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="#0a0a0a" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/><text x="13.5" y="13.5" dominant-baseline="central" text-anchor="middle" fill="#fff" font-size="${fs}" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${n}</text></svg>`
}

/** Pass-by: same teardrop shell; white dot in the head instead of a number. */
function mapPassbySelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="pointer-events-none block h-[54px] w-10 shrink-0 overflow-visible drop-shadow-xl animate-logistics-map-pin-teardrop-in" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="#0a0a0a" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/><circle cx="13.5" cy="13.5" r="3.25" fill="#fff"/></svg>`
}

/** Tailwind `emerald-600` — matches green rail / disc markers */
const MAP_EMERALD_TEARDROP_FILL = '#059669'

/** Viator mark paths from `assets/viator.svg`, scaled into the pin head (user space). */
const MAP_VIATOR_TEARDROP_ICON_G = `<g transform="translate(13.5, 13.5) scale(0.78) translate(-9, -9)"><path d="M13.7529 6.61223C15.5677 6.61223 17.0389 5.13203 17.0389 3.30611C17.0389 1.4802 15.5677 0 13.7529 0C11.938 0 10.4668 1.4802 10.4668 3.30611C10.4668 5.13203 11.938 6.61223 13.7529 6.61223Z" fill="white"/><path d="M10.1357 17.9998L11.8518 14.1231L5.76402 0.367188H0L7.80382 17.9998H10.1357Z" fill="white"/></g>`

/** Variant B meeting — emerald teardrop + white Viator icon in the head. */
function mapMeetingSelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="pointer-events-none block h-[54px] w-10 shrink-0 overflow-visible drop-shadow-xl animate-logistics-map-pin-teardrop-in" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="${MAP_EMERALD_TEARDROP_FILL}" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/>${MAP_VIATOR_TEARDROP_ICON_G}</svg>`
}

/** Variant B end — emerald teardrop + white flag in the head. */
function mapEndSelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  const flagG = `<g transform="translate(13.5, 13.5) scale(0.58) translate(-12, -12)"><path fill="white" d="M5 3h2v18H5zm3 3h12v7H8z"/></g>`
  return `<svg class="pointer-events-none block h-[54px] w-10 shrink-0 overflow-visible drop-shadow-xl animate-logistics-map-pin-teardrop-in" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="${MAP_EMERALD_TEARDROP_FILL}" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/>${flagG}</svg>`
}

/** Selected map marker uses the large teardrop when active (POI, pass-by, or variant B meeting/end), unless overlap forces compact. */
function isMapTeardropPin(
  active: boolean,
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
): boolean {
  if (overlapCompact) return false
  if (!active) return false
  if (variantId === 'b' && stop?.kind === 'meeting') return true
  if (variantId === 'b' && stop?.kind === 'end') return true
  if (stop?.kind === 'passby') return true
  return poiOrder != null
}

function markerSvgForStop(
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
): string {
  if (variantId === 'b' && stop?.kind === 'meeting') {
    if (overlapCompact) return MAP_PASSBY_DOT_HTML
    return MAP_MEETING_VIATOR_SVG
  }
  if (variantId === 'b' && stop?.kind === 'end') {
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
  return variantId === 'b' && (stop?.kind === 'meeting' || stop?.kind === 'end')
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

/** Map-only marker chrome: selected → teardrop SVG (charcoal or emerald); else disc / compact. */
function mapMarkerWrapperClass(
  stop: Stop | undefined,
  variantId: VariantId,
  active: boolean,
  poiOrder: number | null,
  overlapCompact: boolean,
): string {
  if (isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)) {
    const focusRing =
      variantId === 'b' && (stop?.kind === 'meeting' || stop?.kind === 'end')
        ? 'focus-visible:ring-emerald-600'
        : 'focus-visible:ring-black'
    return `flex h-[54px] w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0 ${focusRing}`
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
const MAP_POI_POPUP_Z_INDEX = '100'

function applyMarkerSelectedState(
  el: HTMLElement,
  active: boolean,
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
  overlapCompact: boolean,
) {
  /** MapLibre adds `maplibregl-marker` (position:absolute;inset 0) and anchor classes. Replacing
   * `className` wholesale removes them and breaks alignment with the GL route line. */
  const maplibreglClasses = [...el.classList].filter((c) => c.startsWith('maplibregl-'))
  const teardrop = isMapTeardropPin(active, stop, variantId, poiOrder, overlapCompact)

  const wasActive = el.dataset.mapPinActive === '1'
  el.dataset.mapPinActive = active ? '1' : '0'

  /** Avoid replacing identical markup so teardrop CSS animation does not restart on every effect run. */
  const compactTag = overlapCompact ? ':c' : ':f'
  const nextHtmlKey = teardrop
    ? stop?.kind === 'passby'
      ? 'td:passby'
      : stop?.kind === 'meeting'
        ? 'td:meeting'
        : stop?.kind === 'end'
          ? 'td:end'
          : `td:${poiOrder}`
    : `pl:${variantId}:${stop?.id ?? ''}:${poiOrder ?? ''}${compactTag}`
  const prevHtmlKey = el.getAttribute('data-marker-html-key') ?? ''
  if (prevHtmlKey !== nextHtmlKey) {
    if (teardrop) {
      if (stop?.kind === 'passby') {
        el.innerHTML = mapPassbySelectedTeardropHtml()
      } else if (stop?.kind === 'meeting') {
        el.innerHTML = mapMeetingSelectedTeardropHtml()
      } else if (stop?.kind === 'end') {
        el.innerHTML = mapEndSelectedTeardropHtml()
      } else {
        el.innerHTML = mapPoiSelectedTeardropHtml(poiOrder!)
      }
    } else {
      el.innerHTML = markerSvgForStop(stop, variantId, poiOrder, overlapCompact)
    }
    el.setAttribute('data-marker-html-key', nextHtmlKey)
  }

  let cls = mapMarkerWrapperClass(stop, variantId, active, poiOrder, overlapCompact)
  if (active && !wasActive && !teardrop) {
    cls += ' animate-logistics-map-pin-disc-in'
  }
  el.className = [...maplibreglClasses, cls].join(' ')
  el.style.zIndex = active ? MAP_MARKER_Z_SELECTED : MAP_MARKER_Z_INACTIVE
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

/** Clears transform padding so `fitBounds` uses the full canvas (see overview fit below). */
const ZERO_PADDING: maplibregl.PaddingOptions = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

/**
 * Inset from canvas edges for `fitBounds` only (top: “Re-centre” control, right: zoom stack).
 * Do not combine with `setPadding(POI_VIEW_PADDING)` here — that double-count was clipping pins.
 */
const OVERVIEW_FIT_PADDING: maplibregl.PaddingOptions = {
  top: 56,
  bottom: 52,
  left: 32,
  right: 80,
}

/**
 * Narrow viewports (inline preview + full-screen sheet). Tighter than desktop so the default overview
 * sits closer to the route. **Decrease** to zoom in further (leave room for Re-centre + zoom stack).
 */
const OVERVIEW_FIT_PADDING_MOBILE: maplibregl.PaddingOptions = {
  top: 26,
  bottom: 22,
  left: 8,
  right: 34,
}

/** Upper bound for zoom when fitting tight areas; keep high so we don’t force an overly wide world view. */
const OVERVIEW_MAX_ZOOM = 22

/** Optional tighter cap for mobile overview (lower = never zoom in past this level). Usually padding drives zoom. */
const OVERVIEW_MAX_ZOOM_MOBILE = OVERVIEW_MAX_ZOOM

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

type MapInteractionMode = 'desktop' | 'mobile-preview' | 'mobile-sheet'

function syncMapInteractions(map: maplibregl.Map, mode: MapInteractionMode) {
  const coop = map.cooperativeGestures
  coop.disable()
  if (mode === 'desktop' || mode === 'mobile-sheet') {
    map.dragPan.enable()
    map.scrollZoom.enable()
    map.doubleClickZoom.enable()
    map.touchZoomRotate.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
  } else {
    map.dragPan.disable()
    map.scrollZoom.disable()
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
}

const POI_POPUP_EDGE_PAD_PX = 12
/** Vertical gap (px) between map anchor and popup card — larger so the card clears the teardrop pin. */
const POI_POPUP_OFFSET_FROM_ANCHOR_PX = 64
/** Marker button uses `h-8 w-8` (32px); MapLibre default anchor is center on the lng/lat. */
const MAP_MARKER_SCREEN_PX = 32

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
  const title = stop.title?.trim() || 'Stop'
  const meta = stop.durationLine ? parseDurationAndAdmission(stop.durationLine.trim()) : null

  const descPreview =
    isMobilePopup && stop.description?.trim()
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
    meta != null
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

  const html = `<div class="flex max-h-[min(50svh,320px)] min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-900/12 ring-1 ring-stone-200/90">
    <div class="shrink-0 bg-gradient-to-br from-stone-50 via-white to-stone-50/80 px-4 pb-3 pt-4">
      <h3 class="text-[15px] font-semibold leading-snug tracking-tight text-stone-900">${escapeHtml(title)}</h3>
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

/** Union of all stop coordinates and the curved itinerary polyline (bulges can sit outside stop hull). */
function computeOverviewBounds(stopCoords: [number, number][], mobile?: boolean): maplibregl.LngLatBounds {
  const b = new maplibregl.LngLatBounds(stopCoords[0], stopCoords[0])
  for (const c of stopCoords) {
    b.extend(c)
  }
  const path = buildCurvedRouteLngLat(stopCoords)
  for (const c of path) {
    b.extend(c)
  }
  const padFactor = mobile ? 0.19 : 0.26
  return expandBoundsGeographic(b, padFactor)
}

/** Default / “Show all stops”: full canvas for fitting, single padding pass, no POI chrome inset. */
function fitRouteOverview(
  map: maplibregl.Map,
  coords: [number, number][],
  options: { duration: number; isMobile?: boolean },
) {
  if (coords.length === 0) return
  map.resize()
  map.setPadding(ZERO_PADDING)
  const mobile = options.isMobile === true
  const bounds = computeOverviewBounds(coords, mobile)
  map.fitBounds(bounds, {
    padding: mobile ? OVERVIEW_FIT_PADDING_MOBILE : OVERVIEW_FIT_PADDING,
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
  const onIdleChain = (step: number) => {
    map.once('idle', () => {
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

  map.stop()
  map.resize()
  map.setPadding(ZERO_PADDING)
  const overlap0 = computeOverlapCompactByIndex(routeCoords, map)
  const startTight = overlap0[focusIndex] ?? false
  const [lng, lat] = center
  const d = startTight ? 0.000055 : 0.00018
  const maxZoom = startTight ? 17.25 : 16
  const bounds = new maplibregl.LngLatBounds([lng - d, lat - d], [lng + d, lat + d])
  map.fitBounds(bounds, {
    padding: POI_VIEW_PADDING,
    maxZoom,
    duration: initialDuration,
    linear: true,
    essential: true,
  })
  onIdleChain(0)
}

type Props = {
  variantId: VariantId
  routeLngLat: [number, number][]
  mapKey: string
  stops: Stop[]
  selectedStopId: string
  /** Last channel used to change selection — list/accordion must not move the map on mobile. */
  lastSelectSource: SelectSource
  /** When false, all pins stay the default black style until the user has selected a POI once. */
  highlightSelectedPin: boolean
  onSelectStop: (id: string, source: SelectSource) => void
  /** Called when Re-centre is used — clear list/map selection in the parent. */
  onRecentre?: () => void
}

export function LogisticsMap({
  variantId,
  routeLngLat,
  mapKey,
  stops,
  selectedStopId,
  lastSelectSource,
  highlightSelectedPin,
  onSelectStop,
  onRecentre,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const previewMapHostRef = useRef<HTMLDivElement>(null)
  const sheetMapHostRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const markerElsRef = useRef<HTMLButtonElement[]>([])
  const stopsRef = useRef(stops)
  const onSelectRef = useRef(onSelectStop)
  /** After map ready, first run only syncs markers — no camera move so landing keeps `fitBounds` overview. */
  const previousSelectionForCameraRef = useRef<string | undefined>(undefined)
  /** Detect `highlightSelectedPin` false → true so zoom runs when user first engages the default-selected POI. */
  const prevHighlightForCameraRef = useRef(false)
  /** When true, debounced resize refits the route overview; false after POI focus or manual zoom. */
  const overviewModeRef = useRef(true)
  const routeCoordsRef = useRef(routeLngLat)
  /** After initial overview has settled — before this, `moveend` is ignored for “Re-centre” visibility. */
  const trackRecentreHintRef = useRef(false)
  /** Ignore `moveend` until this time (ms) so programmatic `fitBounds` does not reveal Re-centre. */
  const ignoreMoveEndForRecentreUntilRef = useRef(0)

  const variantIdRef = useRef(variantId)
  const selectedStopIdRef = useRef(selectedStopId)
  const highlightSelectedPinRef = useRef(highlightSelectedPin)
  const lastSelectSourceRef = useRef(lastSelectSource)
  /** Re-applies marker HTML/classes/offset from current selection + screen-space overlap. */
  const syncMarkersAppearanceRef = useRef<() => void>(() => {})

  const interactionRef = useRef({ isMobile: false, sheetOpen: false })
  const poiPopupRef = useRef<maplibregl.Popup | null>(null)
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

  interactionRef.current = { isMobile, sheetOpen: mobileSheetOpen }

  variantIdRef.current = variantId
  selectedStopIdRef.current = selectedStopId
  highlightSelectedPinRef.current = highlightSelectedPin
  lastSelectSourceRef.current = lastSelectSource
  isMobileRef.current = isMobile

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
    /** Mobile inline preview only: pins stay neutral. Desktop + mobile modal use teardrop when selected. */
    const mapInPageEmbed =
      isMobileRef.current && !mobileSheetOpenRef.current
    const showMapPinSelected =
      !mapInPageEmbed &&
      highlightSelectedPinRef.current &&
      !(isMobileRef.current && lastSelectSourceRef.current === 'list')

    markerElsRef.current.forEach((el, i) => {
      const active = selIdx >= 0 && showMapPinSelected && i === selIdx
      const poiOrder = getPoiOrderForStopIndex(stopsLocal, vid, i)
      const oc = mapInPageEmbed ? true : (overlap[i] ?? false)
      applyMarkerSelectedState(el, active, stopsLocal[i], vid, poiOrder, oc)
      const teardrop = isMapTeardropPin(active, stopsLocal[i], vid, poiOrder, oc)
      markersRef.current[i]?.setOffset(teardrop ? [0, MAP_POI_SELECTED_PIN_OFFSET_Y] : [0, 0])
    })
  }

  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false)
  }, [])

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
    const map = mapRef.current
    if (!mapReady || !map) return
    const root = map.getContainer()
    const onReadMore = (e: MouseEvent) => {
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
      scrollZoom: true,
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
      setShowRecentre(true)
    }
    map.on('moveend', revealRecentreIfAllowed)
    map.on('dragstart', revealRecentreIfAllowed)
    map.on('zoomstart', revealRecentreIfAllowed)

    const resize = () => {
      map.resize()
    }

    let resizeOverviewTimer: ReturnType<typeof setTimeout> | undefined
    let attributionCollapseTimer: ReturnType<typeof setTimeout> | undefined
    let attributionFadeFallbackTimer: ReturnType<typeof setTimeout> | undefined
    const scheduleOverviewRefit = () => {
      window.clearTimeout(resizeOverviewTimer)
      resizeOverviewTimer = window.setTimeout(() => {
        if (cancelled || !overviewModeRef.current) return
        const m = mapRef.current
        if (!m) return
        bumpIgnoreMoveEnd(80)
        fitRouteOverview(m, routeCoordsRef.current, {
          duration: 0,
          isMobile: interactionRef.current.isMobile,
        })
        requestAnimationFrame(() => syncMarkersAppearanceRef.current())
      }, 140)
    }

    const ro = new ResizeObserver(() => {
      resize()
      scheduleOverviewRefit()
    })
    if (wrapRef.current) ro.observe(wrapRef.current)

    window.addEventListener('orientationchange', resize)

    requestAnimationFrame(() => {
      resize()
      requestAnimationFrame(resize)
    })

    const onLoad = () => {
      if (cancelled) return
      const safeKey = mapKey.replace(/[^a-zA-Z0-9_-]/g, '')
      const idRoute = `route-${safeKey}`
      const idLine = `route-line-${safeKey}`

      const curvedCoords = buildCurvedRouteLngLat(routeLngLat)

      map.addSource(idRoute, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: curvedCoords,
          },
        },
      })

      map.addLayer({
        id: idLine,
        type: 'line',
        source: idRoute,
        layout: {
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
        markerEl.className = mapMarkerWrapperClass(stopAtI, variantId, false, poiOrder, false)
        markerEl.innerHTML = markerSvgForStop(stopAtI, variantId, poiOrder, false)
        markerEl.setAttribute(
          'data-marker-html-key',
          `pl:${variantId}:${stopAtI?.id ?? ''}:${poiOrder ?? ''}:f`,
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

            // Mobile sheet: teardrop + popup on the same tap; camera zoom runs in parallel (next frames).
            if (mobile && sheetOpen) {
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
              openPoiPopup(map, coord, stop, poiPopupRef, { isMobile: true })
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  runMobileModalPoiFocus(map, coord, routeCoordsRef.current, i, POI_FOCUS_DURATION_MS)
                })
              })
              return
            }

            onSelectRef.current(stop.id, 'map')
            openPoiPopup(map, coord, stop, poiPopupRef, { isMobile: false })
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
        fitRouteOverview(map, routeLngLat, { duration: 0, isMobile: initialMobile })
      }
      applyOverview()
      requestAnimationFrame(() => {
        applyOverview()
        requestAnimationFrame(applyOverview)
      })
      map.once('idle', () => {
        if (cancelled) return
        bumpIgnoreMoveEnd(80)
        fitRouteOverview(map, routeLngLat, { duration: 0, isMobile: initialMobile })
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
      window.clearTimeout(resizeOverviewTimer)
      window.clearTimeout(attributionCollapseTimer)
      window.clearTimeout(attributionFadeFallbackTimer)
      overviewModeRef.current = true
      trackRecentreHintRef.current = false
      map.off('moveend', revealRecentreIfAllowed)
      map.off('dragstart', revealRecentreIfAllowed)
      map.off('zoomstart', revealRecentreIfAllowed)
      if (onMarkerOverlapSync) {
        map.off('moveend', onMarkerOverlapSync)
        map.off('zoomend', onMarkerOverlapSync)
      }
      if (onMoveForOverlap) map.off('move', onMoveForOverlap)
      cancelAnimationFrame(overlapRaf)
      map.off('load', onLoad)
      ro.disconnect()
      window.removeEventListener('orientationchange', resize)
      poiPopupRef.current?.remove()
      poiPopupRef.current = null
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerElsRef.current = []
      map.remove()
      mapRef.current = null
      setMapReady(false)
      setShowRecentre(false)
    }
  }, [mapKey, routeLngLat, variantId])

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
        ignoreMoveEndForRecentreUntilRef.current = Math.max(
          ignoreMoveEndForRecentreUntilRef.current,
          Date.now() + 150,
        )
        fitRouteOverview(map, routeCoordsRef.current, { duration: 0, isMobile: true })
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
      fitRouteOverview(map, routeCoordsRef.current, { duration: 0, isMobile: true })
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

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

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
        fitRouteOverview(map, routeCoordsRef.current, { duration: 600, isMobile: false })
      }
      return
    }

    syncMarkersAppearanceRef.current()

    const previous = previousSelectionForCameraRef.current
    previousSelectionForCameraRef.current = selectedStopId

    const highlightJustEnabled =
      highlightSelectedPin && !prevHighlightForCameraRef.current

    try {
      // Landing: mobile preview keeps overview; desktop may zoom on first POI selection too.
      if (previous === undefined) {
        if (isMobile) return
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
    variantId,
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
        className={`relative h-[200px] w-full overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-50 shadow-sm shadow-stone-900/5 ring-1 ring-stone-200/50 md:h-[480px] [&_.maplibregl-ctrl-attrib]:text-[10px] [&_.maplibregl-ctrl-attrib]:leading-snug [&_.maplibregl-ctrl-attrib_a]:text-[10px] ${mobilePreviewCursor}`}
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
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 flex -translate-x-1/2 justify-center">
            <button
              type="button"
              disabled={!mapReady}
              className="pointer-events-auto rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-[12px] font-medium text-stone-800 shadow-md shadow-stone-900/5 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                poiPopupRef.current?.remove()
                poiPopupRef.current = null
                setPoiDescriptionSheet(null)
                onRecentre?.()
                const m = mapRef.current
                if (!m) return
                m.stop()
                overviewModeRef.current = true
                setShowRecentre(false)
                ignoreMoveEndForRecentreUntilRef.current = Math.max(
                  ignoreMoveEndForRecentreUntilRef.current,
                  Date.now() + 950,
                )
                fitRouteOverview(m, routeLngLat, { duration: 800, isMobile: false })
              }}
              aria-label="Re-centre map on the full itinerary"
            >
              Re-centre
            </button>
          </div>
        ) : null}
        {showDesktopChrome ? (
          <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-0.5 overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-md backdrop-blur-sm">
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
          <>
            <motion.button
              key="map-modal-scrim"
              type="button"
              className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[1px]"
              aria-label="Close map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              onClick={closeMobileSheet}
            />
            <motion.div
              key="map-modal-sheet"
              className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-200/80"
              style={{ height: 'min(90vh, 90dvh)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Full map"
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
          <div className="flex h-full min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 px-4 py-3">
              <span className="text-base font-semibold tracking-tight text-stone-900">Map</span>
              <button
                type="button"
                onClick={closeMobileSheet}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 active:bg-stone-200"
              >
                Close
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div ref={sheetMapHostRef} className="absolute inset-0 min-h-0 bg-stone-50" />
              {showRecentre ? (
                <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 flex -translate-x-1/2 justify-center">
                  <button
                    type="button"
                    disabled={!mapReady}
                    className="pointer-events-auto rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-[12px] font-medium text-stone-800 shadow-md shadow-stone-900/5 ring-1 ring-stone-200/80 backdrop-blur-sm transition hover:bg-stone-50 active:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      poiPopupRef.current?.remove()
                      poiPopupRef.current = null
                      setPoiDescriptionSheet(null)
                      onRecentre?.()
                      const m = mapRef.current
                      if (!m) return
                      m.stop()
                      overviewModeRef.current = true
                      setShowRecentre(false)
                      ignoreMoveEndForRecentreUntilRef.current = Math.max(
                        ignoreMoveEndForRecentreUntilRef.current,
                        Date.now() + 950,
                      )
                      fitRouteOverview(m, routeLngLat, { duration: 800, isMobile: true })
                    }}
                    aria-label="Re-centre map on the full itinerary"
                  >
                    Re-centre
                  </button>
                </div>
              ) : null}
              <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-0.5 overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-md backdrop-blur-sm">
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
            </div>
          </div>
            </motion.div>
          </>
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
                  className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-stone-900"
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
