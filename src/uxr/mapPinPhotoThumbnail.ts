/** Facilitator-only: hero image above selected map teardrop pins (session storage). */
export const MAP_PIN_PHOTO_THUMBNAIL_KEY = 'uxr_map_pin_photo_thumbnail'

export function readMapPinPhotoThumbnail(): boolean {
  try {
    const v = sessionStorage.getItem(MAP_PIN_PHOTO_THUMBNAIL_KEY)
    if (v === '0') return false
    return true
  } catch {
    return true
  }
}

export function setMapPinPhotoThumbnail(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.removeItem(MAP_PIN_PHOTO_THUMBNAIL_KEY)
    else sessionStorage.setItem(MAP_PIN_PHOTO_THUMBNAIL_KEY, '0')
  } catch {
    /* ignore */
  }
}
