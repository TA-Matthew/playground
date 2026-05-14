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
          '4.6★ from 13,603 reviews with a strong recommendation rate—social proof you can scan in seconds.',
      },
      {
        icon: 'check',
        title: 'Inclusions that matter',
        subtext:
          'Mobile ticket, English-speaking guide, and a tight Vatican itinerary—critical facts before you read every line.',
      },
      {
        icon: 'shield',
        title: 'Book with confidence',
        subtext:
          'Free cancellation up to 24 hours before when your date is eligible—check checkout for your exact policy.',
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
          '4.6 average · 13,603 reviews · 91% of travelers recommend this experience—quality you can validate quickly.',
      },
      {
        icon: 'badge',
        title: 'Badge of Excellence',
        subtext:
          'Viator-recognized quality on top of strong ratings—an extra signal beyond stars alone.',
      },
      {
        icon: 'heart',
        title: 'What guests love',
        subtext:
          'Reviewers often praise guides, pacing, and sights—themes that match what you are hoping this tour delivers.',
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
          'Clear “from” pricing with room for promotions and kids’ discounts when you pick travelers and dates.',
      },
      {
        icon: 'shield',
        title: 'Free cancellation',
        subtext:
          'Cancel free up to 24 hours before on eligible bookings—see checkout for the policy on your specific date.',
      },
      {
        icon: 'check',
        title: 'Time well spent',
        subtext:
          'About three hours focused on the Vatican, Sistine Chapel, and St. Peter’s—efficient coverage without filler.',
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
          'Straightforward meeting-point instructions; pickup options may apply depending on how you configure the booking.',
      },
      {
        icon: 'ticket',
        title: 'Tickets & language',
        subtext:
          'Mobile ticket and English-speaking guide; skip-the-line access where the operator secures it for the group.',
      },
      {
        icon: 'list',
        title: 'Know before you go',
        subtext:
          'Surfacing what is included vs. add-ons helps you validate expectations before you commit.',
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
          'Small-group touring often works well for solo travelers—confirm minimum travelers in the booking picker.',
      },
      {
        icon: 'family',
        title: 'Families & ages',
        subtext:
          'Watch for child pricing and age bands at checkout when you are booking with kids or teens.',
      },
      {
        icon: 'thumbs',
        title: 'Less guesswork',
        subtext:
          'Highlighting what is special upfront reduces the self-driven research that slows confident checkout.',
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
