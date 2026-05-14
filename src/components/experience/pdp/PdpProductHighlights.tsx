import type { ReactElement, ReactNode } from 'react'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { IconRailItem } from '../../../data/viatorListing'
import { viatorListing } from '../../../data/viatorListing'
import type { ProductHighlightIconId, ProductHighlightSet, ProductHighlightSetId } from '../../../data/productHighlightSets'
import { getProductHighlightSet } from '../../../data/productHighlightSets'

/** Single accent — icons only; no filled wells (minimal chrome). */
const iconFill = '#0f766e'

function IconSlot({ children }: { children: ReactNode }) {
  return (
    <span className="flex w-6 shrink-0 justify-start pt-0.5 text-teal-800 [&>svg]:size-6">{children}</span>
  )
}

/** Thin-line icons (GetYourGuide–style). */
function PhLineIcon({ id, className = 'size-6 shrink-0 text-stone-400' }: { id: ProductHighlightIconId; className?: string }) {
  const sw = 1.5
  const s = 'currentColor'
  switch (id) {
    case 'star':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3.5 14.25 8.05 19.29 8.78 15.65 12.33 16.51 17.35 12 14.98 7.49 17.35 8.35 12.33 4.71 8.78 9.75 8.05 12 3.5z"
            stroke={s}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'badge':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2.5 14.1 6.9 19 7.6 15.5 11 16.3 15.9 12 13.8 7.7 15.9 8.5 11 5 7.6 9.9 6.9 12 2.5z"
            stroke={s}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 19s-6.5-3.8-6.5-8.2C5.5 7.8 7.2 6.5 9 6.5c1.1 0 2.1.5 2.7 1.2.6-.7 1.6-1.2 2.7-1.2 1.8 0 3.5 1.3 3.5 4.3 0 4.4-6.5 8.2-6.5 8.2z"
            stroke={s}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'tag':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 12V6a2 2 0 012-2h6l8 8-7 7-9-9z" stroke={s} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx="7.5" cy="7.5" r="1" fill={s} />
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3.5 18 6.2v5.8c0 3.6-2.9 6.7-6 7.7-3.1-1-6-4.1-6-7.7V6.2l6-2.7z" stroke={s} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      )
    case 'check':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 12.5l4 4 8-9" stroke={s} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'pin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 11.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zm-6.8 8.3L7 13.5A5.2 5.2 0 1117 13.5l1.8 6H5.2z"
            stroke={s}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'ticket':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 9a2 2 0 012-2h10a2 2 0 012 2v2.2a1.4 1.4 0 010 2.6V16a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.2a1.4 1.4 0 010-2.6V9z"
            stroke={s}
            strokeWidth={sw}
          />
        </svg>
      )
    case 'list':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M8 7h11M8 12h11M8 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke={s} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'user':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 11.5a3 3 0 100-6 3 3 0 000 6zm-7 8.5a7 7 0 0114 0"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      )
    case 'family':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="8" cy="9" r="2.2" stroke={s} strokeWidth={sw} />
          <circle cx="16" cy="9" r="2.2" stroke={s} strokeWidth={sw} />
          <path d="M4 20a4.5 4.5 0 019 0M11 20a4.5 4.5 0 019 0" stroke={s} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      )
    case 'thumbs':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 10.5V20H4v-9.5h3zm11.5-.3l-1.6-3.2H11V20h6.4a1.8 1.8 0 001.8-1.5l1-5.8a1.8 1.8 0 00-1.7-2z"
            stroke={s}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 12.5l4 4 8-9"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

function StarIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5l2.09 4.24 4.68.68-3.39 3.3.8 4.66L12 14.77 7.82 16.38l.8-4.66-3.39-3.3 4.68-.68L12 3.5z"
        fill={iconFill}
      />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.2 4.46 4.92.71-3.56 3.47.84 4.9L12 17.9l-4.4 2.31.84-4.9-3.56-3.47 4.92-.71L12 2z"
        fill={iconFill}
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-7-9.5C5 7.46 6.79 6 9 6c1.2 0 2.32.55 3 1.42A3.49 3.49 0 0115 6c2.21 0 4 1.46 4 4.5 0 5.15-7 9.5-7 9.5z"
        fill={iconFill}
      />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12V5a2 2 0 012-2h7l9 9-7 7-9-9zM7.5 7.5h.01"
        stroke={iconFill}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 4.25-3.4 7.95-7 9-3.6-1.05-7-4.75-7-9V6l7-3z"
        stroke={iconFill}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12l4 4 8-8"
        stroke={iconFill}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 11a2 2 0 100-4 2 2 0 000 4zm-7 9l1.5-6A5 5 0 1117.5 14L19 20l-14-1z"
        fill={iconFill}
      />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2.5a1.5 1.5 0 010 3V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5a1.5 1.5 0 010-3V8z"
        stroke={iconFill}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
        stroke={iconFill}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 0114 0H5z" fill={iconFill} />
    </svg>
  )
}

function FamilyIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 10a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM4 20a5 5 0 0110 0H4zm6 0a5 5 0 0110 0h-4"
        fill={iconFill}
      />
    </svg>
  )
}

function ThumbsIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10V20H4V10h3zm12 .5l-1.5-3H11v9l1 4h6.5a2 2 0 002-1.7l1-6a2 2 0 00-2-2.3z"
        fill={iconFill}
      />
    </svg>
  )
}

const filledIconComponents: Record<ProductHighlightIconId, () => ReactElement> = {
  star: StarIcon,
  badge: BadgeIcon,
  heart: HeartIcon,
  tag: TagIcon,
  shield: ShieldIcon,
  check: CheckIcon,
  pin: PinIcon,
  ticket: TicketIcon,
  list: ListIcon,
  user: UserIcon,
  family: FamilyIcon,
  thumbs: ThumbsIcon,
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="mt-6 font-sans" aria-label="Product highlights">
      {children}
    </section>
  )
}

function LayoutViatorCards({ set }: { set: ProductHighlightSet }) {
  return (
    <SectionShell>
      <ul className="grid list-none grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-0">
        {set.items.map((item) => {
          const Icon = filledIconComponents[item.icon]
          return (
            <li key={`${set.id}-${item.title}`} className="flex gap-3 sm:flex-col sm:gap-2">
              <IconSlot>
                <Icon />
              </IconSlot>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-medium leading-snug text-stone-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{item.subtext}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}

function LayoutAirbnbTrust({ set }: { set: ProductHighlightSet }) {
  return (
    <SectionShell>
      <ul className="divide-y divide-stone-100">
        {set.items.map((item) => {
          const Icon = filledIconComponents[item.icon]
          return (
            <li key={`${set.id}-${item.title}`} className="flex gap-4 py-5 first:pt-0">
              <IconSlot>
                <Icon />
              </IconSlot>
              <div className="min-w-0">
                <h3 className="text-[15px] font-medium text-stone-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">{item.subtext}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}

function LayoutHeadoutGrid({ set }: { set: ProductHighlightSet }) {
  return (
    <SectionShell>
      <ul className="grid list-none grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
        {set.items.map((item) => (
          <li key={`${set.id}-${item.title}`} className="flex gap-3">
            <PhLineIcon id={item.icon} className="mt-0.5 size-6 shrink-0 text-stone-400" />
            <div className="min-w-0">
              <h3 className="text-[15px] font-medium text-stone-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500">{item.subtext}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

function LayoutCompactStrip({ set }: { set: ProductHighlightSet }) {
  return (
    <SectionShell>
      <ul className="grid list-none grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {set.items.map((item) => {
          const Icon = filledIconComponents[item.icon]
          return (
            <li key={`${set.id}-${item.title}`} className="flex gap-3">
              <IconSlot>
                <Icon />
              </IconSlot>
              <div className="min-w-0">
                <h3 className="text-sm font-medium leading-snug text-stone-900">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.subtext}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}

/** Line icons for PDP quick facts (clock / mobile / language). */
function ExpediaRailIcon({
  kind,
  iconClassName = 'size-6 shrink-0 text-slate-900',
}: {
  kind: IconRailItem['icon']
  iconClassName?: string
}) {
  const c = iconClassName
  const sw = 1.5
  const stroke = 'currentColor'
  if (kind === 'clock') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
        <path d="M12 7.5V12l3.5 2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'mobile') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="3" width="10" height="18" rx="2" stroke={stroke} strokeWidth={sw} />
        <path d="M10 18.5h4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h5l2 3 2-3h7v10H4V8z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="13" r="1.2" fill={stroke} />
      <circle cx="12" cy="13" r="1.2" fill={stroke} />
      <circle cx="15" cy="13" r="1.2" fill={stroke} />
    </svg>
  )
}

function withlocalsRailHeading(it: IconRailItem): string {
  if (it.id === 'duration') return 'Duration'
  if (it.id === 'ticket') return 'Ticket'
  if (it.id === 'lang') return it.label?.trim() ? it.label : 'Languages'
  return 'Details'
}

/** Withlocals-style layout: merged block uses PDP teal icons + stone typography (not third-party accent colours). */
function LayoutWithlocalsMerged({ set }: { set: ProductHighlightSet }) {
  const rail = viatorListing.iconRail
  /** Match {@link PdpViatorIconRail} brand green #008768 */
  const pdpIconClass = 'size-6 shrink-0 text-[#008768]'
  return (
    <SectionShell>
      <div className="border-y border-[#d9d9d9] py-4">
        <ul
          className="grid list-none grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2"
          aria-label="Experience details and highlights"
        >
          {rail.map((it) => (
            <li key={it.id} className={`flex gap-3 ${it.id === 'lang' ? 'sm:col-span-2' : ''}`}>
              <ExpediaRailIcon kind={it.icon} iconClassName={pdpIconClass} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900">{withlocalsRailHeading(it)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{it.value}</p>
              </div>
            </li>
          ))}
          {set.items.map((item) => (
            <li key={`${set.id}-${item.title}`} className="flex gap-3 sm:col-span-2">
              <PhLineIcon id={item.icon} className={pdpIconClass} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{item.subtext}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  )
}

function LayoutExpediaSplit({ set }: { set: ProductHighlightSet }) {
  const rail = viatorListing.iconRail
  return (
    <SectionShell>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Highlights</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600">
          Highlights answer “why this listing”—curated proof points so you do not have to piece them together from long
          descriptions and reviews.
        </p>
        <ul className="mt-8 list-none space-y-8">
          {set.items.map((item) => (
            <li key={`${set.id}-${item.title}`} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100">
                <PhLineIcon id={item.icon} className="size-6 text-slate-800" />
              </div>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{item.subtext}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 border-t border-slate-200/90 pt-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">About this property</h2>
        <ul className="mt-5 grid list-none grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2" aria-label="About this property">
          {rail.map((it) => (
            <li key={it.id} className="flex gap-3">
              <ExpediaRailIcon kind={it.icon} />
              <span className="text-[15px] leading-snug text-slate-800">
                {it.label ? (
                  <>
                    {it.label}: {it.value}
                  </>
                ) : (
                  it.value
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[15px] font-medium text-sky-700">
          <span className="cursor-default">See all about this property</span>
          <span aria-hidden> ›</span>
        </p>
      </div>
    </SectionShell>
  )
}

type Props = {
  setId: ProductHighlightSetId
  layoutId: ProductHighlightLayoutId
}

/**
 * Product highlights — copy from {@link getProductHighlightSet}; layout presets (Viator, Airbnb list, Headout, compact, Expedia split, Withlocals merged).
 */
export function PdpProductHighlights({ setId, layoutId }: Props) {
  const set = getProductHighlightSet(setId)

  switch (layoutId) {
    case 'ggy-list':
      return <LayoutAirbnbTrust set={set} />
    case 'headout-grid':
      return <LayoutHeadoutGrid set={set} />
    case 'compact-strip':
      return <LayoutCompactStrip set={set} />
    case 'expedia-split':
      return <LayoutExpediaSplit set={set} />
    case 'withlocals-merged':
      return <LayoutWithlocalsMerged set={set} />
    case 'viator-cards':
    default:
      return <LayoutViatorCards set={set} />
  }
}
