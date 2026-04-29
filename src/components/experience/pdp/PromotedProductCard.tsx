import { useId } from 'react'
import type { PromotedExperienceItem } from '../../../data/viatorListing'

function GlobeIcon() {
  return (
    <svg
      className="size-3.5 shrink-0 text-[#333]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M3.6 9h16.8M3.6 15h16.8M12 3a12.7 12.7 0 0 0 0 18 12.7 12.7 0 0 0 0-18Z"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 12×12 brand star for rating row (promoted PDP cards). */
function PromotedRatingStarIcon() {
  const clipId = `promoted-star-${useId().replaceAll(':', '')}`
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3 shrink-0"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={12} height={12.0001} fill="white" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.99997 0C5.75752 0.000543662 5.53795 0.143322 5.43912 0.364713L4.06997 3.26676C3.9825 3.45712 3.8059 3.59135 3.59908 3.62468L0.537554 4.09004C0.297499 4.13617 0.102345 4.31073 0.029836 4.54418C-0.0426727 4.77762 0.0192441 5.03203 0.19092 5.20604L2.40624 7.46497C2.55467 7.61855 2.62142 7.83345 2.58611 8.04409L2.06315 11.2337C2.02815 11.4196 2.07625 11.6115 2.19479 11.7589C2.31332 11.9063 2.49042 11.9944 2.67947 12C2.78147 11.9996 2.88168 11.9733 2.97068 11.9234L5.70896 10.4175C5.89005 10.3173 6.10996 10.3173 6.29105 10.4175L9.02934 11.9234C9.1183 11.9733 9.21849 11.9996 9.32045 12C9.50949 11.9943 9.68657 11.9062 9.80511 11.7588C9.92364 11.6115 9.97176 11.4196 9.93681 11.2337L9.41384 8.04406C9.37855 7.83342 9.44529 7.61853 9.59372 7.46495L11.809 5.20602C11.9807 5.03202 12.0427 4.7776 11.9702 4.54414C11.8977 4.31069 11.7025 4.13613 11.4624 4.09002L8.4009 3.62468C8.19408 3.59135 8.01749 3.45712 7.93001 3.26676L6.56083 0.364713C6.462 0.143315 6.24242 0.000535331 5.99997 0Z"
          fill="#00C295"
        />
      </g>
    </svg>
  )
}

/**
 * Viator B2C DS “Product Card” (research) — structure aligned with
 * Figma [27970:19415](https://www.figma.com/design/kfEgE1oVxKplDJxEBW9nIT?node-id=27970-19415) /
 * [Storybook](https://www.viator.com/orion/react/styleguide/index.html?path=/story/design-system-elements-cards-product-productcard--product-card).
 */
export function PromotedProductCard({ card }: Readonly<{ card: PromotedExperienceItem }>) {
  const hasRating = card.rating != null && card.reviewCount != null
  const isDeal = card.priceWas != null
  const ribbon = card.ribbon
  const ratingLabel =
    card.rating == null ? '' : `${Number(card.rating).toFixed(1)} (${Number(card.reviewCount).toLocaleString()})`

  return (
    <article className="flex min-h-0 w-full flex-col overflow-hidden rounded-lg border border-[#d9d9d9] bg-white shadow-[0_4px_10px_0_rgba(0,0,0,0.08)] sm:min-w-0 sm:flex-1">
      <div className="relative h-[166px] w-full shrink-0 overflow-hidden bg-stone-100">
        <img
          src={card.image}
          alt={card.imageAlt}
          className="h-full w-full object-cover"
          width={400}
          height={166}
          loading="lazy"
        />
        {ribbon === 'special-offer' || ribbon === 'sell-out' ? (
          <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-1rem)] flex-none items-center justify-center gap-1 rounded-[12px] bg-[#FCEDF0] px-2 py-1 text-center text-xs font-medium leading-[150%] text-[#C81E3A]">
            {ribbon === 'special-offer' ? 'Special Offer' : 'Likely to Sell Out'}
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-2 top-2 grid size-8 place-content-center rounded-full border border-[#e5e5e5] bg-white/95 text-stone-800 shadow-sm"
          aria-label="Save to wishlist"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-6 pt-2 pb-8">
        <p className="inline-flex items-center gap-1.5 text-xs text-[#333]">
          <GlobeIcon />
          <span>{card.location}</span>
        </p>
        {hasRating ? (
          <p
            className="flex items-center gap-1.5 text-sm text-[#333] tabular-nums"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            <PromotedRatingStarIcon />
            <span className="font-medium">{ratingLabel}</span>
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-left text-sm font-medium leading-snug text-black [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {card.title}
        </h3>
        <p className="mt-auto pt-1 text-sm text-black">
          <span className="text-sm font-normal text-[#4d4d4d]">from </span>
          <span
            className={`text-base font-bold ${
              isDeal ? 'text-[#b91c1c]' : 'text-black'
            }`}
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            ${card.price}
          </span>
          {isDeal && card.priceWas != null ? (
            <span className="ml-1.5 text-sm font-normal text-stone-500 line-through">
              ${card.priceWas}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  )
}
