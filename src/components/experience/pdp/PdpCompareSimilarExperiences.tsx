import { useId, useMemo, useState } from 'react'
import { viatorListing } from '../../../data/viatorListing'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { CompareShelfCard } from './CompareShelfCard'

/**
 * [Figma — Compare Shelf](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18356-43441&m=dev): full-width row below the PDP + sticky booking column so the shelf isn’t constrained to the article column width.
 */
export function PdpCompareSimilarExperiences() {
  const { compareShelf } = viatorListing
  const uid = useId().replaceAll(':', '')
  const { cards, cardsPerPage, title, omnibusLead, omnibusLinkLabel } = compareShelf
  const pageCount = Math.max(1, Math.ceil(cards.length / cardsPerPage))
  const [page, setPage] = useState(0)

  const visible = useMemo(() => {
    const start = page * cardsPerPage
    return cards.slice(start, start + cardsPerPage)
  }, [cards, cardsPerPage, page])

  return (
    <section
      id="compare-shelf"
      className="pdp-figma mt-6 w-full scroll-mt-8 border-t border-[#d9d9d9] pb-12 pt-12 sm:pb-14 sm:pt-12"
      aria-labelledby={`compare-shelf-h-${uid}`}
    >
      <div className="flex w-full flex-col gap-6">
        <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id={`compare-shelf-h-${uid}`}
            className="max-w-[420px] font-sans text-[20px] font-bold leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
          >
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
            <p
              className="whitespace-nowrap text-right font-sans text-base font-normal leading-[150%] text-[#4d4d4d]"
              aria-live="polite"
            >
              {page + 1}/{pageCount}
            </p>
            <div className="hidden items-start gap-2.5 sm:flex">
              <span className="inline-flex rotate-180">
                <CarouselChevronNavButton
                  diameter="sm"
                  aria-label="Previous comparisons"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={page <= 0 ? 'opacity-40' : ''}
                />
              </span>
              <CarouselChevronNavButton
                diameter="sm"
                aria-label="Next comparisons"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className={page >= pageCount - 1 ? 'opacity-40' : ''}
              />
            </div>
          </div>
        </header>

        <div
          className="flex w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-sm:snap-x max-sm:snap-mandatory sm:gap-6 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={`Similar tours — ${visible.length} shown; swipe horizontally on small screens`}
        >
          {visible.map((card) => (
            <CompareShelfCard key={card.id} card={card} />
          ))}
        </div>

        <p className="font-sans text-[16px] font-normal leading-[150%] text-[#707070]">
          {omnibusLead}
          <span className="cursor-default text-inherit underline [text-decoration-skip-ink:none]">
            {omnibusLinkLabel}
          </span>
        </p>
      </div>
    </section>
  )
}
