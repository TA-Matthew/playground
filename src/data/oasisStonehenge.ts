/**
 * Content for the OASIS PDP concept — mobile web (MW) layout.
 * Tour content modeled on the Viator listing "Stonehenge, Windsor Castle, and Bath from London"
 * (viator.com/tours/London/.../d737-3858EE021). Section structure follows the Figma MW spec:
 * figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620
 */

export type OasisImage = { src: string; alt: string }

export type OasisItineraryStop = {
  id: string
  time: string
  title: string
  duration: string
  description: string
}

export type OasisReview = {
  id: string
  title: string
  author: string
  date: string
  text: string
  rating: number
}

export type OasisShelfItem = {
  id: string
  title: string
  image: string
  location: string
  rating: number
  reviewCount: number
  price: number
  ribbon: 'Highly rated' | 'Best value' | null
}

export type OasisTrustProp = {
  id: 'deal' | 'trending' | 'value'
  title: string
  description: string
}

export type OasisWhyLovedCard = {
  id: string
  badge: string
  quote: string
  boldPhrase: string
  rating: number
}

export type OasisAvailabilityOption = {
  id: string
  title: string
  timesAvailable: number
  price: number
  tag: 'Best seller' | 'Likely to sell out' | null
}

export type OasisStarDistribution = { stars: 5 | 4 | 3 | 2 | 1; count: number }

export const oasisStonehenge = {
  productCode: '3858EE021',
  sourceViatorPath: 'd737-3858EE021',
  title: 'Stonehenge, Windsor Castle, and Bath Day Trip from London',
  locationLine: 'London, England',
  averageRating: 4.6,
  reviewCount: 20_091,
  price: 95,
  currencySymbol: '£',
  freeCancellation: 'Free 24h cancellation',
  bookedTodayCount: 99,
  dealTag: 'Exceptional deal',
  duration: { value: '12', unit: 'hours' },
  language: { value: 'English', extra: '+3 more' },

  images: [
    { src: 'https://picsum.photos/seed/oasis-stonehenge-hero/500/720', alt: 'Stonehenge stone circle at golden hour' },
    { src: 'https://picsum.photos/seed/oasis-windsor-1/480/360', alt: 'Windsor Castle towers and grounds' },
    { src: 'https://picsum.photos/seed/oasis-bath-1/480/360', alt: 'Roman Baths in Bath, Georgian architecture' },
    { src: 'https://picsum.photos/seed/oasis-coach-1/500/720', alt: 'Group boarding the touring coach' },
    { src: 'https://picsum.photos/seed/oasis-guide-1/500/720', alt: 'Guide talking to travelers at Stonehenge' },
    { src: 'https://picsum.photos/seed/oasis-bath-2/500/720', alt: 'Bath Abbey and Pulteney Bridge' },
    { src: 'https://picsum.photos/seed/oasis-windsor-2/500/720', alt: 'Windsor town street near the castle' },
  ] satisfies OasisImage[],

  /** Short teaser only — full copy sits behind "More". */
  summary:
    'Skip-the-line entry to Stonehenge, a photo stop at Windsor Castle, and free time in Bath — a full day, three iconic sights. About 12 hours; coach transport and a live guide included.',
  fullDescription:
    'This tour combines three iconic destinations in one day, offering a rich blend of history, culture, and stunning scenery. Travelers can explore the prehistoric marvel of Stonehenge, the royal grandeur of Windsor Castle, and the exquisite Georgian architecture of Bath. Benefit from knowledgeable guides who provide fascinating insights and stories about each location, enhancing the overall experience and making the history come alive. Coach transport, live commentary, and skip-the-line entry to Stonehenge are all included, so the day runs smoothly from pickup to drop-off in central London.',

  trustProps: [
    {
      id: 'deal',
      title: 'Exceptional deal',
      description: 'Great price compared to similar experiences',
    },
    {
      id: 'trending',
      title: 'Trending now',
      description: 'Most booked experience in the last 7 days',
    },
    {
      id: 'value',
      title: 'Value for money',
      description: 'Over 90% of travelers praised its value',
    },
  ] satisfies OasisTrustProp[],

  whyLoved: [
    {
      id: 'wl-1',
      badge: 'Expert local guide · 214',
      quote: 'Our guide, Marcus, was amazing! He shared so much about the history of each site and made it fun for everyone. Highly recommend this tour.',
      boldPhrase: 'history of each site',
      rating: 5,
    },
    {
      id: 'wl-2',
      badge: 'Great value · 96',
      quote: 'Seeing Stonehenge, Windsor, and Bath in one day for this price felt like a steal. Well organized from pickup to drop-off.',
      boldPhrase: 'one day for this price',
      rating: 5,
    },
    {
      id: 'wl-3',
      badge: 'Comfortable coach · 58',
      quote: 'Long day but the coach was comfortable and the driver made great time between stops. Would book again.',
      boldPhrase: 'coach was comfortable',
      rating: 4,
    },
  ] satisfies OasisWhyLovedCard[],

  keyDetails: [
    { label: 'Duration', value: '12 hours' },
    { label: 'Live guide', value: 'English' },
    { label: 'Pickup', value: 'Included' },
    { label: 'Group size', value: 'Up to 49' },
  ],

  highlights: [
    'Skip-the-line entry to Stonehenge with audio guide',
    'Photo stop at Windsor Castle, home of the Royal Family',
    'Free time to explore the Roman Baths and Bath’s Georgian streets',
    'Round-trip coach transport with a live guide from central London',
  ],

  availability: {
    filterChips: ['Tomorrow', '2 travelers'],
    options: [
      { id: 'opt-1', title: 'Standard Group - English', timesAvailable: 3, price: 95, tag: 'Best seller' },
      { id: 'opt-2', title: 'Small Group - English', timesAvailable: 2, price: 129, tag: 'Likely to sell out' },
      { id: 'opt-3', title: 'Private Tour - English', timesAvailable: 1, price: 420, tag: null },
    ] satisfies OasisAvailabilityOption[],
    lowestPriceGuarantee: 'Lowest price guarantee',
  },

  inclusions: [
    'Hotel pickup and drop-off (central London)',
    'Skip-the-line entry ticket to Stonehenge',
    'Live guide (English)',
    'Air-conditioned coach transport',
  ],
  exclusions: [
    'Windsor Castle entry ticket (optional, on your own)',
    'Roman Baths entry ticket (optional, on your own)',
    'Food and drinks',
    'Gratuities',
  ],

  meetingPoint: 'Central London pickup points — exact stop confirmed after booking',
  itinerary: [
    {
      id: 'stop-1',
      time: '8:00 AM',
      title: 'Pickup in central London',
      duration: '15 min',
      description:
        'Board your coach at one of several central London pickup points. Your guide will confirm the exact stop after booking.',
    },
    {
      id: 'stop-2',
      time: '9:30 AM',
      title: 'Windsor Castle',
      duration: '1 hr',
      description:
        'Stop in the town of Windsor for a photo opportunity outside the castle walls. Entry inside the castle is optional and booked separately.',
    },
    {
      id: 'stop-3',
      time: '11:30 AM',
      title: 'Stonehenge',
      duration: '1.5 hrs',
      description:
        'Skip the line with pre-booked tickets and explore the stone circle at your own pace with an included audio guide.',
    },
    {
      id: 'stop-4',
      time: '2:00 PM',
      title: 'Bath',
      duration: '3 hrs',
      description:
        'Free time to visit the Roman Baths, Bath Abbey, and the city’s Georgian streets, with recommendations from your guide.',
    },
    {
      id: 'stop-5',
      time: '8:00 PM',
      title: 'Return to London',
      duration: '2 hrs',
      description: 'Drop-off back at your original pickup point in central London.',
    },
  ] satisfies OasisItineraryStop[],

  reviewsSummary: {
    averageRating: 4.6,
    reviewCount: 20_091,
    distribution: [
      { stars: 5, count: 13_400 },
      { stars: 4, count: 4_600 },
      { stars: 3, count: 1_300 },
      { stars: 2, count: 480 },
      { stars: 1, count: 311 },
    ] satisfies OasisStarDistribution[],
    photos: [
      'https://picsum.photos/seed/oasis-review-photo-1/240/240',
      'https://picsum.photos/seed/oasis-review-photo-2/240/240',
      'https://picsum.photos/seed/oasis-review-photo-3/240/240',
      'https://picsum.photos/seed/oasis-review-photo-4/240/240',
      'https://picsum.photos/seed/oasis-review-photo-5/240/240',
    ],
  },

  reviews: [
    {
      id: 'r1',
      title: 'Fantastic day out',
      author: 'Ella_M',
      date: 'Feb 2026',
      rating: 5,
      text: 'Stonehenge at sunset was unforgettable and our guide kept everything running on time across all three stops.',
    },
    {
      id: 'r2',
      title: 'A lot packed in, well organized',
      author: 'James_T',
      date: 'May 2025',
      rating: 4,
      text: 'A lot packed into one day, but well organized. Bath deserved more time — go early if you want to see the Baths properly.',
    },
    {
      id: 'r3',
      title: 'Great value for three destinations',
      author: 'Hannah_W',
      date: 'Feb 2025',
      rating: 5,
      text: 'Great value for seeing three destinations. Coach was comfortable and the guide’s commentary made the drive time enjoyable.',
    },
  ] satisfies OasisReview[],

  thingsToKnow: {
    activityLevel: 'Low',
    activityNote: 'Most travelers can participate in this experience',
    wheelchairAccessible: false,
    nearPublicTransport: true,
    maxTravelers: 49,
    notes:
      'This tour operates rain or shine — Stonehenge is an outdoor site. Windsor Castle may close to the public without notice for state events; when this occurs, a nearby alternative stop is substituted at no extra cost.',
  },

  shelf: [
    {
      id: 'shelf-1',
      title: 'Stonehenge Half-Day Trip from London',
      image: 'https://picsum.photos/seed/oasis-shelf-1/320/240',
      location: 'London, England',
      rating: 4.4,
      reviewCount: 6_210,
      price: 65,
      ribbon: 'Best value',
    },
    {
      id: 'shelf-2',
      title: 'Windsor Castle Tour with Skip-the-Line Entry',
      image: 'https://picsum.photos/seed/oasis-shelf-2/320/240',
      location: 'Windsor, England',
      rating: 4.7,
      reviewCount: 3_040,
      price: 89,
      ribbon: 'Highly rated',
    },
    {
      id: 'shelf-3',
      title: 'Bath and the Cotswolds Day Trip from London',
      image: 'https://picsum.photos/seed/oasis-shelf-3/320/240',
      location: 'London, England',
      rating: 4.5,
      reviewCount: 2_180,
      price: 79,
      ribbon: null,
    },
  ] satisfies OasisShelfItem[],
}
