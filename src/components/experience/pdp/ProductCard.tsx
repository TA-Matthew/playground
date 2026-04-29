import { useId, type ReactElement } from 'react'
import type { PromotedExperienceItem } from '../../../data/viatorListing'

function GlobeIcon() {
  return (
    <svg
      className="size-3.5 shrink-0 text-[#333]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M3.6 9h16.8M3.6 15h16.8M12 3a12.7 12.7 0 0 0 0 18 12.7 12.7 0 0 0 0-18Z"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Figma 16×16 · free cancellation · [18472:33529](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18472-33529&m=dev) */
function PromoIconFreeCancellation() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-px h-4 w-4 shrink-0 text-black"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8502 6.85429C11.0457 6.6593 11.0461 6.34272 10.8512 6.14719C10.6562 5.95165 10.3396 5.95121 10.144 6.1462C9.5282 6.76031 8.71594 7.57432 8.0579 8.23452C7.7388 8.55468 7.45587 8.83876 7.24905 9.04649L5.84957 7.64702C5.6543 7.45175 5.33772 7.45175 5.14246 7.64702C4.9472 7.84228 4.9472 8.15886 5.14246 8.35412L6.89632 10.108C6.99025 10.2019 7.11769 10.2546 7.25052 10.2544C7.38335 10.2543 7.51102 10.2009 7.6047 10.1067L7.93854 9.77129C8.14678 9.56213 8.43726 9.27047 8.76617 8.94047C9.42411 8.28036 10.2355 7.46727 10.8502 6.85429ZM7.24987 9.75443C7.60434 10.1071 7.6047 10.1067 7.6047 10.1067L7.24987 9.75443Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PromoIconLanguage() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-px h-4 w-4 shrink-0 text-black"
      aria-hidden
    >
      <path
        d="M5.04602 2C4.76988 2 4.54602 2.22386 4.54602 2.5C4.54602 2.77614 4.76988 3 5.04602 3H11.4924C12.3208 3 12.9924 3.67157 12.9924 4.5V11.391C12.9924 11.6671 13.2162 11.891 13.4924 11.891C13.7685 11.891 13.9924 11.6671 13.9924 11.391V4.5C13.9924 3.11929 12.8731 2 11.4924 2H5.04602Z"
        fill="currentColor"
      />
      <path
        d="M4.8252 10.7346C5.19351 10.7346 5.49208 10.4361 5.49208 10.0678C5.49208 9.69945 5.19351 9.40088 4.8252 9.40088C4.4569 9.40088 4.15833 9.69945 4.15833 10.0678C4.15833 10.4361 4.4569 10.7346 4.8252 10.7346Z"
        fill="currentColor"
      />
      <path
        d="M7.71352 10.0678C7.71352 10.4361 7.41495 10.7346 7.04664 10.7346C6.67833 10.7346 6.37976 10.4361 6.37976 10.0678C6.37976 9.69945 6.67833 9.40088 7.04664 9.40088C7.41495 9.40088 7.71352 9.69945 7.71352 10.0678Z"
        fill="currentColor"
      />
      <path
        d="M9.93495 10.0678C9.93495 10.4361 9.63638 10.7346 9.26807 10.7346C8.89977 10.7346 8.6012 10.4361 8.6012 10.0678C8.6012 9.69945 8.89977 9.40088 9.26807 9.40088C9.63638 9.40088 9.93495 9.69945 9.93495 10.0678Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.99335 5.38787C1.99335 4.62747 2.62204 3.99878 3.38244 3.99878H10.6014C11.3617 3.99878 11.9904 4.62747 11.9904 5.38787L11.9893 11.6268C11.9893 12.3871 11.3606 13.0159 10.6002 13.0159C10.3733 13.0159 9.39392 13.0127 8.32025 13.0092L7.96664 13.008C6.82026 13.0043 5.64841 13.0006 5.21744 13.0003L1.72089 13.8744C1.54385 13.9187 1.35675 13.863 1.23276 13.7291C1.10877 13.5952 1.06757 13.4044 1.12528 13.2312L1.98873 10.6409C1.98888 10.2394 1.98996 9.1163 1.99103 8.00727L1.99123 7.80094C1.99232 6.67749 1.99335 5.61577 1.99335 5.38787ZM3.38244 4.99878C3.17432 4.99878 2.99335 5.17975 2.99335 5.38787C2.99335 5.61627 2.99232 6.67794 2.99123 7.8005L2.99103 8.00824C2.98987 9.20519 2.98871 10.4173 2.98871 10.7221C2.98871 10.7758 2.98005 10.8292 2.96306 10.8802L2.36199 12.6834L5.03473 12.0152C5.07439 12.0053 5.11512 12.0002 5.156 12.0002C5.52785 12.0002 6.76482 12.0042 7.96988 12.0081L8.32082 12.0092C9.39649 12.0127 10.375 12.0159 10.6002 12.0159C10.8083 12.0159 10.9893 11.8349 10.9893 11.6268L10.9904 5.38787C10.9904 5.17976 10.8095 4.99878 10.6014 4.99878H3.38244Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PromoIconDuration() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-px h-4 w-4 shrink-0 text-black"
      aria-hidden
    >
      <path
        d="M8.50031 5.50159C8.50031 5.22544 8.27645 5.00159 8.00031 5.00159C7.72416 5.00159 7.50031 5.22544 7.50031 5.50159V8.00384C7.50031 8.13603 7.55266 8.26285 7.64591 8.35655L9.66003 10.3803C9.85482 10.576 10.1714 10.5768 10.3671 10.382C10.5629 10.1872 10.5636 9.87059 10.3688 9.67486L8.50031 7.79743V5.50159Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 13.9609C11.3138 13.9609 14 11.2747 14 7.96094C14 4.64723 11.3138 1.96094 8 1.96094C4.68629 1.96094 2 4.64723 2 7.96094C2 11.2747 4.68629 13.9609 8 13.9609ZM13 7.96094C13 10.7224 10.7615 12.9609 8 12.9609C5.23857 12.9609 3 10.7224 3 7.96094C3 5.19951 5.23858 2.96094 8 2.96094C10.7615 2.96094 13 5.19951 13 7.96094Z"
        fill="currentColor"
      />
    </svg>
  )
}

const META_ROW_CLASS =
  "font-sans text-xs font-normal leading-[150%] text-black [font-feature-settings:'liga'_off,_'clig'_off]"

function ProductCardRatingStarIcon() {
  const clipId = `product-card-star-${useId().replaceAll(':', '')}`
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3 shrink-0"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={12} height={12.0001} fill="white" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.99997 0C5.75752 0.000543662 5.53795 0.143322 5.43912 0.364713L4.06997 3.26676C3.9825 3.45712 3.8059 3.59135 3.59908 3.62468L0.537554 4.09004C0.297499 4.13617 0.102345 4.31073 0.029836 4.54418C-0.0426727 4.77762 0.0192441 5.03203 0.19092 5.20604L2.40624 7.46497C2.55467 7.61855 2.62142 7.83345 2.58611 8.04409L2.06315 11.2337C2.02815 11.4196 2.07625 11.6115 2.19479 11.7589C2.31332 11.9063 2.49042 11.9944 2.67947 12C2.78147 11.9996 2.88168 11.9733 2.97068 11.9234L5.70896 10.4175C5.89005 10.3173 6.10996 10.3173 6.29105 10.4175L9.02934 11.9234C9.1183 11.9733 9.21849 11.9996 9.32045 12C9.50949 11.9943 9.68657 11.9062 9.80511 11.7588C9.92364 11.6115 9.97176 11.4196 9.93681 11.2337L9.41384 8.04406C9.37855 7.83342 9.44529 7.61853 9.59372 7.46495L11.809 5.20602C11.9807 5.03202 12.0427 4.7776 11.9702 4.54414C11.8977 4.31069 11.7025 4.13613 11.4624 4.09002L8.4009 3.62468C8.19408 3.59135 8.01749 3.45712 7.93001 3.26676L6.56083 0.364713C6.462 0.143315 6.24242 0.000535331 5.99997 0Z"
          fill="#00C295"
        />
      </g>
    </svg>
  )
}

type ProductCardProps = Readonly<{
  card: PromotedExperienceItem
  /** Free cancellation / language / duration rows — Customers who also bought only. */
  showMetaRows?: boolean
  /** Promoted shelf MW: fixed width + shrink for horizontal scroll; desktop unchanged. */
  mobileRail?: boolean
}>

/**
 * Viator B2C product card · [Storybook DS](https://www.viator.com/orion/react/styleguide/index.html?path=/story/design-system-elements-cards-product-productcard--product-card) /
 * meta rows shelf · [18472:33529](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=18472-33529&m=dev).
 */
export function ProductCard({ card, showMetaRows = false, mobileRail = false }: ProductCardProps) {
  const hasRating = card.rating != null && card.reviewCount != null
  const isDeal = card.priceWas != null
  const ribbon = card.ribbon
  const ratingLabel =
    card.rating == null ? '' : `${Number(card.rating).toFixed(1)} (${Number(card.reviewCount).toLocaleString()})`

  const promoMetaLines: Array<{
    key: string
    Icon: () => ReactElement
    text: string
  }> = []
  if (showMetaRows) {
    if (card.freeCancellation) {
      promoMetaLines.push({
        key: 'fc',
        Icon: PromoIconFreeCancellation,
        text: card.freeCancellation,
      })
    }
    if (card.language) {
      promoMetaLines.push({ key: 'lang', Icon: PromoIconLanguage, text: card.language })
    }
    if (card.duration) {
      promoMetaLines.push({ key: 'dur', Icon: PromoIconDuration, text: card.duration })
    }
  }

  return (
    <article
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#d9d9d9] bg-white shadow-[0_4px_10px_0_rgba(0,0,0,0.08)] ${
        mobileRail
          ? 'w-[254px] shrink-0 sm:w-full sm:min-w-0 sm:flex-1'
          : 'w-full sm:min-w-0 sm:flex-1'
      }`}
    >
      <div className="relative h-[166px] w-full shrink-0 overflow-hidden bg-stone-100">
        <img
          src={card.image}
          alt={card.imageAlt}
          className="h-full w-full object-cover"
          width={400}
          height={166}
          loading="lazy"
        />
        {ribbon === 'special-offer' || ribbon === 'sell-out' ? (
          <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-1rem)] flex-none items-center justify-center gap-1 rounded-[12px] bg-[#FCEDF0] px-2 py-1 text-center text-xs font-medium leading-[150%] text-[#C81E3A]">
            {ribbon === 'special-offer' ? 'Special Offer' : 'Likely to Sell Out'}
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-2 top-2 grid size-8 place-content-center rounded-full border border-[#e5e5e5] bg-white/95 text-stone-800 shadow-sm"
          aria-label="Save to wishlist"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-6 pt-2 pb-8">
        <p className="inline-flex items-center gap-1.5 text-xs text-[#333]">
          <GlobeIcon />
          <span>{card.location}</span>
        </p>
        {hasRating ? (
          <p
            className="flex items-center gap-1.5 text-sm text-[#333] tabular-nums"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            <ProductCardRatingStarIcon />
            <span className="font-medium">{ratingLabel}</span>
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-left text-sm font-medium leading-snug text-black [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {card.title}
        </h3>
        {promoMetaLines.length > 0 ? (
          <ul className="flex list-none flex-col gap-1.5 p-0 pt-1" aria-label="Experience details">
            {promoMetaLines.map(({ key, Icon, text }) => (
              <li key={key} className="flex items-start gap-2">
                <Icon />
                <span className={`min-w-0 flex-1 ${META_ROW_CLASS}`}>{text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-auto pt-1 text-sm text-black">
          <span className="text-sm font-normal text-[#4d4d4d]">from </span>
          <span
            className={`text-base font-bold ${
              isDeal ? 'text-[#b91c1c]' : 'text-black'
            }`}
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            ${card.price}
          </span>
          {isDeal && card.priceWas != null ? (
            <span className="ml-1.5 text-sm font-normal text-stone-500 line-through">
              ${card.priceWas}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  )
}
