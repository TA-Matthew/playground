const LOCATION_TABS = ['Rome', 'Vatican City', 'Lake Bracciano', "Isola d'Ischia"] as const

const CHIPS = [
  'Archaeology Tours',
  'Walking Tours',
  'Half-day Tours',
  'Historical & Heritage Tours',
  'Cultural Tours',
  'On the Ground',
  'Tours, Sightseeing & Cruises',
  'Private Sightseeing Tours',
  'Rome',
  'Archaeology Tours - Vatican City',
  'Half-day Tours - Vatican City',
  'Historical & Heritage Tours - Vatican City',
  'Archaeology Tours - Lake Bracciano',
  'Walking Tours - Lake Bracciano',
  'Half-day Tours - Lake Bracciano',
  'Historical & Heritage Tours - Lake Bracciano',
  "Archaeology Tours - Isola d'Ischia",
  "Walking Tours - Isola d'Ischia",
  "Half-day Tours - Isola d'Ischia",
  "Historical & Heritage Tours - Isola d'Ischia",
]

/**
 * "More Tours" location tabs + similar-things-to-do chip cloud — Figma
 * [node 10033:19201](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-19201).
 * Desktop only — this frame has no mobile-web counterpart.
 */
export function OasisExploreSimilar() {
  return (
    <div className="hidden w-full flex-col gap-4 border-t border-[#d9d9d9] py-8 md:flex">
      <div className="flex items-center gap-2 overflow-x-auto">
        {LOCATION_TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={
              i === 0
                ? 'shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white'
                : 'shrink-0 rounded-full px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100'
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-[#4d4d4d]">
        {CHIPS.map((chip, i) => (
          <span key={chip} className="inline-flex items-center gap-2">
            {chip}
            {i < CHIPS.length - 1 ? (
              <span aria-hidden className="h-3 w-px bg-[#d9d9d9]" />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  )
}
