import { AVAILABILITY_SHORTCUTS } from '../../data/availabilityShortcuts'
import type { AvailabilityShortcut } from '../../data/availabilityShortcuts'
import {
  formatCommerceTimesPreview,
  getTourGradeOption,
} from '../../data/availabilityShortcutOptions'

type Props = {
  readonly optionsLoading?: boolean
  readonly onSelectOption?: (optionId: string) => void
  readonly onShowMoreOptions?: () => void
}

/**
 * Stacked availability shortcuts in sticky commerce — Q3 Decide 2026 (Figma 23804:21049).
 * @see https://www.figma.com/design/4bYSj8Rabd7DceQL8WUi5L/Q3-Decide-2026?node-id=23804-21049
 */
export function BookingSidebarCommerceOptions({
  optionsLoading = false,
  onSelectOption,
  onShowMoreOptions,
}: Props) {
  if (optionsLoading) {
    return <BookingSidebarCommerceOptionsSkeleton />
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-[#d9d9d9]"
      data-commerce-availability-options
    >
      {AVAILABILITY_SHORTCUTS.map((shortcut, index) => (
        <CommerceOptionRow
          key={shortcut.id}
          shortcut={shortcut}
          showDivider={index < AVAILABILITY_SHORTCUTS.length - 1}
          onSelect={() => onSelectOption?.(shortcut.id)}
        />
      ))}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 border-t border-[#d9d9d9] px-4 py-4 text-sm font-medium leading-5 tracking-[0.05px] text-[#333] underline decoration-solid underline-offset-2 transition hover:bg-neutral-50"
        onClick={onShowMoreOptions}
      >
        Show 1 more option
        <ChevronDown />
      </button>
    </div>
  )
}

function CommerceOptionRow({
  shortcut,
  showDivider,
  onSelect,
}: {
  readonly shortcut: AvailabilityShortcut
  readonly showDivider: boolean
  readonly onSelect: () => void
}) {
  const timesPreview =
    formatCommerceTimesPreview(getTourGradeOption(shortcut.id)?.timeSlots) ??
    ({ text: shortcut.timesAvailableLabel, ariaLabel: shortcut.timesAvailableLabel } as const)

  return (
    <button
      type="button"
      data-commerce-availability-option
      className={`flex w-full flex-col gap-2 bg-white px-4 py-4 text-left transition hover:bg-neutral-50/80 ${
        showDivider ? 'border-b border-[#d9d9d9]' : ''
      }`}
      onClick={onSelect}
    >
      {shortcut.scarcityLabel ? (
        <p className="text-xs font-medium leading-4 text-[#c81e3a]">{shortcut.scarcityLabel}</p>
      ) : null}
      <p className="text-base font-medium leading-6 tracking-[0.05px] text-[#333]">{shortcut.title}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="flex min-w-0 items-baseline gap-1 whitespace-nowrap text-black">
          <span className="text-xs font-normal leading-4 tracking-[0.05px]">from</span>
          <span className="text-base font-bold leading-6 tracking-[0.05px]">{shortcut.priceAmount}</span>
          <span className="text-xs font-normal leading-4 tracking-[0.05px]">/person</span>
        </p>
        <p
          className="shrink-0 text-right text-sm font-normal leading-5 tracking-[0.05px] text-[#4d4d4d]"
          aria-label={timesPreview.ariaLabel}
        >
          {timesPreview.text}
        </p>
      </div>
    </button>
  )
}

function BookingSidebarCommerceOptionsSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[#e8e8e8]"
      data-commerce-availability-options
      aria-busy="true"
      aria-label="Loading availability options"
    >
      <CommerceOptionRowSkeleton showDivider />
      <CommerceOptionRowSkeleton showDivider />
      <CommerceOptionRowSkeleton />
      <div className="border-t border-[#e8e8e8] px-4 py-4">
        <Bone className="mx-auto h-5 w-36" />
      </div>
    </div>
  )
}

function CommerceOptionRowSkeleton({ showDivider }: { readonly showDivider?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-2 px-4 py-4 ${showDivider ? 'border-b border-[#e8e8e8]' : ''}`}
    >
      <Bone className="h-6 w-[min(100%,180px)]" />
      <div className="flex items-end justify-between gap-3">
        <Bone className="h-6 w-24" />
        <Bone className="h-5 w-28 shrink-0" />
      </div>
    </div>
  )
}

function Bone({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`booking-sidebar-bone rounded bg-[#e8e8e8] ${className}`.trim()} aria-hidden />
  )
}

function ChevronDown() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
