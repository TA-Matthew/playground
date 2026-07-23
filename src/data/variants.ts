import { viatorListing } from './viatorListing'

export type VariantId = 'a' | 'a2' | 'b' | 'b2' | 'c' | 'c2' | 'd2'

export interface Stop {
  id: string
  title: string
  /** Short place name shown on the map pin label (overrides title for meeting stops). */
  placeName?: string
  durationLine: string
  /** Full POI description (may be truncated in UI with Read more) */
  description: string
  /**
   * `'meeting' | 'end'`: Variant B only.
   * `'passby'`: intermediate leg (dot on rail / map; not numbered).
   * Variant A POIs omit `kind` (treated as normal POIs).
   */
  kind?: 'poi' | 'meeting' | 'end' | 'passby'
  /** Optional hero for map popups (desktop + mobile sheet) — from gallery / media. */
  popupImageSrc?: string
  popupImageAlt?: string
}

export interface BookingContent {
  /** Large bold headline: currency + amount only (with “From · per person” in UI). */
  priceAmount: string
  badgeExceptionalDeal: string
  badgeKidsDiscount: string
  dateLabel: string
  travellers: number
  /** Sidebar “book ahead” callout — headline (14px medium) + micro body (13px). */
  bookAheadTitle: string
  bookAheadSubtitle: string
}

/** Shared meeting / end copy for the `MeetingAndPickupCard` (placement in `ExperiencePage` is variant-specific). */
export type MeetingAndPickupContent = {
  meeting: {
    /** Short display name shown on the map pin label (e.g. “Via Plauto, Prati North”). */
    placeName: string
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
  /** Optional lead + expanded copy above itinerary + map (`LogisticsBlock`). Variant A/B use shared PDP copy where shown. */
  whatToExpectIntro?: string
  whatToExpectExtra?: string
  /** Optional “Meeting and Pickup” card — order relative to Itinerary is set in the page. */
  meetingAndPickup?: MeetingAndPickupContent
  stops: Stop[]
  /** GeoJSON order: [lng, lat][] — must match stops order */
  routeLngLat: [number, number][]
  /**
   * Dashed itinerary path (when shown). B2: POI 1 through end; meetings use `routeLngLat` for pins.
   */
  routePolylineLngLat?: [number, number][]
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

/** Borgo first POI (variant A) — map pin + popup (`/public/figma-assets/poi-borgo-street.png`). */
const BORGO_POI_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-borgo-street.png`
const BORGO_POI_IMAGE_ALT = 'Narrow cobblestone street in the Borgo, Rome'

/** Via Plauto 17 / Borgo Pio check-in — meeting-point pin (`/public/figma-assets/meeting-via-plauto-17.png`). */
const MEETING_VIA_PLAUTO_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/meeting-via-plauto-17.png`
const MEETING_VIA_PLAUTO_IMAGE_ALT =
  'Street at Via Plauto: parked scooters, orange wall, and historic buildings, Rome'

/** Ottaviano metro (Line A) — B2 meeting `b2-meeting-b` (`/public/figma-assets/meeting-ottaviano-metro.png`). */
const MEETING_OTTAVIANO_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/meeting-ottaviano-metro.png`
const MEETING_OTTAVIANO_IMAGE_ALT =
  'Ottaviano metro station entrance, Line A signage and street corner, Rome'

/** Piazza del Risorgimento / north Prati — B2 meeting `b2-meeting-a` (`/public/figma-assets/meeting-piazza-risorgimento.png`). */
const MEETING_RISORGIMENTO_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/meeting-piazza-risorgimento.png`
const MEETING_RISORGIMENTO_IMAGE_ALT =
  'Piazza del Risorgimento with café umbrellas, equestrian statue, and surrounding buildings, Rome'

/** Via della Conciliazione pass-by — St. Peter’s Square (`/public/figma-assets/poi-conciliazione-pass-by.png`). */
const CONCILIAZIONE_PASSBY_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-conciliazione-pass-by.png`
const CONCILIAZIONE_PASSBY_IMAGE_ALT = "St. Peter’s Square, colonnade and basilica, Vatican"

/** St. Peter’s Square — aerial over piazza and Via della Conciliazione (`/public/figma-assets/poi-st-peters-square.png`). */
const ST_PETERS_SQUARE_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-st-peters-square.png`
const ST_PETERS_SQUARE_IMAGE_ALT =
  "Aerial view of St. Peter’s Square, obelisk, colonnades, and Via della Conciliazione toward Rome"

/** Città del Vaticano — Governorate, gardens, Vatican City (`/public/figma-assets/poi-citta-vaticano.png`). */
const CITTA_VATICANO_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-citta-vaticano.png`
const CITTA_VATICANO_IMAGE_ALT =
  "Aerial view of the Palace of the Governorate, Vatican Gardens, and Rome beyond"

/** Vatican Museums — gilded coffered hall (`/public/figma-assets/poi-vatican-museums.png`). */
const VATICAN_MUSEUMS_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-vatican-museums.png`
const VATICAN_MUSEUMS_IMAGE_ALT =
  "Gilded coffered ceiling and arched windows in a Vatican Museums gallery hall"

/** Sistine Chapel stop — map/popup (`/public/figma-assets/poi-sistine.png`). */
const SISTINE_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-sistine.png`
const SISTINE_IMAGE_ALT =
  "Frescoed barrel vault, pillars, and checkered marble floor in an ornate Vatican hall"

/** St. Peter’s Basilica — dome interior (`/public/figma-assets/poi-st-peters-basilica.png`). */
const ST_PETERS_BASILICA_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-st-peters-basilica.png`
const ST_PETERS_BASILICA_IMAGE_ALT =
  "Interior of St. Peter’s dome, mosaics, Latin frieze, and pendentive roundels, Vatican"

/** Tour end pin — façade and dome from Via della Conciliazione (`/public/figma-assets/poi-tour-end-st-peters.png`). */
const TOUR_END_POINT_IMAGE_SRC = `${import.meta.env.BASE_URL}figma-assets/poi-tour-end-st-peters.png`
const TOUR_END_POINT_IMAGE_ALT =
  "St. Peter’s Basilica façade and dome along Via della Conciliazione toward Piazza San Pietro"

const STOPS_A: Stop[] = [
  {
    id: 'poi-borgo',
    title: 'Borgo',
    durationLine: '40 minutes • Free entry',
    popupImageSrc: BORGO_POI_IMAGE_SRC,
    popupImageAlt: BORGO_POI_IMAGE_ALT,
    description: `Meet your tour guide at our office, located in the oldest neighbourhoods of the Vatican, Borgo Pio. Following a self introduction by your guide, you will walk through the charming shops of the Borgo, as he/she shares some local tips for eating and site seeing in Rome, including off the beaten track sites that you must visit during your holiday!

Some background will also be provided on the history of the Sistine Chapel (we do it here as the chapel forbids noise and travellers are expected to observe silence once entering).`,
  },
  {
    id: 'poi-conciliazione',
    kind: 'passby',
    title: 'Via Della Conciliazione',
    durationLine: 'Passing by / Short stop',
    popupImageSrc: CONCILIAZIONE_PASSBY_IMAGE_SRC,
    popupImageAlt: CONCILIAZIONE_PASSBY_IMAGE_ALT,
    description:
      'Admire the flags and surrounding embassies as you walk through this street, which serve as the primary access point to St. Peter\'s Square, and by extension, to the Vatican City itself.',
  },
  {
    id: 'poi-st-peters-square',
    title: 'St. Peter\'s Square',
    durationLine: '20 minutes • Free entry',
    popupImageSrc: ST_PETERS_SQUARE_IMAGE_SRC,
    popupImageAlt: ST_PETERS_SQUARE_IMAGE_ALT,
    description: `We arrive at St. Peter's Square, which is marked by a towering Egyptian obelisk and enveloped by columns and statues of saints. Hear about the history of the square and the legendary artist Bernini who designed it.

Fun fact — the Pope addresses crowds from his apartment window overlooking St. Peter's Square, during the Papal audience held every Wednesday and Sunday morning.`,
  },
  {
    id: 'poi-citta-vaticano',
    title: 'Città del Vaticano',
    durationLine: '15 minutes • Free entry',
    popupImageSrc: CITTA_VATICANO_IMAGE_SRC,
    popupImageAlt: CITTA_VATICANO_IMAGE_ALT,
    description: `En route to the museum, you will get to see and hear about how residents of the smallest city in the world go about their day to day life (including getting their mail!) Snap a pic of the Swiss guards — the pontifical bodyguards in their distinctly Renaissance uniforms.

Our tip: send yourself a postcard after the tour. The post office sells a variety of memorabilia, including stamps with Pope Francis's face!

Then, slowly head towards the museum's entrance, where you will be led to a special area reserved for skip-the-line groups.`,
  },
  {
    id: 'poi-vatican-museums',
    title: 'Vatican Museums',
    durationLine: '45 minutes • Ticket included',
    popupImageSrc: VATICAN_MUSEUMS_IMAGE_SRC,
    popupImageAlt: VATICAN_MUSEUMS_IMAGE_ALT,
    description:
      'Be prepared to hear stories as your guide walks you through an astonishing collection of Roman and Greek statues, the gallery of tapestries, and a gallery of maps depicting 16th century Italy.',
  },
  {
    id: 'poi-sistine',
    title: 'Sistine Chapel',
    durationLine: '15 minutes • Ticket included',
    popupImageSrc: SISTINE_IMAGE_SRC,
    popupImageAlt: SISTINE_IMAGE_ALT,
    description: `Admire Michelangelo's famous works, including the Creation of Adam and the Last Judgement. This spectacular fresco evokes lifelike images within the mind, vividly portraying stories of mankind in the biblical era.

Note that the museum requires visitors to observe silence and a dress code (knees and shoulders covered).`,
  },
  {
    id: 'poi-st-peters-basilica',
    title: 'St. Peter\'s Basilica',
    durationLine: '15 minutes • Free entry',
    popupImageSrc: ST_PETERS_BASILICA_IMAGE_SRC,
    popupImageAlt: ST_PETERS_BASILICA_IMAGE_ALT,
    description:
      'You will be brought in front of St. Peter\'s Church, where a special entrance will allow you to enter directly from the museum and bypass the long queue out in the square. Got questions? Ask your guide before parting ways!',
  },
]

/** Variant B core POIs — same itinerary copy as variant A */
const STOPS_B_CORE: Stop[] = [...STOPS_A]

/** Via Plauto meeting point — start of route on map (Borgo Pio area) */
const MEETING_LNG_LAT_B: [number, number] = [12.4583, 41.9027]
/** St Peter’s area — tour end */
const END_LNG_LAT_B: [number, number] = [12.4534, 41.9022]

const STOP_B_MEETING: Stop = {
  id: 'b-meeting',
  kind: 'meeting',
  title: 'Meeting point',
  placeName: 'Via Plauto',
  durationLine: 'Via Plauto, 17, 00193 Roma RM, Italy',
  popupImageSrc: MEETING_VIA_PLAUTO_IMAGE_SRC,
  popupImageAlt: MEETING_VIA_PLAUTO_IMAGE_ALT,
  description:
    "The meeting point is located in Borgo Pio, near St. Peter's square. The exact address is Via Plauto 17/A. IMPORTANT: Please check your booking for the start time of the Vatican ENGLISH tour. Arrive 20 minutes before at the meeting point (Via Plauto 17A) for check-in. Thank you!",
}

const STOP_B_END: Stop = {
  id: 'b-end',
  kind: 'end',
  title: 'End point',
  durationLine: 'Saint Peter’s Basilica',
  popupImageSrc: TOUR_END_POINT_IMAGE_SRC,
  popupImageAlt: TOUR_END_POINT_IMAGE_ALT,
  description: 'Piazza San Pietro, 00120 Città del Vaticano, Vatican City',
}

/** Variant B: meeting + itinerary + end (10 map points) */
const STOPS_B: Stop[] = [STOP_B_MEETING, ...STOPS_B_CORE, STOP_B_END]

const ROUTE_LNG_LAT_B: [number, number][] = [MEETING_LNG_LAT_B, ...VATICAN_ROUTE_B, END_LNG_LAT_B]

/** Rome (Prati / outside Vatican walls) — pickup pins kept off the dashed POI path */
const B2_MEETING_LNG_LAT: [number, number][] = [
  [12.4656, 41.9093],
  [12.4614, 41.9062],
  MEETING_LNG_LAT_B,
]

const B2_MEETING_STOPS: Stop[] = [
  {
    id: 'b2-meeting-a',
    kind: 'meeting',
    title: 'Meeting point',
    placeName: 'Prati North',
    durationLine: 'Piazza del Risorgimento, 00192 Roma RM, Italy',
    popupImageSrc: MEETING_RISORGIMENTO_IMAGE_SRC,
    popupImageAlt: MEETING_RISORGIMENTO_IMAGE_ALT,
    description:
      'North Prati pickup, outside the Vatican walls. Arrive 20 minutes before departure — check your voucher for the exact corner.',
  },
  {
    id: 'b2-meeting-b',
    kind: 'meeting',
    title: 'Meeting point',
    placeName: 'Ottaviano',
    durationLine: 'Via Ottaviano, 00192 Roma RM, Italy',
    popupImageSrc: MEETING_OTTAVIANO_IMAGE_SRC,
    popupImageAlt: MEETING_OTTAVIANO_IMAGE_ALT,
    description:
      'Near Ottaviano metro, Rome side. Meet where noted on your voucher — arrive 20 minutes early.',
  },
  {
    id: 'b2-meeting-c',
    kind: 'meeting',
    title: 'Meeting point',
    placeName: 'Via Plauto',
    durationLine: 'Via Plauto, 17, 00193 Roma RM, Italy',
    popupImageSrc: MEETING_VIA_PLAUTO_IMAGE_SRC,
    popupImageAlt: MEETING_VIA_PLAUTO_IMAGE_ALT,
    description:
      "Borgo Pio pickup near St. Peter's square — same corner as the classic Via Plauto meeting. Arrive 20 minutes before departure; confirm details on your voucher.",
  },
]

/** Same three meeting options as B2 — for A2 “Meeting & Pickup” only (A2 map/timeline use {@link STOPS_A}). */
export const TRIPLE_MEETING_STOPS: Stop[] = B2_MEETING_STOPS

const STOPS_B2: Stop[] = [...B2_MEETING_STOPS, ...STOPS_B_CORE, STOP_B_END]

/** Labels for the three B2 meeting pickups — keep in sync with `TimelineB2MeetingRow` list options. */
export const B2_MEETING_OPTION_LABELS = ['Prati north', 'Ottaviano', 'Via Plauto'] as const

const ROUTE_LNG_LAT_B2: [number, number][] = [...B2_MEETING_LNG_LAT, ...VATICAN_ROUTE_B, END_LNG_LAT_B]

/** B2 dashed line: POI 1 (Borgo) through the core path to the end pin (meetings are separate; not on this line until one is chosen). */
const ROUTE_POLYLINE_B2_CORE: [number, number][] = [...VATICAN_ROUTE_B, END_LNG_LAT_B]

const MEETING_AND_PICKUP_A: MeetingAndPickupContent = {
  meeting: {
    placeName: 'Via Plauto',
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

const STOPS_C2: Stop[] = [...B2_MEETING_STOPS, ...STOPS_A, STOP_B_END]
const ROUTE_LNG_LAT_C2: [number, number][] = [...B2_MEETING_LNG_LAT, ...VATICAN_ROUTE, END_LNG_LAT_B]
const ROUTE_POLYLINE_C2_CORE: [number, number][] = [...VATICAN_ROUTE, END_LNG_LAT_B]

/** D2 shares the same stop data / route as C2 — layout difference is mobile-only. */
const STOPS_D2 = STOPS_C2
const ROUTE_LNG_LAT_D2 = ROUTE_LNG_LAT_C2
const ROUTE_POLYLINE_D2_CORE = ROUTE_POLYLINE_C2_CORE

export const variants: Record<VariantId, ExperienceVariant> = {
  d2: {
    id: 'd2',
    label: 'D2 (sandwich)',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    /** Same stop/route data as C2 — desktop identical; mobile sandwiches map between meeting row and POI list. */
    stops: STOPS_D2,
    routeLngLat: ROUTE_LNG_LAT_D2,
    routePolylineLngLat: ROUTE_POLYLINE_D2_CORE,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  a: {
    id: 'a',
    label: 'Variant A',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    stops: STOPS_A,
    routeLngLat: VATICAN_ROUTE,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  a2: {
    id: 'a2',
    label: 'Variant A2 (multiple meeting)',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    /** Same POI path as A — meeting choice lives only in Meeting & Pickup (not map/timeline). */
    stops: STOPS_A,
    routeLngLat: VATICAN_ROUTE,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  b: {
    id: 'b',
    label: 'Variant B',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    stops: STOPS_B,
    routeLngLat: ROUTE_LNG_LAT_B,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  b2: {
    id: 'b2',
    label: 'B2 (multiple meeting)',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    stops: STOPS_B2,
    routeLngLat: ROUTE_LNG_LAT_B2,
    routePolylineLngLat: ROUTE_POLYLINE_B2_CORE,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  c: {
    id: 'c',
    label: 'Variant C',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    stops: STOPS_B,
    routeLngLat: ROUTE_LNG_LAT_B,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
  c2: {
    id: 'c2',
    label: 'C2 (multiple meeting)',
    tourTitle: viatorListing.tourTitle,
    ratingLine: viatorListing.ratingLine,
    meetingAndPickup: MEETING_AND_PICKUP_A,
    whatToExpectIntro: ITINERARY_SECTION_INTRO,
    whatToExpectExtra: ITINERARY_SECTION_EXTRA,
    /** Same POI path as A but with triple meeting points on the map. */
    stops: STOPS_C2,
    routeLngLat: ROUTE_LNG_LAT_C2,
    routePolylineLngLat: ROUTE_POLYLINE_C2_CORE,
    booking: {
      priceAmount: '$40.56',
      badgeExceptionalDeal: 'Exceptional deal',
      badgeKidsDiscount: 'Discounted rates for kids',
      dateLabel: 'Wed, Apr 29',
      travellers: 2,
      bookAheadTitle: 'Book ahead!',
      bookAheadSubtitle: 'Typically booked 8 days ahead',
    },
  },
}

export const DEFAULT_VARIANT: VariantId = 'a'

export function getVariant(id: string | null | undefined): VariantId {
  if (id === 'a2') return 'a2'
  if (id === 'b') return 'b'
  if (id === 'b2') return 'b2'
  if (id === 'c') return 'c'
  if (id === 'c2') return 'c2'
  if (id === 'd2') return 'd2'
  return 'a'
}

/** A2 / C2 / D2: triple meeting picker in card — D2 mobile uses timeline sandwich row + dropdown instead. */
export function isVariantTripleMeetingCardOnly(variantId: VariantId): boolean {
  return variantId === 'a2' || variantId === 'c2' || variantId === 'd2'
}

/** D2: mobile sandwiches map between the meeting-dropdown row and POI list; desktop identical to C2. */
export function isVariantD2Sandwich(variantId: VariantId): boolean {
  return variantId === 'd2'
}

/** C2 / D2: meeting + end use green map pins; end stays off the itinerary timeline list. */
export function isVariantC2OrD2MapLayout(variantId: VariantId): boolean {
  return variantId === 'c2' || variantId === 'd2'
}

/** B2 / C2 / D2: committed triple-meeting pickup drives map pin visibility and hover. */
export function isVariantTripleMeetingMapPickup(variantId: VariantId): boolean {
  return variantId === 'b2' || variantId === 'c2' || variantId === 'd2'
}

/** Variant B, B2, and C share the same itinerary / map behavior (meeting + end stops, B-route offset). */
export function isVariantBLayout(variantId: VariantId): boolean {
  return variantId === 'b' || variantId === 'b2' || variantId === 'c'
}

/** B2 / C2 / D2 timeline/map: three meeting stops first, then core + end */
export function isVariantB2TripleMeeting(variantId: VariantId, stops: Stop[]): boolean {
  return (
    (variantId === 'b2' || variantId === 'c2' || variantId === 'd2') &&
    stops.length >= 3 &&
    stops[0]?.kind === 'meeting' &&
    stops[1]?.kind === 'meeting' &&
    stops[2]?.kind === 'meeting'
  )
}

/** Single itinerary row + dropdown (`Timeline` uses this id for expand state) */
export const B2_MEETING_TIMELINE_ROW_ID = 'b2-meeting-row'
