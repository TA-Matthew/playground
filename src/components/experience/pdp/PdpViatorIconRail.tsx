import type { IconRailItem } from '../../../data/viatorListing'

function ClockIcon() {
  return (
    <svg className="size-6 shrink-0 text-[#00c295]" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg className="size-6 shrink-0 text-[#00c295]" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="6"
        y="3"
        width="12"
        height="18"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M10 19h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function LangIcon() {
  return (
    <svg className="size-6 shrink-0 text-[#00c295]" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h6M4 10h4M4 14h3M4 18h2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 4c3 0 5 2.5 5 8s-2 8-5 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

const iconMap = {
  clock: ClockIcon,
  mobile: MobileIcon,
  language: LangIcon,
} as const

type Props = { items: readonly IconRailItem[] }

/**
 * Teal outline icon row below the gallery (Viator PDP).
 */
export function PdpViatorIconRail({ items }: Props) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 border-t border-b border-[#d9d9d9] py-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-4"
      aria-label="Quick facts"
    >
      {items.map((it) => {
        const Ic = iconMap[it.icon]
        return (
          <li
            key={it.id}
            className="flex min-h-9 items-center gap-2 text-base leading-[1.5] text-black"
          >
            <Ic />
            <span className="whitespace-nowrap">
                {it.label ? <span className="font-medium">{it.label}: </span> : null}
                {it.value}
              </span>
          </li>
        )
      })}
    </ul>
  )
}
