import type { ReactNode } from 'react'
import { PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_TEXT } from '../../../data/productHighlightConciseSummary'
import {
  TOP_PRODUCT_HIGHLIGHT_COPY,
  TOP_PRODUCT_TROPHY_SRC,
} from '../../../data/productHighlightTopProduct'
import {
  highlightIconGraphicClassName,
  highlightIconWellWrapperClassName,
  highlightItemCopyClassName,
  isLargeProductHighlightIconStyle,
  type ProductHighlightIconStyleId,
} from '../../../data/productHighlightIconStyles'
import type { ProductHighlightLayoutId } from '../../../data/productHighlightLayouts'
import { viatorListing } from '../../../data/viatorListing'
import { PdpQuickFactLineText, PdpQuickFactRailIcon } from './pdpQuickFactIcons'
import type { ProductHighlightIconId } from '../../../data/productHighlightSets'
import { PRODUCT_HIGHLIGHT_ITEMS } from '../../../data/productHighlightSets'

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
          <path
            d="M17.1429 7.93036C17.1429 8.5445 16.6451 9.04236 16.0309 9.04236C15.4168 9.04236 14.9189 8.5445 14.9189 7.93036C14.9189 7.31622 15.4168 6.81836 16.0309 6.81836C16.6451 6.81836 17.1429 7.31622 17.1429 7.93036Z"
            fill={s}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.533 3.53035C21.8259 3.23747 21.8259 2.76259 21.533 2.46969C21.2402 2.17679 20.7653 2.17677 20.4724 2.46965L19.4376 3.50438H12.7282C12.5293 3.50438 12.3385 3.58339 12.1979 3.72403L2.32125 13.5999C2.18059 13.7406 2.10156 13.9314 2.10156 14.1303C2.10156 14.3292 2.18059 14.52 2.32125 14.6606L9.34463 21.6835C9.63752 21.9764 10.1124 21.9764 10.4052 21.6835L20.2818 11.8076C20.4225 11.6669 20.5015 11.4762 20.5015 11.2773V4.56176L21.533 3.53035ZM3.91226 14.1303L13.0388 5.00438H19.0015V10.9666L9.87493 20.0925L3.91226 14.1303Z"
            fill={s}
          />
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
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1.99414C9.51148 1.99414 7.49414 4.01148 7.49414 6.5C7.49414 8.98852 9.51148 11.0059 12 11.0059C14.4885 11.0059 16.5059 8.98852 16.5059 6.5C16.5059 4.01148 14.4885 1.99414 12 1.99414ZM8.99414 6.5C8.99414 4.83991 10.3399 3.49414 12 3.49414C13.6601 3.49414 15.0059 4.83991 15.0059 6.5C15.0059 8.16009 13.6601 9.50586 12 9.50586C10.3399 9.50586 8.99414 8.16009 8.99414 6.5Z"
            fill={s}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.3668 13.0154C12.2266 13.0088 12.1242 13.0067 12.0042 13.0065L11.9946 13.0065L11.9854 13.0066L11.9595 13.0069L11.8727 13.0084C11.8053 13.0097 11.7146 13.0118 11.6395 13.0154C10.0968 13.0882 9.12864 13.3874 7.81348 14.1967C6.4982 15.0061 5.79507 15.7357 5.0347 17.0799C4.26939 18.4328 4.00917 19.601 3.99512 20.9467V21.2733C3.99512 21.6876 4.3309 22.0233 4.74512 22.0233H19.261C19.6752 22.0233 20.011 21.6876 20.011 21.2733L20.0111 20.9545L20.011 20.9467C19.9969 19.601 19.7367 18.4328 18.9714 17.0799C18.2111 15.7357 17.5081 15.0061 16.1928 14.1967C14.8777 13.3873 13.9095 13.0882 12.3668 13.0154ZM12.003 14.5065L12.0065 14.5065C12.103 14.5067 12.1818 14.5083 12.2961 14.5137C13.5853 14.5745 14.3073 14.7976 15.4067 15.4742C16.5059 16.1507 17.0303 16.6948 17.6658 17.8184C18.2116 18.7833 18.4371 19.5994 18.4954 20.5233H5.5107C5.56898 19.5994 5.79447 18.7833 6.3403 17.8184C6.97585 16.6948 7.50027 16.1507 8.59962 15.4742C9.69903 14.7976 10.421 14.5745 11.7102 14.5137C11.7632 14.5112 11.8366 14.5093 11.9013 14.5081L11.9801 14.5068L12.003 14.5065Z"
            fill={s}
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
            d="M10.5823 7.66688C10.6421 7.56611 10.7013 7.53402 10.7412 7.52069C10.7895 7.50461 10.8578 7.50123 10.9379 7.5278C11.1096 7.58471 11.2174 7.72909 11.2174 7.89241C11.2174 8.2708 11.2257 8.7483 11.2339 9.18431L11.2366 9.32741C11.2438 9.71077 11.2501 10.0454 11.2501 10.2484C11.2501 10.4473 11.3291 10.638 11.4697 10.7787C11.6104 10.9193 11.8011 10.9984 12.0001 10.9984H15.9016C15.9883 10.9984 16.0861 11.04 16.1699 11.1484C16.2572 11.2611 16.2936 11.4042 16.2748 11.5254L16.2736 11.5332C16.0384 13.1623 15.7185 14.7951 15.5589 15.6095C15.5103 15.8573 15.4766 16.0294 15.4646 16.1025L15.4622 16.1187C15.4294 16.3509 15.238 16.4967 15.0737 16.4976H7.49805C7.08383 16.4976 6.74805 16.8334 6.74805 17.2476C6.74805 17.6618 7.08383 17.9976 7.49805 17.9976H15.0752L15.0774 17.9976C16.0636 17.9947 16.8157 17.2236 16.9458 16.3394C16.9513 16.3081 16.969 16.2183 16.996 16.081L16.9962 16.0799C17.1331 15.3839 17.509 13.4732 17.7578 11.751C17.9189 10.6953 17.1413 9.49836 15.9016 9.49836H12.74L12.7336 9.15632C12.7254 8.71797 12.7174 8.25447 12.7174 7.89241C12.7174 6.99288 12.1057 6.33468 11.41 6.10402C10.686 5.86398 9.79019 6.06165 9.29203 6.90195C9.27051 6.93826 9.08302 7.2592 8.8069 7.73185L8.80111 7.74176C8.28909 8.61823 7.47685 10.0086 6.85097 11.0766C6.64154 11.434 6.76148 11.8935 7.11885 12.1029C7.47622 12.3123 7.9357 12.1924 8.14512 11.835C8.77945 10.7526 9.59767 9.35195 10.1066 8.48067L10.1095 8.47575C10.3795 8.01357 10.5618 7.70148 10.5823 7.66688Z"
            fill={s}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.13087 3.00745C3.95687 3.00745 2.99625 3.96806 2.99625 5.14207V16.174L2.00866 21.1011C1.95936 21.347 2.03627 21.6013 2.21359 21.7787C2.39091 21.9561 2.64517 22.0331 2.89112 21.9839L7.8183 20.9985H18.89C20.0584 20.9985 21.0247 20.0322 21.0247 18.8638V5.14207C21.0247 3.96808 20.064 3.00745 18.89 3.00745H5.13087ZM4.49625 5.14207C4.49625 4.79649 4.78529 4.50745 5.13087 4.50745H18.89C19.2356 4.50745 19.5247 4.7965 19.5247 5.14207V18.8638C19.5247 19.2037 19.23 19.4985 18.89 19.4985H7.74403C7.69464 19.4985 7.64537 19.5033 7.59694 19.513L3.70061 20.2923L4.48162 16.3959C4.49135 16.3473 4.49625 16.2979 4.49625 16.2485V5.14207Z"
            fill={s}
          />
        </svg>
      )
    case 'wave-hand':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M22.4464 7.07869C22.3876 6.1698 22.0696 5.33941 21.5691 4.65491"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.21328 1.55359C7.43756 1.89612 6.74696 2.45626 6.24161 3.21399"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.91827 20.1961L5.36241 19.5635C4.59098 18.6857 3.98553 17.675 3.57558 16.5807L2.47095 13.6319C2.19743 12.9018 2.42831 12.0785 3.04163 11.5971C3.96154 10.875 5.31554 11.2153 5.78481 12.2865L6.71774 14.4159C7.41683 14.6033 9.01973 15.3325 9.83856 16.7507"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.1504 11.8596L12.5553 6.61642C12.8139 5.65117 12.2411 4.65902 11.2759 4.40039C10.3106 4.14176 9.31849 4.71457 9.05985 5.67981L6.71832 14.4185M12.5553 6.61642L13.1173 4.51915C13.3759 3.5539 14.3681 2.98108 15.3333 3.23972C16.2985 3.49835 16.8714 4.49051 16.6127 5.45576L15.6761 8.95121M14.308 22.4465L14.9278 22.0885C15.666 21.6623 16.2047 20.9602 16.4254 20.1368L19.1716 9.88782C19.4301 8.92257 18.8574 7.93042 17.8921 7.67178C16.9269 7.41314 15.9348 7.98596 15.6761 8.95121L14.4585 13.4953"
            stroke={s}
            strokeWidth={sw}
            strokeLinecap="round"
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

/** Highlight row icon well — [Grey](https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY?node-id=21601-124897) / [Outline](https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY?node-id=21601-124930) / [Stylised](https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY?node-id=21601-124962). */
function HighlightIconWell({
  iconId,
  iconStyle,
}: {
  iconId: ProductHighlightIconId
  iconStyle: ProductHighlightIconStyleId
}) {
  return (
    <span className={highlightIconWellWrapperClassName(iconStyle)} aria-hidden>
      <PhLineIcon id={iconId} className={highlightIconGraphicClassName(iconStyle)} />
    </span>
  )
}

/** Gold 3D trophy — Figma 21501:113572; well follows icon-style tab like other highlights. */
function TopProductTrophyWell({ iconStyle }: { iconStyle: ProductHighlightIconStyleId }) {
  const isLarge = isLargeProductHighlightIconStyle(iconStyle)

  if (isLarge) {
    return (
      <span className={highlightIconWellWrapperClassName(iconStyle)} aria-hidden>
        <div className="box-border flex size-8 shrink-0 items-center justify-center p-0.5">
          <img src={TOP_PRODUCT_TROPHY_SRC} alt="" className="size-full object-contain" />
        </div>
      </span>
    )
  }

  return (
    <span className={highlightIconWellWrapperClassName(iconStyle)} aria-hidden>
      <img
        src={TOP_PRODUCT_TROPHY_SRC}
        alt=""
        className="size-[18px] shrink-0 object-contain"
        width={18}
        height={18}
      />
    </span>
  )
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="font-sans" aria-label="Product highlights">
      {children}
    </section>
  )
}

function ConciseSummaryIntro() {
  return (
    <p
      className="max-w-prose"
      style={{
        color: 'var(--Color-Neutral-20, #333)',
        fontFamily: 'var(--Typeface-Font-Brand, Aeonik)',
        fontSize: 'var(--Typeface-Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: 'var(--Typeface-Font-weight-Regular, 400)',
        lineHeight: 'var(--Typeface-Line-height-300, 20px)',
        letterSpacing: 'var(--Typeface-Letter-spacing-None, 0.05px)',
      }}
    >
      {PRODUCT_HIGHLIGHT_CONCISE_SUMMARY_TEXT}
    </p>
  )
}

function HighlightItemCopy({
  title,
  subtext,
  iconStyle,
}: {
  title: string
  subtext: string
  iconStyle: ProductHighlightIconStyleId
}) {
  return (
    <div className={highlightItemCopyClassName(iconStyle)}>
      <h3 className="pdp-highlight-title">{title}</h3>
      <p className="pdp-highlight-subtext">{subtext}</p>
    </div>
  )
}

type ProductHighlightColumns = 1 | 2

/** Shared highlight rows — Expedia row chrome; Headout uses two columns only. */
function ProductHighlightList({
  iconStyle,
  columns,
  topProduct = false,
  topSpacing = false,
  bottomChrome = false,
}: {
  iconStyle: ProductHighlightIconStyleId
  columns: ProductHighlightColumns
  topProduct?: boolean
  topSpacing?: boolean
  /** Padding + divider before the next block (e.g. Expedia quick-facts rail). */
  bottomChrome?: boolean
}) {
  const listClass =
    columns === 2
      ? 'grid list-none grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2'
      : 'list-none space-y-8'

  const list = (
    <ul className={[listClass, topSpacing ? 'mt-8' : ''].filter(Boolean).join(' ')}>
      {PRODUCT_HIGHLIGHT_ITEMS.map((item, index) => {
        const isTopRow = topProduct && index === 0
        return (
          <li
            key={isTopRow ? 'top-product' : item.title}
            className={[
              'flex gap-4',
              isLargeProductHighlightIconStyle(iconStyle) ? 'items-start' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isTopRow ? (
              <TopProductTrophyWell iconStyle={iconStyle} />
            ) : (
              <HighlightIconWell iconId={item.icon} iconStyle={iconStyle} />
            )}
            <HighlightItemCopy
              title={isTopRow ? TOP_PRODUCT_HIGHLIGHT_COPY.title : item.title}
              subtext={isTopRow ? TOP_PRODUCT_HIGHLIGHT_COPY.subtext : item.subtext}
              iconStyle={iconStyle}
            />
          </li>
        )
      })}
    </ul>
  )

  if (!bottomChrome) return list

  return <div className="border-b border-slate-200/90 pb-8">{list}</div>
}

function ProductHighlightsBlock({
  iconStyle,
  columns,
  conciseSummary,
  topProduct = false,
  bottomChrome = false,
}: {
  iconStyle: ProductHighlightIconStyleId
  columns: ProductHighlightColumns
  conciseSummary: boolean
  topProduct?: boolean
  bottomChrome?: boolean
}) {
  return (
    <>
      {conciseSummary ? <ConciseSummaryIntro /> : null}
      <ProductHighlightList
        iconStyle={iconStyle}
        columns={columns}
        topProduct={topProduct}
        topSpacing={conciseSummary}
        bottomChrome={bottomChrome}
      />
    </>
  )
}

function LayoutHeadoutGrid({
  iconStyle,
  conciseSummary,
  topProduct = false,
  bottomChrome = true,
}: {
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
  /** Divider + padding below grid (off for Headout + Viator — spacing comes from parent `gap-8`). */
  bottomChrome?: boolean
}) {
  return (
    <SectionShell>
      <ProductHighlightsBlock
        iconStyle={iconStyle}
        columns={2}
        conciseSummary={conciseSummary}
        topProduct={topProduct}
        bottomChrome={bottomChrome}
      />
    </SectionShell>
  )
}

/** Expedia-style 2-col quick-facts rail. Also reused as the "Deferred" rail above the Overview section. */
export function ExpediaQuickFactsRail({
  topBorder = false,
}: {
  readonly topBorder?: boolean
} = {}) {
  const rail = viatorListing.iconRail
  return (
    <ul
      className={[
        'grid list-none grid-cols-1 gap-x-12 gap-y-5 py-8 sm:grid-cols-2',
        topBorder ? 'border-t border-[#d9d9d9]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Quick facts"
    >
      {rail.map((it) => (
        <li key={it.id} className="flex gap-3">
          <PdpQuickFactRailIcon kind={it.icon} />
          <PdpQuickFactLineText item={it} />
        </li>
      ))}
    </ul>
  )
}

function LayoutHeadoutExpediaRail({
  iconStyle,
  conciseSummary,
  topProduct = false,
}: {
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
}) {
  return (
    <SectionShell>
      <ProductHighlightsBlock
        iconStyle={iconStyle}
        columns={2}
        conciseSummary={conciseSummary}
        topProduct={topProduct}
        bottomChrome
      />
      <ExpediaQuickFactsRail />
    </SectionShell>
  )
}

function LayoutExpediaHighlights({
  iconStyle,
  conciseSummary,
  topProduct = false,
  includeQuickFactsRail,
  bottomPadding = true,
}: {
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
  includeQuickFactsRail: boolean
  /** `pb-8` below highlights when no in-section rail (off for Expedia + Viator). */
  bottomPadding?: boolean
}) {
  const highlightsBlock = (
    <ProductHighlightsBlock
      iconStyle={iconStyle}
      columns={1}
      conciseSummary={conciseSummary}
      topProduct={topProduct}
    />
  )

  if (!includeQuickFactsRail) {
    return (
      <SectionShell>
        {bottomPadding ? <div className="pb-8">{highlightsBlock}</div> : highlightsBlock}
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      <div className="flex flex-col divide-y divide-slate-200/90">
        <div className="pb-8">{highlightsBlock}</div>
        <ExpediaQuickFactsRail />
      </div>
    </SectionShell>
  )
}

function LayoutExpediaSplit({
  iconStyle,
  conciseSummary,
  topProduct = false,
}: {
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
}) {
  return (
    <LayoutExpediaHighlights
      iconStyle={iconStyle}
      conciseSummary={conciseSummary}
      topProduct={topProduct}
      includeQuickFactsRail
    />
  )
}

function LayoutExpediaKlookLabels({
  iconStyle,
  conciseSummary,
  topProduct = false,
}: {
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
}) {
  return (
    <LayoutExpediaHighlights
      iconStyle={iconStyle}
      conciseSummary={conciseSummary}
      topProduct={topProduct}
      includeQuickFactsRail={false}
    />
  )
}

type Props = {
  layoutId: ProductHighlightLayoutId
  iconStyle: ProductHighlightIconStyleId
  conciseSummary: boolean
  topProduct?: boolean
}

/**
 * Product highlights — fixed four rows; layout presets (Headout, Expedia).
 */
export function PdpProductHighlights({
  layoutId,
  iconStyle,
  conciseSummary,
  topProduct = false,
}: Props) {
  const layoutProps = { iconStyle, conciseSummary, topProduct }

  switch (layoutId) {
    case 'expedia-klook-labels':
    case 'expedia-deferred-rail':
      return <LayoutExpediaKlookLabels {...layoutProps} />
    case 'expedia-split':
      return <LayoutExpediaSplit {...layoutProps} />
    case 'headout-expedia-rail':
      return <LayoutHeadoutExpediaRail {...layoutProps} />
    case 'headout-viator-rail':
      return <LayoutHeadoutGrid {...layoutProps} bottomChrome={false} />
    case 'expedia-viator-rail':
      return (
        <LayoutExpediaHighlights
          {...layoutProps}
          includeQuickFactsRail={false}
          bottomPadding={false}
        />
      )
    case 'headout-grid':
    case 'headout-deferred-rail':
    default:
      return <LayoutHeadoutGrid {...layoutProps} />
  }
}
