import { FigmaRatingRow } from './figmaListingUi'

type Props = {
  title: string
  averageRating: number
  reviewCount: number
  locationLine: string
  reviewsHref?: string
}

function PriceTagIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M11.7152 4.98483C11.7152 4.57906 11.3866 4.25012 10.9808 4.25012C10.575 4.25012 10.2461 4.57906 10.2461 4.98483C10.2461 5.39059 10.575 5.71953 10.9808 5.71953C11.3866 5.71953 11.7152 5.39059 11.7152 4.98483Z"
        fill="#008768"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6033 1.39938C14.7986 1.59464 14.7986 1.91122 14.6033 2.10648L13.9934 2.71644V7.07821C13.9934 7.21082 13.9407 7.338 13.8469 7.43177L7.42225 13.8565C7.22698 14.0517 6.9104 14.0517 6.71514 13.8565L2.14645 9.2878C2.05268 9.19403 2 9.06685 2 8.93424C2 8.80164 2.05268 8.67446 2.14645 8.58069L8.57118 2.15597C8.66495 2.0622 8.79212 2.00952 8.92473 2.00952H13.2861L13.8962 1.39938C14.0915 1.20411 14.4081 1.20411 14.6033 1.39938ZM9.13184 3.00952L3.20711 8.93424L7.06869 12.7958L12.9934 6.87111V3.00952H9.13184Z"
        fill="#008768"
      />
    </svg>
  )
}

/** DS tag shell + Global/Body micro 02 Medium: neutral 95 chip; type neutral-30, Aeonik 12/16 medium 0.05px LS, centered. */
function LowestPriceGuaranteeLabel() {
  return (
    <span className="inline-flex h-6 w-fit shrink-0 flex-row items-center justify-center gap-1 whitespace-nowrap rounded-[6px] bg-[#F5F5F5] p-1 text-center font-sans text-[12px] font-medium not-italic leading-4 tracking-[0.05px] text-[#4D4D4D]">
      <PriceTagIcon />
      Lowest price guarantee
    </span>
  )
}

function MetaDivider() {
  return <span className="hidden h-3 w-px shrink-0 bg-[#d9d9d9] sm:block" aria-hidden />
}

function BadgeOfExcellence() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="shrink-0" aria-hidden>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="8" fill="#FED141" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.1433 8.35364L11.1914 9.11432L11.5781 10.4657C11.6036 10.5507 11.5692 10.6403 11.5012 10.6952C11.429 10.7462 11.3359 10.7504 11.2594 10.7037L10.0988 9.97699L8.9387 10.7037C8.86221 10.7504 8.76914 10.7462 8.6969 10.6952C8.62891 10.6403 8.59449 10.5507 8.61998 10.4657L9.0067 9.11432L8.05479 8.35364C7.98254 8.29415 7.95705 8.20066 7.98679 8.11567C8.01654 8.03067 8.09771 7.97543 8.18652 7.97543H9.32967L9.91229 6.81571C9.97985 6.6708 10.2178 6.6708 10.2905 6.81571L10.8684 7.97543H12.0112C12.1004 7.97543 12.1816 8.03067 12.2109 8.11567C12.2411 8.20066 12.2156 8.29415 12.1433 8.35364ZM10.0996 5C7.86985 5 6.0625 6.80778 6.0625 9.03711C6.0625 11.2669 7.86985 13.0742 10.0996 13.0742C12.3294 13.0742 14.1367 11.2669 14.1367 9.03711C14.1367 6.80778 12.3294 5 10.0996 5Z"
            fill="black"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.68776 13.2656C7.69208 12.9324 6.85534 12.2576 6.31011 11.3809L5.02886 13.5966C4.93835 13.7538 5.07433 13.9438 5.24814 13.9123L6.71 13.6654L7.21953 15.0585C7.27987 15.2233 7.49958 15.251 7.59604 15.0946L8.68776 13.2656Z"
            fill="black"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.5117 13.2656C12.5074 12.9324 13.3441 12.2576 13.8894 11.3809L15.1706 13.5966C15.2611 13.7538 15.1251 13.9438 14.9513 13.9123L13.4895 13.6654L12.98 15.0585C12.9196 15.2233 12.6999 15.251 12.6034 15.0946L11.5117 13.2656Z"
            fill="black"
          />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[12px] leading-normal text-[#4d4d4d]">
        Badge of Excellence
      </span>
    </span>
  )
}

/**
 * Viator B2C-style title + single metadata row (rating · stars · reviews · badge · location).
 */
export function PdpViatorTitleMeta({
  title,
  averageRating,
  reviewCount,
  locationLine,
  reviewsHref = '#reviews',
}: Props) {
  return (
    <div className="space-y-3">
      <h1
        className="font-sans text-[28px] font-medium leading-[1.2] text-[#000]"
        style={{ fontFeatureSettings: '"liga" 0, "clig" 0' }}
      >
        {title}
      </h1>
      <div
        className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2"
        role="group"
        aria-label="Product rating, location, and pricing"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
          <span
            className="text-base font-bold tabular-nums text-black sm:text-lg"
            style={{ fontFeatureSettings: "'lnum' 1" }}
          >
            {averageRating.toFixed(1)}
          </span>
          <FigmaRatingRow value={averageRating} size={16} />
          <a
            className="text-[12px] font-medium leading-normal text-black underline decoration-black underline-offset-2 [text-decoration-skip-ink:none] hover:decoration-[#00c295]"
            href={reviewsHref}
          >
            {reviewCount.toLocaleString()} reviews
          </a>
          <MetaDivider />
          <BadgeOfExcellence />
          <MetaDivider />
          <span className="text-[12px] leading-normal text-[#4d4d4d]">{locationLine}</span>
        </div>
        <LowestPriceGuaranteeLabel />
      </div>
    </div>
  )
}
