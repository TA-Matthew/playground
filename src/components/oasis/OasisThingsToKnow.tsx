import { useState } from 'react'

type Props = {
  activityLevel: string
  activityNote: string
  wheelchairAccessible: boolean
  nearPublicTransport: boolean
  maxTravelers: number
  notes: string
}

export function OasisThingsToKnow({
  activityLevel,
  activityNote,
  wheelchairAccessible,
  nearPublicTransport,
  maxTravelers,
  notes,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">Things to know</h2>
      <div className="mt-4 flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
        <div className="flex items-start gap-4">
          <span aria-hidden>🚶</span>
          <div>
            <p className="text-base text-stone-900">Activity level: {activityLevel}</p>
            <p className="text-sm text-stone-500">{activityNote}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span aria-hidden>♿</span>
          <p className="text-base text-stone-900">
            {wheelchairAccessible ? 'Wheelchair accessible' : 'Not wheelchair accessible'}
          </p>
        </div>
        {nearPublicTransport && (
          <div className="flex items-center gap-4">
            <span aria-hidden>🚌</span>
            <p className="text-base text-stone-900">Near public transportation</p>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span aria-hidden>👥</span>
          <p className="text-base text-stone-900">Maximum of {maxTravelers} travelers</p>
        </div>
        <div className="flex items-start gap-4 lg:col-span-2">
          <span aria-hidden>ⓘ</span>
          <div>
            <p className="text-base text-stone-900">Notes from the tour supplier</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              {expanded ? notes : `${notes.slice(0, 90)}…`}{' '}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="font-medium text-stone-900 underline"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
