export type Project = {
  id: string
  title: string
  description: string
  /** Primary route for this experiment */
  path: string
}

/** Keep in sync with the matching `<Route>` in App.tsx */
export const LOGISTICS_PROJECT_PATH = '/projects/logistics'

export const projects: Project[] = [
  {
    id: 'logistics',
    title: 'Logistics & itinerary',
    description:
      'Booking PDP experiment with map, timeline, and research variants.',
    path: LOGISTICS_PROJECT_PATH,
  },
]
