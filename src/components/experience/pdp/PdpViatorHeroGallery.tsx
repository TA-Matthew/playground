import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { viatorListing, type MediaItem } from '../../../data/viatorListing'

const MOBILE_GALLERY_IMAGE_COUNT = 18
/** Visible slice of the next slide on the right (MW carousel peek). */
const MOBILE_GALLERY_RIGHT_PEEK_PX = 16
/** Matches `gap-1` between horizontal slides — included in width math so peek stays exact. */
const MOBILE_GALLERY_INTER_SLIDE_GAP_PX = 4
/** Flex grow weights — left square vs right stack (~210 : 127.5); `gap-1` between columns and rows. */
const MOBILE_GALLERY_COL_PRIMARY_FR = 210
const MOBILE_GALLERY_COL_SECONDARY_FR = 127.5

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

const HERO_DEMAND_DELAY_MS = 600
const HERO_DEMAND_VISIBLE_MS = 5000
const HERO_DEMAND_FADE_MS = 350

/** “In high demand!” — waits on landing, fades in, shows, then fades out and unmounts. */
function HeroDemandRibbon({ mobileGallery }: { mobileGallery?: boolean }) {
  const [mountedAfterDelay, setMountedAfterDelay] = useState(false)
  const [opaque, setOpaque] = useState(false)
  const [finished, setFinished] = useState(false)
  const postRevealTimeoutsRef = useRef<ReturnType<typeof window.setTimeout>[]>([])

  useEffect(() => {
    let cancelled = false
    const tDelay = window.setTimeout(() => {
      if (!cancelled) setMountedAfterDelay(true)
    }, HERO_DEMAND_DELAY_MS)
    return () => {
      cancelled = true
      window.clearTimeout(tDelay)
    }
  }, [])

  useEffect(() => {
    if (!mountedAfterDelay) return undefined

    let cancelled = false
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return
      setOpaque(true)
      postRevealTimeoutsRef.current = [
        window.setTimeout(() => {
          if (!cancelled) setOpaque(false)
        }, HERO_DEMAND_VISIBLE_MS),
        window.setTimeout(() => {
          if (!cancelled) setFinished(true)
        }, HERO_DEMAND_VISIBLE_MS + HERO_DEMAND_FADE_MS),
      ]
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      postRevealTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
      postRevealTimeoutsRef.current = []
    }
  }, [mountedAfterDelay])

  if (!mountedAfterDelay || finished) {
    return null
  }

  return (
    <div
      className={`pointer-events-auto absolute z-20 flex min-h-[53px] w-[min(100%,245px)] max-w-[245px] flex-row items-start gap-4 rounded-lg bg-[#E2EFFF] px-4 py-2 font-sans ease-in-out transition-opacity ${
        mobileGallery ? 'bottom-[16px] left-[16px]' : 'bottom-3 left-3'
      } ${
        opaque ? 'opacity-100' : 'pointer-events-none opacity-0 select-none'
      }`}
      style={{ transitionDuration: `${HERO_DEMAND_FADE_MS}ms`, transitionProperty: 'opacity' }}
      aria-live="polite"
      role="status"
    >
      <DemandFlameIcon />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 tracking-[0.05px] text-[#333333]">In high demand!</p>
        <p className="mt-0.5 text-[13px] font-normal leading-[17px] tracking-[0.05px] text-[#333333]">
          20+ bookings in the last hour!
        </p>
      </div>
    </div>
  )
}

function HeroGalleryShareWishlist({ variant = 'pill' }: { variant?: 'pill' | 'icon' }) {
  const shareIcon = (
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
  )
  const wishlistIcon = (
    <svg className="size-5 shrink-0 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12.8197 5.57912L11.999 6.40163L11.1757 5.57838C9.07663 3.47931 5.67337 3.47931 3.5743 5.57838C1.47523 7.67744 1.47523 11.0807 3.5743 13.1798L11.4697 21.0751C11.7626 21.368 12.2374 21.368 12.5303 21.0751L20.4318 13.1783C22.5262 11.0723 22.5298 7.67857 20.4303 5.57912C18.3274 3.47623 14.9226 3.47623 12.8197 5.57912ZM19.3682 12.1206L12 19.4842L4.63496 12.1191C3.12168 10.6058 3.12168 8.15232 4.63496 6.63904C6.14824 5.12575 8.60176 5.12575 10.115 6.63904L11.4725 7.99648C11.7703 8.29435 12.255 8.28854 12.5457 7.98363L13.8803 6.63978C15.3974 5.12268 17.8526 5.12268 19.3697 6.63978C20.8833 8.15343 20.8807 10.5997 19.3682 12.1206Z"
        fill="currentColor"
      />
    </svg>
  )

  if (variant === 'icon') {
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="grid size-10 place-content-center rounded-full border border-[#b3b3b3] bg-white text-black shadow-sm"
          aria-label="Share"
        >
          {shareIcon}
        </button>
        <button
          type="button"
          className="grid size-10 place-content-center rounded-full border border-[#b3b3b3] bg-white text-black shadow-sm"
          aria-label="Add to wishlist"
        >
          {wishlistIcon}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
      >
        {shareIcon}
        Share
      </button>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-[#b3b3b3] bg-white px-2.5 text-sm font-bold text-black shadow-sm"
      >
        {wishlistIcon}
        Add to wishlist
      </button>
    </div>
  )
}

type Triple = readonly [MediaItem, MediaItem, MediaItem]

/** Image-in-frame icon — Figma 20664:17629 (orientation / gallery affordance). */
function MobileGalleryAllImagesIcon() {
  return (
    <svg
      className="size-6 shrink-0 text-black"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6.75C4 5.7835 4.7835 5 5.75 5H18.25C19.2165 5 20 5.7835 20 6.75V17.25C20 18.2165 19.2165 19 18.25 19H5.75C4.7835 19 4 18.2165 4 17.25V6.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.25 14L10.5 11.25L13.5 15L15.75 12.25L19 16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.25" fill="currentColor" />
    </svg>
  )
}

/**
 * Trailing panel after photo slides — Figma 20664:17627 (neutral outline button).
 */
function MobileGalleryViewAllEndCard({ imageCount }: { imageCount: number }) {
  return (
    <div className="flex w-fit max-w-full flex-col items-center gap-2 rounded-tr-lg rounded-br-lg bg-white px-6">
      <div className="flex shrink-0 items-start justify-end rounded-[30px] bg-white p-1.5">
        <MobileGalleryAllImagesIcon />
      </div>
      <p className="max-w-[200px] text-center font-sans text-sm font-bold leading-[1.5] text-[#4d4d4d]">
        View all {imageCount} images
      </p>
      <button type="button" className="pdp-neutral-outline-btn-md shrink-0">
        Open gallery
      </button>
    </div>
  )
}

/**
 * One mobile “page”: left = **square** primary (scales with slide width); right = two tiles `flex-1`
 * filling width and splitting height — Figma 20664:17610.
 */
function MobileGalleryTriple({
  triple,
  slideIndex,
}: {
  triple: Triple
  slideIndex: number
}) {
  const [left, topRight, bottomRight] = triple
  const showHeroChrome = slideIndex === 0
  const leftCellClass = [
    'relative aspect-square min-h-0 min-w-0 overflow-hidden',
    slideIndex === 0 ? 'rounded-l-lg' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const primaryColStyle = {
    flex: `${MOBILE_GALLERY_COL_PRIMARY_FR} 1 0%`,
    minWidth: 0,
  } as const
  const secondaryColStyle = {
    flex: `${MOBILE_GALLERY_COL_SECONDARY_FR} 1 0%`,
    minWidth: 0,
  } as const

  return (
    <div className="flex w-full min-w-0 shrink-0 items-stretch gap-1">
      <div className={leftCellClass} style={primaryColStyle}>
        <img
          alt={left.alt}
          className="absolute inset-0 size-full object-cover"
          src={left.src}
          width={MOBILE_GALLERY_COL_PRIMARY_FR}
          height={MOBILE_GALLERY_COL_PRIMARY_FR}
          draggable={false}
          loading={showHeroChrome ? 'eager' : 'lazy'}
          decoding="async"
        />
        {showHeroChrome ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"
              aria-hidden
            />
            <div className="absolute top-3 right-3 z-20">
              <HeroGalleryShareWishlist variant="icon" />
            </div>
          </>
        ) : null}
      </div>
      <div className="flex min-h-0 min-w-0 flex-col gap-1" style={secondaryColStyle}>
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <img
            alt={topRight.alt}
            className="absolute inset-0 size-full object-cover"
            src={topRight.src}
            width={128}
            height={128}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <img
            alt={bottomRight.alt}
            className="absolute inset-0 size-full object-cover"
            src={bottomRight.src}
            width={128}
            height={128}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Figma node 20632:95823 — left rail (4 thumbs + “See more”), right hero, share / wishlist / chevrons.
 * Mobile (md ↓): horizontal scroll carousel (no snap); each slide is square hero + right stack (18 images → 6 slides).
 * @see https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20632-95823
 * @see Mobile grid https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20664-17610
 * @see End-of-scroll “View all” https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20664-17627
 */
export function PdpViatorHeroGallery() {
  const { hero, thumbnails: t } = viatorListing.media
  const strip = (t.length >= 4 ? t.slice(0, 4) : t) as MediaItem[]
  const seeMoreBg = t[3] ?? t[0] ?? hero

  const basePool = useMemo(() => [hero, ...t] as MediaItem[], [hero, t])
  const mobileGalleryImages = useMemo(
    () =>
      Array.from({ length: MOBILE_GALLERY_IMAGE_COUNT }, (_, i) => basePool[i % basePool.length]),
    [basePool],
  )
  const mobileTriples = useMemo(() => {
    const out: Triple[] = []
    for (let i = 0; i < mobileGalleryImages.length; i += 3) {
      const a = mobileGalleryImages[i]
      const b = mobileGalleryImages[i + 1]
      const c = mobileGalleryImages[i + 2]
      if (a && b && c) {
        out.push([a, b, c])
      }
    }
    return out
  }, [mobileGalleryImages])

  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const [mobileSlidePx, setMobileSlidePx] = useState(0)

  useLayoutEffect(() => {
    const el = mobileScrollRef.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const padL = Number.parseFloat(cs.paddingLeft) || 0
      const padR = Number.parseFloat(cs.paddingRight) || 0
      const inner = el.clientWidth - padL - padR
      /** One slide + one gap + peek of next = inner → slide = inner − gap − peek */
      setMobileSlidePx(
        Math.max(
          200,
          inner - MOBILE_GALLERY_INTER_SLIDE_GAP_PX - MOBILE_GALLERY_RIGHT_PEEK_PX,
        ),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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

  /** Mouse drag-to-scroll; touch keeps native horizontal pan (pointerType !== mouse). */
  const mobileMouseDragRef = useRef<{
    pointerId: number | null
    originX: number
    originScrollLeft: number
  }>({ pointerId: null, originX: 0, originScrollLeft: 0 })

  const onMobileCarouselPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = e.currentTarget
    if ((e.target as HTMLElement).closest('button, a')) return

    mobileMouseDragRef.current = {
      pointerId: e.pointerId,
      originX: e.clientX,
      originScrollLeft: el.scrollLeft,
    }
    el.setPointerCapture(e.pointerId)
    el.style.cursor = 'grabbing'
  }, [])

  const onMobileCarouselPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { pointerId, originX, originScrollLeft } = mobileMouseDragRef.current
    if (pointerId === null || e.pointerId !== pointerId) return
    e.currentTarget.scrollLeft = originScrollLeft - (e.clientX - originX)
  }, [])

  const onMobileCarouselPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { pointerId } = mobileMouseDragRef.current
    if (pointerId === null || e.pointerId !== pointerId) return
    const el = e.currentTarget
    mobileMouseDragRef.current.pointerId = null
    try {
      el.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    el.style.cursor = ''
  }, [])

  return (
    <div
      className="w-full"
      data-node="pdp-hero-gallery"
    >
      {/* Mobile: demand ribbon on slide 0 only — scrolls with carousel; 16px from slide bottom-left (whole strip). */}
      <div className="-mx-4 pl-4 pr-0 sm:-mx-6 sm:pl-6 sm:pr-0 md:hidden">
        <div
          ref={mobileScrollRef}
          className="cursor-grab select-none overflow-x-auto overflow-y-hidden pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [touch-action:pan-x_pan-y] scrollbar-hide [&::-webkit-scrollbar]:hidden"
          aria-label="Product photos"
          onPointerCancel={onMobileCarouselPointerUp}
          onPointerDown={onMobileCarouselPointerDown}
          onPointerMove={onMobileCarouselPointerMove}
          onPointerUp={onMobileCarouselPointerUp}
        >
          <div className="flex min-h-0 items-stretch gap-1">
            {mobileTriples.map((triple, slideIdx) => (
              <div
                key={`${triple[0].src}-${triple[1].src}-${slideIdx}`}
                className="relative min-w-0 shrink-0"
                style={
                  mobileSlidePx > 0
                    ? { flex: '0 0 auto', width: mobileSlidePx }
                    : {
                        flex: '0 0 auto',
                        width: `calc(100vw - ${MOBILE_GALLERY_RIGHT_PEEK_PX}px - ${MOBILE_GALLERY_INTER_SLIDE_GAP_PX}px - 1rem)`,
                        maxWidth: '100%',
                      }
                }
              >
                <MobileGalleryTriple slideIndex={slideIdx} triple={triple} />
                {slideIdx === 0 ? <HeroDemandRibbon mobileGallery /> : null}
              </div>
            ))}
            <div className="relative w-fit shrink-0 self-center">
              <MobileGalleryViewAllEndCard imageCount={MOBILE_GALLERY_IMAGE_COUNT} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-3 md:flex md:min-h-[20rem] md:flex-row md:items-stretch md:gap-4">
        <div
          className="flex w-full max-h-24 min-h-0 flex-row gap-2 overflow-x-auto pb-1 sm:h-[min(32rem,52vh)] sm:max-h-none sm:min-h-0 sm:w-24 sm:min-w-24 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible md:h-full md:w-[150px] md:min-w-[150px] md:self-stretch"
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
                className={`group relative aspect-[150/98] w-full shrink-0 overflow-hidden rounded-lg border-2 outline-none ring-offset-0 transition-[border-color] focus-visible:ring-2 focus-visible:ring-black/35 sm:w-full sm:max-w-full md:aspect-[150/98] md:min-h-0 md:min-w-0 md:max-w-none md:flex-1 ${
                  isActive ? 'border-black' : 'border-transparent'
                }`}
              >
                <img
                  alt=""
                  className="size-full origin-center object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-105 group-focus-visible:scale-105"
                  src={img.src}
                  width={150}
                  height={98}
                  loading="lazy"
                />
              </button>
            )
          })}
          <div
            className="pointer-events-none relative aspect-[150/98] w-full shrink-0 overflow-hidden rounded-lg border-2 border-transparent sm:w-full sm:max-w-full md:aspect-[150/98] md:min-h-0 md:min-w-0 md:max-w-none md:flex-1"
            aria-hidden
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
          </div>
        </div>

        <div
          className="relative aspect-[1200/800] w-full min-w-0 flex-1 overflow-hidden rounded-lg"
        >
          <img
            alt={mainSrc.alt}
            className="absolute inset-0 size-full object-cover"
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

          <HeroDemandRibbon />

          <div className="absolute top-3 right-3 z-20">
            <HeroGalleryShareWishlist variant="pill" />
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
