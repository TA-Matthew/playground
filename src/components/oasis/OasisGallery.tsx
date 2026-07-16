import { viatorListing } from '../../data/viatorListing'

function ShareIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12M8 7l4-4 4 4M6 13v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartOutlineIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-9.5-8.9C1 8 2.4 4.5 6 4.5c2.1 0 3.5 1.2 6 3.7 2.5-2.5 3.9-3.7 6-3.7 3.6 0 5 3.5 3.5 6.6C19 15.65 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhotosStackIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="7" width="14" height="14" rx="2" stroke="white" strokeWidth="1.6" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="1.6" />
    </svg>
  )
}

/**
 * Gallery block — Figma [node 10092:29466](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10092-29466):
 * hero + two stacked thumbnails + a "Best in London" ribbon panel over a fourth image with a +N overlay.
 * Bespoke to the Oasis desktop PDP — replaces the shared gallery markup previously rendered inside `ViatorPdpBlock`.
 */
export function OasisGallery() {
  const { hero, thumbnails } = viatorListing.media
  const extraCount = thumbnails.length - 3

  return (
    <div className="flex w-full items-stretch gap-2">
      <div className="relative h-[515px] w-[615px] shrink-0 overflow-hidden rounded-l-2xl">
        <img src={hero.src} alt={hero.alt} className="h-full w-full object-cover" />
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#b3b3b3] bg-white px-3 py-2.5 text-sm font-bold text-black shadow-sm"
          >
            <ShareIcon />
            Share
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#b3b3b3] bg-white px-3 py-2.5 text-sm font-bold text-black shadow-sm"
          >
            <HeartOutlineIcon />
            Add to wishlist
          </button>
        </div>
      </div>

      <div className="flex h-[515px] w-[260px] shrink-0 flex-col gap-2">
        <div className="flex-1 overflow-hidden">
          <img src={thumbnails[0]?.src} alt={thumbnails[0]?.alt} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 overflow-hidden">
          <img src={thumbnails[1]?.src} alt={thumbnails[1]?.alt} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="flex h-[515px] w-[260px] shrink-0 flex-col gap-2">
        <div className="flex flex-1 flex-col items-start justify-center gap-2 overflow-hidden rounded-tr-2xl bg-[#f9f9f9] p-4">
          <span className="inline-flex items-center gap-1 text-base font-medium leading-5 text-[#00ad86]">
            🏆 Best in London
          </span>
          <p className="text-[20px] font-medium leading-6 tracking-[0.2px] text-[#00654e]">
            #1 Most booked in London in the last 48 hours
          </p>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-br-2xl">
          <img src={thumbnails[2]?.src} alt={thumbnails[2]?.alt} className="h-full w-full object-cover" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/40 px-2.5 py-2.5">
            <span className="text-base font-bold text-white">+{Math.max(extraCount, 1)}</span>
            <PhotosStackIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
