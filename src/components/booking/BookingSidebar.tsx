import { useId, type SVGProps } from 'react'
import { BenefitCheckIcon } from '../icons/BenefitCheckIcon'
import { Tag } from '../common/Tag'
import { AvailabilityDateControl } from '../experience/pdp/AvailabilityDateControl'
import { AvailabilityTravelersControl } from '../experience/pdp/AvailabilityTravelersControl'
import { BookingSidebarCommerceOptions } from './BookingSidebarCommerceOptions'
import bookAheadFlame from '../../assets/book-ahead-flame.png'
import type { AvailabilityCommerceModeId } from '../../data/availabilityShortcutCommerce'
import { usesStickyCommerceSidebar } from '../../data/availabilityShortcutCommerce'
import type { AvailabilityTravelerCounts } from '../../data/availabilityShortcutTravelers'
import type { BookingContent } from '../../data/variants'

const CARD_BORDER = 'border-[#e0e0e0]'
const CTA_TEAL = 'bg-[#2d8564]'
const MINT_PANEL = 'bg-[#f0faf7]'

type Props = {
  booking: BookingContent
  /** Mobile PDP inline: strip outer booking card border/padding; book-ahead row keeps its border. */
  embedded?: boolean
  /** Facilitator-only: hide the book-ahead row on mobile (only applied when embedded). */
  hideBookAheadMobile?: boolean
  /** Opens expanded availability options in the main column (availability shortcut). */
  onCheckAvailability?: () => void
  /** Availability shortcut — total price, Update Search CTA, hide policy panel. */
  availabilitySearchActive?: boolean
  /** Shown when {@link availabilitySearchActive} (defaults to travelers × option price). */
  searchTotalAmount?: string
  /** Skeleton for total price while availability options load. */
  searchTotalLoading?: boolean
  /** Reopens availability search (modal variant) when search is already active. */
  onUpdateSearch?: () => void
  /** Overrides {@link BookingContent.travellers} in the date/travelers row. */
  travelers?: number
  /** Overrides {@link BookingContent.dateLabel} in the date/travelers row. */
  dateLabel?: string
  /** Availability shortcut — where shortcuts render (`asCommerce`). */
  availabilityCommerceMode?: AvailabilityCommerceModeId
  travelerCounts?: AvailabilityTravelerCounts
  onDateLabelChange?: (dateLabel: string) => void
  onTravelerCountsChange?: (counts: AvailabilityTravelerCounts) => void
  onSelectAvailabilityOption?: (optionId: string) => void
  availabilityOptionsLoading?: boolean
}

export function BookingSidebar({
  booking,
  embedded,
  hideBookAheadMobile,
  onCheckAvailability,
  onUpdateSearch,
  availabilitySearchActive = false,
  searchTotalAmount,
  searchTotalLoading = false,
  travelers,
  dateLabel: dateLabelOverride,
  availabilityCommerceMode = 'main-column',
  travelerCounts,
  onDateLabelChange,
  onTravelerCountsChange,
  onSelectAvailabilityOption,
  availabilityOptionsLoading = false,
}: Props) {
  const sidebarCommerce = usesStickyCommerceSidebar(availabilityCommerceMode)
  const useMetaChips =
    sidebarCommerce && Boolean(onDateLabelChange && onTravelerCountsChange && travelerCounts)
  const shellCard = embedded
    ? 'bg-transparent p-0'
    : `rounded-[12px] border ${CARD_BORDER} bg-white p-6`

  const travelerCount = travelers ?? booking.travellers
  const dateLabel = dateLabelOverride ?? booking.dateLabel

  return (
    <div className="space-y-4">
      <div className={shellCard} aria-label="Book this experience">
        {/* Price */}
        {availabilitySearchActive ? (
          searchTotalLoading ? (
            <BookingSearchTotalSkeleton />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-[1.2] text-black">
              <span className="text-[clamp(22px,2.75vw,28px)] font-bold tracking-[-0.02em]">
                {searchTotalAmount ?? booking.priceAmount}
              </span>
              <button
                type="button"
                className="text-[14px] font-normal underline decoration-solid underline-offset-2 transition hover:text-[#333]"
              >
                Price details
              </button>
            </div>
          )
        ) : (
          <p className="leading-[1.2] text-black">
            <span className="text-[clamp(22px,2.75vw,28px)] font-bold tracking-[-0.02em]">
              From {booking.priceAmount}
            </span>{' '}
            <span className="text-[14px] font-normal">per person</span>
          </p>
        )}

        {/* Badges — shared Tag component, outlined variant */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag variant="outlined">
            <DealBadgeIcon aria-hidden />
            {booking.badgeExceptionalDeal}
          </Tag>
          <Tag variant="outlined">
            <KidsDiscountIcon aria-hidden />
            {booking.badgeKidsDiscount}
          </Tag>
        </div>

        {/* Date + Travelers */}
        {useMetaChips ? (
          <div className="mt-5 flex w-full items-center gap-2">
            <AvailabilityDateControl
              dateLabel={dateLabel}
              onDateLabelChange={onDateLabelChange!}
              variant="chip"
              fullWidth
            />
            <AvailabilityTravelersControl
              travelerCounts={travelerCounts!}
              onTravelerCountsChange={onTravelerCountsChange!}
              variant="chip"
              className="shrink-0"
            />
          </div>
        ) : (
        <div className={`mt-5 overflow-hidden rounded-[10px] border ${CARD_BORDER} bg-white`}>
          <div className="grid grid-cols-2 divide-x divide-[#e0e0e0]">
            <button
              type="button"
              className="flex flex-col items-stretch gap-0.5 bg-white px-3 py-2.5 text-left outline-none ring-inset transition hover:bg-neutral-50/80 focus-visible:ring-2 focus-visible:ring-[#2d8564]"
            >
              <span className="text-[12px] font-normal leading-tight text-[#737373]">Date</span>
              <span className="flex w-full items-center justify-between gap-2 text-[15px] font-medium leading-tight text-black">
                <span className="min-w-0 truncate">{dateLabel}</span>
                <ChevronDown className="shrink-0" />
              </span>
            </button>
            <button
              type="button"
              className="flex flex-col items-stretch gap-0.5 bg-white px-3 py-2.5 text-left outline-none ring-inset transition hover:bg-neutral-50/80 focus-visible:ring-2 focus-visible:ring-[#2d8564]"
            >
              <span className="text-[12px] font-normal leading-tight text-[#737373]">Travelers</span>
              <span className="flex w-full items-center justify-between gap-2 text-[15px] font-medium leading-tight text-black">
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                  <PersonIcon />
                  <span>{travelerCount}</span>
                </span>
                <ChevronDown className="shrink-0" />
              </span>
            </button>
          </div>
        </div>
        )}

        {sidebarCommerce && !availabilitySearchActive ? (
          <div className="mt-6">
            <BookingSidebarCommerceOptions
              optionsLoading={availabilityOptionsLoading}
              onSelectOption={onSelectAvailabilityOption}
              onShowMoreOptions={onCheckAvailability}
            />
          </div>
        ) : null}

        {/* Primary CTA */}
        <button
          type="button"
          className={
            availabilitySearchActive
              ? 'mt-5 w-full rounded-[10px] border-[1.5px] border-black bg-white py-3.5 text-center text-[15px] font-bold leading-tight tracking-tight text-black shadow-none transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:scale-[0.99]'
              : `mt-5 w-full rounded-[10px] ${CTA_TEAL} py-3.5 text-center text-[15px] font-bold leading-tight tracking-tight text-white shadow-none transition hover:bg-[#256b51] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256b51] active:scale-[0.99]`
          }
          onClick={
            availabilitySearchActive ? onUpdateSearch ?? onCheckAvailability : onCheckAvailability
          }
        >
          {availabilitySearchActive ? 'Update Search' : 'Check Availability'}
        </button>

        {/* Policies */}
        {availabilitySearchActive ? null : sidebarCommerce ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-sm leading-normal text-black">
            <BenefitCheckIcon className="size-5 shrink-0" />
            <span>
              <span className="font-normal">Free 24 hr cancellation</span>
              <span className="font-normal"> • </span>
              <span className="font-normal">Pay $0 today</span>
            </span>
            <InfoCircleIcon />
          </div>
        ) : (
        <div className={`mt-5 rounded-[10px] ${MINT_PANEL} px-4 py-3.5`}>
          <ul className="space-y-3 text-[13px] leading-snug text-[#333]">
            <li className="flex gap-2.5">
              <BenefitCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold underline underline-offset-[0.12em] [text-decoration-skip-ink:none]">
                  Free cancellation
                </span>{' '}
                up to 24 hours before the experience starts (local time)
              </span>
            </li>
            <li className="flex gap-2.5">
              <BenefitCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold underline underline-offset-[0.12em] [text-decoration-skip-ink:none]">
                  Reserve Now and Pay Later
                </span>
                {' '}
                - Secure your spot while staying flexible
              </span>
            </li>
          </ul>
        </div>
        )}
      </div>

      {embedded && hideBookAheadMobile ? null : (
      <div
        className={`flex items-start gap-4 self-stretch rounded-[12px] border ${CARD_BORDER} bg-white px-4 py-2`}
      >
        <img
          src={bookAheadFlame}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 object-contain"
          aria-hidden
        />
        <div className="min-w-0 font-sans text-[#333] [font-feature-settings:'liga'_0,'clig'_0]">
          <p className="text-[14px] font-medium not-italic leading-[150%]">
            {booking.bookAheadTitle}
          </p>
          <p className="text-[13px] font-normal not-italic leading-[150%]">
            {booking.bookAheadSubtitle}
          </p>
        </div>
      </div>
      )}
    </div>
  )
}

function BookingSearchTotalSkeleton() {
  return (
    <div
      className="flex items-baseline gap-2"
      aria-busy="true"
      aria-label="Loading price"
    >
      <div className="booking-sidebar-bone h-8 w-[5.5rem] rounded" />
      <div className="booking-sidebar-bone h-4 w-[5.25rem] rounded" />
    </div>
  )
}

function DealBadgeIcon(props: SVGProps<SVGSVGElement>) {
  const raw = useId()
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const m1 = `deal-mask-1-${uid}`
  const m2 = `deal-mask-2-${uid}`

  return (
    <svg
      width={20}
      height={10}
      viewBox="0 0 20 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      {...props}
    >
      <path
        d="M9.95117 0.416992C15.0762 0.416992 19.2583 4.48202 19.4756 9.58301L0.426758 9.58301C0.644008 4.48207 4.82624 0.41707 9.95117 0.416992Z"
        fill="#D9D9D9"
        stroke="white"
        strokeWidth={0.833333}
      />
      <mask id={m1} fill="white">
        <path d="M10.0312 9.99902H0.0625C0.0516789 8.24202 0.496606 6.51089 1.35156 4.9873C2.2381 3.46554 3.51512 2.19914 5.04688 1.32324C6.70838 4.21514 8.36974 7.10713 10.0312 9.99902Z" />
      </mask>
      <path
        d="M10.0312 9.99902H0.0625C0.0516789 8.24202 0.496606 6.51089 1.35156 4.9873C2.2381 3.46554 3.51512 2.19914 5.04688 1.32324C6.70838 4.21514 8.36974 7.10713 10.0312 9.99902Z"
        fill="#00C295"
      />
      <path
        d="M10.0312 9.99902V10.999H11.7591L10.8983 9.50085L10.0312 9.99902ZM0.0625 9.99902L-0.937481 10.0052L-0.93136 10.999H0.0625V9.99902ZM1.35156 4.9873L0.487497 4.48392L0.483434 4.4909L0.479483 4.49794L1.35156 4.9873ZM5.04688 1.32324L5.91395 0.825071L5.4168 -0.0402395L4.55048 0.455148L5.04688 1.32324ZM10.0312 9.99902V8.99902H0.0625V9.99902V10.999H10.0312V9.99902ZM0.0625 9.99902L1.06248 9.99286C1.05272 8.4081 1.45418 6.8479 2.22364 5.47667L1.35156 4.9873L0.479483 4.49794C-0.460969 6.17389 -0.949363 8.07594 -0.937481 10.0052L0.0625 9.99902ZM1.35156 4.9873L2.21563 5.49068C3.01362 4.12091 4.16374 2.98019 5.54327 2.19134L5.04688 1.32324L4.55048 0.455148C2.8665 1.41809 1.46257 2.81018 0.487497 4.48392L1.35156 4.9873ZM5.04688 1.32324L4.1798 1.82141C5.01054 3.26735 5.84125 4.71331 6.67197 6.15928C7.50269 7.60525 8.33341 9.05123 9.16417 10.4972L10.0312 9.99902L10.8983 9.50085C10.0676 8.05492 9.23687 6.60896 8.40615 5.16298C7.57544 3.71702 6.74472 2.27103 5.91395 0.825071L5.04688 1.32324Z"
        fill="white"
        mask={`url(#${m1})`}
      />
      <mask id={m2} fill="white">
        <path d="M15.0127 1.32227C16.5136 2.18067 17.7703 3.41333 18.6543 4.89453C19.5435 6.43992 20.0077 8.20482 19.9971 9.99707H10.0293C11.6906 7.10556 13.3514 4.21378 15.0127 1.32227Z" />
      </mask>
      <path
        d="M15.0127 1.32227C16.5136 2.18067 17.7703 3.41333 18.6543 4.89453C19.5435 6.43992 20.0077 8.20482 19.9971 9.99707H10.0293C11.6906 7.10556 13.3514 4.21378 15.0127 1.32227Z"
        fill="#D9D9D9"
      />
      <path
        d="M15.0127 1.32227L15.4264 0.598879L14.7045 0.185987L14.2901 0.907123L15.0127 1.32227ZM18.6543 4.89453L19.3767 4.47888L19.3699 4.46747L18.6543 4.89453ZM19.9971 9.99707V10.8304H20.8255L20.8304 10.002L19.9971 9.99707ZM10.0293 9.99707L9.30673 9.58193L8.58943 10.8304H10.0293V9.99707ZM15.0127 1.32227L14.599 2.04565C15.9758 2.83308 17.1284 3.96383 17.9387 5.3216L18.6543 4.89453L19.3699 4.46747C18.4122 2.86284 17.0514 1.52825 15.4264 0.598879L15.0127 1.32227ZM18.6543 4.89453L17.932 5.31013C18.7471 6.72684 19.1735 8.3465 19.1638 9.99211L19.9971 9.99707L20.8304 10.002C20.8419 8.06314 20.3398 6.15299 19.3766 4.47894L18.6543 4.89453ZM19.9971 9.99707V9.16374H10.0293V9.99707V10.8304H19.9971V9.99707ZM10.0293 9.99707L10.7519 10.4122C11.5825 8.96642 12.4131 7.52057 13.2436 6.07475C14.0741 4.62892 14.9046 3.18313 15.7353 1.73741L15.0127 1.32227L14.2901 0.907123C13.4595 2.35291 12.6289 3.79877 11.7984 5.24458C10.9679 6.69041 10.1374 8.13621 9.30673 9.58193L10.0293 9.99707Z"
        fill="white"
        mask={`url(#${m2})`}
      />
    </svg>
  )
}

function KidsDiscountIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0"
      {...props}
    >
      <path
        d="M10.6207 6.08536C10.816 5.8901 10.816 5.57352 10.6207 5.37826C10.4255 5.183 10.1089 5.183 9.91364 5.37826L5.37692 9.91498C5.18165 10.1102 5.18165 10.4268 5.37692 10.6221C5.57218 10.8174 5.88876 10.8174 6.08402 10.6221L10.6207 6.08536Z"
        fill="#00C295"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.63781 6.18548C7.63781 6.98832 6.98698 7.63916 6.18414 7.63916C5.3813 7.63916 4.73047 6.98832 4.73047 6.18548C4.73047 5.38264 5.3813 4.73181 6.18414 4.73181C6.98698 4.73181 7.63781 5.38264 7.63781 6.18548ZM6.18414 5.63916C5.88241 5.63916 5.63781 5.88375 5.63781 6.18548C5.63781 6.48722 5.88241 6.73181 6.18414 6.73181C6.48587 6.73181 6.73047 6.48721 6.73047 6.18548C6.73047 5.88375 6.48587 5.63916 6.18414 5.63916Z"
        fill="#00C295"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.81305 11.2687C10.6159 11.2687 11.2667 10.6178 11.2667 9.815C11.2667 9.01216 10.6159 8.36133 9.81305 8.36133C9.01021 8.36133 8.35938 9.01216 8.35938 9.815C8.35938 10.6178 9.01021 11.2687 9.81305 11.2687ZM9.26672 9.815C9.26672 9.51327 9.51132 9.26867 9.81305 9.26867C10.1148 9.26867 10.3594 9.51327 10.3594 9.815C10.3594 10.1167 10.1148 10.3613 9.81305 10.3613C9.51132 10.3613 9.26672 10.1167 9.26672 9.815Z"
        fill="#00C295"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.58187 2.10625C7.40748 1.43463 8.59112 1.43463 9.41673 2.10625L9.54963 2.21437L9.71878 2.18719C10.7696 2.01836 11.7947 2.61018 12.1738 3.60467L12.2348 3.76469L12.395 3.82574C13.3894 4.20493 13.9813 5.22998 13.8124 6.28083L13.7852 6.44995L13.8933 6.58282C14.565 7.40845 14.565 8.59211 13.8933 9.41773L13.7852 9.55061L13.8124 9.71973C13.9813 10.7706 13.3894 11.7957 12.3949 12.1748L12.2348 12.2358L12.1738 12.3959C11.7947 13.3904 10.7696 13.9822 9.71875 13.8133L9.54963 13.7862L9.41675 13.8943C8.59113 14.566 7.40747 14.566 6.58185 13.8943L6.44897 13.7862L6.27985 13.8133C5.229 13.9822 4.20394 13.3903 3.82475 12.3959L3.76371 12.2358L3.60366 12.1748C2.60917 11.7957 2.01738 10.7705 2.18622 9.71975L2.21339 9.55061L2.10528 9.41771C1.43366 8.5921 1.43366 7.40846 2.10528 6.58285L2.21339 6.44995L2.18621 6.2808C2.01738 5.22998 2.6092 4.20493 3.60365 3.82574L3.76372 3.7647L3.82476 3.60462C4.20395 2.61018 5.22901 2.01836 6.27983 2.18719L6.44897 2.21437L6.58187 2.10625ZM7.21292 2.882C7.67096 2.50939 8.32764 2.50939 8.78568 2.882L9.09231 3.13143C9.20284 3.22134 9.34647 3.25983 9.48715 3.23723L9.87741 3.17453C10.4604 3.08086 11.0291 3.40925 11.2394 3.9609L11.3802 4.33023C11.431 4.46337 11.5362 4.56853 11.6693 4.61929L12.0387 4.76012C12.5904 4.97051 12.9187 5.53923 12.825 6.12217L12.7623 6.51243C12.7397 6.65311 12.7782 6.79674 12.8681 6.90726L13.1176 7.21392C13.4902 7.67196 13.4902 8.32863 13.1176 8.78667L12.8681 9.09329C12.7782 9.20382 12.7397 9.34745 12.7623 9.48813L12.825 9.87841C12.9187 10.4614 12.5904 11.0301 12.0387 11.2404L11.6693 11.3812C11.5362 11.432 11.431 11.5372 11.3802 11.6703L11.2394 12.0397C11.0291 12.5913 10.4604 12.9197 9.8774 12.826L9.48715 12.7633C9.34647 12.7407 9.20284 12.7792 9.09232 12.8691L8.78566 13.1186C8.32762 13.4912 7.67095 13.4912 7.21291 13.1185L6.90629 12.8691C6.79576 12.7792 6.65213 12.7407 6.51145 12.7633L6.12117 12.826C5.53822 12.9197 4.96952 12.5913 4.75913 12.0396L4.61831 11.6703C4.56755 11.5372 4.46239 11.432 4.32925 11.3812L3.95989 11.2404C3.40823 11.0301 3.07988 10.4614 3.17355 9.87838L3.23625 9.48812C3.25885 9.34745 3.22036 9.20382 3.13045 9.09329L2.88102 8.78666C2.50841 8.32862 2.50841 7.67194 2.88102 7.21389L3.13045 6.90727C3.22036 6.79674 3.25885 6.65311 3.23625 6.51243L3.17355 6.12217C3.07988 5.53918 3.40822 4.97049 3.95994 4.76011L4.32926 4.61928C4.46239 4.56852 4.56754 4.46337 4.6183 4.33024L4.75913 3.96091C4.96951 3.40919 5.53822 3.08086 6.1212 3.17453L6.51145 3.23723C6.65213 3.25983 6.79576 3.22134 6.90629 3.13143L7.21292 2.882Z"
        fill="#00C295"
      />
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'h-4 w-4 shrink-0 text-neutral-700'}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
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

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 1116 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function InfoCircleIcon() {
  return (
    <svg className="size-4 shrink-0 text-[#4d4d4d]" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
