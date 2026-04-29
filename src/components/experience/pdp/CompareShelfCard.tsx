import type { CompareShelfCardItem } from '../../../data/viatorListing'
import { FigmaRatingRow } from './figmaListingUi'

function ShelfWishlistHeart() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function CompareShelfDivider() {
  return <div className="h-px w-full shrink-0 bg-[#d9d9d9]" aria-hidden />
}

function ribbonLabel(ribbon: CompareShelfCardItem['ribbon']): string | null {
  if (ribbon === 'sell-out') return 'Likely to Sell Out'
  if (ribbon === 'special-offer') return 'Special Offer'
  return null
}

/**
 * Compare / “also bought” shelf product card — [B2C page templates](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18356-43441&m=dev).
 */
export function CompareShelfCard({ card }: { readonly card: CompareShelfCardItem }) {
  const ribbon = ribbonLabel(card.ribbon)

  return (
    <article
      className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)] ${
        card.isCurrent ? 'ring-1 ring-[#d9d9d9]' : ''
      }`}
    >
      {card.isCurrent ? (
        <div className="bg-[#d9d9d9] px-2 py-2 text-center font-sans text-[14px] font-semibold uppercase leading-normal tracking-wide text-[#4d4d4d]">
          Current
        </div>
      ) : null}
      <div className="relative aspect-[214/143] w-full shrink-0 overflow-hidden bg-neutral-100">
        <img
          src={card.imageSrc}
          alt={card.imageAlt}
          width={428}
          height={286}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {ribbon ? (
          <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-1rem)] items-center rounded-[12px] bg-[#FCEDF0] px-2 py-1 text-xs font-medium leading-[150%] text-[#C81E3A]">
            {ribbon}
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-2 top-2 grid size-8 place-content-center rounded-md bg-white/90 text-stone-800 shadow-sm"
          aria-label="Save to wishlist"
        >
          <ShelfWishlistHeart />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <h3 className="line-clamp-3 font-sans text-[14px] font-bold leading-snug tracking-wide text-black">
          {card.title}
        </h3>
        <CompareShelfDivider />
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <FigmaRatingRow size={16} value={Math.min(5, card.rating)} />
          <span
            className="font-sans text-sm tabular-nums text-[#333]"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {card.rating.toFixed(1)} ({card.reviewCount.toLocaleString()})
          </span>
        </div>
        <CompareShelfDivider />
        <p className="font-sans text-[14px] font-normal leading-[150%] text-black">{card.duration}</p>
        <CompareShelfDivider />
        <p className="font-sans text-[14px] font-normal leading-[150%] text-black">{card.cancellation}</p>
        <CompareShelfDivider />
        <p
          className="font-sans text-[16px] font-bold leading-[150%] text-black"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          {card.priceLabel}
        </p>
      </div>
    </article>
  )
}
