import { viatorListing } from '../../data/viatorListing'

function ChevronLeftIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 5l-7 7 7 7" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12M8 7l4-4 4 4M6 13v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6"
        stroke="black"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-9.5-8.9C1 8 2.4 4.5 6 4.5c2.1 0 3.5 1.2 6 3.7 2.5-2.5 3.9-3.7 6-3.7 3.6 0 5 3.5 3.5 6.6C19 15.65 12 20 12 20z"
        stroke="black"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GalleryStackIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <rect x="4" y="7" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <span aria-hidden className="text-[24px] leading-none">
      🔥
    </span>
  )
}

/**
 * Mobile-web hero gallery + overlay chrome — Figma
 * [node 10144:18514](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18514):
 * a horizontal image shelf (edge-to-edge, 439px tall) with a back-chevron/share/heart icon row and a
 * "View all N images" heart-badge panel overlaid on top, plus a "Typically booked" alert card near the
 * bottom. The sticky logo/search/hamburger header above this is {@link OasisMobileTopBar} — Figma treats
 * it as a separate layer, not part of the gallery shelf.
 */
type Props = {
  /** Once true, the "Typically booked" card has docked into the sticky footer strip and fades out here. */
  bookedBannerDocked?: boolean
}

export function OasisMobileGallery({ bookedBannerDocked = false }: Props) {
  const { hero, thumbnails } = viatorListing.media
  const imageCount = thumbnails.length + 1

  return (
    <div className="relative h-[439px] w-full overflow-hidden">
      <div className="flex h-full snap-x snap-mandatory gap-1 overflow-x-auto">
        <div className="h-full w-[240px] shrink-0 snap-start overflow-hidden">
          <img src={hero.src} alt={hero.alt} className="h-full w-[248px] max-w-none object-cover" />
        </div>
        <div className="flex h-full w-[240px] shrink-0 snap-start flex-col gap-1">
          <div className="min-h-0 flex-1 overflow-hidden">
            <img src={thumbnails[0]?.src} alt={thumbnails[0]?.alt} className="h-full w-full object-cover" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <img src={thumbnails[1]?.src} alt={thumbnails[1]?.alt} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="h-full w-[240px] shrink-0 snap-start overflow-hidden">
          <img src={thumbnails[2]?.src} alt={thumbnails[2]?.alt} className="h-full w-full object-cover" />
        </div>
        <div className="flex h-full w-[230px] shrink-0 snap-start flex-col items-center justify-center gap-2">
          <span className="flex items-center justify-center rounded-[30px] bg-white p-1.5">
            <GalleryStackIcon />
          </span>
          <p className="text-center text-[14px] font-bold leading-[1.5] text-[#4d4d4d]">
            View all {imageCount} images
          </p>
          <button type="button" className="pdp-neutral-outline-btn-md">
            See all photos
          </button>
        </div>
      </div>

      {/* Scrim behind the overlaid icon row so it reads against bright photos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[342px] bg-gradient-to-b from-black/45 via-black/10 to-transparent"
      />

      <div className="absolute inset-x-0 top-[61px] flex items-center justify-between px-4">
        <button
          type="button"
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-[30px] bg-white/90 p-1.5"
        >
          <ChevronLeftIcon />
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Share"
            className="flex size-10 items-center justify-center rounded-[30px] bg-white/90 p-1.5"
          >
            <ShareIcon />
          </button>
          <button
            type="button"
            aria-label="Add to wishlist"
            className="flex size-10 items-center justify-center rounded-[30px] bg-white/90 p-1.5"
          >
            <HeartIcon />
          </button>
        </div>
      </div>

      <div
        aria-hidden={bookedBannerDocked}
        className={`absolute bottom-10 left-1/2 flex w-[342px] -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-white p-4 drop-shadow-[0px_4px_12px_rgba(2,44,69,0.15)] transition-all duration-500 ease-out ${
          bookedBannerDocked ? 'pointer-events-none translate-y-3 opacity-0' : 'opacity-100'
        }`}
      >
        <FlameIcon />
        <p className="whitespace-nowrap text-[14px] font-medium leading-[1.5] text-[#333]">
          Typically booked 8 days in advance
        </p>
      </div>
    </div>
  )
}
