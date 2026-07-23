import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreloadMapPinImages } from '../hooks/usePreloadMapPinImages'
import { useDockedBookedBanner } from '../hooks/useDockedBookedBanner'
import { useIsMobileViewport } from '../hooks/useIsMobileViewport'
import { UPCOMING_AVAILABILITY_SECTION_ID } from '../components/experience/pdp/PdpUpcomingAvailabilitySection'
import { OasisHeader, OasisMobileTopBar } from '../components/oasis/OasisHeader'
import { OasisBookingSidebar } from '../components/oasis/OasisBookingSidebar'
import { OasisCompareShelf } from '../components/oasis/OasisCompareShelf'
import { OasisExploreSimilar } from '../components/oasis/OasisExploreSimilar'
import { OasisFooter } from '../components/oasis/OasisFooter'
import { OasisGallery } from '../components/oasis/OasisGallery'
import { OasisHighlights } from '../components/oasis/OasisHighlights'
import { OasisIncluded } from '../components/oasis/OasisIncluded'
import { OasisItinerary } from '../components/oasis/OasisItinerary'
import { OasisMobileCommerceModule } from '../components/oasis/OasisMobileCommerceModule'
import { OasisMobileGallery } from '../components/oasis/OasisMobileGallery'
import { OasisMobileIncluded } from '../components/oasis/OasisMobileIncluded'
import { OasisMobileItinerary } from '../components/oasis/OasisMobileItinerary'
import { OasisMobileStickyBar } from '../components/oasis/OasisMobileStickyBar'
import { OasisMobileTitleInfo } from '../components/oasis/OasisMobileTitleInfo'
import { OasisMobileWhyTravelersLoved } from '../components/oasis/OasisMobileWhyTravelersLoved'
import { OasisMobileYouMayAlsoLike } from '../components/oasis/OasisMobileYouMayAlsoLike'
import { OasisReviews } from '../components/oasis/OasisReviews'
import { OasisThingsToKnow } from '../components/oasis/OasisThingsToKnow'
import { OasisTitleMeta } from '../components/oasis/OasisTitleMeta'
import { OasisWhyTravelersLoved } from '../components/oasis/OasisWhyTravelersLoved'
import { AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL } from '../data/availabilityShortcutDates'
import { formatAvailabilitySearchTotal, getTourGradeOption } from '../data/availabilityShortcutOptions'
import {
  areTravelerCountsEqual,
  travelerCountsFromTotal,
  type AvailabilityTravelerCounts,
} from '../data/availabilityShortcutTravelers'
import { viatorListing } from '../data/viatorListing'
import { variants } from '../data/variants'

/** Thin `<hr>`-style divider between stacked sections — Figma uses a plain 1px `#d9d9d9` line. */
function OasisSectionDivider() {
  return <div className="h-px w-full shrink-0 bg-[#d9d9d9]" />
}

const AVAILABILITY_OPTIONS_LOAD_MS = 900

/**
 * Oasis — desktop + mobile-web PDP from Figma
 * [PDP ideas](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-18938)
 * (desktop) and [node 9937:8620](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620) (mobile web).
 */
export function OasisPage() {
  const isMobile = useIsMobileViewport()
  const bookedBannerDocked = useDockedBookedBanner()
  const booking = useMemo(() => variants.a.booking, [])
  const [dateLabel, setDateLabel] = useState(() => AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL)
  const [travelerCounts, setTravelerCounts] = useState<AvailabilityTravelerCounts>(() =>
    travelerCountsFromTotal(booking.travellers),
  )
  const [availabilityOptionsOpen, setAvailabilityOptionsOpen] = useState(false)
  const [availabilityOptionsLoading, setAvailabilityOptionsLoading] = useState(false)
  const [selectedAvailabilityOptionId, setSelectedAvailabilityOptionId] = useState('english')

  const availabilityPanelHasLoaded = useRef(false)
  const optionsLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const prevTravelerCountsRef = useRef(travelerCounts)
  const prevDateLabelRef = useRef(dateLabel)

  usePreloadMapPinImages(variants.a.stops)

  const triggerOptionsLoading = useCallback(() => {
    setAvailabilityOptionsLoading(true)
    if (optionsLoadingTimerRef.current !== undefined) {
      window.clearTimeout(optionsLoadingTimerRef.current)
    }
    optionsLoadingTimerRef.current = window.setTimeout(() => {
      optionsLoadingTimerRef.current = undefined
      setAvailabilityOptionsLoading(false)
    }, AVAILABILITY_OPTIONS_LOAD_MS)
  }, [])

  const handleTravelerCountsChange = useCallback((counts: AvailabilityTravelerCounts) => {
    setTravelerCounts(counts)
  }, [])

  const scrollToUpcomingAvailability = useCallback(() => {
    const section = document.getElementById(UPCOMING_AVAILABILITY_SECTION_ID)
    if (!section) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const handleOpenAvailabilityOptions = useCallback(
    (optionId: string) => {
      setSelectedAvailabilityOptionId(optionId)
      setAvailabilityOptionsOpen(true)
      requestAnimationFrame(() => scrollToUpcomingAvailability())
    },
    [scrollToUpcomingAvailability],
  )

  const openAvailabilityFromSidebar = useCallback(() => {
    handleOpenAvailabilityOptions('english')
  }, [handleOpenAvailabilityOptions])

  useEffect(() => {
    if (!availabilityOptionsOpen) {
      availabilityPanelHasLoaded.current = false
      return
    }
    if (availabilityPanelHasLoaded.current) return
    availabilityPanelHasLoaded.current = true
    triggerOptionsLoading()
  }, [availabilityOptionsOpen, triggerOptionsLoading])

  useEffect(() => {
    if (areTravelerCountsEqual(prevTravelerCountsRef.current, travelerCounts)) return
    prevTravelerCountsRef.current = travelerCounts
    triggerOptionsLoading()
    requestAnimationFrame(() => scrollToUpcomingAvailability())
  }, [travelerCounts, triggerOptionsLoading, scrollToUpcomingAvailability])

  useEffect(() => {
    if (prevDateLabelRef.current === dateLabel) return
    prevDateLabelRef.current = dateLabel
    if (!availabilityOptionsOpen) return
    triggerOptionsLoading()
    requestAnimationFrame(() => scrollToUpcomingAvailability())
  }, [dateLabel, availabilityOptionsOpen, triggerOptionsLoading, scrollToUpcomingAvailability])

  const availabilitySearchTotal = useMemo(() => {
    const option = getTourGradeOption(selectedAvailabilityOptionId)
    return formatAvailabilitySearchTotal(travelerCounts, option?.perPersonPrice)
  }, [travelerCounts, selectedAvailabilityOptionId])

  if (isMobile) {
    const durationText = viatorListing.iconRail.find((item) => item.id === 'duration')?.value ?? ''
    const [durationValue, ...durationRest] = durationText.split(' ')

    return (
      <div className="min-h-screen bg-white text-stone-900">
        <OasisHeader />
        <OasisMobileTopBar />

        <main className="pdp-figma w-full min-w-0 pb-40">
          <OasisMobileGallery />

          <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-emerald-800"
            >
              <span aria-hidden className="text-stone-400">
                ←
              </span>
              All projects
            </Link>

            <OasisMobileTitleInfo
              title={viatorListing.tourTitle}
              durationValue={durationValue ?? ''}
              durationUnit={durationRest.join(' ') || 'hours'}
              averageRating={viatorListing.averageRating}
              reviewCount={viatorListing.reviewCount}
              languageLabel="English"
              languageSubLabel="+3 more"
              descriptionBody={viatorListing.overview.body}
            />

            <OasisSectionDivider />
            <OasisMobileCommerceModule
              booking={booking}
              dateLabel={dateLabel}
              onDateLabelChange={setDateLabel}
              travelerCounts={travelerCounts}
              onTravelerCountsChange={handleTravelerCountsChange}
              onCheckAvailability={openAvailabilityFromSidebar}
              onOpenAvailabilityOptions={handleOpenAvailabilityOptions}
              availabilitySearchActive={availabilityOptionsOpen}
              searchTotalAmount={availabilitySearchTotal}
              searchTotalLoading={availabilityOptionsLoading}
            />

            <OasisSectionDivider />
            <OasisMobileWhyTravelersLoved />

            <OasisSectionDivider />
            <OasisMobileIncluded />

            <OasisSectionDivider />
            <OasisMobileItinerary
              stops={variants.a.stops}
              routeLngLat={variants.a.routeLngLat}
              meetingAddress={variants.a.meetingAndPickup?.meeting.placeName}
            />

            <OasisSectionDivider />
            <OasisReviews />

            <OasisSectionDivider />
            <div className="flex w-full flex-col items-start gap-6">
              <p className="text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black">Things to know</p>
              <OasisThingsToKnow />
            </div>

            <OasisSectionDivider />
            <OasisMobileYouMayAlsoLike />
          </div>
        </main>

        <OasisFooter />

        <OasisMobileStickyBar
          priceAmount={booking.priceAmount}
          exceptionalDealLabel={booking.badgeExceptionalDeal}
          onCheckAvailability={openAvailabilityFromSidebar}
          showBookedBanner={bookedBannerDocked}
        />
      </div>
    )
  }

  // Desktop — bespoke, pixel-matched rebuild of the Figma "Desktop Single option" frame
  // (https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-18938).
  const itineraryVariant = variants.b

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <OasisHeader />

      <div className="pdp-figma mx-auto w-full max-w-[1152px] px-6 py-6">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-emerald-800"
          >
            <span aria-hidden className="text-stone-400">
              ←
            </span>
            All projects
          </Link>
        </div>

        <OasisGallery />

        <div className="mt-8 grid grid-cols-[700px_419px] items-start gap-8">
          <main className="flex w-[700px] flex-col items-start gap-6">
            <OasisTitleMeta
              title={viatorListing.tourTitle}
              averageRating={viatorListing.averageRating}
              reviewCount={viatorListing.reviewCount}
              durationLabel={viatorListing.iconRail.find((item) => item.id === 'duration')?.value ?? ''}
              languageLabel="English +3 more"
            />

            <OasisSectionDivider />
            <p className="text-[16px] leading-6 text-black">{viatorListing.overview.body}</p>

            <OasisSectionDivider />
            <OasisHighlights />

            <OasisSectionDivider />
            <OasisWhyTravelersLoved />

            <OasisSectionDivider />
            <OasisIncluded />

            <OasisSectionDivider />
            <OasisItinerary
              stops={itineraryVariant.stops}
              routeLngLat={itineraryVariant.routeLngLat}
              meetingAddress={itineraryVariant.meetingAndPickup?.meeting.placeName}
            />

            <OasisSectionDivider />
            <OasisReviews />

            <OasisSectionDivider />
            <div className="flex w-full flex-col items-start gap-6">
              <h2 className="text-[24px] font-medium leading-7 tracking-[0.2px] text-black">Things to know</h2>
              <OasisThingsToKnow />
            </div>
          </main>

          <aside className="sticky top-8 z-10 self-start">
            <OasisBookingSidebar
              booking={booking}
              dateLabel={dateLabel}
              onDateLabelChange={setDateLabel}
              travelerCounts={travelerCounts}
              onTravelerCountsChange={handleTravelerCountsChange}
              onCheckAvailability={openAvailabilityFromSidebar}
              availabilitySearchActive={availabilityOptionsOpen}
              searchTotalAmount={availabilitySearchTotal}
              searchTotalLoading={availabilityOptionsLoading}
            />
          </aside>
        </div>

        <OasisCompareShelf />
        <OasisExploreSimilar />
      </div>

      <OasisFooter />
    </div>
  )
}
