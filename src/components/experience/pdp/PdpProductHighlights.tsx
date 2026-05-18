import type { ReactNode } from 'react'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import type { IconRailItem } from '../../../data/viatorListing'
import { viatorListing } from '../../../data/viatorListing'
import type { ProductHighlightIconId, ProductHighlightSet, ProductHighlightSetId } from '../../../data/productHighlightSets'
import { getProductHighlightSet } from '../../../data/productHighlightSets'

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

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="font-sans" aria-label="Product highlights">
      {children}
    </section>
  )
}

function LayoutHeadoutGrid({ set }: { set: ProductHighlightSet }) {
  return (
    <SectionShell>
      <ul className="grid list-none grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
        {set.items.map((item) => (
          <li key={`${set.id}-${item.title}`} className="flex items-start gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white"
              aria-hidden
            >
              <PhLineIcon id={item.icon} className="size-5 text-stone-800" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-[15px] font-medium text-stone-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-500">{item.subtext}</p>
            </div>
          </li>
        ))}
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

function LayoutExpediaHighlights({
  set,
  includeQuickFactsRail,
}: {
  set: ProductHighlightSet
  includeQuickFactsRail: boolean
}) {
  const rail = viatorListing.iconRail
  const highlightsBlock = (
    <>
      <p className="max-w-prose text-sm leading-relaxed text-slate-600">
        Skip-the-line group tour of the Vatican Museums, Sistine Chapel, and St. Peter&apos;s Basilica with an expert
        guide. About three hours; admission and mobile tickets included.
      </p>
      <ul className="mt-8 list-none space-y-8">
        {set.items.map((item) => (
          <li key={`${set.id}-${item.title}`} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100">
              <PhLineIcon id={item.icon} className="size-6 text-slate-800" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-base font-medium text-slate-900">{item.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{item.subtext}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  )

  if (!includeQuickFactsRail) {
    return (
      <SectionShell>
        <div className="pb-8">{highlightsBlock}</div>
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      <div className="flex flex-col divide-y divide-slate-200/90">
        <div className="pb-8">{highlightsBlock}</div>
        <ul className="grid list-none grid-cols-1 gap-x-12 gap-y-5 py-8 sm:grid-cols-2" aria-label="Quick facts">
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
      </div>
    </SectionShell>
  )
}

function LayoutExpediaSplit({ set }: { set: ProductHighlightSet }) {
  return <LayoutExpediaHighlights set={set} includeQuickFactsRail />
}

function LayoutExpediaKlookLabels({ set }: { set: ProductHighlightSet }) {
  return <LayoutExpediaHighlights set={set} includeQuickFactsRail={false} />
}

type Props = {
  setId: ProductHighlightSetId
  layoutId: ProductHighlightLayoutId
}

/**
 * Product highlights — copy from {@link getProductHighlightSet}; layout presets (Headout, Expedia).
 */
export function PdpProductHighlights({ setId, layoutId }: Props) {
  const set = getProductHighlightSet(setId)

  switch (layoutId) {
    case 'expedia-klook-labels':
      return <LayoutExpediaKlookLabels set={set} />
    case 'expedia-split':
      return <LayoutExpediaSplit set={set} />
    case 'headout-grid':
    default:
      return <LayoutHeadoutGrid set={set} />
  }
}
