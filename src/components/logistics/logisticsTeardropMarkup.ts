import { isVariantBLayout, type Stop, type VariantId } from '../../data/variants'

/**
 * Teardrop SVG is shared by timeline + map pin tail.
 * Map-only: square photo head (`mapSelectedTeardropMarkerHtml`) above the teardrop; entrance animation is viewport-gated in `LogisticsMap`.
 */
export const MAP_POI_SELECTED_PIN_WIDTH_PX = 40
export const MAP_POI_SELECTED_PIN_HEIGHT_PX = 54

/** Square thumbnail above pin on map (Tailwind `h-20` / `w-20` = 80px). */
export const MAP_PIN_HEAD_PX = 80
/** Drops the photo block down from the stack top (`pt-8` / 32px); included in stack height math. */
export const MAP_PIN_HEAD_TOP_OFFSET_PX = 32
/** Teardrop sits under the image; shared vertical band (map-only negative margin). */
export const MAP_PIN_HEAD_TEARDROP_OVERLAP_PX = 16

/** Full selected map marker stack height — keep `LogisticsMap` min-height + `MAP_POI_SELECTED_PIN_OFFSET_Y` in sync. */
export const MAP_MAP_SELECTED_STACK_HEIGHT_PX =
  MAP_PIN_HEAD_TOP_OFFSET_PX +
  MAP_PIN_HEAD_PX +
  MAP_POI_SELECTED_PIN_HEIGHT_PX -
  MAP_PIN_HEAD_TEARDROP_OVERLAP_PX

/** Center-anchored marker vertical offset (photo + teardrop stack). */
export const MAP_POI_SELECTED_PIN_OFFSET_Y = -Math.round(MAP_MAP_SELECTED_STACK_HEIGHT_PX / 2)

/** After the photo head dismisses — teardrop-only height (`MAP_POI_SELECTED_PIN_HEIGHT_PX`). */
export const MAP_MAP_PIN_COLLAPSED_OFFSET_Y = -Math.round(MAP_POI_SELECTED_PIN_HEIGHT_PX / 2)

/**
 * White stroke in SVG user units — tuned with `viewBox` scale so on-screen weight matches
 * the map head photo `border-4` (4px CSS) at ~40×54 display size.
 */
export const MAP_POI_TEARDROP_STROKE_USER = 4

/** Padding so the stroke isn’t clipped (stroke is centered on the path outline). */
export const MAP_POI_TEARDROP_VIEWBOX = `-4 -4 35 44`

/** MapLibre-style pin silhouette — shared by numbered + pass-by teardrops. */
export const MAP_POI_TEARDROP_PATH_D =
  'M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z'

/** Tailwind `emerald-600` — matches green rail / disc markers */
export const MAP_EMERALD_TEARDROP_FILL = '#059669'

/**
 * Viator mark scale inside the meeting teardrop: same on-screen size as the rail
 * (`viatorMeetingMark`: 14px on 18×18 design) given `width={40}` and `viewBox` width 39.
 * 18 * s * (40/39) = 14 → s = (14/18) * (39/40)
 */
const MAP_MEETING_VIATOR_TEARDROP_ICON_SCALE = (14 / 18) * (39 / 40)

/** Viator paths from `assets/viator.svg`, centered on the pin ball (13.5, 13.5). */
function mapMeetingViatorTeardropIconG(): string {
  const s = MAP_MEETING_VIATOR_TEARDROP_ICON_SCALE
  return `<g transform="translate(13.5, 13.5) scale(${s}) translate(-9, -9)"><path d="M13.7529 6.61223C15.5677 6.61223 17.0389 5.13203 17.0389 3.30611C17.0389 1.4802 15.5677 0 13.7529 0C11.938 0 10.4668 1.4802 10.4668 3.30611C10.4668 5.13203 11.938 6.61223 13.7529 6.61223Z" fill="white"/><path d="M10.1357 17.9998L11.8518 14.1231L5.76402 0.367188H0L7.80382 17.9998H10.1357Z" fill="white"/></g>`
}

/** Teardrop `<svg>` — no mount animation (map adds `logistics-map-pin-in-view` when the pin intersects the **viewport**). Timeline uses as-is. */
const TEARDROP_SVG_CLASS =
  'logistics-map-pin-teardrop-shape pointer-events-none block h-[54px] w-10 shrink-0 overflow-visible'

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;')
}

function mapPinPhotoHeadHtml(stop: Stop): string {
  const src = stop.popupImageSrc?.trim()
  if (src) {
    return `<div class="logistics-map-pin-head-photo pointer-events-none box-border h-20 w-20 shrink-0 overflow-hidden rounded-md border-4 border-solid border-white bg-neutral-600 shadow-sm" aria-hidden="true"><img src="${escapeAttr(src)}" alt="" class="block h-full w-full object-cover"/></div>`
  }
  return `<div class="logistics-map-pin-head-photo pointer-events-none box-border h-20 w-20 shrink-0 rounded-md border-4 border-solid border-white bg-neutral-500 shadow-sm" aria-hidden="true"></div>`
}

function mapSelectedPinStackWrap(inner: string): string {
  return `<span class="logistics-map-selected-pin-stack flex flex-col items-center pointer-events-none">${inner}</span>`
}

/**
 * Map HTML marker only: white-bordered square image (or placeholder) above teardrop.
 * Teardrop animates in when `.logistics-map-pin-in-view` is added (see `LogisticsMap`).
 */
export function mapSelectedTeardropMarkerHtml(
  stop: Stop,
  poiOrder: number | null,
  options?: MapSelectedTeardropOptions,
): string {
  const teardropPart =
    stop.kind === 'passby'
      ? mapPassbySelectedTeardropHtml()
      : stop.kind === 'meeting'
        ? wrapMeetingTeardropWithOptionalB2Check(
            mapMeetingSelectedTeardropHtml(),
            options?.b2ShowCommittedCheck === true,
          )
        : stop.kind === 'end'
          ? mapEndSelectedTeardropHtml()
          : mapPoiSelectedTeardropHtml(poiOrder ?? 1)
  /** Single motion wrapper: one bounce for photo + teardrop (`pt-8` = 32px drop above photo). */
  return mapSelectedPinStackWrap(
    `<div class="logistics-map-pin-motion-wrap flex flex-col items-center shrink-0 pt-8">${mapPinPhotoHeadHtml(stop)}<span class="logistics-map-pin-teardrop-slot -mt-4 inline-flex shrink-0">${teardropPart}</span></div>`,
  )
}

export function mapPoiSelectedTeardropHtml(n: number): string {
  const fs = n >= 10 ? 11 : 13
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="${TEARDROP_SVG_CLASS}" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="#0a0a0a" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/><text x="13.5" y="13.5" dominant-baseline="central" text-anchor="middle" fill="#fff" font-size="${fs}" font-weight="600" font-family="Aeonik, system-ui, sans-serif">${n}</text></svg>`
}

export function mapPassbySelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="${TEARDROP_SVG_CLASS}" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="#0a0a0a" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/><circle cx="13.5" cy="13.5" r="3.25" fill="#fff"/></svg>`
}

export function mapMeetingSelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  return `<svg class="${TEARDROP_SVG_CLASS}" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="${MAP_EMERALD_TEARDROP_FILL}" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/>${mapMeetingViatorTeardropIconG()}</svg>`
}

/** B2: confirmation badge on committed pickup — **default meeting disc** on map (`absolute inset-0` wrapper). */
export function mapB2MeetingCommittedCheckBadgeHtml(): string {
  return `<span class="pointer-events-none absolute right-0 top-0 z-10 flex h-3.5 w-3.5 translate-x-[5px] -translate-y-[5px] items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-600/25" aria-hidden="true"><svg class="h-[9px] w-[9px] text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
}

/** B2: same badge, softer placement on **meeting teardrop** (down/left vs disc corner push). */
function mapB2MeetingTeardropCommittedCheckBadgeHtml(): string {
  return `<span class="pointer-events-none absolute -right-0.5 -top-0.5 z-10 flex h-3.5 w-3.5 -translate-x-1 translate-y-1 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-600/25" aria-hidden="true"><svg class="h-[9px] w-[9px] text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
}

function wrapMeetingTeardropWithOptionalB2Check(innerSvg: string, showCommittedCheck: boolean): string {
  if (!showCommittedCheck) return innerSvg
  return `<span class="relative inline-flex shrink-0 overflow-visible">${innerSvg}${mapB2MeetingTeardropCommittedCheckBadgeHtml()}</span>`
}

export type MapSelectedTeardropOptions = {
  /** B2 only: show check on teardrop when this pin is the committed pickup (caller gates with `active`). */
  b2ShowCommittedCheck?: boolean
}

export function mapEndSelectedTeardropHtml(): string {
  const sw = MAP_POI_TEARDROP_STROKE_USER
  const w = MAP_POI_SELECTED_PIN_WIDTH_PX
  const h = MAP_POI_SELECTED_PIN_HEIGHT_PX
  const d = MAP_POI_TEARDROP_PATH_D
  const flagG = `<g transform="translate(13.5, 13.5) scale(0.58) translate(-12, -12)"><path fill="white" d="M5 3h2v18H5zm3 3h12v7H8z"/></g>`
  return `<svg class="${TEARDROP_SVG_CLASS}" width="${w}" height="${h}" viewBox="${MAP_POI_TEARDROP_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="${MAP_EMERALD_TEARDROP_FILL}" stroke="#ffffff" stroke-width="${sw}" stroke-linejoin="round" d="${d}"/>${flagG}</svg>`
}

/** Same rules as map selected teardrop when overlap is not forcing compact mode. */
export function itineraryStopUsesTeardropWhenSelected(
  stop: Stop | undefined,
  variantId: VariantId,
  poiOrder: number | null,
): boolean {
  if (!stop) return false
  if (isVariantBLayout(variantId) && stop.kind === 'meeting') return true
  if (isVariantBLayout(variantId) && stop.kind === 'end') return true
  if (stop.kind === 'passby') return true
  return poiOrder != null
}

/**
 * Wrap timeline teardrop SVG in the same stack/motion structure as the map pin so
 * `index.css` (`logistics-map-pin-teardrop-in`) runs the bounce when `.logistics-map-pin-in-view` is present.
 */
function wrapTimelineTeardropForMapAnimation(innerSvg: string): string {
  return `<span class="logistics-map-selected-pin-stack logistics-map-pin-in-view block w-full"><span class="logistics-map-pin-motion-wrap inline-flex flex-col items-center justify-center shrink-0">${innerSvg}</span></span>`
}

/** HTML for timeline rail when the row is selected — teardrop only (no photo stack); matches map entrance motion. */
export function buildTimelineSelectedTeardropHtml(
  stop: Stop,
  variantId: VariantId,
  poiOrder: number | null,
): string | null {
  if (!itineraryStopUsesTeardropWhenSelected(stop, variantId, poiOrder)) return null
  let svg: string | null = null
  if (isVariantBLayout(variantId) && stop.kind === 'meeting') svg = mapMeetingSelectedTeardropHtml()
  else if (isVariantBLayout(variantId) && stop.kind === 'end') svg = mapEndSelectedTeardropHtml()
  else if (stop.kind === 'passby') svg = mapPassbySelectedTeardropHtml()
  else if (poiOrder != null) svg = mapPoiSelectedTeardropHtml(poiOrder)
  if (!svg) return null
  return wrapTimelineTeardropForMapAnimation(svg)
}
