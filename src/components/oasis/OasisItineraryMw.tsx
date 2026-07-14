import { useState } from 'react'
import type { OasisItineraryStop } from '../../data/oasisStonehenge'

type Props = {
  meetingPoint: string
  stops: OasisItineraryStop[]
}

/** Map placeholder + numbered pins + vertical stop list, per Figma MW itinerary section. */
export function OasisItineraryMw({ meetingPoint, stops }: Props) {
  const [openId, setOpenId] = useState<string | null>(stops[0]?.id ?? null)
  const [showAll, setShowAll] = useState(false)
  const visibleStops = showAll ? stops : stops.slice(0, 4)

  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">Itinerary</h2>

      <div className="mt-4 lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-6">
        <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 lg:sticky lg:top-8 lg:h-[420px]">
          <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-400">Map</div>
          {stops.map((stop, idx) => (
            <span
              key={stop.id}
              className="absolute flex size-7 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-xs font-medium text-white"
              style={{
                left: `${12 + ((idx * 17) % 76)}%`,
                top: `${20 + ((idx * 23) % 60)}%`,
              }}
            >
              {idx + 1}
            </span>
          ))}
          <button
            type="button"
            aria-label="Open map"
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm"
          >
            ⤢
          </button>
        </div>

        <div className="relative mt-4 flex flex-col lg:mt-0">
          <div className="flex gap-4 pb-6">
            <div className="flex flex-col items-center">
              <span className="mt-1 size-8 shrink-0 rounded-full bg-emerald-800" aria-hidden />
              <span className="mt-1 w-px flex-1 bg-stone-900" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-stone-900">Meeting point</p>
              <p className="text-sm text-stone-500">{meetingPoint}</p>
            </div>
          </div>

          {visibleStops.map((stop, idx) => {
            const open = openId === stop.id
            const isLast = idx === visibleStops.length - 1
            return (
              <div key={stop.id} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-xs font-medium text-white">
                    {idx + 1}
                  </span>
                  {!isLast && <span className="mt-1 w-px flex-1 bg-stone-900" aria-hidden />}
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : stop.id)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                    aria-expanded={open}
                  >
                    <p className="text-base font-medium text-stone-900">{stop.title}</p>
                    <span className={`mt-1 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                      ⌄
                    </span>
                  </button>
                  <p className="text-sm text-stone-500">
                    {stop.duration} · Tickets included
                  </p>
                  {open && <p className="mt-2 text-sm leading-relaxed text-stone-600">{stop.description}</p>}
                </div>
              </div>
            )
          })}

          {!showAll && stops.length > 4 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-14 h-20 bg-gradient-to-b from-transparent to-white" />
          )}

          {!showAll && stops.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 lg:w-auto lg:px-8"
            >
              Read full details
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
