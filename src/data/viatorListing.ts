/**
 * Public listing data for the research PDP (Viator d511-120123P3 / Tripadvisor product 120123P3).
 * Copy and stats were transcribed from the live listing; review snippets are from published guest text.
 * @see https://www.viator.com/tours/Rome/Skip-the-Line-Group-Tour-of-the-Vatican-Sistine-Chapel-and-St-Peters-Basilica/d511-120123P3
 */

export type BreadcrumbItem = { label: string; href?: string }

export type MediaItem = { src: string; alt: string }

export type KeyFact = { label: string; value: string }

export type StarDistribution = { stars: 1 | 2 | 3 | 4 | 5; count: number }

export type PdpReview = {
  id: string
  title: string
  body: string
  dateLabel: string
  ratingLabel: string
  author: string
  authorLocation: string
}

export type IconRailItem = {
  id: string
  icon: 'clock' | 'mobile' | 'language'
  /** e.g. "Duration" — omitted when value is self-explanatory */
  label?: string
  value: string
}

/** Figma DS “Product Card” (research) — [KILIMANJARO · node 27970:19415](https://www.figma.com/design/kfEgE1oVxKplDJxEBW9nIT?node-id=27970-19415) */
export type PromotedExperienceItem = {
  id: string
  title: string
  image: string
  imageAlt: string
  location: string
  /** When null, the rating line is hidden. */
  rating: number | null
  reviewCount: number | null
  price: number
  priceWas: number | null
  /** Top-left ribbon on the card image — matches Viator PDP product cards research. */
  ribbon?: 'special-offer' | 'sell-out'
}

export const viatorListing = {
  productCode: '120123P3',
  sourceViatorPath: 'd511-120123P3',
  /** Also used in ExperienceVariant.tourTitle / ratingLine for a single source of truth. */
  tourTitle:
    "Skip-the-Line Group Tour of the Vatican, Sistine Chapel & St. Peter's Basilica",
  ratingLine: "4.6 (13,603) · Badge of Excellence · Rome, Italy",
  /** Plain numeric for UI (Viator B2C PDP) */
  averageRating: 4.6,
  reviewCount: 13_603,
  locationLine: 'Rome, Italy',
  recommendedPct: 91,
  /** Legacy chips — not shown on Viator B2C title block; kept for research if needed */
  chips: [
    { label: 'BEST SELLER', style: 'brand' as const },
    { label: 'LIKELY TO SELL OUT', style: 'warning' as const },
  ],
  travelersChoice: {
    awardYear: '2025' as const,
    photoCount: 5_841,
  },
  operatorLine: 'Offered by: Made in Rome Tours',
  breadcrumb: [
    { label: 'Home' },
    { label: 'Europe' },
    { label: 'Italy' },
    { label: 'Lazio' },
    { label: 'Rome' },
    { label: 'Rome Tours' },
  ] satisfies BreadcrumbItem[],
  /**
   * Hero: wide Sistine-style main image; `thumbnails` are left-rail (4 tiles + 5th “see more” uses last + overlay in UI).
   */
  media: {
    hero: {
      src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/fa/09/f1/caption.jpg?w=1200&h=800&s=1',
      alt: "Sistine Chapel ceiling and interior",
    },
    thumbnails: [
      {
        src: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/0a/13/fb.jpg',
        alt: "Vatican Museums gallery",
      },
      {
        src: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/09/fd/d4.jpg',
        alt: "St. Peter's Square",
      },
      {
        src: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/1d/5b/73.jpg',
        alt: "Vatican and St. Peter’s dome",
      },
      {
        src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/fa/51/54/caption.jpg?w=500&h=500&s=1',
        alt: "Guided group in Vatican corridors",
      },
    ] satisfies MediaItem[],
  },
  /** Icon row below gallery (Viator PDP; aligns with Figma 20632:95823 Features row) */
  iconRail: [
    { id: 'duration', icon: 'clock' as const, value: '3 hours (approx.)' },
    { id: 'ticket', icon: 'mobile' as const, value: 'Mobile ticket' },
    { id: 'lang', icon: 'language' as const, label: 'Offered in', value: 'English' },
  ] satisfies IconRailItem[],
  /** Figma: Inline Callout below features (Viator Rewards). */
  rewardsCallout: {
    title: 'You earned a Viator Rewards credit on this listing (example)' as const,
    subtitle: 'See your account for validity and full terms' as const,
  },
  keyFacts: [
    { label: 'Duration', value: '3 hours' },
    { label: 'Group size', value: 'Max 200' },
    { label: 'Languages', value: 'English (live guide)' },
    { label: 'Ticket', value: 'Mobile ticket' },
  ] satisfies KeyFact[],
  reviewsIntro: 'Total reviews and rating from Viator & Tripadvisor',
  /** Proportions ~4.6 average, sum matches reviewCount */
  starDistribution: [
    { stars: 5, count: 8_200 },
    { stars: 4, count: 3_500 },
    { stars: 3, count: 1_200 },
    { stars: 2, count: 400 },
    { stars: 1, count: 303 },
  ] as const satisfies Readonly<StarDistribution[]>,
  reviewSamples: [
    {
      id: 'r1',
      title: 'Excellent tour and guide',
      body:
        'This is a very busy time and we were very happy to have purchased a tour and to skip the 4 hour line — to get into the Vatican museum. Our guide Richard was great. Gave great information in an efficient manner and got us through the crowds well. He was very attentive and helpful and I would definitely recommend this tour company and this guide.',
      dateLabel: 'Written June 12, 2025',
      ratingLabel: '5 of 5 stars',
      author: 'Catherine M',
      authorLocation: 'US',
    },
    {
      id: 'r2',
      title: 'Worth the skip-the-line',
      body:
        "Skip the line is essential in peak season. Organized check-in, knowledgeable guide, and a clear route through the museums to the Sistine Chapel. Basilica was the perfect finish. Crowded but that’s the Vatican in summer — still glad we did it.",
      dateLabel: 'Written May 4, 2025',
      ratingLabel: '5 of 5 stars',
      author: 'James T',
      authorLocation: 'UK',
    },
  ] satisfies PdpReview[],

  /** “Why travelers loved this” — spotlight strip (before full reviews / logistics) */
  whyTravelersLoved: {
    /** First chip is “All”, rest are theme tags */
    filterTagLabels: [
      'All',
      'Informative experience',
      'Amazing sights',
      'City highlights',
      'Great guides',
      'Couple-friendly',
    ] as const,
    spotlightReviews: [
      {
        id: 'spot-1',
        author: 'Kelly_B',
        date: 'Feb 2026',
        text:
          'We had Carl the "tall German guy" as our tour guide and he was outstanding!! He was funny and very informative. He was incredibly knowledgeable and encouraged everyone to ask questions which made it an amazing tour. We would highly...',
      },
      {
        id: 'spot-2',
        author: 'Keith_B',
        date: 'Feb 2026',
        text:
          'This was an in-depth tour of the famous sites of Rome. Being able to skip queues as part of a trip was brilliant in itself but the knowledge of the history passed on in creative and vivid terms was highly commendable. Communication from Viator...',
      },
    ],
  },
  /** Promoted experiences rail */
  promotedExperiences: {
    title: 'Explore our promoted experiences',
    disclaimer: 'Viator earns higher commissions on',
    disclaimerLink: 'experiences featured here' as const,
    items: [
      {
        id: 'p1',
        title: "Vatican City St Peter's Basilica Fun Tour (small group)",
        image: '/promoted/vatican-basilica-dome.png',
        imageAlt: 'Interior of St Peter’s Basilica dome and ornate architecture',
        location: 'Rome, Italy',
        rating: 4.9,
        reviewCount: 79,
        price: 39,
        priceWas: 49,
        ribbon: 'special-offer',
      },
      {
        id: 'p2',
        title: 'Explore Night Life Photos in Rome with A Vintage Car Fiat 500',
        image: '/promoted/fiat-500-colosseum-night.png',
        imageAlt: 'Vintage Fiat near the Colosseum at night',
        location: 'Rome, Italy',
        rating: 5.0,
        reviewCount: 4,
        price: 90,
        priceWas: 101,
        ribbon: 'special-offer',
      },
      {
        id: 'p3',
        title: 'Colosseum Arena & Roman Forum Guided Tour',
        image: '/promoted/colosseum-arena-interior.png',
        imageAlt: 'Interior view into the arena of the Roman Colosseum',
        location: 'Rome, Italy',
        rating: 4.1,
        reviewCount: 58,
        price: 72,
        priceWas: null,
        ribbon: 'sell-out',
      },
    ] as const satisfies readonly PromotedExperienceItem[],
  },
  overview: {
    body:
      "Make the most of your valuable vacation time by avoiding the long line at the Vatican Museums. You save hours of waiting time by booking a group tour with skip-the-line admission. Follow your guide on a carefully crafted itinerary and hear informative commentary as you admire the art and architecture. Admission is included to the Sistine Chapel and St. Peter's Basilica (depending on the option selected).",
    bullets: [
      'Visit the Vatican Museums on a guided tour with skip-the-line access',
      'Save tons of valuable vacation time not having to wait in long lines',
      'Gain more from your visit with in-depth commentary from your guide',
      "A hassle-free experience; admission to all sites visited is included",
    ] as const,
    whyChooseTitle: 'Why Travelers Choose This Tour' as const,
    whyChooseBody:
      'A group tour is more affordable than private options and includes skip-the-line entry to save time.',
  },
  whatsIncluded: {
    inclusions: [
      'An expert tour guide with over 10 years of experience. Excellent story teller.',
      'Guaranteed skip-the-line access',
      "Admission tickets to the Vatican Museums, Sistine Chapel and/or St. Peter's Basilica",
    ] as const,
    exclusions: [
      'If you book the "Museums & SISTINE CHAPEL Tour" option it does NOT include St. Peter’s Basilica.',
      'If you book "ONLY ST.PETER\'S BASILICA TOUR" option it does NOT include the Museums & Sistine Chapel.',
      'Gratuities (Tips)',
    ] as const,
    hiddenInclusionCount: 3,
  },
  /** Shown in footer and post–Additional-Info “Questions” card */
  supplierName: 'Vatican Tour' as const,
  postPdp: {
    cancellation: {
      summary:
        'You can cancel up to 24 hours in advance of the experience for a full refund.',
    },
    questions: {
      body: 'Visit the Viator Help Centre for any further questions.',
      helpCenterCta: 'Viator Help Center' as const,
    },
  },
} as const

const STAR_TOTAL = viatorListing.starDistribution.reduce((a, s) => a + s.count, 0)

export function getStarBarPercent(_stars: number, count: number): number {
  if (STAR_TOTAL <= 0) return 0
  return (count / STAR_TOTAL) * 100
}
