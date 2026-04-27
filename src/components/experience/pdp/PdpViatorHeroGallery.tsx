import { useCallback, useMemo, useState } from 'react'
import { viatorListing, type MediaItem } from '../../../data/viatorListing'

type Props = {
  /** Optional: scroll to traveler photos for “see more” */
  travelerPhotosHref?: string
}

/**
 * Figma node 20632:95823 — left rail (4 thumbs + “See more”), right hero, share / wishlist / chevrons.
 * @see https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20632-95823
 */
export function PdpViatorHeroGallery({ travelerPhotosHref = '#pdp-traveler-photos-main-h' }: Props) {
  const { hero, thumbnails: t } = viatorListing.media
  const strip = (t.length >= 4 ? t.slice(0, 4) : t) as MediaItem[]
  const seeMoreBg = t[3] ?? t[0] ?? hero

  /** Slides: [hero, …first four thumbs] for prev/next and thumb sync */
  const slides = useMemo<MediaItem[]>(() => {
    const rest = t.slice(0, 4)
    return [hero, ...rest]
  }, [hero, t])
  const [idx, setIdx] = useState(0)
  const mainSrc = slides[idx] ?? hero

  const goPrev = useCallback(() => {
    setIdx((i) => (i - 1 + slides.length) % slides.length)
  }, [slides.length])
  const goNext = useCallback(() => {
    setIdx((i) => (i + 1) % slides.length)
  }, [slides.length])

  return (
    <div
      className="w-full"
      data-node="pdp-hero-gallery"
    >
      <div className="flex flex-col gap-3 md:min-h-[20rem] md:flex-row md:items-stretch md:gap-4">
        <div
          className="flex w-full max-h-24 min-h-0 flex-row gap-2 overflow-x-auto pb-1 sm:h-[min(32rem,52vh)] sm:max-h-none sm:min-h-0 sm:w-24 sm:min-w-24 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible md:h-[min(32rem,52vh)] md:w-[150px] md:min-w-[150px]"
          aria-label="Image thumbnails"
        >
          {strip.map((img, i) => {
            const slideIndex = i + 1
            const isActive = idx === slideIndex
            return (
              <button
                key={img.src}
                type="button"
                onClick={() => setIdx(slideIndex)}
                className={`relative aspect-[150/98] w-full shrink-0 overflow-hidden rounded-lg sm:w-full sm:max-w-full md:aspect-[150/98] md:min-h-0 md:min-w-0 md:max-w-none md:flex-1 ${
                  isActive ? 'ring-2 ring-black/25 ring-offset-1' : ''
                }`}
              >
                <img
                  alt=""
                  className="size-full object-cover"
                  src={img.src}
                  width={150}
                  height={98}
                  loading="lazy"
                />
                <span
                  className="pointer-events-none absolute inset-0 ring-inset ring-transparent transition group-hover:ring-white/20"
                  aria-hidden
                />
              </button>
            )
          })}
          <a
            href={travelerPhotosHref}
            className="relative aspect-[150/98] w-full shrink-0 overflow-hidden rounded-lg sm:w-full sm:max-w-full md:aspect-[150/98] md:min-h-0 md:min-w-0 md:max-w-none md:flex-1"
          >
            <img
              alt=""
              className="size-full object-cover"
              src={seeMoreBg.src}
              width={150}
              height={98}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50" aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center p-1">
              <span className="rounded-2xl bg-black/40 px-2 py-1 text-center text-xs font-bold leading-normal text-white">
                See More
              </span>
            </div>
          </a>
        </div>

        <div
          className="relative min-h-[220px] w-full min-w-0 flex-1 overflow-hidden rounded-lg md:min-h-[20rem] lg:min-h-[24rem]"
        >
          <img
            alt={mainSrc.alt}
            className="size-full object-cover"
            src={mainSrc.src}
            width={1200}
            height={800}
            loading="eager"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"
            aria-hidden
          />

          <div
            className="pointer-events-auto absolute bottom-3 left-3 z-20 max-w-[min(100%,18rem)] rounded-md bg-white/90 px-3 py-2 shadow-sm ring-1 ring-black/5"
            role="status"
          >
            <p className="text-xs font-bold leading-snug text-[#1a1a1a]">In high demand!</p>
            <p className="text-[11px] leading-snug text-[#333]">20+ bookings in the last 24 hours</p>
          </div>

          <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
            >
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M4 12v6a1 1 0 0 0 1 1h3M16 4h2a1 1 0 0 1 1 1v2M8 4H6a1 1 0 0 0-1 1v2"
                  strokeLinecap="round"
                />
                <path d="M16 4l-4 4-4-4M12 8v8" strokeLinecap="round" />
              </svg>
              Share
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
            >
              <svg
                className="size-5 shrink-0 text-rose-600"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Add to wishlist
            </button>
          </div>

          <div className="absolute inset-y-0 left-2 z-20 flex items-center">
            <button
              type="button"
              onClick={goPrev}
              className="grid size-10 place-content-center rounded-full border border-white/20 bg-white/80 text-black shadow-sm backdrop-blur-sm"
              aria-label="Previous image"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 z-20 flex items-center">
            <button
              type="button"
              onClick={goNext}
              className="grid size-10 place-content-center rounded-full border border-white/20 bg-white/80 text-black shadow-sm backdrop-blur-sm"
              aria-label="Next image"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
