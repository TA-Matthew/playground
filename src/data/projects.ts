export type Project = {
  id: string
  title: string
  description: string
  /** Primary route for this experiment */
  path: string
}

/** Keep in sync with the matching `<Route>` in App.tsx */
export const LOGISTICS_PROJECT_PATH = '/projects/logistics'
export const AI_REVIEW_PROJECT_PATH = '/projects/ai-review-prototype'
export const LOYALTY_LOGIN_BUTTON_PATH = '/projects/loyalty-login-button-animation'

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
]
