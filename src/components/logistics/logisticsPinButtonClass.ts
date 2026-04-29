const LOGISTICS_PIN_BUTTON_BASE =
  'relative z-10 box-border flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full p-1 ring-4 transition-[box-shadow,filter] focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0'

/** Timeline rail discs only — visuals match numbered pins without hover/focus (row expands/collapses instead). */
const LOGISTICS_PIN_RAIL_DISPLAY_BASE =
  'relative z-10 box-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1 ring-4'

/** Pass-by legs: smaller disc — same `ring-4` white/black treatment as numbered POIs (no `overflow-hidden` or the ring clips). */
const LOGISTICS_PASSBY_PIN_BUTTON_BASE =
  'relative z-10 box-border flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full p-0 leading-none ring-4 transition-[box-shadow,filter] focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0'

const LOGISTICS_PASSBY_RAIL_DISPLAY_BASE =
  'relative z-10 box-border flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full p-0 leading-none ring-4'

/**
 * Shared by timeline rail pins and map markers.
 * Variant B meeting/end: green disc + emerald-800 selected ring; POIs: charcoal + black selected ring. Icons stay white.
 */
export function logisticsPinButtonClass(greenRail: boolean, selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = greenRail ? 'ring-emerald-800' : 'ring-black'
  }
  if (greenRail) {
    return `${LOGISTICS_PIN_BUTTON_BASE} bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 ${ring}`
  }
  return `${LOGISTICS_PIN_BUTTON_BASE} bg-[#333333] hover:bg-neutral-800 focus-visible:ring-black ${ring}`
}

/** Charcoal pass-by marker (map + timeline rail) — same palette as POI, tighter footprint. */
export function logisticsPassbyPinButtonClass(selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = 'ring-black'
  }
  return `${LOGISTICS_PASSBY_PIN_BUTTON_BASE} bg-[#333333] hover:bg-neutral-800 focus-visible:ring-black ${ring}`
}

/** Timeline rail pass-by dot — decorative only (`logisticsPinButtonClass` stays for interactive map pins). */
export function logisticsPassbyRailDiscClass(selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = 'ring-black'
  }
  return `${LOGISTICS_PASSBY_RAIL_DISPLAY_BASE} bg-[#333333] ${ring}`
}

/** Timeline rail meeting / POI / end discs — decorative only (`logisticsPinButtonClass` stays for interactive map pins). */
export function logisticsRailDiscClass(greenRail: boolean, selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = greenRail ? 'ring-emerald-800' : 'ring-black'
  }
  if (greenRail) {
    return `${LOGISTICS_PIN_RAIL_DISPLAY_BASE} bg-emerald-600 ${ring}`
  }
  return `${LOGISTICS_PIN_RAIL_DISPLAY_BASE} bg-[#333333] ${ring}`
}

/** Variant B meeting/end at compact size (overlap mode on map) — same 18px disc as pass-by, emerald rail. */
export function logisticsCompactGreenPinButtonClass(selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = 'ring-emerald-800'
  }
  return `${LOGISTICS_PASSBY_PIN_BUTTON_BASE} bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 ${ring}`
}
