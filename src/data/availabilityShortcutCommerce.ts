/** Availability shortcut — where tour-grade shortcuts render (`asCommerce`). */
export const AVAILABILITY_COMMERCE_QUERY = 'asCommerce'

export type AvailabilityCommerceModeId = 'main-column' | 'sticky-commerce' | 'modal'

/** @deprecated Share links — alias for {@link AvailabilityCommerceModeId} `modal`. */
export const LEGACY_MODAL_COMMERCE_MODE = 'sticky-commerce-modal'

export const DEFAULT_AVAILABILITY_COMMERCE_MODE: AvailabilityCommerceModeId = 'main-column'

export const AVAILABILITY_COMMERCE_MODE_OPTIONS = [
  {
    id: 'main-column' as const,
    label: 'Main column',
    title: 'Availability shortcuts in upcoming availability section',
  },
  {
    id: 'sticky-commerce' as const,
    label: 'Sticky commerce',
    title: 'Availability shortcuts in sticky booking sidebar (Figma 23804:21049)',
  },
  {
    id: 'modal' as const,
    label: 'Modal',
    title: 'Sidebar shortcuts; expanded options open in a modal',
  },
] as const satisfies ReadonlyArray<{
  id: AvailabilityCommerceModeId
  label: string
  title: string
}>

export function normalizeAvailabilityCommerceMode(raw: string | null): AvailabilityCommerceModeId {
  if (raw === LEGACY_MODAL_COMMERCE_MODE) return 'modal'
  if (raw != null && isAvailabilityCommerceModeId(raw)) return raw
  return DEFAULT_AVAILABILITY_COMMERCE_MODE
}

export function isAvailabilityCommerceModeId(value: string): value is AvailabilityCommerceModeId {
  return value === 'main-column' || value === 'sticky-commerce' || value === 'modal'
}

export function parseAvailabilityCommerceMode(raw: string | null): AvailabilityCommerceModeId {
  return normalizeAvailabilityCommerceMode(raw)
}

/** Sticky sidebar with filter chips and commerce option rows. */
export function usesStickyCommerceSidebar(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'sticky-commerce' || mode === 'modal'
}

/** @deprecated Prefer {@link usesStickyCommerceSidebar} or {@link loadsAvailabilityOptionsInMainColumn}. */
export function isStickyCommerceAvailabilityMode(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'sticky-commerce'
}

export function loadsAvailabilityOptionsInMainColumn(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'main-column' || mode === 'sticky-commerce'
}

export function loadsAvailabilityOptionsInModal(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'modal'
}
