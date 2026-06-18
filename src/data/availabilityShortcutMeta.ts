/** Availability shortcut — date / travelers row under “Upcoming availability” (`asMeta`). */
export const AVAILABILITY_META_QUERY = 'asMeta'

export type AvailabilityMetaDisplayId = 'chips' | 'inline'

export const DEFAULT_AVAILABILITY_META_DISPLAY: AvailabilityMetaDisplayId = 'chips'

export function isAvailabilityMetaDisplayId(value: string): value is AvailabilityMetaDisplayId {
  return value === 'chips' || value === 'inline'
}

export function parseAvailabilityMetaDisplay(raw: string | null): AvailabilityMetaDisplayId {
  if (raw != null && isAvailabilityMetaDisplayId(raw)) return raw
  return DEFAULT_AVAILABILITY_META_DISPLAY
}
