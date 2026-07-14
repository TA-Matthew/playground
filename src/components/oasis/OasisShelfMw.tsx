import type { OasisShelfItem } from '../../data/oasisStonehenge'

type Props = {
  currencySymbol: string
  items: OasisShelfItem[]
}

/** Horizontally-scrollable "You may also like" cards with a top ribbon tag, per Figma MW spec. */
export function OasisShelfMw({ currencySymbol, items }: Props) {
  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">You may also like</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {items.map((item) => (
          <a key={item.id} href="#" className="block w-[160px] shrink-0 lg:w-auto lg:shrink">
            {item.ribbon && (
              <span className="mb-1 block w-fit rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-700">
                {item.ribbon}
              </span>
            )}
            <div className="relative">
              <img src={item.image} alt={item.title} className="aspect-[4/3] w-full rounded-lg object-cover" />
              <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1 text-[10px] font-medium text-stone-600">
                Ad
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-700">
              ★ {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString()})
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-900">{item.title}</p>
            <p className="mt-1 text-sm text-stone-900">
              from <span className="font-semibold">{currencySymbol}{item.price}</span>
            </p>
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Why you are seeing these <span className="underline">recommendations</span>
      </p>
    </section>
  )
}
