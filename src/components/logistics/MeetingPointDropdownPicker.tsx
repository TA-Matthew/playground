import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { B2_MEETING_OPTION_LABELS, type Stop } from '../../data/variants'
import { BenefitCheckIcon } from '../icons/BenefitCheckIcon'

/** C2 picker trigger — same outer height for “Show meeting points” and selected (border included). */
export const C2_PICKER_TRIGGER_HEIGHT_CLASS = 'box-border h-[48px]'

function buildMeetingPickerRows(meetings: readonly Stop[]) {
  return meetings.map((m, i) => ({
    stop: m,
    label: B2_MEETING_OPTION_LABELS[i] ?? `Pickup ${i + 1}`,
  }))
}

type Props = {
  readonly meetings: readonly Stop[]
  readonly pickupId: string | null
  readonly onPickupChange: (id: string | null) => void
  readonly onMeetingHover?: (id: string | null) => void
  readonly hoverMeetingId?: string | null
  /** Parent increments to open the dropdown (e.g. map pin tap). */
  readonly openMeetingPickerSignal?: number
  /** A2 / C2: 1px selected border + clear (X) while the option list is open. */
  readonly showClearOnListOpen?: boolean
  readonly listboxId?: string
  readonly className?: string
  /** Unselected trigger label (default: “View 3 location options”). */
  readonly emptyTriggerLabel?: string
}

/** C2 / D2 meeting dropdown — “View 3 location options” trigger + floating option list. */
export function MeetingPointDropdownPicker({
  meetings,
  pickupId,
  onPickupChange,
  onMeetingHover,
  hoverMeetingId = null,
  openMeetingPickerSignal = 0,
  showClearOnListOpen = false,
  listboxId = 'meeting-point-options-dropdown',
  className = 'relative mt-3',
  emptyTriggerLabel = 'View 3 location options',
}: Props) {
  const [listOpen, setListOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const blurHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastOpenMeetingPickerSignalRef = useRef(0)

  const selectedMeeting = useMemo(
    () => (pickupId ? meetings.find((m) => m.id === pickupId) : undefined),
    [pickupId, meetings],
  )
  const selectedMeetingLabel = useMemo(() => {
    if (!pickupId) return undefined
    const idx = meetings.findIndex((m) => m.id === pickupId)
    return idx >= 0 ? (B2_MEETING_OPTION_LABELS[idx] ?? `Pickup ${idx + 1}`) : undefined
  }, [pickupId, meetings])

  const filteredRows = useMemo(() => buildMeetingPickerRows(meetings), [meetings])

  useEffect(() => {
    if (!listOpen) return
    const close = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      const el = pickerRef.current
      if (el?.contains(target)) return
      if (
        target instanceof Element &&
        target.closest('[data-logistics-meeting-map-pin="1"]')
      ) {
        return
      }
      setListOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [listOpen])

  useEffect(() => {
    return () => {
      if (blurHideTimerRef.current) clearTimeout(blurHideTimerRef.current)
    }
  }, [])

  const clearBlurHide = () => {
    if (blurHideTimerRef.current) {
      clearTimeout(blurHideTimerRef.current)
      blurHideTimerRef.current = null
    }
  }

  const openMeetingList = () => {
    clearBlurHide()
    setListOpen(true)
  }

  useEffect(() => {
    if (openMeetingPickerSignal <= 0) return
    if (openMeetingPickerSignal <= lastOpenMeetingPickerSignalRef.current) return
    lastOpenMeetingPickerSignalRef.current = openMeetingPickerSignal
    if (listOpen) {
      clearBlurHide()
      return
    }
    openMeetingList()
  }, [openMeetingPickerSignal, listOpen])

  useEffect(() => {
    if (!listOpen || !hoverMeetingId) return
    requestAnimationFrame(() => {
      document
        .getElementById(`meeting-option-${hoverMeetingId}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [hoverMeetingId, listOpen])

  const toggleMeetingList = () => {
    if (listOpen) {
      setListOpen(false)
      return
    }
    openMeetingList()
  }

  return (
    <div ref={pickerRef} className={`${className}${listOpen ? ' relative z-30' : ''}`}>
      <div className="relative">
        {selectedMeeting ? (
          <button
            type="button"
            className={`${C2_PICKER_TRIGGER_HEIGHT_CLASS} flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#008768] bg-white pl-4 pr-4 text-left text-[16px] font-normal leading-normal outline-none transition hover:bg-emerald-50/40 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0`}
            aria-expanded={listOpen}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            onClick={toggleMeetingList}
          >
            <span className="min-w-0 flex-1 truncate">
              <MeetingAddressConfirmedText line={selectedMeeting.durationLine} label={selectedMeetingLabel} />
            </span>
            {showClearOnListOpen && listOpen ? (
              <button
                type="button"
                className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-stone-900 transition hover:bg-stone-100 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600"
                aria-label="Clear meeting point selection"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onPickupChange(null)
                  onMeetingHover?.(null)
                  setListOpen(false)
                }}
              >
                <ClearSelectionIcon className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <BenefitCheckIcon className="h-5 w-5 shrink-0" />
            )}
          </button>
        ) : (
          <button
            type="button"
            className={`${C2_PICKER_TRIGGER_HEIGHT_CLASS} flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#d1d5db] bg-white pl-4 pr-4 text-left text-[16px] font-normal leading-normal text-[#6b7280] outline-none transition hover:bg-stone-50/80 focus-visible:ring-2 focus-visible:ring-stone-200/80 focus-visible:ring-offset-0`}
            aria-expanded={listOpen}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            onClick={toggleMeetingList}
          >
            <span className="min-w-0 flex-1 truncate">{emptyTriggerLabel}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-stone-900 transition-transform duration-200 ${
                listOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {listOpen ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1">
          <p id={`${listboxId}-label`} className="sr-only">
            Pickup location — choose one option
          </p>
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={`${listboxId}-label`}
            className="max-h-[min(320px,50vh)] overflow-y-auto rounded-lg border border-[#d1d5db] bg-white shadow-md"
            onMouseLeave={() => onMeetingHover?.(null)}
          >
            {filteredRows.map(({ stop, label }) => (
              <li key={stop.id} role="presentation">
                <MeetingPickupOptionRow
                  id={`meeting-option-${stop.id}`}
                  title={label}
                  address={stop.durationLine}
                  selected={pickupId === stop.id}
                  highlighted={hoverMeetingId === stop.id}
                  onMouseEnter={() => onMeetingHover?.(stop.id)}
                  onFocus={() => onMeetingHover?.(stop.id)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    clearBlurHide()
                  }}
                  onClick={() => {
                    onPickupChange(stop.id)
                    onMeetingHover?.(null)
                    setListOpen(false)
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function MeetingPickupOptionRow({
  id,
  title,
  address,
  selected,
  highlighted = false,
  onMouseEnter,
  onFocus,
  onMouseDown,
  onClick,
}: {
  readonly id?: string
  readonly title: string
  readonly address: string
  readonly selected: boolean
  readonly highlighted?: boolean
  readonly onMouseEnter: () => void
  readonly onFocus: () => void
  readonly onMouseDown: (e: ReactMouseEvent<HTMLButtonElement>) => void
  readonly onClick: () => void
}) {
  const activeRow = selected || highlighted
  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={selected}
      className={`flex w-full cursor-pointer items-start gap-2 p-4 text-left transition [word-break:break-word] ${
        activeRow ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#e5e5e5]'
      }`}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <MeetingPickupListPinIcon className="h-5 w-5 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col gap-0">
        <span className="w-full text-[16px] font-normal leading-[1.5] text-black">{title}</span>
        <span className="w-full text-[14px] font-normal leading-[1.5] text-[#4d4d4d]">
          {address}
        </span>
      </span>
    </button>
  )
}

function MeetingAddressConfirmedText({ line, label }: { readonly line: string; readonly label?: string }) {
  if (label) {
    return (
      <span className="flex w-full min-w-0 flex-nowrap items-baseline gap-x-1">
        <span className="shrink-0 font-medium text-black">{label},</span>
        <span className="min-w-0 flex-1 truncate font-normal text-stone-600">{line}</span>
      </span>
    )
  }
  const comma = line.indexOf(',')
  if (comma === -1) {
    return <span className="block truncate font-medium text-black">{line}</span>
  }
  const lead = line.slice(0, comma + 1).trim()
  const tail = line.slice(comma + 1).trim()
  return (
    <span className="flex w-full min-w-0 flex-nowrap items-baseline gap-x-1">
      <span className="shrink-0 font-medium text-black">{lead}</span>
      {tail ? (
        <span className="min-w-0 flex-1 truncate font-normal text-stone-600">{tail}</span>
      ) : null}
    </span>
  )
}

function MeetingPickupListPinIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11.4991 21.8082C11.4991 21.8082 11.4993 21.8084 12 21.25C12.5007 21.8084 12.5014 21.8078 12.5014 21.8078C12.2165 22.0632 11.784 22.0636 11.4991 21.8082Z"
        fill="#008768"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.5C10.067 5.5 8.5 7.067 8.5 9C8.5 10.933 10.067 12.5 12 12.5C13.933 12.5 15.5 10.933 15.5 9C15.5 7.067 13.933 5.5 12 5.5ZM10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9Z"
        fill="#008768"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4991 21.8082L12 21.25L12.5014 21.8078L12.5074 21.8023L12.5245 21.7869L12.5884 21.7286C12.6437 21.6779 12.7239 21.6037 12.8255 21.5081C13.0285 21.3171 13.3173 21.0403 13.6631 20.6944C14.354 20.0035 15.2772 19.0328 16.2025 17.916C17.1257 16.8019 18.0641 15.5267 18.7751 14.2272C19.4791 12.9405 20 11.5591 20 10.25C20 8.03563 19.1017 6.06142 17.6393 4.49577C16.1529 2.90448 14.1256 2 12 2C9.87438 2 7.84708 2.90448 6.36074 4.49577C4.89834 6.06142 4 8.03562 4 10.25C4 11.5591 4.52084 12.9405 5.22486 14.2272C5.9359 15.5267 6.87433 16.8019 7.79748 17.916C8.72279 19.0328 9.64599 20.0035 10.3369 20.6944C10.6827 21.0403 10.9715 21.3171 11.1745 21.5081C11.2761 21.6037 11.3563 21.6779 11.4116 21.7286L11.4755 21.7869L11.4926 21.8023L11.4973 21.8066L11.4991 21.8082ZM7.45693 5.51967C8.6711 4.21977 10.3065 3.5 12 3.5C13.6935 3.5 15.3289 4.21977 16.5431 5.51967C17.7812 6.8452 18.5 8.46437 18.5 10.25C18.5 11.1909 18.1146 12.3095 17.4592 13.5072C16.8109 14.6921 15.9368 15.8856 15.0475 16.959C14.1603 18.0297 13.271 18.9652 12.6025 19.6337C12.3717 19.8645 12.1678 20.0629 12 20.2235C11.8322 20.0629 11.6283 19.8645 11.3975 19.6337C10.729 18.9652 9.8397 18.0297 8.95251 16.959C8.06316 15.8856 7.18909 14.6921 6.54075 13.5072C5.8854 12.3095 5.5 11.1909 5.5 10.25C5.5 8.46438 6.2188 6.84521 7.45693 5.51967Z"
        fill="#008768"
      />
    </svg>
  )
}

function ClearSelectionIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDown({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
