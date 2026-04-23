export type VariantId = 'a' | 'b'

export interface Stop {
  id: string
  title: string
  durationLine: string
  /** Full POI description (may be truncated in UI with Read more) */
  description: string
  /**
   * `'meeting' | 'end'`: Variant B only.
   * `'passby'`: intermediate leg (dot on rail / map; not numbered).
   * Variant A POIs omit `kind` (treated as normal POIs).
   */
  kind?: 'poi' | 'meeting' | 'end' | 'passby'
}

export interface BookingContent {
  dealEndsLabel: string
  discountPct: string
  priceDisplay: string
  wasPrice: string
  dateLabel: string
  travellers: number
  meetingPoint: string
  bookAheadNote: string
}

/** Variant A — “Meeting and Pickup” card above itinerary (desktop: two columns; mobile: stacked). */
export type MeetingAndPickupContent = {
  meeting: {
    address: string
    directions: string
    /** Used for “Open in Google Maps” search query */
    mapsQuery: string
  }
  end: {
    placeName: string
    address: string
    mapsQuery: string
  }
}

export interface ExperienceVariant {
  id: VariantId
  label: string
  tourTitle: string
  ratingLine: string
  /** Variant A only — lead + expanded copy above itinerary (Variant B omits for UXR). */
  whatToExpectIntro?: string
  whatToExpectExtra?: string
  /** Variant A only — meeting / end card above itinerary. */
  meetingAndPickup?: MeetingAndPickupContent
  stops: Stop[]
  /** GeoJSON order: [lng, lat][] — must match stops order */
  routeLngLat: [number, number][]
  booking: BookingContent
}

/**
 * Walking path through Borgo → Conciliazione → St Peter’s → Museums — one [lng, lat] per itinerary stop.
 */
const VATICAN_ROUTE: [number, number][] = [
  [12.4560, 41.9073],
  [12.4555, 41.9055],
  [12.4533, 41.9023],
  [12.4540, 41.9058],
  [12.4544, 41.9045],
  [12.4540, 41.9038],
  [12.4536, 41.9024],
]

/** Slight offset for variant B map (A/B visual difference) */
const VATICAN_ROUTE_B: [number, number][] = VATICAN_ROUTE.map(
  ([lng, lat]) => [lng + 0.0006, lat - 0.00025] as [number, number],
)

const STOPS_A: Stop[] = [
  {
    id: 'poi-borgo',
    title: 'Borgo',
    durationLine: '40 minutes • Admission Ticket Free',
    description: `Meet your tour guide at our office, located in the oldest neighbourhoods of the Vatican, Borgo Pio. Following a self introduction by your guide, you will walk through the charming shops of the Borgo, as he/she shares some local tips for eating and site seeing in Rome, including off the beaten track sites that you must visit during your holiday!

Some background will also be provided on the history of the Sistine Chapel (we do it here as the chapel forbids noise and travellers are expected to observe silence once entering).`,
  },
  {
    id: 'poi-conciliazione',
    kind: 'passby',
    title: 'Via Della Conciliazione (Pass By)',
    durationLine: 'Pass by',
    description:
      'Admire the flags and surrounding embassies as you walk through this street, which serve as the primary access point to St. Peter\'s Square, and by extension, to the Vatican City itself.',
  },
  {
    id: 'poi-st-peters-square',
    title: 'St. Peter\'s Square',
    durationLine: '20 minutes • Admission Ticket Free',
    description: `We arrive at St. Peter's Square, which is marked by a towering Egyptian obelisk and enveloped by columns and statues of saints. Hear about the history of the square and the legendary artist Bernini who designed it.

Fun fact — the Pope addresses crowds from his apartment window overlooking St. Peter's Square, during the Papal audience held every Wednesday and Sunday morning.`,
  },
  {
    id: 'poi-citta-vaticano',
    title: 'Città del Vaticano',
    durationLine: '15 minutes • Admission Ticket Free',
    description: `En route to the museum, you will get to see and hear about how residents of the smallest city in the world go about their day to day life (including getting their mail!) Snap a pic of the Swiss guards — the pontifical bodyguards in their distinctly Renaissance uniforms.

Our tip: send yourself a postcard after the tour. The post office sells a variety of memorabilia, including stamps with Pope Francis's face!

Then, slowly head towards the museum's entrance, where you will be led to a special area reserved for skip-the-line groups.`,
  },
  {
    id: 'poi-vatican-museums',
    title: 'Vatican Museums',
    durationLine: '45 minutes • Admission Ticket Included',
    description:
      'Be prepared to hear stories as your guide walks you through an astonishing collection of Roman and Greek statues, the gallery of tapestries, and a gallery of maps depicting 16th century Italy.',
  },
  {
    id: 'poi-sistine',
    title: 'Sistine Chapel',
    durationLine: '15 minutes • Admission Ticket Included',
    description: `Admire Michelangelo's famous works, including the Creation of Adam and the Last Judgement. This spectacular fresco evokes lifelike images within the mind, vividly portraying stories of mankind in the biblical era.

Note that the museum requires visitors to observe silence and a dress code (knees and shoulders covered).`,
  },
  {
    id: 'poi-st-peters-basilica',
    title: 'St. Peter\'s Basilica',
    durationLine: '15 minutes • Admission Ticket Free',
    description:
      'You will be brought in front of St. Peter\'s Church, where a special entrance will allow you to enter directly from the museum and bypass the long queue out in the square. Got questions? Ask your guide before parting ways!',
  },
]

/** Variant B core POIs — same itinerary, alternate phrasing for UXR comparisons */
const STOPS_B_CORE: Stop[] = STOPS_A.map((s, i) =>
  i === 0
    ? {
        ...s,
        description: `${s.description}

(Variant B: same Borgo start, alternate emphasis for research sessions.)`,
      }
    : s.kind === 'passby'
      ? s
      : {
          ...s,
          description: `${s.description} (Variant B wording: same stops, alternate emphasis for research sessions.)`,
        },
)

/** Via Plauto meeting point — start of route on map (Borgo Pio area) */
const MEETING_LNG_LAT_B: [number, number] = [12.4583, 41.9027]
/** St Peter’s area — tour end */
const END_LNG_LAT_B: [number, number] = [12.4534, 41.9022]

const STOP_B_MEETING: Stop = {
  id: 'b-meeting',
  kind: 'meeting',
  title: 'Meeting point',
  durationLine: 'Via Plauto, 17, 00193 Roma RM, Italy',
  description:
    "The meeting point is located in Borgo Pio, near St. Peter's square. The exact address is Via Plauto 17/A. IMPORTANT: Please check your booking for the start time of the Vatican ENGLISH tour. Arrive 20 minutes before at the meeting point (Via Plauto 17A) for check-in. Thank you!",
}

const STOP_B_END: Stop = {
  id: 'b-end',
  kind: 'end',
  title: 'End point',
  durationLine: 'Saint Peter’s Basilica',
  description: 'Piazza San Pietro, 00120 Città del Vaticano, Vatican City',
}

/** Variant B: meeting + itinerary + end (10 map points) */
const STOPS_B: Stop[] = [STOP_B_MEETING, ...STOPS_B_CORE, STOP_B_END]

const ROUTE_LNG_LAT_B: [number, number][] = [MEETING_LNG_LAT_B, ...VATICAN_ROUTE_B, END_LNG_LAT_B]

const MEETING_AND_PICKUP_A: MeetingAndPickupContent = {
  meeting: {
    address: 'Via Plauto, 17, 00193 Roma RM, Italy',
    directions:
      "The meeting point is located in Borgo Pio, near St. Peter's square. The exact address is Via Plauto 17/A. IMPORTANT: Please check your booking for the start time of the Vatican ENGLISH tour. Arrive 20 minutes before at the meeting point (Via Plauto 17A) for check-in. Thank you!",
    mapsQuery: 'Via Plauto 17/A, 00193 Roma RM, Italy',
  },
  end: {
    placeName: 'Saint Peter’s Basilica',
    address: 'Piazza San Pietro, 00120 Città del Vaticano, Vatican City',
    mapsQuery: "Saint Peter's Basilica, Piazza San Pietro, Città del Vaticano",
  },
}

const ITINERARY_SECTION_INTRO = `Meet your guide and group in the Borgo neighborhood, a short walk away from the St. Peter's Square, for an introductory briefing for this Vatican Museums guided tour with skip-the-line access. Then, head to the square as a group, passing along the Via della Conciliazione along the way, while your guide provides commentary about the Vatican and its history, including the Sistine Chapel.

Arrive at St. Peter's Square and head into the Vatican Museums, taking advantage of your special skip-the-line admission ticket to avoid having to wait in the long regular admission lines. Once inside, listen to your guide provide live commentary as you take in the sculptures, paintings, and tapestries that flank the main halls.

Continue to the Sistine Chapel to see some of Michelangelo's most famous works, including the Creation of Adam and the Last Judgement. Wrap up your Vatican Museums tour up at St. Peter's Basilica (if option selected), where you'll be able to enter directly, circumventing the regular lines.`

const ITINERARY_SECTION_EXTRA = `The halls and rooms of the museum complex comprise miles of historic art and antiquities, but you go straight to the highlights, such as the Gallery of the Tapestries, the Gallery of the Maps, and the Pinecone Courtyard.

Continue to the Sistine Chapel, home of two of the most important frescoes of the Italian Renaissance. Learn about Michelangelo's "The Last Judgement" and "The Creation of Adam" from outside the chapel (no talking inside), then head on in to admire the frescoes in person.

Follow your guide into St. Peter's Basilica to see "La Pietà," another Michelangelo masterpiece, and learn about Bernini's bronze altar. You can stay inside St. Peter's Basilica after your tour ends, or head outside to St. Peter's Square, where your tour ends.`

export const variants: Record<VariantId, ExperienceVariant> = {
  a: {
    id: 'a',
    label: 'Variant A',
    tourTitle: 'Vatican Museums, Sistine Chapel & St Peter’s Basilica Guided Tour',
    ratingLine: '4.5 (12,480) · Badge of Excellence · Rome, Italy',
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    stops: STOPS_A,
    routeLngLat: VATICAN_ROUTE,
    booking: {
      dealEndsLabel: 'Ends May 24',
      discountPct: '-6%',
      priceDisplay: '$101.49 per person',
      wasPrice: '€124.00',
      dateLabel: 'Mon 18 Jan',
      travellers: 2,
      meetingPoint: 'Meet at: Via Plauto, 17, 00193 Roma RM, Italy',
      bookAheadNote: 'Book ahead! On average, booked 8 days in advance.',
    },
  },
  b: {
    id: 'b',
    label: 'Variant B',
    tourTitle: 'Vatican Museums, Sistine Chapel & St Peter’s Basilica Guided Tour',
    ratingLine: '4.5 (12,480) · Badge of Excellence · Rome, Italy',
    stops: STOPS_B,
    routeLngLat: ROUTE_LNG_LAT_B,
    booking: {
      dealEndsLabel: 'Ends May 24',
      discountPct: '-8%',
      priceDisplay: '$98.00 per person',
      wasPrice: '€124.00',
      dateLabel: 'Mon 18 Jan',
      travellers: 2,
      meetingPoint: 'Meet at: Via Plauto, 17, 00193 Roma RM, Italy',
      bookAheadNote: 'Book ahead! On average, booked 8 days in advance.',
    },
  },
}

export const DEFAULT_VARIANT: VariantId = 'a'

export function getVariant(id: string | null | undefined): VariantId {
  if (id === 'b') return 'b'
  return 'a'
}
