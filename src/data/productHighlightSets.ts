/**
 * Product highlight PDP — fixed four rows (Figma Labels 21489:112825).
 * @see https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=21489-112825
 */

export type ProductHighlightIconId =
  | 'star'
  | 'badge'
  | 'heart'
  | 'tag'
  | 'shield'
  | 'check'
  | 'pin'
  | 'ticket'
  | 'list'
  | 'user'
  | 'family'
  | 'thumbs'
  | 'wave-hand'

export type ProductHighlightItem = {
  icon: ProductHighlightIconId
  title: string
  subtext: string
}

/** Default PDP highlight list — four traveler-need rows. */
export const PRODUCT_HIGHLIGHT_ITEMS: readonly [
  ProductHighlightItem,
  ProductHighlightItem,
  ProductHighlightItem,
  ProductHighlightItem,
] = [
  {
    icon: 'thumbs',
    title: 'Quality travelers can trust',
    subtext: 'Rated 4.6/5 by over 13,600 reviewers who loved the expert guides.',
  },
  {
    icon: 'tag',
    title: 'Excellent Value',
    subtext: 'Skip the line and enjoy the full Vatican route in just 3 hours.',
  },
  {
    icon: 'user',
    title: 'Perfect for your solo trip',
    subtext: 'An engaging, social, and safe way for solo travelers to see the Vatican.',
  },
  {
    icon: 'wave-hand',
    title: 'Easy to meet the guide',
    subtext: 'Hundreds of reviews praise the prompt, stress-free check-in experience.',
  },
]
