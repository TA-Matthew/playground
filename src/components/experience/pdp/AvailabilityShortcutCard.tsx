import type { AvailabilityShortcut } from '../../../data/availabilityShortcuts'

type Props = {
  readonly shortcut: AvailabilityShortcut
  readonly onSelect?: () => void
}

/** Availability shortcut card — compact option in the 3-column upcoming availability grid. */
export function AvailabilityShortcutCard({ shortcut, onSelect }: Props) {
  return (
    <article
      data-availability-shortcut-card
      className="relative flex h-full min-h-[152px] flex-col justify-between rounded-2xl border border-[#d9d9d9] bg-white px-4 py-4"
    >
      {shortcut.isBestSeller || shortcut.scarcityLabel ? (
        <div className="absolute -top-3 left-4 z-10 flex items-center gap-2">
          {shortcut.isBestSeller ? (
            <span className="inline-flex rounded-md bg-[#eafbf7] px-1 py-1 text-xs font-medium leading-4 text-[#008768]">
              Best seller
            </span>
          ) : null}
          {shortcut.scarcityLabel ? (
            <span className="inline-flex rounded-md bg-[#feece9] px-1 py-1 text-xs font-medium leading-4 text-[#ae3e38]">
              {shortcut.scarcityLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="text-base font-medium leading-6 tracking-[0.05px] text-[#333]">{shortcut.title}</p>
        <p className="text-sm font-normal leading-5 tracking-[0.05px] text-[#4d4d4d]">
          {shortcut.timesAvailableLabel}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="flex items-baseline gap-1 whitespace-nowrap text-black">
          <span className="text-xs font-normal leading-4 tracking-[0.05px]">from</span>
          <span className="text-base font-bold leading-6 tracking-[0.05px]">{shortcut.priceAmount}</span>
          <span className="text-xs font-normal leading-4 tracking-[0.05px]">/person</span>
        </p>
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-transparent bg-[#008768] px-6 pt-[7px] pb-2 text-sm font-medium leading-5 tracking-[0.05px] text-white transition hover:bg-[#007058] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008768] lg:border-black lg:bg-white lg:text-[#0d0d0d] lg:hover:bg-neutral-50 lg:focus-visible:outline-black"
          onClick={onSelect}
        >
          Select
        </button>
      </div>
    </article>
  )
}
