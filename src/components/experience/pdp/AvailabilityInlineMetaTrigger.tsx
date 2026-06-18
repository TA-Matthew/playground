import { type ReactNode } from 'react'

type InlineMetaTriggerProps = {
  readonly icon: ReactNode
  readonly children: ReactNode
  readonly interactive?: boolean
  readonly expanded?: boolean
  readonly onClick?: () => void
  readonly ariaLabel?: string
  readonly ariaExpanded?: boolean
  readonly ariaControls?: string
}

/** Shared inline date / travelers trigger — dashed underline + chevron when interactive. */
export function AvailabilityInlineMetaTrigger({
  icon,
  children,
  interactive = false,
  expanded = false,
  onClick,
  ariaLabel,
  ariaExpanded,
  ariaControls,
}: InlineMetaTriggerProps) {
  const className = [
    'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 text-base font-medium leading-6 tracking-[0.05px]',
    interactive
      ? 'cursor-pointer text-black underline decoration-dotted decoration-[#737373] underline-offset-[5px] transition hover:bg-neutral-50 hover:decoration-solid hover:decoration-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d8564]'
      : 'text-[#4d4d4d]',
  ].join(' ')

  if (!interactive) {
    return (
      <span className={className}>
        {icon}
        <span>{children}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
      <ChevronDown className={expanded ? 'rotate-180' : ''} />
    </button>
  )
}

function ChevronDown({ className = '' }: { readonly className?: string }) {
  return (
    <svg
      className={`size-4 shrink-0 text-[#4d4d4d] transition-transform ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
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
