import type { OasisAvailabilityOption } from '../../data/oasisStonehenge'

type Props = {
  price: number
  currencySymbol: string
  dealTag: string
  freeCancellation: string
  options: OasisAvailabilityOption[]
}

/** Desktop-only sticky booking sidebar — replaces the mobile fixed bottom CTA. */
export function OasisSidebarDw({ price, currencySymbol, dealTag, freeCancellation, options }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 p-5 shadow-sm">
      <p className="text-sm text-stone-600">From</p>
      <p className="text-2xl font-semibold text-stone-900">
        {currencySymbol}
        {price} <span className="text-sm font-normal text-stone-500">per person</span>
      </p>
      <span className="mt-2 flex w-fit items-center gap-1 rounded-md border border-stone-200 px-1 py-0.5 text-xs font-medium text-stone-600">
        🟢 {dealTag}
      </span>

      <button
        type="button"
        className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Check availability
      </button>
      <p className="mt-3 text-sm text-emerald-800">{freeCancellation}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-5">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-stone-700">{opt.title}</span>
            <span className="shrink-0 font-medium text-stone-900">
              {currencySymbol}
              {opt.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
