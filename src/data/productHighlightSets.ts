/**
 * Product highlight PDP experiment — preset copy aligned to in-scope themes
 * (social proof, pricing/value, inclusion, flexibility, cohort suitability).
 */

export const PRODUCT_HIGHLIGHT_SET_QUERY = 'phSet'

export type ProductHighlightSetId =
  | 'balanced'
  | 'social-quality'
  | 'value-flex'
  | 'inclusion-logistics'
  | 'cohort-solo'

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

export type ProductHighlightItem = {
  icon: ProductHighlightIconId
  title: string
  subtext: string
}

export type ProductHighlightSet = {
  id: ProductHighlightSetId
  /** Short label for facilitator buttons */
  facilitatorLabel: string
  /** One-line description of the angle */
  angle: string
  items: [ProductHighlightItem, ProductHighlightItem, ProductHighlightItem]
}

const SET_IDS: ProductHighlightSetId[] = [
  'balanced',
  'social-quality',
  'value-flex',
  'inclusion-logistics',
  'cohort-solo',
]

export const DEFAULT_PRODUCT_HIGHLIGHT_SET: ProductHighlightSetId = 'balanced'

export function isProductHighlightSetId(v: string): v is ProductHighlightSetId {
  return (SET_IDS as readonly string[]).includes(v)
}

export const PRODUCT_HIGHLIGHT_SETS: ProductHighlightSet[] = [
  {
    id: 'balanced',
    facilitatorLabel: 'Balanced mix',
    angle: 'One highlight each from trust, inclusion, and flexibility.',
    items: [
      {
        icon: 'star',
        title: 'Trusted by many guests',
        subtext:
          'Rated 4.6 from over 13,000 reviews, and most guests say they would recommend this tour.',
      },
      {
        icon: 'check',
        title: 'Inclusions that matter',
        subtext:
          'Your mobile ticket, English-speaking guide, and Vatican route are included for a focused visit.',
      },
      {
        icon: 'shield',
        title: 'Book with confidence',
        subtext:
          'You can cancel for free up to 24 hours before your start time when your booking date qualifies.',
      },
    ],
  },
  {
    id: 'social-quality',
    facilitatorLabel: 'Social proof & quality',
    angle: 'Ratings, recommendation, and excellence signals.',
    items: [
      {
        icon: 'star',
        title: 'Highly rated',
        subtext:
          'Guests give it 4.6 stars on average, and about nine in ten say they would recommend it.',
      },
      {
        icon: 'badge',
        title: 'Badge of Excellence',
        subtext:
          'Viator recognizes this operator for strong service, on top of consistently high guest ratings.',
      },
      {
        icon: 'heart',
        title: 'What guests love',
        subtext:
          'Recent reviewers often praise the guides, the pacing, and seeing the main Vatican highlights.',
      },
    ],
  },
  {
    id: 'value-flex',
    facilitatorLabel: 'Value & flexibility',
    angle: 'Pricing levers plus cancellation and time well spent.',
    items: [
      {
        icon: 'tag',
        title: 'Transparent value',
        subtext:
          'You see a clear starting price, with promotions and child discounts when you choose your date and party size.',
      },
      {
        icon: 'shield',
        title: 'Free cancellation',
        subtext:
          'You can cancel up to 24 hours before for a full refund when your booking qualifies.',
      },
      {
        icon: 'check',
        title: 'Time well spent',
        subtext:
          'The route covers the Vatican Museums, Sistine Chapel, and St. Peter’s in about three focused hours.',
      },
    ],
  },
  {
    id: 'inclusion-logistics',
    facilitatorLabel: 'Inclusions & logistics',
    angle: 'Pickup, tickets, language, and expectation-setting.',
    items: [
      {
        icon: 'pin',
        title: 'Meeting & access',
        subtext:
          'Clear meeting-point directions help you arrive ready, with pickup on some booking options.',
      },
      {
        icon: 'ticket',
        title: 'Tickets & language',
        subtext:
          'Your mobile ticket and English-speaking guide cover entry and commentary at the main Vatican sites.',
      },
      {
        icon: 'list',
        title: 'Know before you go',
        subtext:
          'You can see what is included and what costs extra before you book, so the day matches your expectations.',
      },
    ],
  },
  {
    id: 'cohort-solo',
    facilitatorLabel: 'Cohort suitability',
    angle: 'Solo, families, and reducing self-driven research.',
    items: [
      {
        icon: 'user',
        title: 'Solo-friendly format',
        subtext:
          'A small-group tour makes it easy to join on your own without organizing a private booking.',
      },
      {
        icon: 'family',
        title: 'Families & ages',
        subtext:
          'Child prices and age limits show at checkout when you add kids or teens to your booking.',
      },
      {
        icon: 'thumbs',
        title: 'Less guesswork',
        subtext:
          'The main details about this tour are summarized here so you spend less time reading the full listing.',
      },
    ],
  },
]

export function getProductHighlightSet(id: ProductHighlightSetId): ProductHighlightSet {
  const found = PRODUCT_HIGHLIGHT_SETS.find((s) => s.id === id)
  if (found) return found
  const fallback = PRODUCT_HIGHLIGHT_SETS.find((s) => s.id === DEFAULT_PRODUCT_HIGHLIGHT_SET)
  return fallback ?? PRODUCT_HIGHLIGHT_SETS[0]
}
