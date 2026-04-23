import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdditionalInfo } from '../components/additional/AdditionalInfo'
import { BookingSidebar } from '../components/booking/BookingSidebar'
import { CollapsibleSection } from '../components/common/CollapsibleSection'
import { MeetingAndPickupCard } from '../components/experience/MeetingAndPickupCard'
import { LogisticsBlock } from '../components/logistics/LogisticsBlock'
import { FacilitatorBar } from '../components/uxr/FacilitatorBar'
import { SecretUnlock } from '../components/uxr/SecretUnlock'
import { variants, type VariantId } from '../data/variants'
import {
  buildParticipantUrl,
  parseHideUi,
  parseVariant,
  readFacilitatorUnlock,
  setFacilitatorUnlock,
  shouldShowFacilitatorChrome,
} from '../uxr/urlState'

export function ExperiencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [unlock, setUnlock] = useState(() => readFacilitatorUnlock())
  const [copyFeedback, setCopyFeedback] = useState(false)

  const hideUi = parseHideUi(searchParams)
  const variant: VariantId = parseVariant(searchParams)
  const data = variants[variant]

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

  const copyParticipantLink = useCallback(async () => {
    const url = buildParticipantUrl(variant)
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
  }, [variant, setSearchParams])

  const toggleSecretUnlock = useCallback(() => {
    const next = !readFacilitatorUnlock()
    setFacilitatorUnlock(next)
    setUnlock(next)
  }, [])

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto w-full max-w-[1308px] px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-8 xl:px-10">
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
            onVariantChange={setVariant}
            onCopyParticipantLink={copyParticipantLink}
            copyFeedback={copyFeedback}
          />
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:gap-12">
          <main className="min-w-0 lg:order-1">
            {data.meetingAndPickup ? (
              <CollapsibleSection title="Meeting and Pickup" defaultOpen>
                <MeetingAndPickupCard content={data.meetingAndPickup} />
              </CollapsibleSection>
            ) : null}

            <CollapsibleSection
              title={variant === 'b' ? 'Itinerary & Meeting point' : 'Itinerary'}
              defaultOpen
            >
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
                mapKey={`logistics-${variant}`}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Additional Info" defaultOpen>
              <AdditionalInfo />
            </CollapsibleSection>
          </main>

          <aside className="hidden min-w-0 lg:order-2 lg:block lg:sticky lg:top-8 lg:z-10 lg:self-start">
            <BookingSidebar booking={data.booking} variantId={variant} />
          </aside>
        </div>
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
          <p className="line-clamp-3 text-[15px] leading-relaxed text-stone-700">{intro}</p>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/85 to-transparent"
            aria-hidden
          />
        </div>
      ) : (
        <div className="max-w-none space-y-3 text-[15px] leading-relaxed text-stone-700">
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
        className="group mt-3 inline-flex items-center gap-1.5 text-[15px] font-medium text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 transition hover:text-emerald-900 hover:decoration-emerald-800/60"
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
