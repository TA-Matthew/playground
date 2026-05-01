import { useId } from 'react'
import { viatorListing } from '../../../data/viatorListing'
import { CarouselChevronNavButton } from './CarouselChevronNavButton'
import { ProductCard } from './ProductCard'

/**
 * [Figma — Customers who also bought](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18472-33529&m=dev): meta-row cards; mobile matches promoted shelf (horizontal rail); sm+ grid.
 */
export function PdpCustomersAlsoBought() {
  const { alsoBoughtShelf } = viatorListing
  const uid = useId().replaceAll(':', '')

  return (
    <section
      id="customers-also-bought"
      className="pdp-figma mt-0 w-full scroll-mt-8 border-t border-[#d9d9d9] pb-12 pt-6 sm:pb-14"
      aria-labelledby={`also-bought-h-${uid}`}
    >
      <h2
        id={`also-bought-h-${uid}`}
        className="inline-flex items-center gap-1.5 text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black sm:text-[28px]"
      >
        {alsoBoughtShelf.title}
      </h2>
      <div className="relative isolate mt-5 -mx-4 overflow-visible sm:mx-0">
        <div
          className="flex min-w-0 gap-3 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [touch-action:pan-x_pan-y] [&::-webkit-scrollbar]:hidden sm:hidden"
          aria-label={alsoBoughtShelf.title}
        >
          {alsoBoughtShelf.items.map((card) => (
            <ProductCard key={card.id} card={card} mobileRail showMetaRows />
          ))}
        </div>
        <div className="hidden w-full gap-3 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
          {alsoBoughtShelf.items.map((card) => (
            <ProductCard key={card.id} card={card} showMetaRows />
          ))}
        </div>
        <CarouselChevronNavButton
          className="absolute right-0 top-[38%] z-[40] hidden -translate-y-1/2 translate-x-1/2 sm:block"
          aria-label="Next recommendations"
        />
      </div>
    </section>
  )
}
