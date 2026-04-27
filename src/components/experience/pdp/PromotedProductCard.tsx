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

/**
 * Viator B2C DS “Product Card” (research) — structure aligned with
 * Figma [27970:19415](https://www.figma.com/design/kfEgE1oVxKplDJxEBW9nIT?node-id=27970-19415) /
 * [Storybook](https://www.viator.com/orion/react/styleguide/index.html?path=/story/design-system-elements-cards-product-productcard--product-card).
 */
export function PromotedProductCard({ card }: { card: PromotedExperienceItem }) {
  const hasRating = card.rating != null && card.reviewCount != null
  const isDeal = card.priceWas != null
  return (
    <article className="flex w-[min(100%,17.5rem)] min-w-[17rem] shrink-0 flex-col overflow-hidden rounded-lg border border-[#d9d9d9] bg-white shadow-[0_4px_10px_0_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-stone-100">
        <img
          src={card.image}
          alt={card.imageAlt}
          className="h-full w-full object-cover"
          width={400}
          height={300}
          loading="lazy"
        />
        {card.specialOffer ? (
          <span className="absolute left-2 top-2 rounded-md bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-rose-800">
            Special Offer
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
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-[#333]">
          <GlobeIcon />
          <span>{card.location}</span>
        </p>
        {hasRating ? (
          <p
            className="flex items-center gap-1.5 text-sm text-[#333] tabular-nums"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            <svg
              className="size-4 shrink-0 text-[#00c295]"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 1.2L9.5 4.1l2.1.2-1.5 1.2.4 1.4L8 5.1 5.6 6.9l.4-1.4L4.4 4.3l2.1-.2L8 1.2z" />
            </svg>
            <span className="font-medium">
              {card.rating} ({Number(card.reviewCount).toLocaleString()})
            </span>
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
