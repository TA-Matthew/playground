/** Traveler breakdown for availability shortcut pax picker (Figma 23785:27995). */
export type AvailabilityTravelerCounts = {
  readonly adults: number
  readonly children: number
  readonly infants: number
}

export const AVAILABILITY_MAX_TRAVELERS_TOTAL = 15

export const DEFAULT_AVAILABILITY_TRAVELER_COUNTS: AvailabilityTravelerCounts = {
  adults: 2,
  children: 0,
  infants: 0,
}

export function totalTravelers(counts: AvailabilityTravelerCounts): number {
  return counts.adults + counts.children + counts.infants
}

export function travelerCountsFromTotal(adults: number): AvailabilityTravelerCounts {
  return { adults, children: 0, infants: 0 }
}

export function areTravelerCountsEqual(
  a: AvailabilityTravelerCounts,
  b: AvailabilityTravelerCounts,
): boolean {
  return a.adults === b.adults && a.children === b.children && a.infants === b.infants
}
