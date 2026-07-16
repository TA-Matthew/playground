import { viatorListing } from '../../data/viatorListing'

function StarIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 1.24l1.67 3.54c.26.55.78.94 1.38 1.03l3.82.58-2.8 2.85c-.42.43-.61 1.04-.51 1.63l.65 3.97-3.34-1.84a1.5 1.5 0 0 0-1.44 0L4.09 14.8l.65-3.97c.1-.6-.09-1.2-.51-1.63L1.44 6.35l3.82-.58c.6-.09 1.12-.48 1.38-1.03L8 1.24Z"
        fill="#00C295"
      />
    </svg>
  )
}

/**
 * Mobile-web "You may also like" shelf — Figma
 * [node 10144:18887](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18887):
 * four 160px product cards ("Ad" tag above, rating badge over the image). Reuses
 * `viatorListing.compareShelf` card data — same source as the desktop {@link OasisCompareShelf}, just a
 * smaller bespoke card shape (no pagination arrows, no "currently viewing" bar).
 */
export function OasisMobileYouMayAlsoLike() {
  const { cards, omnibusLinkLabel } = viatorListing.compareShelf
  const visibleCards = cards.slice(0, 4)

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <p className="w-full text-[20px] font-medium leading-[22px] tracking-[0.2px] text-black">You may also like</p>

      <div className="flex w-full gap-3 overflow-x-auto pb-1">
        {visibleCards.map((card) => (
          <div key={card.id} className="flex w-[160px] shrink-0 flex-col items-start">
            <span className="flex h-6 w-full items-center rounded-t-lg bg-[#f5f5f5] px-2 text-[11px] text-[#707070]">
              Ad
            </span>
            <div className="relative w-full">
              <img src={card.imageSrc} alt={card.imageAlt} className="h-[95px] w-[160px] object-cover" />
              <span className="absolute left-2 top-[95px] -translate-y-1/2 rounded bg-white px-1 py-0.5 text-[11px] font-medium text-black shadow-sm">
                {card.rating}
              </span>
            </div>
            <div className="flex w-full flex-col gap-1 pt-2">
              <p className="line-clamp-2 text-[13px] font-medium leading-4 text-black">{card.title}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#4d4d4d]">
                <StarIcon />
                <span>{card.rating}</span>
                <span>({card.reviewCount.toLocaleString()})</span>
              </div>
              <p className="text-[13px] font-bold text-black">{card.priceLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] leading-4 tracking-[0.05px] text-[#4d4d4d]">
        Why you are seeing these <span className="cursor-pointer underline">{omnibusLinkLabel}</span>
      </p>
    </div>
  )
}
