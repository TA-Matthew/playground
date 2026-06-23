import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
import {
  AVAILABILITY_OPTIONS_LOAD_MS,
  UPCOMING_AVAILABILITY_SECTION_ID,
} from '../components/experience/pdp/PdpUpcomingAvailabilitySection'
import { FacilitatorBar } from '../components/uxr/FacilitatorBar'
import { ParticipantLinkModal } from '../components/uxr/ParticipantLinkModal'
import { SecretUnlock } from '../components/uxr/SecretUnlock'
import { ShareLinkGate } from '../components/uxr/ShareLinkGate'
import {
  AVAILABILITY_COMMERCE_QUERY,
  DEFAULT_AVAILABILITY_COMMERCE_MODE,
  isStickyCommerceAvailabilityMode,
  type AvailabilityCommerceModeId,
} from '../data/availabilityShortcutCommerce'
import { AVAILABILITY_SHORTCUT_FACILITATOR_VARIANTS } from '../data/projects'
import { AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL } from '../data/availabilityShortcutDates'
import { formatAvailabilitySearchTotal, getTourGradeOption } from '../data/availabilityShortcutOptions'
import {
  areTravelerCountsEqual,
  travelerCountsFromTotal,
  totalTravelers,
  type AvailabilityTravelerCounts,
} from '../data/availabilityShortcutTravelers'
import { viatorListing } from '../data/viatorListing'
import { variants } from '../data/variants'
import type { ParticipantLinkExtras } from '../uxr/shareLink'
import {
  parseAvailabilityCommerceModeFromUrl,
  parseHideUi,
  readFacilitatorUnlock,
  setFacilitatorUnlock,
  shouldShowFacilitatorChrome,
} from '../uxr/urlState'

/**
 * Availability shortcut study — PDP shell for faster paths to Check Availability / booking.
 * @see Q3 Decide 2026 (Figma)
 */
export function AvailabilityShortcutPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [unlock, setUnlock] = useState(() => readFacilitatorUnlock())
  const [participantLinkModalOpen, setParticipantLinkModalOpen] = useState(false)
  const participantLinkButtonRef = useRef<HTMLButtonElement>(null)

  const [availabilityOptionsOpen, setAvailabilityOptionsOpen] = useState(false)
  const [availabilityOptionsLoading, setAvailabilityOptionsLoading] = useState(false)
  const [selectedAvailabilityOptionId, setSelectedAvailabilityOptionId] = useState('english')
  const availabilityPanelHasLoaded = useRef(false)
  const booking = useMemo(
    () => ({ ...variants.a.booking, priceAmount: '$80.35' }),
    [],
  )
  const [dateLabel, setDateLabel] = useState(() => AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL)
  const [travelerCounts, setTravelerCounts] = useState<AvailabilityTravelerCounts>(() =>
    travelerCountsFromTotal(booking.travellers),
  )
  const optionsLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const prevTravelerCountsRef = useRef(travelerCounts)
  const prevDateLabelRef = useRef(dateLabel)

  const hideUi = parseHideUi(searchParams)
  const availabilityCommerceMode = parseAvailabilityCommerceModeFromUrl(searchParams)
  const stickyCommerce = isStickyCommerceAvailabilityMode(availabilityCommerceMode)

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

  const openAvailabilityOptions = useCallback((optionId: string) => {
    setSelectedAvailabilityOptionId(optionId)
    setAvailabilityOptionsOpen(true)
  }, [])

  const scrollToUpcomingAvailability = useCallback(() => {
    const section = document.getElementById(UPCOMING_AVAILABILITY_SECTION_ID)
    if (!section) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [])

  const handleOpenAvailabilityOptions = useCallback(
    (optionId: string) => {
      openAvailabilityOptions(optionId)
      if (stickyCommerce) {
        requestAnimationFrame(() => scrollToUpcomingAvailability())
      }
    },
    [openAvailabilityOptions, scrollToUpcomingAvailability, stickyCommerce],
  )

  const openAvailabilityFromSidebar = useCallback(() => {
    handleOpenAvailabilityOptions('english')
    if (!stickyCommerce) {
      requestAnimationFrame(() => scrollToUpcomingAvailability())
    }
  }, [handleOpenAvailabilityOptions, scrollToUpcomingAvailability, stickyCommerce])

  const resetAvailabilityFlow = useCallback(() => {
    availabilityPanelHasLoaded.current = false
    setAvailabilityOptionsOpen(false)
    setAvailabilityOptionsLoading(false)
    setSelectedAvailabilityOptionId('english')
    setTravelerCounts(travelerCountsFromTotal(booking.travellers))
    setDateLabel(AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL)
    prevTravelerCountsRef.current = travelerCountsFromTotal(booking.travellers)
    prevDateLabelRef.current = AVAILABILITY_SHORTCUT_DEFAULT_DATE_LABEL
    if (optionsLoadingTimerRef.current !== undefined) {
      window.clearTimeout(optionsLoadingTimerRef.current)
      optionsLoadingTimerRef.current = undefined
    }
  }, [booking.travellers])

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
  }, [travelerCounts, triggerOptionsLoading])

  useEffect(() => {
    if (prevDateLabelRef.current === dateLabel) return
    prevDateLabelRef.current = dateLabel
    triggerOptionsLoading()
  }, [dateLabel, triggerOptionsLoading])

  const availabilitySearchTotal = useMemo(() => {
    const option = getTourGradeOption(selectedAvailabilityOptionId)
    return formatAvailabilitySearchTotal(
      travelerCounts,
      option?.perPersonPrice,
    )
  }, [travelerCounts, selectedAvailabilityOptionId])

  const showFacilitatorChrome = useMemo(
    () => shouldShowFacilitatorChrome(hideUi, unlock),
    [hideUi, unlock],
  )

  const setAvailabilityCommerceMode = useCallback(
    (commerceMode: AvailabilityCommerceModeId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (commerceMode === DEFAULT_AVAILABILITY_COMMERCE_MODE) {
            next.delete(AVAILABILITY_COMMERCE_QUERY)
          } else {
            next.set(AVAILABILITY_COMMERCE_QUERY, commerceMode)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleAvailabilityCommerceModeChange = useCallback(
    (commerceMode: AvailabilityCommerceModeId) => {
      resetAvailabilityFlow()
      setAvailabilityCommerceMode(commerceMode)
    },
    [resetAvailabilityFlow, setAvailabilityCommerceMode],
  )

  const participantLinkExtras = useMemo((): ParticipantLinkExtras | undefined => {
    const extras: ParticipantLinkExtras = {}
    if (availabilityCommerceMode !== DEFAULT_AVAILABILITY_COMMERCE_MODE) {
      extras.availabilityCommerceMode = availabilityCommerceMode
    }
    return Object.keys(extras).length > 0 ? extras : undefined
  }, [availabilityCommerceMode])

  const applyParticipantViewToFacilitator = useCallback(() => {
    setFacilitatorUnlock(false)
    setUnlock(false)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('hideUi', '1')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const toggleSecretUnlock = useCallback(() => {
    const next = !readFacilitatorUnlock()
    setFacilitatorUnlock(next)
    setUnlock(next)
  }, [])

  return (
    <>
      <ShareLinkGate
        path="/projects/availability-shortcut"
        searchParams={searchParams}
        facilitatorUnlocked={unlock}
      >
        <div className="min-h-screen bg-white text-stone-900">
          <div className="mx-auto w-full max-w-[1308px] px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-8 xl:px-0">
            {!hideUi ? (
              <div className="mb-6">
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
            ) : null}

            {showFacilitatorChrome ? (
              <FacilitatorBar
                variant="a"
                allowedVariants={AVAILABILITY_SHORTCUT_FACILITATOR_VARIANTS}
                onVariantChange={resetAvailabilityFlow}
                onOpenParticipantLinkModal={() => setParticipantLinkModalOpen(true)}
                participantLinkButtonRef={participantLinkButtonRef}
                availabilityCommerceControls={{
                  commerceMode: availabilityCommerceMode,
                  onCommerceModeChange: handleAvailabilityCommerceModeChange,
                }}
              />
            ) : null}

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
                  availabilityCommerceMode={availabilityCommerceMode}
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

                <CollapsibleSection title="Additional Info" defaultOpen>
                  <AdditionalInfo />
                </CollapsibleSection>

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
                  availabilityCommerceMode={availabilityCommerceMode}
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
        </div>
      </ShareLinkGate>

      <SecretUnlock onToggleUnlock={toggleSecretUnlock} />

      <ParticipantLinkModal
        open={participantLinkModalOpen}
        onClose={() => setParticipantLinkModalOpen(false)}
        path="/projects/availability-shortcut"
        variant="a"
        extras={participantLinkExtras}
        onCopied={applyParticipantViewToFacilitator}
        returnFocusRef={participantLinkButtonRef}
      />
    </>
  )
}
