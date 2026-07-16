/** Availability shortcut — where tour-grade shortcuts render (`asCommerce`). */
export const AVAILABILITY_COMMERCE_QUERY = 'asCommerce'

export type AvailabilityCommerceModeId = 'main-column' | 'sticky-commerce' | 'modal' | 'merged'

/** @deprecated Share links — alias for {@link AvailabilityCommerceModeId} `modal`. */
export const LEGACY_MODAL_COMMERCE_MODE = 'sticky-commerce-modal'

export const DEFAULT_AVAILABILITY_COMMERCE_MODE: AvailabilityCommerceModeId = 'merged'

/**
 * Facilitator bar options — `merged` is the only mode surfaced now; its shelf-in-card
 * behavior only changes anything on MW (desktop still renders the main-column layout).
 * `main-column` / `sticky-commerce` / `modal` remain valid ids (old share links) but are
 * no longer selectable from the facilitator bar.
 */
export const AVAILABILITY_COMMERCE_MODE_OPTIONS = [
  {
    id: 'merged' as const,
    label: 'Merged',
    title: 'MW: shortcut shelf + full options inline in the booking card (no Check Availability CTA)',
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
  return (
    value === 'main-column' ||
    value === 'sticky-commerce' ||
    value === 'modal' ||
    value === 'merged'
  )
}

/** MW only — shortcut shelf swaps for the full options panel inline in the booking card. */
export function usesMergedMobileCommerce(mode: AvailabilityCommerceModeId): boolean {
  return mode === 'merged'
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
