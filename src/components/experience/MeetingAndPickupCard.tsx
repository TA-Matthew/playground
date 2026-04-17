import type { MeetingAndPickupContent } from '../../data/variants'

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function MeetingAndPickupCard({
  content,
}: {
  readonly content: MeetingAndPickupContent
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
      <div className="grid grid-cols-1 divide-y divide-stone-200 md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="px-4 py-5 sm:px-5 sm:py-6 md:px-6 md:py-6">
          <div className="flex items-start gap-3">
            <PinIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-stone-900">Meeting point</p>
              <p className="mt-1.5 text-[15px] leading-snug text-stone-800">
                {content.meeting.address}
              </p>
              <a
                href={googleMapsSearchUrl(content.meeting.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-stone-900 underline decoration-stone-300 underline-offset-[3px] hover:decoration-stone-500"
              >
                Open in Google Maps
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </a>
              <p className="mt-4 text-[14px] leading-relaxed text-stone-600">
                {content.meeting.directions}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6 md:px-6 md:py-6">
          <div className="flex items-start gap-3">
            <FlagIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-stone-900">End point</p>
              <p className="mt-1.5 text-[15px] font-normal text-stone-900">
                {content.end.placeName}
              </p>
              <p className="mt-1 text-[15px] leading-snug text-stone-800">{content.end.address}</p>
              <a
                href={googleMapsSearchUrl(content.end.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-stone-900 underline decoration-stone-300 underline-offset-[3px] hover:decoration-stone-500"
              >
                Open in Google Maps
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PinIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.15 9.27 6.24 11.47.42.45 1.1.45 1.52 0C14.85 18.27 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
      />
    </svg>
  )
}

function FlagIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 3h2v18H5zm3 3h12v7H8z" />
    </svg>
  )
}

function ChevronRight({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
