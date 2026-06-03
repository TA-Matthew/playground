import type { VariantId } from './variants'

export type Project = {
  id: string
  title: string
  description: string
  /** Primary route for this experiment */
  path: string
}

/** Primary logistics variants in the facilitator strip. */
export const LOGISTICS_FACILITATOR_ACTIVE_VARIANTS: VariantId[] = ['b', 'd2']

/** Older logistics variants — still reachable via facilitator Archive row and `?variant=`. */
export const LOGISTICS_FACILITATOR_ARCHIVED_VARIANTS: VariantId[] = ['a', 'a2', 'b2', 'c2']

/** All logistics facilitator / share-link variant ids (active + archived). */
export const LOGISTICS_FACILITATOR_VARIANTS: VariantId[] = [
  ...LOGISTICS_FACILITATOR_ACTIVE_VARIANTS,
  ...LOGISTICS_FACILITATOR_ARCHIVED_VARIANTS,
]

/** Default when `/projects/logistics` has no `variant` query. */
export const LOGISTICS_DEFAULT_VARIANT: VariantId = 'b'

/** Product highlight study: Variant A PDP only — no A2 / B / B2 (or C) in UI or URL. */
export const PRODUCT_HIGHLIGHT_FACILITATOR_VARIANTS: VariantId[] = ['a']

/** Keep in sync with the matching `<Route>` in App.tsx */
export const LOGISTICS_PROJECT_PATH = '/projects/logistics'
export const PRODUCT_HIGHLIGHT_PROJECT_PATH = '/projects/product-highlight'
export const AI_REVIEW_PROJECT_PATH = '/projects/ai-review-prototype'
export const LOYALTY_LOGIN_BUTTON_PATH = '/projects/loyalty-login-button-animation'

/** Order is oldest → newest; the home list shows the last item first. */
export const projects: Project[] = [
  {
    id: 'logistics',
    title: 'Logistics & itinerary',
    description:
      'Booking PDP experiment with map, timeline, and research variants.',
    path: LOGISTICS_PROJECT_PATH,
  },
  {
    id: 'ai-review-prototype',
    title: 'AI review prototype',
    description: 'Empty page to build your AI review flow.',
    path: AI_REVIEW_PROJECT_PATH,
  },
  {
    id: 'loyalty-login-button-animation',
    title: 'Loyalty log in button animation',
    description: 'Animated log in CTA with loyalty-style shimmer and focus states.',
    path: LOYALTY_LOGIN_BUTTON_PATH,
  },
  {
    id: 'product-highlight',
    title: 'Product highlight',
    description:
      'We hypothesize a PDP Product Highlights strip (2–4 explicit positives plus critical booking facts) compounds perceived quality, clarifies reasons to book, and lifts booking confidence and conversion.',
    path: PRODUCT_HIGHLIGHT_PROJECT_PATH,
  },
]
