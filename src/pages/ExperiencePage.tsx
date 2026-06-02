import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePreloadMapPinImages } from '../hooks/usePreloadMapPinImages'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { AdditionalInfo } from '../components/additional/AdditionalInfo'
import { BookingSidebar } from '../components/booking/BookingSidebar'
import { CollapsibleSection } from '../components/common/CollapsibleSection'
import { MeetingAndPickupCard } from '../components/experience/MeetingAndPickupCard'
import { PdpCompareSimilarExperiences } from '../components/experience/pdp/PdpCompareSimilarExperiences'
import { PdpCustomersAlsoBought } from '../components/experience/pdp/PdpCustomersAlsoBought'
import { PdpCancellationQuestionsSection } from '../components/experience/pdp/PdpCancellationQuestionsSection'
import { PdpTravelerPhotosSection } from '../components/experience/pdp/PdpTravelerPhotosSection'
import { PdpViatorDeepReviewsBlock } from '../components/experience/pdp/PdpViatorDeepReviewsBlock'
import { PdpViatorTitleMeta } from '../components/experience/pdp/PdpViatorTitleMeta'
import { ViatorPdpBlock } from '../components/experience/pdp/ViatorPdpBlock'
import { LogisticsBlock } from '../components/logistics/LogisticsBlock'
import { FacilitatorBar } from '../components/uxr/FacilitatorBar'
import { ParticipantLinkModal } from '../components/uxr/ParticipantLinkModal'
import { SecretUnlock } from '../components/uxr/SecretUnlock'
import { ShareLinkGate } from '../components/uxr/ShareLinkGate'
import {
  LOGISTICS_FACILITATOR_VARIANTS,
  PRODUCT_HIGHLIGHT_FACILITATOR_VARIANTS,
  PRODUCT_HIGHLIGHT_PROJECT_PATH,
} from '../data/projects'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_CONCISE_SUMMARY,
  PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY,
} from '../data/productHighlightConciseSummary'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_TOP_PRODUCT,
  PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY,
} from '../data/productHighlightTopProduct'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_ICON_STYLE,
  isProductHighlightIconStyleId,
  PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY,
  type ProductHighlightIconStyleId,
} from '../data/productHighlightIconStyles'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT,
  isProductHighlightLayoutId,
  parseProductHighlightLayoutOptions,
  productHighlightLayoutFromOptions,
  PRODUCT_HIGHLIGHT_LAYOUT_QUERY,
  type ProductHighlightLayoutId,
} from '../data/productHighlightLayouts'
import { viatorListing } from '../data/viatorListing'
import {
  isVariantBLayout,
  isVariantTripleMeetingCardOnly,
  TRIPLE_MEETING_STOPS,
  variants,
  type VariantId,
} from '../data/variants'
import type { ParticipantLinkExtras } from '../uxr/shareLink'
import {
  readMapPinPhotoThumbnail,
  setMapPinPhotoThumbnail,
} from '../uxr/mapPinPhotoThumbnail'
import {
  parseHideUi,
  parseHighlightConciseSummary,
  parseHighlightIconStyle,
  parseHighlightLayout,
  parseHighlightTopProduct,
  parseVariant,
  readFacilitatorUnlock,
  setFacilitatorUnlock,
  shouldShowFacilitatorChrome,
} from '../uxr/urlState'

export function ExperiencePage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [unlock, setUnlock] = useState(() => readFacilitatorUnlock())
  const [mapPinPhotoThumbnail, setMapPinPhotoThumbnailState] = useState(() =>
    readMapPinPhotoThumbnail(),
  )
  const [participantLinkModalOpen, setParticipantLinkModalOpen] = useState(false)
  const participantLinkButtonRef = useRef<HTMLButtonElement>(null)

  const isProductHighlight = location.pathname === PRODUCT_HIGHLIGHT_PROJECT_PATH
  const parsedVariant = parseVariant(searchParams)
  const variant: VariantId = isProductHighlight ? 'a' : parsedVariant
  const facilitatorVariants = isProductHighlight
    ? PRODUCT_HIGHLIGHT_FACILITATOR_VARIANTS
    : LOGISTICS_FACILITATOR_VARIANTS

  const rawPhLayoutParam = searchParams.get(PRODUCT_HIGHLIGHT_LAYOUT_QUERY)
  const rawPhIconStyleParam = searchParams.get(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY)
  const highlightLayoutId: ProductHighlightLayoutId | null = useMemo(
    () => (isProductHighlight ? parseHighlightLayout(searchParams) : null),
    [isProductHighlight, searchParams],
  )
  const highlightIconStyleId: ProductHighlightIconStyleId | null = useMemo(
    () => (isProductHighlight ? parseHighlightIconStyle(searchParams) : null),
    [isProductHighlight, searchParams],
  )
  const highlightConciseSummary: boolean | null = useMemo(
    () => (isProductHighlight ? parseHighlightConciseSummary(searchParams) : null),
    [isProductHighlight, searchParams],
  )
  const highlightTopProduct: boolean | null = useMemo(
    () => (isProductHighlight ? parseHighlightTopProduct(searchParams) : null),
    [isProductHighlight, searchParams],
  )

  const hideUi = parseHideUi(searchParams)
  const data = variants[variant]

  useLayoutEffect(() => {
    if (!isProductHighlight) return
    if (parsedVariant !== 'a') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('variant', 'a')
          return next
        },
        { replace: true },
      )
    }
  }, [isProductHighlight, parsedVariant, setSearchParams])

  useLayoutEffect(() => {
    if (!isProductHighlight) return
    if (searchParams.has('phSet')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('phSet')
          return next
        },
        { replace: true },
      )
    }
  }, [isProductHighlight, searchParams, setSearchParams])

  useLayoutEffect(() => {
    if (!isProductHighlight) return
    if (
      rawPhLayoutParam === 'airbnb-trust' ||
      rawPhLayoutParam === 'ggy-list' ||
      rawPhLayoutParam === 'viator-cards' ||
      rawPhLayoutParam === 'compact-strip' ||
      rawPhLayoutParam === 'withlocals-merged'
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(PRODUCT_HIGHLIGHT_LAYOUT_QUERY, DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT)
          return next
        },
        { replace: true },
      )
      return
    }
    if (
      rawPhLayoutParam !== null &&
      rawPhLayoutParam !== '' &&
      !isProductHighlightLayoutId(rawPhLayoutParam)
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(PRODUCT_HIGHLIGHT_LAYOUT_QUERY, DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT)
          return next
        },
        { replace: true },
      )
    }
  }, [isProductHighlight, rawPhLayoutParam, setSearchParams])

  useLayoutEffect(() => {
    if (!isProductHighlight) return
    if (
      rawPhIconStyleParam !== null &&
      rawPhIconStyleParam !== '' &&
      !isProductHighlightIconStyleId(rawPhIconStyleParam)
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY, DEFAULT_PRODUCT_HIGHLIGHT_ICON_STYLE)
          return next
        },
        { replace: true },
      )
    }
  }, [isProductHighlight, rawPhIconStyleParam, setSearchParams])

  /** B2: shared with `LogisticsBlock` so Meeting & Pickup search stays synced with map/timeline. */
  const [b2PickupId, setB2PickupId] = useState<string | null>(null)
  const [b2HoverMeetingId, setB2HoverMeetingId] = useState<string | null>(null)
  /** A2: card-only pickup. C2: shared with map via `b2PickupApplyRef` + `tripleMeetingCardPickupId`. */
  const [tripleMeetingCardPickupId, setTripleMeetingCardPickupId] = useState<string | null>(null)
  /** Same handler as timeline/map (`LogisticsBlock.handleB2PickupChange`). */
  const b2PickupApplyRef = useRef<((id: string | null) => void) | null>(null)
  /** C2: increment to open meeting dropdown when a map pin is tapped. */
  const [c2OpenMeetingPickerNonce, setC2OpenMeetingPickerNonce] = useState(0)

  useEffect(() => {
    if (variant !== 'b2') {
      setB2PickupId(null)
      setB2HoverMeetingId(null)
    }
    if (!isVariantTripleMeetingCardOnly(variant)) {
      setTripleMeetingCardPickupId(null)
    }
  }, [variant])

  usePreloadMapPinImages(data.stops)

  const meetingAndPickupCard =
    data.meetingAndPickup != null ? (
      <MeetingAndPickupCard
        content={data.meetingAndPickup}
        variantId={variant}
        meetings={
          (variant === 'b2' || variant === 'c2' || variant === 'd2')
            ? data.stops.slice(0, 3)
            : isVariantTripleMeetingCardOnly(variant)
              ? TRIPLE_MEETING_STOPS
              : undefined
        }
        b2PickupId={
          variant === 'b2'
            ? b2PickupId
            : (variant === 'c2' || variant === 'd2')
              ? tripleMeetingCardPickupId
              : isVariantTripleMeetingCardOnly(variant)
                ? tripleMeetingCardPickupId
                : undefined
        }
        onB2PickupChange={
          (variant === 'b2' || variant === 'c2' || variant === 'd2')
            ? (id) => b2PickupApplyRef.current?.(id)
            : isVariantTripleMeetingCardOnly(variant)
              ? setTripleMeetingCardPickupId
              : undefined
        }
        onB2MeetingHover={(variant === 'b2' || variant === 'c2' || variant === 'd2') ? setB2HoverMeetingId : undefined}
        b2HoverMeetingId={(variant === 'c2' || variant === 'd2') ? b2HoverMeetingId : undefined}
        openMeetingPickerSignal={(variant === 'c2' || variant === 'd2') ? c2OpenMeetingPickerNonce : 0}
      />
    ) : null

  const meetingAndPickupAccordion =
    variant !== 'c2' && variant !== 'd2' && meetingAndPickupCard != null ? (
      <CollapsibleSection title="Meeting and Pickup" defaultOpen={!isVariantBLayout(variant)}>
        {meetingAndPickupCard}
      </CollapsibleSection>
    ) : null

  const meetingAndPickupInlineInItinerary =
    (variant === 'c2' || variant === 'd2') && meetingAndPickupCard != null ? (
      /**
       * C2: meeting card inline before LogisticsBlock.
       * D2 uses timeline meeting row (MW sandwich + desktop dropdown) — card hidden.
       */
      <div
        className={`mt-6 max-md:relative max-md:z-[70] max-md:overflow-visible ${
          variant === 'd2' ? 'hidden' : ''
        }`}
      >
        {meetingAndPickupCard}
      </div>
    ) : null

  const handleMapPinPhotoThumbnailChange = useCallback((enabled: boolean) => {
    setMapPinPhotoThumbnailState(enabled)
    setMapPinPhotoThumbnail(enabled)
  }, [])

  const showFacilitatorChrome = useMemo(
    () => shouldShowFacilitatorChrome(hideUi, unlock),
    [hideUi, unlock],
  )

  const setVariant = useCallback(
    (v: VariantId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('variant', v)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setHighlightLayout = useCallback(
    (id: ProductHighlightLayoutId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id === DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT) {
            next.delete(PRODUCT_HIGHLIGHT_LAYOUT_QUERY)
          } else {
            next.set(PRODUCT_HIGHLIGHT_LAYOUT_QUERY, id)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setHighlightIconStyle = useCallback(
    (id: ProductHighlightIconStyleId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id === DEFAULT_PRODUCT_HIGHLIGHT_ICON_STYLE) {
            next.delete(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY)
          } else {
            next.set(PRODUCT_HIGHLIGHT_ICON_STYLE_QUERY, id)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setHighlightConciseSummary = useCallback(
    (on: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (on === DEFAULT_PRODUCT_HIGHLIGHT_CONCISE_SUMMARY) {
            next.delete(PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY)
          } else {
            next.set(PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_QUERY, on ? '1' : '0')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setHighlightTopProduct = useCallback(
    (on: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (on === DEFAULT_PRODUCT_HIGHLIGHT_TOP_PRODUCT) {
            next.delete(PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY)
          } else {
            next.set(PRODUCT_HIGHLIGHT_TOP_PRODUCT_QUERY, '1')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const participantLinkExtras = useMemo((): ParticipantLinkExtras | undefined => {
    if (!isProductHighlight || highlightLayoutId == null) return undefined
    return {
      highlightLayoutId,
      highlightIconStyleId: highlightIconStyleId ?? undefined,
      highlightConciseSummary: highlightConciseSummary ?? undefined,
      highlightTopProduct: highlightTopProduct ?? undefined,
    }
  }, [
    isProductHighlight,
    highlightLayoutId,
    highlightIconStyleId,
    highlightConciseSummary,
    highlightTopProduct,
  ])

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
      path={location.pathname}
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
            variant={variant}
            allowedVariants={facilitatorVariants}
            onVariantChange={setVariant}
            onOpenParticipantLinkModal={() => setParticipantLinkModalOpen(true)}
            participantLinkButtonRef={participantLinkButtonRef}
            highlightLayoutControls={
              isProductHighlight && highlightLayoutId
                ? {
                    ...parseProductHighlightLayoutOptions(highlightLayoutId),
                    onBaseChange: (base) => {
                      const { iconRail } = parseProductHighlightLayoutOptions(highlightLayoutId)
                      setHighlightLayout(productHighlightLayoutFromOptions(base, iconRail))
                    },
                    onIconRailChange: (iconRail) => {
                      const { base } = parseProductHighlightLayoutOptions(highlightLayoutId)
                      setHighlightLayout(productHighlightLayoutFromOptions(base, iconRail))
                    },
                  }
                : undefined
            }
            highlightIconStyleControls={
              isProductHighlight && highlightIconStyleId
                ? {
                    iconStyle: highlightIconStyleId,
                    onIconStyleChange: (iconStyle) => {
                      if (isProductHighlightIconStyleId(iconStyle)) setHighlightIconStyle(iconStyle)
                    },
                  }
                : undefined
            }
            highlightConciseSummaryControls={
              isProductHighlight && highlightConciseSummary != null
                ? {
                    conciseSummary: highlightConciseSummary,
                    onConciseSummaryChange: setHighlightConciseSummary,
                  }
                : undefined
            }
            highlightTopProductControls={
              isProductHighlight && highlightTopProduct != null
                ? {
                    topProduct: highlightTopProduct,
                    onTopProductChange: setHighlightTopProduct,
                  }
                : undefined
            }
            mapPinPhotoThumbnailControls={
              !isProductHighlight
                ? {
                    enabled: mapPinPhotoThumbnail,
                    onEnabledChange: handleMapPinPhotoThumbnailChange,
                  }
                : undefined
            }
          />
        ) : null}

        <div className="mb-5 w-full min-w-0">
          <PdpViatorTitleMeta
            title={viatorListing.tourTitle}
            averageRating={viatorListing.averageRating}
            reviewCount={viatorListing.reviewCount}
            locationLine={viatorListing.locationLine}
            quickFacts={
              isProductHighlight && highlightLayoutId
                ? parseProductHighlightLayoutOptions(highlightLayoutId).iconRail === 'klook'
                  ? viatorListing.iconRail
                  : undefined
                : undefined
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6 xl:gap-6">
          <main className="pdp-figma w-full min-w-0 max-w-[864px] lg:order-1">
            <ViatorPdpBlock
              booking={data.booking}
              productHighlightLayoutId={isProductHighlight ? highlightLayoutId : null}
              productHighlightIconStyleId={isProductHighlight ? highlightIconStyleId : null}
              productHighlightConciseSummary={isProductHighlight ? highlightConciseSummary : null}
              productHighlightTopProduct={isProductHighlight ? highlightTopProduct : null}
            />
            {!isVariantBLayout(variant) && meetingAndPickupAccordion}

            <CollapsibleSection title="Itinerary" defaultOpen>
              {data.whatToExpectIntro || data.whatToExpectExtra ? (
                <WhatToExpectIntroBlock
                  key={variant}
                  intro={data.whatToExpectIntro ?? ''}
                  extra={data.whatToExpectExtra ?? ''}
                />
              ) : null}

              {meetingAndPickupInlineInItinerary}

              <LogisticsBlock
                key={`logistics-${variant}`}
                variantId={variant}
                stops={data.stops}
                routeLngLat={data.routeLngLat}
                routePolylineLngLat={data.routePolylineLngLat}
                mapKey={`logistics-${variant}`}
                mapPinPhotoThumbnail={mapPinPhotoThumbnail}
                poiPopupContent="image-only"
                controlledB2PickupId={
                  variant === 'b2'
                    ? b2PickupId
                    : (variant === 'c2' || variant === 'd2')
                      ? tripleMeetingCardPickupId
                      : undefined
                }
                onControlledB2PickupChange={
                  variant === 'b2'
                    ? setB2PickupId
                    : (variant === 'c2' || variant === 'd2')
                      ? setTripleMeetingCardPickupId
                      : undefined
                }
                controlledB2HoverMeetingId={
                  (variant === 'b2' || variant === 'c2' || variant === 'd2')
                    ? b2HoverMeetingId
                    : undefined
                }
                onControlledB2MeetingHover={
                  (variant === 'b2' || variant === 'c2' || variant === 'd2')
                    ? setB2HoverMeetingId
                    : undefined
                }
                onExposeB2PickupApply={
                  (variant === 'b2' || variant === 'c2' || variant === 'd2')
                    ? (fn) => {
                        b2PickupApplyRef.current = fn
                      }
                    : undefined
                }
                onC2MapMeetingPinClick={
                  (variant === 'c2' || variant === 'd2')
                    ? (meetingStopId) => {
                        setB2HoverMeetingId(meetingStopId)
                        setC2OpenMeetingPickerNonce((n) => n + 1)
                      }
                    : undefined
                }
                openMeetingPickerSignal={variant === 'd2' ? c2OpenMeetingPickerNonce : 0}
              />
            </CollapsibleSection>

            {isVariantBLayout(variant) && meetingAndPickupAccordion}

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
            <BookingSidebar booking={data.booking} />
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
        path={location.pathname}
        variant={variant}
        extras={participantLinkExtras}
        onCopied={applyParticipantViewToFacilitator}
        returnFocusRef={participantLinkButtonRef}
      />
    </>
  )
}

function WhatToExpectIntroBlock({
  intro,
  extra,
}: {
  intro: string
  extra: string
}) {
  const [readMore, setReadMore] = useState(false)

  return (
    <>
      {!readMore ? (
        <div className="relative max-w-none">
          <p className="line-clamp-3 text-base leading-[1.5] text-[#333]">{intro}</p>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/85 to-transparent"
            aria-hidden
          />
        </div>
      ) : (
        <div className="max-w-none space-y-3 text-base leading-[1.5] text-[#333]">
          {intro.split('\n\n').map((block, i) => (
            <p key={`intro-${i}`}>{block}</p>
          ))}
          {extra
            ? extra.split('\n\n').map((block, i) => (
                <p key={`extra-${i}`}>{block}</p>
              ))
            : null}
        </div>
      )}
      <button
        type="button"
        className="group mt-3 inline-flex cursor-pointer items-center gap-1.5 text-base font-medium text-[#0d0d0d] underline [text-decoration-skip-ink:none] decoration-[#0d0d0d] underline-offset-2 transition hover:text-black hover:decoration-black"
        onClick={() => setReadMore((r) => !r)}
      >
        {readMore ? 'Read less' : 'Read more'}
        <ChevronTiny down={!readMore} />
      </button>
    </>
  )
}

function ChevronTiny({ down }: { down: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${down ? '' : 'rotate-180'}`}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
