type Props = {
  price: number
  currencySymbol: string
  dealTag: string
}

/** Fixed bottom CTA — mobile only; desktop uses the sticky sidebar instead. */
export function OasisStickyCta({ price, currencySymbol, dealTag }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-stone-200 bg-white px-4 py-4 shadow-[0_0_6px_rgba(0,0,0,0.15)] lg:hidden">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-stone-900">
          From <span className="text-lg font-bold">{currencySymbol}{price}</span>
          <span className="text-stone-500"> /person</span>
        </p>
        <span className="flex w-fit items-center gap-1 rounded-md border border-stone-200 px-1 py-0.5 text-xs font-medium text-stone-600">
          🟢 {dealTag}
        </span>
      </div>
      <button
        type="button"
        className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Check availability
      </button>
    </div>
  )
}
