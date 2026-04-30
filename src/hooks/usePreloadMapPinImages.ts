import { useEffect } from 'react'
import type { Stop } from '../data/variants'

/**
 * Warms HTTP cache for itinerary/map pin photos (`popupImageSrc`) so marker heads and
 * popups don’t flash empty on first hover/focus after paint.
 */
export function usePreloadMapPinImages(stops: readonly Stop[]) {
  useEffect(() => {
    const urls = new Set<string>()
    for (const s of stops) {
      const src = s.popupImageSrc?.trim()
      if (src) urls.add(src)
    }
    if (urls.size === 0) return undefined

    const imgs: HTMLImageElement[] = []
    for (const src of urls) {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      imgs.push(img)
    }

    return () => {
      for (const img of imgs) {
        img.src = ''
      }
    }
  }, [stops])
}
