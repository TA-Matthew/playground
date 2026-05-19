import type { IconRailItem } from '../../../data/viatorListing'
import {
  formatQuickFactLine,
  PdpQuickFactClockIcon,
  PdpQuickFactLanguageIcon,
  PdpQuickFactLineText,
  PdpQuickFactMobileIcon,
  VIATOR_QUICK_FACT_ICON_FILL,
} from './pdpQuickFactIcons'

const iconMap = {
  clock: () => <PdpQuickFactClockIcon fill={VIATOR_QUICK_FACT_ICON_FILL} />,
  mobile: () => <PdpQuickFactMobileIcon fill={VIATOR_QUICK_FACT_ICON_FILL} />,
  language: () => <PdpQuickFactLanguageIcon fill={VIATOR_QUICK_FACT_ICON_FILL} />,
} as const

type Props = { items: readonly IconRailItem[] }

function quickFactLabel(it: IconRailItem): string {
  return formatQuickFactLine(it)
}

/**
 * Klook-style text pills under the PDP title — no icons, light grey fill.
 */
export function PdpQuickFactLabels({ items }: Props) {
  return (
    <ul className="flex flex-wrap gap-2 font-sans" aria-label="Quick facts">
      {items.map((it) => (
        <li key={it.id}>
          <span className="inline-block rounded bg-[#f5f5f5] px-2 py-1 text-xs leading-snug text-[#666666] sm:px-2.5 sm:py-1 sm:text-sm">
            {quickFactLabel(it)}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Features row — vertical stack on small screens; horizontal wrap from `md` up.
 * 16px gap, neutral/80 borders; DS icons #008768; global/body (16px / 400 / #000).
 */
export function PdpViatorIconRail({ items }: Props) {
  return (
    <ul
      className="box-border flex w-full flex-col content-start items-start gap-4 border-y border-[#d9d9d9] py-4 font-sans md:flex-row md:flex-wrap"
      aria-label="Quick facts"
    >
      {items.map((it) => {
        const Ic = iconMap[it.icon]
        return (
          <li key={it.id} className="flex min-h-6 max-w-full items-center gap-2">
            <Ic />
            <span className="whitespace-nowrap">
              <PdpQuickFactLineText item={it} />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
