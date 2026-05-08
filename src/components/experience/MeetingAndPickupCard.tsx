import { useEffect, useMemo, useRef, useState } from 'react'
import {
  B2_MEETING_OPTION_LABELS,
  type MeetingAndPickupContent,
  type Stop,
  type VariantId,
} from '../../data/variants'
import { BenefitCheckIcon } from '../icons/BenefitCheckIcon'

export function MeetingAndPickupCard({
  content,
  variantId,
  meetings,
  b2PickupId,
  onB2PickupChange,
  onB2MeetingHover,
}: {
  readonly content: MeetingAndPickupContent
  readonly variantId?: VariantId
  readonly meetings?: readonly Stop[]
  readonly b2PickupId?: string | null
  readonly onB2PickupChange?: (id: string | null) => void
  readonly onB2MeetingHover?: (id: string | null) => void
}) {
  const showB2MeetingPicker =
    variantId === 'b2' &&
    meetings != null &&
    meetings.length >= 3 &&
    onB2PickupChange != null

  if (showB2MeetingPicker) {
    return (
      <MeetingPickupCardB2Layout
        content={content}
        meetings={meetings}
        b2PickupId={b2PickupId ?? null}
        onB2PickupChange={onB2PickupChange}
        onB2MeetingHover={onB2MeetingHover}
      />
    )
  }

  return (
    <div className="flex flex-col gap-0 self-stretch rounded-2xl border border-stone-200/90 bg-white px-4 py-6 md:flex-row md:items-stretch md:gap-0 md:p-6">
      <div className="min-w-0 flex-1 border-b border-stone-200/90 pb-8 md:border-b-0 md:pb-0 md:pr-8">
        <div className="mb-4 flex items-start gap-2">
          <PinIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <h3 className="text-[18px] font-medium leading-6 text-black">Meeting point</h3>
        </div>
        <p className="pdp-meeting-detail-text">{content.meeting.address}</p>
        <span className="mt-3 inline-flex cursor-default items-center gap-1 text-[15px] font-medium text-stone-900 underline decoration-stone-300 underline-offset-[3px] pointer-events-none">
          Open in Google Maps
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </span>
        <p className="pdp-location-instruction">{content.meeting.directions}</p>
      </div>

      <div className="min-w-0 flex-1 border-stone-200/90 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <div className="mb-4 flex items-start gap-2">
          <FlagIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <h3 className="text-[18px] font-medium leading-6 text-black">End point</h3>
        </div>
        <p className="pdp-meeting-detail-text">{content.end.placeName}</p>
        <p className="pdp-meeting-detail-text mt-1">{content.end.address}</p>
        <span className="mt-3 inline-flex cursor-default items-center gap-1 text-[15px] font-medium text-stone-900 underline decoration-stone-300 underline-offset-[3px] pointer-events-none">
          Open in Google Maps
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </span>
      </div>
    </div>
  )
}

function MeetingPickupCardB2Layout({
  content,
  meetings,
  b2PickupId,
  onB2PickupChange,
  onB2MeetingHover,
}: {
  readonly content: MeetingAndPickupContent
  readonly meetings: readonly Stop[]
  readonly b2PickupId: string | null
  readonly onB2PickupChange: (id: string | null) => void
  readonly onB2MeetingHover?: (id: string | null) => void
}) {
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const blurHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedMeeting = useMemo(
    () => (b2PickupId ? meetings.find((m) => m.id === b2PickupId) : undefined),
    [b2PickupId, meetings],
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return meetings.map((m, i) => ({
      stop: m,
      label: B2_MEETING_OPTION_LABELS[i] ?? `Pickup ${i + 1}`,
    })).filter(
      ({ stop, label }) =>
        q === '' ||
        label.toLowerCase().includes(q) ||
        stop.durationLine.toLowerCase().includes(q),
    )
  }, [meetings, query])

  useEffect(() => {
    if (!listOpen) return
    const close = (e: MouseEvent) => {
      const el = pickerRef.current
      if (el && !el.contains(e.target as Node)) {
        setListOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [listOpen])

  useEffect(() => {
    return () => {
      if (blurHideTimerRef.current) clearTimeout(blurHideTimerRef.current)
    }
  }, [])

  const mapsUrl = (queryStr: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`

  const clearBlurHide = () => {
    if (blurHideTimerRef.current) {
      clearTimeout(blurHideTimerRef.current)
      blurHideTimerRef.current = null
    }
  }

  const scheduleBlurHide = () => {
    clearBlurHide()
    blurHideTimerRef.current = window.setTimeout(() => setListOpen(false), 120)
  }

  const openMeetingList = () => {
    clearBlurHide()
    setQuery('')
    setListOpen(true)
  }

  return (
    <div className="flex flex-col gap-0 self-stretch rounded-2xl border border-stone-200/90 bg-white px-4 py-6 md:flex-row md:items-stretch md:gap-0 md:p-6">
      <div className="min-w-0 flex-1 border-b border-stone-200/90 pb-8 md:border-b-0 md:pb-0 md:pr-8">
        <div className="mb-4 flex items-start gap-2">
          <PinIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <h3 className="text-[18px] font-medium leading-6 text-black">Meeting points</h3>
        </div>

        <p className="text-[15px] font-normal leading-snug text-black">Select a meeting point</p>

        <div ref={pickerRef} className="relative mt-3">
          <div className="relative">
            {selectedMeeting ? (
              <button
                type="button"
                className="flex w-full cursor-pointer items-start gap-2 rounded-lg border-2 border-[#008768] bg-white py-2.5 pl-3 pr-12 text-left text-[15px] leading-snug outline-none transition hover:bg-emerald-50/40 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0"
                aria-expanded={listOpen}
                aria-controls="meeting-point-options-meeting-pickup-card"
                aria-haspopup="listbox"
                onClick={() => openMeetingList()}
              >
                <span className="min-w-0 flex-1">
                  <MeetingAddressConfirmedText line={selectedMeeting.durationLine} />
                </span>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <BenefitCheckIcon className="h-5 w-5 shrink-0" />
                </span>
              </button>
            ) : (
              <>
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Type to search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => {
                    clearBlurHide()
                    setListOpen(true)
                  }}
                  onBlur={scheduleBlurHide}
                  className="w-full rounded-lg border border-[#d1d5db] bg-white py-2.5 pl-3 pr-10 text-[15px] leading-snug text-stone-900 placeholder:text-[#9ca3af] outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200/80"
                  aria-expanded={listOpen}
                  aria-controls="meeting-point-options-meeting-pickup-card"
                  aria-haspopup="listbox"
                />
                <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-900" />
              </>
            )}
          </div>

          {listOpen ? (
            <div className="absolute left-0 right-0 top-full z-20 mt-1">
              <p id="meeting-point-options-label-mp" className="sr-only">
                Pickup location — choose one option
              </p>
              <ul
                id="meeting-point-options-meeting-pickup-card"
                role="listbox"
                aria-labelledby="meeting-point-options-label-mp"
                className="max-h-[min(280px,40vh)] overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-md"
                onMouseLeave={() => onB2MeetingHover?.(null)}
              >
                {filteredRows.length === 0 ? (
                  <li className="px-3 py-2 text-[13px] text-stone-500">No matches</li>
                ) : (
                  filteredRows.map(({ stop, label }) => (
                    <li key={stop.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={b2PickupId === stop.id}
                        className={`flex w-full cursor-pointer px-3 py-2 text-left text-[13px] leading-snug transition ${
                          b2PickupId === stop.id
                            ? 'bg-emerald-50 text-emerald-950'
                            : 'text-stone-900 hover:bg-stone-50'
                        }`}
                        onMouseEnter={() => onB2MeetingHover?.(stop.id)}
                        onFocus={() => onB2MeetingHover?.(stop.id)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          clearBlurHide()
                        }}
                        onClick={() => {
                          onB2PickupChange(stop.id)
                          onB2MeetingHover?.(null)
                          setListOpen(false)
                          setQuery('')
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>

        {selectedMeeting ? (
          <>
            <button
              type="button"
              className="mt-4 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-left text-[15px] font-medium text-stone-900 underline decoration-stone-300 underline-offset-[3px] transition hover:decoration-stone-500"
            >
              Open in Google Maps
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </button>
            <p className="pdp-location-instruction">{selectedMeeting.description}</p>
          </>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 border-stone-200/90 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <div className="mb-4 flex items-start gap-2">
          <FlagIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <h3 className="text-[18px] font-medium leading-6 text-black">End point</h3>
        </div>
        <p className="pdp-meeting-detail-text">{content.end.placeName}</p>
        <p className="pdp-meeting-detail-text mt-1">{content.end.address}</p>
        <a
          href={mapsUrl(content.end.mapsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[15px] font-medium text-stone-900 underline decoration-stone-300 underline-offset-[3px] transition hover:decoration-stone-500"
        >
          Open in Google Maps
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      </div>
    </div>
  )
}

/** Bold through first comma (street-style lead); remainder neutral gray, single-line ellipsis. */
function MeetingAddressConfirmedText({ line }: { readonly line: string }) {
  const comma = line.indexOf(',')
  if (comma === -1) {
    return <span className="block truncate font-semibold text-black">{line}</span>
  }
  const lead = line.slice(0, comma + 1).trim()
  const tail = line.slice(comma + 1).trim()
  return (
    <span className="flex w-full min-w-0 flex-nowrap items-baseline gap-x-1">
      <span className="shrink-0 font-semibold text-black">{lead}</span>
      {tail ? (
        <span className="min-w-0 flex-1 truncate font-normal text-stone-600">{tail}</span>
      ) : null}
    </span>
  )
}

function SearchIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM16.213 16.213L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5014 21.8078C12.2165 22.0632 11.784 22.0636 11.4991 21.8082L11.4973 21.8066L11.4926 21.8023L11.4755 21.7869L11.4116 21.7286C11.3563 21.6779 11.2761 21.6037 11.1745 21.5081C10.9715 21.3171 10.6827 21.0403 10.3369 20.6944C9.64599 20.0035 8.72279 19.0328 7.79748 17.916C6.87433 16.8019 5.9359 15.5267 5.22486 14.2272C4.52084 12.9405 4 11.5591 4 10.25C4 8.03562 4.89834 6.06142 6.36074 4.49577C7.84708 2.90448 9.87438 2 12 2C14.1256 2 16.1529 2.90448 17.6393 4.49577C19.1017 6.06142 20 8.03563 20 10.25C20 11.5591 19.4791 12.9405 18.7751 14.2272C18.0641 15.5267 17.1257 16.8019 16.2025 17.916C15.2772 19.0328 14.354 20.0035 13.6631 20.6944C13.3173 21.0403 13.0285 21.3171 12.8255 21.5081C12.7239 21.6037 12.6437 21.6779 12.5884 21.7286L12.5245 21.7869L12.5074 21.8023L12.5014 21.8078ZM12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
        fill="#008768"
      />
    </svg>
  )
}

function FlagIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.79736 2.01159C5.78547 2.01103 5.77351 2.01074 5.76147 2.01074C5.34726 2.01074 5.01147 2.34653 5.01147 2.76074L5.01147 8.51013H5V13.5101H5.01148L5.01148 21.2484C5.01148 21.6626 5.34726 21.9984 5.76148 21.9984C6.17569 21.9984 6.51148 21.6626 6.51148 21.2484L6.51148 14.0096H11.074L11.8839 15.6C12.012 15.8513 12.2709 16.0096 12.553 16.0096L18.2427 16.0096C18.6569 16.0096 18.9927 15.6738 18.9927 15.2596L18.9927 4.76074C18.9927 4.56183 18.9137 4.37106 18.773 4.23041C18.6324 4.08976 18.4416 4.01074 18.2427 4.01074H13.012L12.202 2.42038C12.074 2.16902 11.8158 2.01074 11.5337 2.01074H5.83325C5.82122 2.01074 5.80926 2.01103 5.79736 2.01159ZM12 12.6724C12.0829 12.7381 12.1523 12.8216 12.202 12.9192L13.012 14.5096L17.4927 14.5096L17.4927 8.51013H12V5.26822C11.9545 5.21875 11.9153 5.16272 11.8839 5.1011L11.074 3.51074L6.51147 3.51074L6.51147 8.51013H12V12.6724Z"
        fill="#008768"
      />
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
