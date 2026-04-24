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
]
