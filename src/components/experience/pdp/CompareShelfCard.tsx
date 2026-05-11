import type { CompareShelfCardItem } from '../../../data/viatorListing'
import { FigmaRatingRow } from './figmaListingUi'

function ShelfWishlistHeart({ className }: { readonly className?: string }) {
  return (
    <svg className={className ?? 'size-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function ShelfGlobeIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className ?? 'size-3'} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  )
}

function CompareShelfDivider() {
  return <div className="h-px w-full shrink-0 bg-[#d9d9d9]" aria-hidden />
}

function ribbonBadgeLabel(ribbon: CompareShelfCardItem['ribbon']): string | null {
  if (ribbon === 'sell-out') return 'Likely to Sell Out'
  if (ribbon === 'special-offer') return 'Special Offer'
  return null
}

/** Gray top strip — explicit topLabel, else Current, else ribbon-based label. */
function compareShelfStripLabel(card: CompareShelfCardItem): string | null {
  if (card.topLabel != null && card.topLabel !== '') return card.topLabel
  if (card.isCurrent) return 'Current'
  return ribbonBadgeLabel(card.ribbon)
}

function CompareShelfPriceMobile({ priceLabel }: { readonly priceLabel: string }) {
  const m = priceLabel.match(/^From\s+(.+)$/i)
  if (m) {
    return (
      <p className="font-sans leading-tight text-black" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
        <span className="text-[12px] font-normal lowercase">from </span>
        <span className="text-[14px] font-bold">{m[1]}</span>
      </p>
    )
  }
  return (
    <p className="font-sans text-[14px] font-bold leading-tight text-black" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
      {priceLabel}
    </p>
  )
}

/**
 * Compare / “also bought” shelf product card — [B2C page templates](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18356-43441&m=dev).
 * MW: 160px rails with top label strip + compact body (matches compact compare reference).
 */
export function CompareShelfCard({ card }: { readonly card: CompareShelfCardItem }) {
  const stripLabel = compareShelfStripLabel(card)
  const overlayRibbon = ribbonBadgeLabel(card.ribbon)
  const locationLine = card.location ?? 'Rome, Italy'
  /** Desktop: legacy pink badge only when there is no gray strip (ribbon-only cards). */
  const showImageOverlayBadge = Boolean(overlayRibbon && stripLabel == null)

  return (
    <article
      className="flex w-[160px] min-w-[160px] max-w-[160px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#d9d9d9] bg-white max-sm:snap-start sm:max-w-none sm:w-auto sm:min-w-0 sm:flex-1"
    >
      {stripLabel ? (
        <div className="bg-[#ebebeb] px-1.5 py-1.5 text-center font-sans text-[12px] font-semibold leading-tight tracking-[0.02em] text-[#4d4d4d] sm:px-2 sm:py-2 sm:text-[13px]">
          {stripLabel}
        </div>
      ) : null}

      <div className="relative aspect-[160/100] w-full shrink-0 overflow-hidden bg-neutral-100 sm:aspect-[214/143]">
        <img
          src={card.imageSrc}
          alt={card.imageAlt}
          width={428}
          height={286}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {showImageOverlayBadge && overlayRibbon ? (
          <span className="absolute left-2 top-2 hidden max-w-[calc(100%-1rem)] items-center rounded-[12px] bg-[#FCEDF0] px-2 py-1 text-xs font-medium leading-[150%] text-[#C81E3A] sm:inline-flex">
            {overlayRibbon}
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-1 top-1 grid size-7 place-content-center rounded-full bg-white/95 text-stone-800 shadow-sm sm:right-2 sm:top-2 sm:size-8 sm:rounded-md"
          aria-label="Save to wishlist"
        >
          <ShelfWishlistHeart className="size-3.5 sm:size-4" />
        </button>
      </div>

      {/* MW compact body */}
      <div className="flex flex-col gap-1.5 px-2 pb-2.5 pt-2 sm:hidden">
        <div className="flex items-center gap-1">
          <FigmaRatingRow size={16} value={Math.min(5, card.rating)} />
          <span
            className="font-sans text-[12px] font-normal tabular-nums leading-none text-[#333]"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {card.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="line-clamp-5 min-h-0 font-sans text-[14px] font-bold leading-snug text-black">{card.title}</h3>
        <p className="flex items-start gap-1 text-[12px] leading-snug text-[#333]">
          <ShelfGlobeIcon className="mt-0.5 size-3 shrink-0 text-[#333]" />
          <span>{locationLine}</span>
        </p>
        <CompareShelfPriceMobile priceLabel={card.priceLabel} />
      </div>

      {/* Desktop detailed body */}
      <div className="hidden flex-col gap-4 px-6 pb-6 pt-4 sm:flex">
        <h3 className="line-clamp-3 font-sans text-[14px] font-bold leading-snug tracking-wide text-black">{card.title}</h3>
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
