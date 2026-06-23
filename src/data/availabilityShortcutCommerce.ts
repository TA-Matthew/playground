/** Availability shortcut — where tour-grade shortcuts render (`asCommerce`). */
export const AVAILABILITY_COMMERCE_QUERY = 'asCommerce'

export type AvailabilityCommerceModeId = 'main-column' | 'sticky-commerce'

export const DEFAULT_AVAILABILITY_COMMERCE_MODE: AvailabilityCommerceModeId = 'main-column'

export function isAvailabilityCommerceModeId(value: string): value is AvailabilityCommerceModeId {
  return value === 'main-column' || value === 'sticky-commerce'
}

export function parseAvailabilityCommerceMode(raw: string | null): AvailabilityCommerceModeId {
  if (raw != null && isAvailabilityCommerceModeId(raw)) return raw
  return DEFAULT_AVAILABILITY_COMMERCE_MODE
}

export function isStickyCommerceAvailabilityMode(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'sticky-commerce'
}
