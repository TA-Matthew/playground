import viatorSvgRaw from '../../assets/viator.svg?raw'

/**
 * Viator mark for variant B meeting point — map marker `innerHTML` and itinerary rail.
 */
export function viatorMeetingMarkSvgHtml(iconClassName: string): string {
  return viatorSvgRaw
    .trim()
    .replace('<svg ', `<svg class="${iconClassName}" aria-hidden="true" `)
}
