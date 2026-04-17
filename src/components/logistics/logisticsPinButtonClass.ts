const LOGISTICS_PIN_BUTTON_BASE =
  'relative z-10 box-border flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full p-1 shadow-sm ring-4 transition-[box-shadow,filter] focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0'

/** Pass-by legs: smaller disc — same `ring-4` white/black treatment as numbered POIs (no `overflow-hidden` or the ring clips). */
const LOGISTICS_PASSBY_PIN_BUTTON_BASE =
  'relative z-10 box-border flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full p-0 leading-none shadow-sm ring-4 transition-[box-shadow,filter] focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-0'

/**
 * Shared by timeline rail pins and map markers.
 * Variant B meeting/end: green disc + emerald-800 selected ring; POIs: charcoal + black selected ring. Icons stay white.
 * Selected adds a drop shadow so the pin lifts off the surface.
 */
export function logisticsPinButtonClass(greenRail: boolean, selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = greenRail ? 'ring-emerald-800' : 'ring-black'
  }
  const selectedDrop = selected ? ' drop-shadow-xl' : ''
  if (greenRail) {
    return `${LOGISTICS_PIN_BUTTON_BASE} bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 ${ring}${selectedDrop}`
  }
  return `${LOGISTICS_PIN_BUTTON_BASE} bg-[#333333] hover:bg-neutral-800 focus-visible:ring-black ${ring}${selectedDrop}`
}

/** Charcoal pass-by marker (map + timeline rail) — same palette as POI, tighter footprint. */
export function logisticsPassbyPinButtonClass(selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = 'ring-black'
  }
  const selectedDrop = selected ? ' drop-shadow-xl' : ''
  return `${LOGISTICS_PASSBY_PIN_BUTTON_BASE} bg-[#333333] hover:bg-neutral-800 focus-visible:ring-black ${ring}${selectedDrop}`
}

/** Variant B meeting/end at compact size (overlap mode on map) — same 18px disc as pass-by, emerald rail. */
export function logisticsCompactGreenPinButtonClass(selected: boolean): string {
  let ring = 'ring-white'
  if (selected) {
    ring = 'ring-emerald-800'
  }
  const selectedDrop = selected ? ' drop-shadow-md' : ''
  return `${LOGISTICS_PASSBY_PIN_BUTTON_BASE} bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 ${ring}${selectedDrop}`
}
