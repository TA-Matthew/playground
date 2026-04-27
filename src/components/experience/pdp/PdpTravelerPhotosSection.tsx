import { viatorListing } from '../../../data/viatorListing'

/**
 * Figma / Viator “Traveler Photos” — main image left, 2×2 grid on the right (4th = See more).
 */
export function PdpTravelerPhotosSection() {
  const { hero, thumbnails: t } = viatorListing.media
  const [a, b, c, d] = [t[0], t[1], t[2], t[3] ?? t[0]]

  return (
    <section
      className="border-t border-[#d9d9d9] py-10"
      aria-labelledby="pdp-traveler-photos-main-h"
    >
      <h2
        id="pdp-traveler-photos-main-h"
        className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black"
      >
        Traveler Photos
      </h2>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-2">
        <div className="relative h-52 w-full min-w-0 flex-[1.1] overflow-hidden rounded-lg sm:h-72 sm:min-h-0 md:h-80">
          <img
            alt={hero.alt}
            src={hero.src}
            className="h-full w-full object-cover"
            width={900}
            height={600}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
          {[a, b, c].map(
            (img) =>
              img && (
                <div
                  key={img.src}
                  className="relative aspect-[4/3] min-h-0 w-full overflow-hidden rounded-lg"
                >
                  <img
                    alt={img.alt}
                    className="h-full w-full object-cover"
                    src={img.src}
                    loading="lazy"
                  />
                </div>
              ),
          )}
          {d ? (
            <div className="relative aspect-[4/3] min-h-0 w-full overflow-hidden rounded-lg">
              <img alt={d.alt} className="h-full w-full object-cover" src={d.src} loading="lazy" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                <span
                  className="grid size-9 place-content-center rounded-full border-[1.5px] border-white/90"
                  aria-hidden
                >
                  <span className="text-lg">↻</span>
                </span>
                <span className="text-xs font-bold leading-[1.5] text-white">See More</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
