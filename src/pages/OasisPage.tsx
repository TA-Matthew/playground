import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreloadMapPinImages } from '../hooks/usePreloadMapPinImages'
import { useIsMobileViewport } from '../hooks/useIsMobileViewport'
import { BookingSidebar } from '../components/booking/BookingSidebar'
import { CollapsibleSection } from '../components/common/CollapsibleSection'
import { AdditionalInfo } from '../components/additional/AdditionalInfo'
import { PdpCancellationQuestionsSection } from '../components/experience/pdp/PdpCancellationQuestionsSection'
import { PdpCompareSimilarExperiences } from '../components/experience/pdp/PdpCompareSimilarExperiences'
import { PdpCustomersAlsoBought } from '../components/experience/pdp/PdpCustomersAlsoBought'
import { PdpTravelerPhotosSection } from '../components/experience/pdp/PdpTravelerPhotosSection'
import { PdpViatorDeepReviewsBlock } from '../components/experience/pdp/PdpViatorDeepReviewsBlock'
import { PdpViatorTitleMeta } from '../components/experience/pdp/PdpViatorTitleMeta'
import { ViatorPdpBlock } from '../components/experience/pdp/ViatorPdpBlock'
import { UPCOMING_AVAILABILITY_SECTION_ID } from '../components/experience/pdp/PdpUpcomingAvailabilitySection'
import { LogisticsBlock } from '../components/logistics/LogisticsBlock'
import { OasisHeader, OasisMobileTopBar } from '../components/oasis/OasisHeader'
import { OasisFooter } from '../components/oasis/OasisFooter'
import { OasisMobileSection } from '../components/oasis/OasisMobileSection'
import { OasisMobileStickyBar } from '../components/oasis/OasisMobileStickyBar'
import { AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL } from '../data/availabilityShortcutDates'
import { formatAvailabilitySearchTotal, getTourGradeOption } from '../data/availabilityShortcutOptions'
import {
  areTravelerCountsEqual,
  totalTravelers,
  travelerCountsFromTotal,
  type AvailabilityTravelerCounts,
} from '../data/availabilityShortcutTravelers'
import { viatorListing } from '../data/viatorListing'
import { variants } from '../data/variants'

const AVAILABILITY_OPTIONS_LOAD_MS = 900

/**
 * Oasis — desktop + mobile-web PDP from Figma
 * [PDP ideas](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-18938)
 * (desktop) and [node 9937:8620](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620) (mobile web).
 */
export function OasisPage() {
  const isMobile = useIsMobileViewport()
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

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <OasisHeader />
      <OasisMobileTopBar />

      <div className="mx-auto w-full max-w-[1308px] px-4 pb-32 pt-6 sm:px-6 md:pb-20 md:pt-8 lg:px-8 xl:px-0">
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

        <div className="mb-5 w-full min-w-0">
          <PdpViatorTitleMeta
            title={viatorListing.tourTitle}
            averageRating={viatorListing.averageRating}
            reviewCount={viatorListing.reviewCount}
            locationLine={viatorListing.locationLine}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6 xl:gap-6">
          <main className="pdp-figma w-full min-w-0 max-w-[864px] lg:order-1">
            <ViatorPdpBlock
              booking={booking}
              showUpcomingAvailability
              availabilityOptionsOpen={availabilityOptionsOpen}
              availabilityOptionsLoading={availabilityOptionsLoading}
              selectedAvailabilityOptionId={selectedAvailabilityOptionId}
              travelerCounts={travelerCounts}
              onTravelerCountsChange={handleTravelerCountsChange}
              dateLabel={dateLabel}
              onDateLabelChange={setDateLabel}
              onSelectAvailabilityOption={setSelectedAvailabilityOptionId}
              onOpenAvailabilityOptions={handleOpenAvailabilityOptions}
            />

            {isMobile ? (
              <>
                <OasisMobileSection title="Itinerary">
                  <LogisticsBlock
                    variantId="a"
                    stops={variants.a.stops}
                    routeLngLat={variants.a.routeLngLat}
                    mapKey="oasis-logistics"
                    poiPopupContent="image-only"
                    meetingAddress={variants.a.meetingAndPickup?.meeting.placeName}
                  />
                </OasisMobileSection>

                <OasisMobileSection title="Things to know">
                  <AdditionalInfo />
                </OasisMobileSection>
              </>
            ) : (
              <>
                <CollapsibleSection title="Itinerary" defaultOpen>
                  <LogisticsBlock
                    variantId="a"
                    stops={variants.a.stops}
                    routeLngLat={variants.a.routeLngLat}
                    mapKey="oasis-logistics"
                    poiPopupContent="image-only"
                    meetingAddress={variants.a.meetingAndPickup?.meeting.placeName}
                  />
                </CollapsibleSection>

                <CollapsibleSection title="Things to know" defaultOpen>
                  <AdditionalInfo />
                </CollapsibleSection>
              </>
            )}

            <div className="w-full">
              <PdpCancellationQuestionsSection />
              <PdpTravelerPhotosSection />
            </div>
            <PdpViatorDeepReviewsBlock />
          </main>

          <aside className="hidden min-w-0 lg:order-2 lg:block lg:sticky lg:top-8 lg:z-10 lg:self-start">
            <BookingSidebar
              booking={booking}
              travelers={totalTravelers(travelerCounts)}
              dateLabel={dateLabel}
              travelerCounts={travelerCounts}
              onDateLabelChange={setDateLabel}
              onTravelerCountsChange={handleTravelerCountsChange}
              onSelectAvailabilityOption={handleOpenAvailabilityOptions}
              availabilityOptionsLoading={availabilityOptionsLoading}
              onCheckAvailability={openAvailabilityFromSidebar}
              availabilitySearchActive={availabilityOptionsOpen}
              searchTotalAmount={availabilitySearchTotal}
              searchTotalLoading={availabilityOptionsLoading}
            />
          </aside>
        </div>

        <PdpCompareSimilarExperiences />
        <PdpCustomersAlsoBought />
      </div>

      <OasisFooter />

      <OasisMobileStickyBar
        priceAmount={booking.priceAmount}
        durationLabel={viatorListing.iconRail.find((item) => item.id === 'duration')?.value ?? ''}
        averageRating={viatorListing.averageRating}
        onCheckAvailability={openAvailabilityFromSidebar}
      />
    </div>
  )
}
