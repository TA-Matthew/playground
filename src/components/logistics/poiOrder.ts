import type { Stop, VariantId } from '../../data/variants'

/**
 * 1-based POI sequence for timeline/map (skips variant B meeting + end, and `passby` legs).
 */
export function getPoiOrderForStopIndex(
  stops: Stop[],
  variantId: VariantId,
  index: number,
): number | null {
  const stop = stops[index]
  if (!stop) return null
  if (variantId === 'b' && (stop.kind === 'meeting' || stop.kind === 'end')) {
    return null
  }
  if (stop.kind === 'passby') {
    return null
  }
  if (variantId === 'a') {
    let n = 0
    for (let j = 0; j <= index; j++) {
      const s = stops[j]
      if (s && s.kind !== 'passby') {
        n += 1
      }
    }
    return n
  }
  let n = 0
  for (let j = 0; j <= index; j++) {
    const s = stops[j]
    if (s.kind !== 'meeting' && s.kind !== 'end' && s.kind !== 'passby') {
      n += 1
    }
  }
  return n
}
