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
  /** User + month/year only — e.g. `Ella_M, Feb 2026` */
  byline: string
}

export type IconRailItem = {
  id: string
  icon: 'clock' | 'mobile' | 'language'
  /** e.g. "Duration" — omitted when value is self-explanatory */
  label?: string
  value: string
}
/**
 * Product card row (`ProductCard`): Explore promoted & Customers who also bought shelves.
 */
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
  /** Customers who also bought only (`ProductCard` + `showMetaRows`). Omit row when undefined. */
  freeCancellation?: string
  /** e.g. "English, Spanish". Also who-also-bought only. */
  language?: string
  /** e.g. "4 hours". Also who-also-bought only. */
  duration?: string
}

export type CompareShelfRibbon = 'sell-out' | 'special-offer' | null

export type CompareShelfCardItem = {
  id: string
  /** Highlight column — [Figma Compare Shelf](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18356-43441&m=dev). */
  isCurrent: boolean
  title: string
  imageSrc: string
  imageAlt: string
  ribbon: CompareShelfRibbon
  rating: number
  reviewCount: number
  duration: string
  cancellation: string
  /** Rendered verbatim, e.g. `From $101.49` */
  priceLabel: string
  /** Compact card — location under title (MW reference). */
  location?: string
  /**
   * Gray top bar label (e.g. Highest rated, Best value). When omitted, uses Current / ribbon-based copy.
   */
  topLabel?: string | null
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
   * Entries 5–17 are deterministic Lorem Picsum placeholders so the mobile gallery can show 18 unique frames (hero + 17 thumbs).
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
      { src: 'https://picsum.photos/seed/pdp-gallery-05/674/446', alt: 'Tour photo (placeholder 5)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-06/674/446', alt: 'Tour photo (placeholder 6)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-07/674/446', alt: 'Tour photo (placeholder 7)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-08/674/446', alt: 'Tour photo (placeholder 8)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-09/674/446', alt: 'Tour photo (placeholder 9)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-10/674/446', alt: 'Tour photo (placeholder 10)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-11/674/446', alt: 'Tour photo (placeholder 11)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-12/674/446', alt: 'Tour photo (placeholder 12)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-13/674/446', alt: 'Tour photo (placeholder 13)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-14/674/446', alt: 'Tour photo (placeholder 14)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-15/674/446', alt: 'Tour photo (placeholder 15)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-16/674/446', alt: 'Tour photo (placeholder 16)' },
      { src: 'https://picsum.photos/seed/pdp-gallery-17/674/446', alt: 'Tour photo (placeholder 17)' },
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
      byline: 'Ella_M, Feb 2026',
    },
    {
      id: 'r2',
      title: 'Worth the skip-the-line',
      body:
        "Skip the line is essential in peak season. Organized check-in, knowledgeable guide, and a clear route through the museums to the Sistine Chapel. Basilica was the perfect finish. Crowded but that’s the Vatican in summer — still glad we did it.",
      byline: 'James_T, May 2025',
    },
    {
      id: 'r3',
      title: 'Outstanding guide — great pacing',
      body:
        'Our guide kept the group moving without feeling rushed and explained Raphael Rooms and Gallery of Maps clearly. Headsets worked well — important in the busy corridors.',
      byline: 'Marco_P, Apr 2025',
    },
    {
      id: 'r4',
      title: 'Sistine Chapel made it worth it',
      body:
        'Nothing prepares you for the ceiling in person. The guide gave context before we entered the chapel (no talking inside) so we knew what to look for. Be ready for security and dress code — worth double-checking shoulders/knees.',
      byline: 'Sarah_L, Mar 2025',
    },
    {
      id: 'r5',
      title: 'Family-friendly overview',
      body:
        "We toured with teenagers and they stayed engaged thanks to storytelling and manageable walking. Meeting point instructions were straightforward. Bring water if it’s warm — minimal stops once you're inside.",
      byline: 'Hannah_W, Feb 2025',
    },
    {
      id: 'r6',
      title: 'Clear headset setup and checkpoints',
      body:
        'Check-in ran smoothly despite the queues outside. Loved the headsets for hearing the guide clearly in crowded rooms. Small group feel even though the museums are packed.',
      byline: 'David_R, Jan 2025',
    },
    {
      id: 'r7',
      title: 'St. Peter’s was the highlight for us',
      body:
        "We picked the option that included the basilica and it was stunning. Security line after the Chapel went faster than we expected. Guide pointed out details we would have walked past on our own.",
      byline: 'Elena_S, Dec 2024',
    },
    {
      id: 'r8',
      title: 'Efficient itinerary for first-timers',
      body:
        'First Vatican visit — this tour lined up Museums → Sistine → Basilica in a logical sequence. Commentary was factual without drifting into long speeches. Comfortable shoes mandatory.',
      byline: 'Yuki_N, Nov 2024',
    },
    {
      id: 'r9',
      title: 'Crowded but well organized',
      body:
        'Expected crowds in August; the skip-the-line entry still saved us a big wait. Guide managed photo stops and regrouping well. If you want quiet reflection, go early or off-season — but the content was excellent.',
      byline: 'Olivier_B, Oct 2024',
    },
    {
      id: 'r10',
      title: 'Would book again with the same operator',
      body:
        'Communication before the tour was clear, meeting point easy to find near the entrance area. Guide was professional, friendly, and patient with questions. Perfect way to see the Vatican without wasting a day in line.',
      byline: 'Anna_K, Sep 2024',
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
          'We had Carl the "tall German guy" as our tour guide and he was outstanding — funny, informative, and happy for questions. Skip-the-line actually worked; we walked straight in while the general queue looked brutal. Would book again.',
      },
      {
        id: 'spot-2',
        author: 'Keith_B',
        date: 'Feb 2026',
        text:
          'In-depth tour of the Vatican and key Rome highlights. Skipping queues saved us hours, and the guide explained history in vivid detail without rambling. Clear instructions from Viator before the day — meeting point was easy to find.',
      },
      {
        id: 'spot-3',
        author: 'Maria_S',
        date: 'Jan 2026',
        text:
          'The Sistine Chapel moment alone was worth it — our guide helped us understand what we were looking at before we entered, which made the silence inside feel meaningful instead of overwhelming. Group size felt manageable.',
      },
      {
        id: 'spot-4',
        author: 'James_T',
        date: 'Dec 2025',
        text:
          'First time in Rome and this tour paced everything well: enough time in the Museums, a steady flow into the Chapel, then St Peter’s without feeling rushed. Headsets worked great in crowds. Bring water and comfy shoes.',
      },
      {
        id: 'spot-5',
        author: 'Sophie_L',
        date: 'Nov 2025',
        text:
          'Traveled with my parents (late 60s) — guide kept routes clear, repeated meeting spots, and checked in when stairs got steep. Art and architecture context was excellent; never felt like a lecture. Highly recommend for mixed-age groups.',
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
  /** [Figma Compare Similar Experiences shelf](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18356-43441&m=dev) — full-width PDP block below reviews. */
  compareShelf: {
    title: 'Compare Similar Experiences',
    omnibusLead: 'Why you are seeing these ',
    omnibusLinkLabel: 'recommendations',
    cardsPerPage: 4,
    cards: [
      {
        id: 'cmp-1',
        isCurrent: true,
        title:
          'Vatican Museums, Sistine Chapel & St Peter’s Basilica Guided Tour',
        imageSrc:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/fa/09/f1/caption.jpg?w=1200&h=800&s=1',
        imageAlt: "St Peter’s Basilica and Vatican cityscape",
        ribbon: null,
        rating: 5,
        reviewCount: 4876,
        duration: '4 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $101.49',
        location: 'Rome, Italy',
      },
      {
        id: 'cmp-2',
        isCurrent: false,
        title:
          'Vatican Museums, Sistine Chapel & St Peter’s Basilica Guided Tour',
        imageSrc:
          'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/0a/13/fb.jpg',
        imageAlt: 'Vatican Museums gallery corridor',
        ribbon: null,
        rating: 5,
        reviewCount: 1498,
        duration: '4 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $84.39',
        location: 'Rome, Italy',
        topLabel: 'Highest rated',
      },
      {
        id: 'cmp-3',
        isCurrent: false,
        title:
          'Private Vatican Museums Tour with Sistine Chapel & St. Peter’s Basilica',
        imageSrc:
          'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/09/fd/d4.jpg',
        imageAlt: "St. Peter's Square",
        ribbon: null,
        rating: 5,
        reviewCount: 962,
        duration: '4 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $228.07',
        location: 'Rome, Italy',
        topLabel: 'Best value',
      },
      {
        id: 'cmp-4',
        isCurrent: false,
        title:
          'Exclusive Private Tour: Vatican Museums, Sistine Chapel and St Peter’s Basilica',
        imageSrc:
          'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/1d/5b/73.jpg',
        imageAlt: 'Vatican and St. Peter’s dome',
        ribbon: 'sell-out',
        rating: 5,
        reviewCount: 841,
        duration: '4 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $340.87',
        location: 'Rome, Italy',
      },
      {
        id: 'cmp-5',
        isCurrent: false,
        title: 'VIP Vatican Museums & Basilica Guided Tour — Small Groups',
        imageSrc: '/promoted/vatican-basilica-dome.png',
        imageAlt: 'Interior of St Peter’s Basilica dome',
        ribbon: 'special-offer',
        rating: 4.9,
        reviewCount: 312,
        duration: '3 hours 30 min',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $129.00',
        location: 'Rome, Italy',
      },
      {
        id: 'cmp-6',
        isCurrent: false,
        title: 'Early Morning Vatican Skip-the-Line — Beat the crowds',
        imageSrc:
          'https://media-cdn.tripadvisor.com/media/photo-o/2f/fa/51/54/caption.jpg?w=800&h=600&s=1',
        imageAlt: 'Guided tour group inside Vatican Museums',
        ribbon: null,
        rating: 4.8,
        reviewCount: 2105,
        duration: '3 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $95.00',
        location: 'Rome, Italy',
      },
      {
        id: 'cmp-7',
        isCurrent: false,
        title: 'Vatican Museums with St Peter’s Dome Climb Combo',
        imageSrc:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/fa/51/54/caption.jpg?w=500&h=500&s=1',
        imageAlt: 'Guided group in Vatican corridors',
        ribbon: 'sell-out',
        rating: 4.9,
        reviewCount: 428,
        duration: '4 hours 30 min',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $189.99',
        location: 'Rome, Italy',
      },
      {
        id: 'cmp-8',
        isCurrent: false,
        title: 'Private Driver + Vatican Museums — Family Friendly',
        imageSrc: '/promoted/fiat-500-colosseum-night.png',
        imageAlt: 'Night view near Roman landmark',
        ribbon: null,
        rating: 4.7,
        reviewCount: 156,
        duration: '5 hours',
        cancellation: 'Free Cancellation',
        priceLabel: 'From $412.00',
        location: 'Rome, Italy',
      },
    ] satisfies CompareShelfCardItem[],
  },
  /**
   * [Figma — Customers who also bought](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18472-33529&m=dev) — full-width 4-up shelf below Compare Similar Experiences.
   */
  alsoBoughtShelf: {
    title: 'Customers who also bought',
    items: [
      {
        id: 'cab-1',
        title: 'Rome: Colosseum Underground & Roman Forum Skip-the-Line Tour',
        image:
          'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/0a/13/fb.jpg',
        imageAlt: 'Ancient Roman ruins and Colosseum arches',
        location: 'Rome, Italy',
        rating: 4.9,
        reviewCount: 8421,
        price: 94,
        priceWas: null,
        ribbon: 'sell-out',
        freeCancellation: 'Free cancellation',
        language: 'English, Italian',
        duration: '3 hours 30 min',
      },
      {
        id: 'cab-2',
        title: 'Pasta & Tiramisu Class with Dinner in a Roman Kitchen',
        image: '/promoted/fiat-500-colosseum-night.png',
        imageAlt: 'Italian cooking class setting in Rome',
        location: 'Rome, Italy',
        rating: 5,
        reviewCount: 2044,
        price: 76,
        priceWas: null,
        freeCancellation: 'Free cancellation',
        language: 'English, Italian',
        duration: '4 hours',
      },
      {
        id: 'cab-3',
        title: 'Borghese Gallery Reserved Entry + Guided Tour',
        image:
          'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/09/fd/d4.jpg',
        imageAlt: 'Sculptures in a gallery hall',
        location: 'Rome, Italy',
        rating: 4.8,
        reviewCount: 3102,
        price: 68,
        priceWas: 89,
        ribbon: 'special-offer',
        freeCancellation: 'Free cancellation',
        language: 'English',
        duration: '3 hours',
      },
      {
        id: 'cab-4',
        title: 'Rome Food Tour: Trastevere Street Eats & Hidden Corners',
        image:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/fa/51/54/caption.jpg?w=800&h=600&s=1',
        imageAlt: 'Small walking group in a Roman neighborhood',
        location: 'Rome, Italy',
        rating: 4.9,
        reviewCount: 1788,
        price: 89,
        priceWas: null,
        freeCancellation: 'Free cancellation',
        language: 'English',
        duration: '4 hours',
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
