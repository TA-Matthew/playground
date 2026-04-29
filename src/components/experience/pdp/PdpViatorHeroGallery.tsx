import { useCallback, useMemo, useState } from 'react'
import { viatorListing, type MediaItem } from '../../../data/viatorListing'

type Props = {
  /** Optional: scroll to traveler photos for “see more” */
  travelerPhotosHref?: string
}

function DemandFlameIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-[#333333]"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.8426 1.65C13.6153 1.47956 13.3113 1.45214 13.0572 1.57918C12.8031 1.70623 12.6426 1.96593 12.6426 2.25C12.6426 4.87985 12.0078 8.34997 8.75018 9.71919C8.30365 9.08656 7.87473 8.00459 7.87473 6.42858C7.87473 6.16865 7.74014 5.92725 7.51903 5.79059C7.29791 5.65394 7.02181 5.64152 6.78932 5.75776C5.14035 6.58224 2.89258 8.93248 2.89258 13.3929C2.89258 16.3821 4.021 18.6791 5.75591 20.2213C7.47703 21.7512 9.75064 22.5 11.9997 22.5C14.2488 22.5 16.5224 21.7512 18.2435 20.2213C19.9785 18.6791 21.1069 16.3821 21.1069 13.3929C21.1069 7.41621 16.6192 3.73244 13.8426 1.65ZM8.75476 11.3187C12.6934 10.0058 13.8165 6.49094 14.0753 3.72837C16.6774 5.83025 19.6069 8.89777 19.6069 13.3929C19.6069 15.9751 18.646 17.8566 17.247 19.1002C15.8342 20.356 13.9292 21 11.9997 21C10.0702 21 8.16527 20.356 6.75246 19.1002C5.35344 17.8566 4.39258 15.9751 4.39258 13.3929C4.39258 10.4961 5.45954 8.74242 6.47413 7.79959C6.70555 9.33672 7.31223 10.4625 7.98726 11.1375C8.18813 11.3384 8.48526 11.4085 8.75476 11.3187Z"
        fill="currentColor"
      />
    </svg>
  )
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
            className="pointer-events-auto absolute bottom-3 left-3 z-20 flex min-h-[53px] w-[min(100%,245px)] max-w-[245px] flex-row items-start gap-4 rounded-lg bg-[#E2EFFF] px-4 py-2 font-sans"
            role="status"
          >
            <DemandFlameIcon />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5 tracking-[0.05px] text-[#333333]">
                In high demand!
              </p>
              <p className="mt-0.5 text-[13px] font-normal leading-[17px] tracking-[0.05px] text-[#333333]">
                20+ bookings in the last hour!
              </p>
            </div>
          </div>

          <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
            >
              <svg className="size-5 shrink-0 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M12 15.8855C11.5858 15.8855 11.25 15.5497 11.25 15.1355L11.25 5.5616L7.99908 8.81254C7.70619 9.10544 7.23131 9.10544 6.93842 8.81254C6.64553 8.51965 6.64553 8.04478 6.93842 7.75188L11.4697 3.22063C11.4909 3.19938 11.5133 3.17954 11.5367 3.16116C11.6643 3.06083 11.8252 3.00098 12 3.00098C12.2085 3.00098 12.3971 3.08602 12.533 3.2233L17.0616 7.75188C17.3545 8.04478 17.3545 8.51965 17.0616 8.81254C16.7687 9.10544 16.2938 9.10544 16.0009 8.81254L12.75 5.56164L12.75 15.1355C12.75 15.5497 12.4142 15.8855 12 15.8855Z"
                  fill="currentColor"
                />
                <path
                  d="M7.25 20.9808C5.45508 20.9808 4 19.5258 4 17.7308V11.5346C4 11.1204 4.33579 10.7846 4.75 10.7846C5.16421 10.7846 5.5 11.1204 5.5 11.5346L5.5 17.7308C5.5 18.6973 6.2835 19.4808 7.25 19.4808H16.75C17.7165 19.4808 18.5 18.6973 18.5 17.7308V11.5346C18.5 11.1204 18.8358 10.7846 19.25 10.7846C19.6642 10.7846 20 11.1204 20 11.5346V17.7308C20 19.5257 18.5449 20.9808 16.75 20.9808H7.25Z"
                  fill="currentColor"
                />
              </svg>
              Share
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
            >
              <svg className="size-5 shrink-0 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M12.8197 5.57912L11.999 6.40163L11.1757 5.57838C9.07663 3.47931 5.67337 3.47931 3.5743 5.57838C1.47523 7.67744 1.47523 11.0807 3.5743 13.1798L11.4697 21.0751C11.7626 21.368 12.2374 21.368 12.5303 21.0751L20.4318 13.1783C22.5262 11.0723 22.5298 7.67857 20.4303 5.57912C18.3274 3.47623 14.9226 3.47623 12.8197 5.57912ZM19.3682 12.1206L12 19.4842L4.63496 12.1191C3.12168 10.6058 3.12168 8.15232 4.63496 6.63904C6.14824 5.12575 8.60176 5.12575 10.115 6.63904L11.4725 7.99648C11.7703 8.29435 12.255 8.28854 12.5457 7.98363L13.8803 6.63978C15.3974 5.12268 17.8526 5.12268 19.3697 6.63978C20.8833 8.15343 20.8807 10.5997 19.3682 12.1206Z"
                  fill="currentColor"
                />
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
