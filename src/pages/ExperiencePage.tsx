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
import { SecretUnlock } from '../components/uxr/SecretUnlock'
import {
  LOGISTICS_FACILITATOR_VARIANTS,
  PRODUCT_HIGHLIGHT_FACILITATOR_VARIANTS,
  PRODUCT_HIGHLIGHT_PROJECT_PATH,
} from '../data/projects'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_LAYOUT,
  isProductHighlightLayoutId,
  PRODUCT_HIGHLIGHT_LAYOUTS,
  PRODUCT_HIGHLIGHT_LAYOUT_QUERY,
  type ProductHighlightLayoutId,
} from '../data/productHighlightLayouts'
import {
  DEFAULT_PRODUCT_HIGHLIGHT_SET,
  isProductHighlightSetId,
  PRODUCT_HIGHLIGHT_SETS,
  PRODUCT_HIGHLIGHT_SET_QUERY,
  type ProductHighlightSetId,
} from '../data/productHighlightSets'
import { viatorListing } from '../data/viatorListing'
import {
  isVariantBLayout,
  TRIPLE_MEETING_STOPS,
  variants,
  type VariantId,
} from '../data/variants'
import {
  buildParticipantUrl,
  parseHideUi,
  parseHighlightLayout,
  parseHighlightSet,
  parseVariant,
  readFacilitatorUnlock,
  setFacilitatorUnlock,
  shouldShowFacilitatorChrome,
} from '../uxr/urlState'

export function ExperiencePage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [unlock, setUnlock] = useState(() => readFacilitatorUnlock())
  const [copyFeedback, setCopyFeedback] = useState(false)

  const isProductHighlight = location.pathname === PRODUCT_HIGHLIGHT_PROJECT_PATH
  const parsedVariant = parseVariant(searchParams)
  const variant: VariantId = isProductHighlight ? 'a' : parsedVariant
  const facilitatorVariants = isProductHighlight
    ? PRODUCT_HIGHLIGHT_FACILITATOR_VARIANTS
    : LOGISTICS_FACILITATOR_VARIANTS

  const rawPhSetParam = searchParams.get(PRODUCT_HIGHLIGHT_SET_QUERY)
  const rawPhLayoutParam = searchParams.get(PRODUCT_HIGHLIGHT_LAYOUT_QUERY)
  const highlightSetId: ProductHighlightSetId | null = useMemo(
    () => (isProductHighlight ? parseHighlightSet(searchParams) : null),
    [isProductHighlight, searchParams],
  )
  const highlightLayoutId: ProductHighlightLayoutId | null = useMemo(
    () => (isProductHighlight ? parseHighlightLayout(searchParams) : null),
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
    if (rawPhSetParam !== null && rawPhSetParam !== '' && !isProductHighlightSetId(rawPhSetParam)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(PRODUCT_HIGHLIGHT_SET_QUERY, DEFAULT_PRODUCT_HIGHLIGHT_SET)
          return next
        },
        { replace: true },
      )
    }
  }, [isProductHighlight, rawPhSetParam, setSearchParams])

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

  /** B2: shared with `LogisticsBlock` so Meeting & Pickup search stays synced with map/timeline. */
  const [b2PickupId, setB2PickupId] = useState<string | null>(null)
  const [b2HoverMeetingId, setB2HoverMeetingId] = useState<string | null>(null)
  /** A2: meeting pick is card-only — not wired to map/timeline. */
  const [a2PickupId, setA2PickupId] = useState<string | null>(null)
  /** Same handler as timeline/map (`LogisticsBlock.handleB2PickupChange`). */
  const b2PickupApplyRef = useRef<((id: string | null) => void) | null>(null)

  useEffect(() => {
    if (variant !== 'b2') {
      setB2PickupId(null)
      setB2HoverMeetingId(null)
    }
    if (variant !== 'a2') {
      setA2PickupId(null)
    }
  }, [variant])

  usePreloadMapPinImages(data.stops)

  const meetingAndPickupSection = data.meetingAndPickup ? (
    <CollapsibleSection title="Meeting and Pickup" defaultOpen={!isVariantBLayout(variant)}>
      <MeetingAndPickupCard
        content={data.meetingAndPickup}
        variantId={variant}
        meetings={
          variant === 'b2'
            ? data.stops.slice(0, 3)
            : variant === 'a2'
              ? TRIPLE_MEETING_STOPS
              : undefined
        }
        b2PickupId={
          variant === 'b2' ? b2PickupId : variant === 'a2' ? a2PickupId : undefined
        }
        onB2PickupChange={
          variant === 'b2'
            ? (id) => b2PickupApplyRef.current?.(id)
            : variant === 'a2'
              ? setA2PickupId
              : undefined
        }
        onB2MeetingHover={variant === 'b2' ? setB2HoverMeetingId : undefined}
      />
    </CollapsibleSection>
  ) : null

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

  const setHighlightSet = useCallback(
    (id: ProductHighlightSetId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id === DEFAULT_PRODUCT_HIGHLIGHT_SET) {
            next.delete(PRODUCT_HIGHLIGHT_SET_QUERY)
          } else {
            next.set(PRODUCT_HIGHLIGHT_SET_QUERY, id)
          }
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

  const copyParticipantLink = useCallback(async () => {
    const url = buildParticipantUrl(
      variant,
      isProductHighlight && highlightSetId != null && highlightLayoutId != null
        ? { highlightSetId, highlightLayoutId }
        : undefined,
    )
    try {
      await navigator.clipboard.writeText(url)
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
      setCopyFeedback(true)
      window.setTimeout(() => setCopyFeedback(false), 2000)
    } catch {
      setCopyFeedback(false)
    }
  }, [variant, setSearchParams, isProductHighlight, highlightSetId, highlightLayoutId])

  const toggleSecretUnlock = useCallback(() => {
    const next = !readFacilitatorUnlock()
    setFacilitatorUnlock(next)
    setUnlock(next)
  }, [])

  return (
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
            onCopyParticipantLink={copyParticipantLink}
            copyFeedback={copyFeedback}
            highlightCopyControls={
              isProductHighlight && highlightSetId
                ? {
                    selectedId: highlightSetId,
                    options: PRODUCT_HIGHLIGHT_SETS.map((s) => ({
                      id: s.id,
                      label: s.facilitatorLabel,
                    })),
                    onChange: (id) => {
                      if (isProductHighlightSetId(id)) setHighlightSet(id)
                    },
                  }
                : undefined
            }
            highlightLayoutControls={
              isProductHighlight && highlightLayoutId
                ? {
                    selectedId: highlightLayoutId,
                    options: PRODUCT_HIGHLIGHT_LAYOUTS.map((l) => ({
                      id: l.id,
                      label: l.facilitatorLabel,
                    })),
                    onChange: (id) => {
                      if (isProductHighlightLayoutId(id)) setHighlightLayout(id)
                    },
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
              isProductHighlight &&
              (highlightLayoutId === 'headout-grid' || highlightLayoutId === 'expedia-klook-labels')
                ? viatorListing.iconRail
                : undefined
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-6 xl:gap-6">
          <main className="pdp-figma w-full min-w-0 max-w-[864px] lg:order-1">
            <ViatorPdpBlock
              booking={data.booking}
              productHighlightSetId={isProductHighlight ? highlightSetId : null}
              productHighlightLayoutId={isProductHighlight ? highlightLayoutId : null}
            />
            {!isVariantBLayout(variant) && meetingAndPickupSection}

            <CollapsibleSection title="Itinerary" defaultOpen>
              {data.whatToExpectIntro || data.whatToExpectExtra ? (
                <WhatToExpectIntroBlock
                  key={variant}
                  intro={data.whatToExpectIntro ?? ''}
                  extra={data.whatToExpectExtra ?? ''}
                />
              ) : null}

              <LogisticsBlock
                key={`logistics-${variant}`}
                variantId={variant}
                stops={data.stops}
                routeLngLat={data.routeLngLat}
                routePolylineLngLat={data.routePolylineLngLat}
                mapKey={`logistics-${variant}`}
                poiPopupContent="image-only"
                controlledB2PickupId={variant === 'b2' ? b2PickupId : undefined}
                onControlledB2PickupChange={variant === 'b2' ? setB2PickupId : undefined}
                controlledB2HoverMeetingId={variant === 'b2' ? b2HoverMeetingId : undefined}
                onControlledB2MeetingHover={variant === 'b2' ? setB2HoverMeetingId : undefined}
                onExposeB2PickupApply={
                  variant === 'b2'
                    ? (fn) => {
                        b2PickupApplyRef.current = fn
                      }
                    : undefined
                }
              />
            </CollapsibleSection>

            {isVariantBLayout(variant) && meetingAndPickupSection}

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

      <SecretUnlock onToggleUnlock={toggleSecretUnlock} />
    </div>
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
