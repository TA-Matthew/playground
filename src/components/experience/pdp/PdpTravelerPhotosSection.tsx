import { viatorListing } from '../../../data/viatorListing'

/**
 * Figma / Viator “Traveler Photos” — main image left; narrow view shows only the bottom row of the
 * thumbnail grid (third thumb + See more); sm+ shows full 2×2 grid (4th = See more).
 */
export function PdpTravelerPhotosSection() {
  const { hero, thumbnails: t } = viatorListing.media
  const [a, b, c, d] = [t[0], t[1], t[2], t[3] ?? t[0]]

  return (
    <section
      className="border-t border-[#d9d9d9] pt-6 pb-10"
      aria-labelledby="pdp-traveler-photos-main-h"
    >
      <h2
        id="pdp-traveler-photos-main-h"
        className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
      >
        Traveler Photos
      </h2>
      <div className="mt-5 flex flex-col gap-2 sm:h-[320px] sm:flex-row sm:gap-2">
        <div className="relative h-52 w-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg sm:h-[320px]">
          <img
            alt={hero.alt}
            src={hero.src}
            className="h-full w-full min-w-0 object-cover"
            width={900}
            height={600}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-2 grid-rows-1 gap-2 sm:h-full sm:grid-rows-[171px_140px]">
          {[a, b, c].map(
            (img, i) =>
              img && (
                <div
                  key={img.src}
                  className={
                    i < 2
                      ? 'relative hidden aspect-[4/3] min-h-0 min-w-0 w-full overflow-hidden rounded-lg sm:block sm:aspect-auto sm:h-full'
                      : 'relative aspect-[4/3] min-h-0 min-w-0 w-full overflow-hidden rounded-lg sm:aspect-auto sm:h-full'
                  }
                >
                  <img
                    alt={img.alt}
                    className="h-full w-full min-w-0 object-cover"
                    src={img.src}
                    loading="lazy"
                  />
                </div>
              ),
          )}
          {d ? (
            <div className="relative aspect-[4/3] min-h-0 min-w-0 w-full overflow-hidden rounded-lg sm:aspect-auto sm:h-full">
              <img alt={d.alt} className="h-full w-full min-w-0 object-cover" src={d.src} loading="lazy" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                <svg
                  className="h-10 w-10 shrink-0"
                  width={40}
                  height={40}
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <rect
                    x="0.75"
                    y="0.75"
                    width="38.5"
                    height="38.5"
                    rx="19.25"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <path
                    d="M21.7071 12.2929C21.3166 11.9024 20.6834 11.9024 20.2929 12.2929C19.9024 12.6834 19.9024 13.3166 20.2929 13.7071L25.5858 19H12C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21H25.5858L20.2929 26.2929C19.9024 26.6834 19.9024 27.3166 20.2929 27.7071C20.6834 28.0976 21.3166 28.0976 21.7071 27.7071L28.7071 20.7071C28.8946 20.5196 29 20.2652 29 20C29 19.7419 28.9002 19.4941 28.722 19.3081C28.7171 19.303 28.7121 19.2979 28.7071 19.2929L21.7071 12.2929Z"
                    fill="white"
                  />
                </svg>
                <span className="text-center font-sans text-base font-normal leading-[150%] text-white [font-feature-settings:'liga'_0,'clig'_0]">
                  See More
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
