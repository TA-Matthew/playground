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

function ChevronRightIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const RIBBON_LABEL: Record<'sell-out' | 'special-offer', string> = {
  'sell-out': 'Likely to sell out',
  'special-offer': 'Special offer',
}

/**
 * Compare Shelf — Figma
 * [node 10083:29222](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10083-29222):
 * 4-up 270px product cards with pagination arrows above. Bespoke to the Oasis desktop PDP —
 * replaces the shared `PdpCompareSimilarExperiences` block (`viatorListing.compareShelf` data reused as-is).
 */
export function OasisCompareShelf() {
  const { title, cards, omnibusLead, omnibusLinkLabel } = viatorListing.compareShelf
  const visibleCards = cards.slice(0, 4)

  return (
    <div className="flex w-full flex-col gap-4 border-t border-[#d9d9d9] py-8">
      <div className="flex items-center justify-between">
        <p className="text-[16px] leading-6 text-black">{title}</p>
        <div className="flex items-center gap-2 text-sm text-[#4d4d4d]">
          <span>1/2</span>
          <button
            type="button"
            aria-label="Previous"
            className="flex size-8 items-center justify-center rounded-full border border-[#d9d9d9] rotate-180"
          >
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="flex size-8 items-center justify-center rounded-full border border-[#d9d9d9]"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {visibleCards.map((card) => (
          <div key={card.id} className="flex w-[270px] flex-col overflow-hidden rounded-2xl border border-[#d9d9d9]">
            <div
              className={`flex h-8 items-center justify-center text-[12px] font-medium tracking-[0.05px] ${
                card.isCurrent ? 'bg-black text-white' : 'bg-[#f5f5f5] text-[#333]'
              }`}
            >
              {card.isCurrent ? 'Currently viewing' : card.topLabel ?? (card.ribbon ? RIBBON_LABEL[card.ribbon] : 'Also popular')}
            </div>
            <div className="relative h-[160px] w-full overflow-hidden">
              <img src={card.imageSrc} alt={card.imageAlt} className="h-full w-full object-cover" />
              {card.ribbon ? (
                <span className="absolute left-2 top-2 rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-black">
                  {RIBBON_LABEL[card.ribbon]}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="line-clamp-2 text-[14px] font-medium leading-5 text-black">{card.title}</p>
              <div className="flex items-center gap-1 text-[12px] text-[#4d4d4d]">
                <StarIcon />
                <span>{card.rating}</span>
                <span>({card.reviewCount.toLocaleString()})</span>
              </div>
              <p className="text-[12px] text-[#008768]">{card.cancellation}</p>
              <p className="mt-auto text-[16px] font-bold text-black">{card.priceLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[#4d4d4d]">
        {omnibusLead}
        <span className="cursor-pointer underline">{omnibusLinkLabel}</span>
      </p>
    </div>
  )
}
