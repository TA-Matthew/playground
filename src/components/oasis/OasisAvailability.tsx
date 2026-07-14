import type { OasisAvailabilityOption } from '../../data/oasisStonehenge'

type Props = {
  currencySymbol: string
  filterChips: string[]
  options: OasisAvailabilityOption[]
  lowestPriceGuarantee: string
}

export function OasisAvailability({ currencySymbol, filterChips, options, lowestPriceGuarantee }: Props) {
  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">Upcoming availability</h2>

      <div className="mt-4 flex gap-2">
        {filterChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="relative w-[260px] shrink-0 rounded-2xl border border-stone-200 p-4 pt-8 lg:w-auto lg:shrink"
          >
            {opt.tag && (
              <span
                className={`absolute left-4 top-2 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                  opt.tag === 'Best seller' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {opt.tag}
              </span>
            )}
            <p className="text-base font-medium text-stone-900">{opt.title}</p>
            <p className="mt-1 text-sm text-stone-500">{opt.timesAvailable} times available</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-sm text-stone-900">
                from <span className="text-base font-bold">{currencySymbol}{opt.price}</span>{' '}
                <span className="text-xs text-stone-500">/person</span>
              </p>
              <button
                type="button"
                className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-stone-500">🏷 {lowestPriceGuarantee}</p>
    </section>
  )
}
