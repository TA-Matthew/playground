import { useState } from 'react'
import type { OasisImage } from '../../data/oasisStonehenge'

type Props = {
  images: OasisImage[]
}

/**
 * Responsive hero gallery: a horizontally-scrollable photo shelf with a back/share/heart
 * overlay on mobile (per the Figma MW spec), and a static grid collage on desktop (DW).
 */
export function OasisGalleryMw({ images }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [hero, ...rest] = images
  const gridThumbs = rest.slice(0, 4)

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:mx-0">
      {/* Mobile: horizontal scroll shelf with floating back/share/heart */}
      <div className="lg:hidden">
        <div className="flex h-[300px] gap-1 overflow-x-auto scroll-smooth sm:h-[360px] [&::-webkit-scrollbar]:hidden">
          {images.map((img) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className="h-full w-[70%] shrink-0 snap-start object-cover sm:w-[300px]"
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Share"
              className="flex size-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm"
            >
              ⇗
            </button>
            <button
              type="button"
              aria-label="Save"
              className="flex size-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm"
            >
              ♡
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: static grid collage, one large image + 2x2 thumbnails */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:gap-2 lg:overflow-hidden lg:rounded-2xl">
        <img
          src={hero.src}
          alt={hero.alt}
          className="col-span-2 row-span-2 h-[420px] w-full object-cover"
        />
        {gridThumbs.map((img) => (
          <img key={img.src} src={img.src} alt={img.alt} className="h-[204px] w-full object-cover" />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowAll(true)}
        className="absolute bottom-4 right-4 rounded-full border border-stone-900 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm"
      >
        View all {images.length} photos
      </button>

      {showAll && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-lg px-4 py-6">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-700"
            >
              <span aria-hidden>←</span> Close
            </button>
            <div className="flex flex-col gap-3">
              {images.map((img) => (
                <img key={img.src} src={img.src} alt={img.alt} className="w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
