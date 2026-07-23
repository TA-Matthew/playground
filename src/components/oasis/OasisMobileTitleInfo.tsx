function SingleStarIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 1.24l1.67 3.54c.26.55.78.94 1.38 1.03l3.82.58-2.8 2.85c-.42.43-.61 1.04-.51 1.63l.65 3.97-3.34-1.84a1.5 1.5 0 0 0-1.44 0L4.09 14.8l.65-3.97c.1-.6-.09-1.2-.51-1.63L1.44 6.35l3.82-.58c.6-.09 1.12-.48 1.38-1.03L8 1.24Z"
        fill="#00C295"
      />
    </svg>
  )
}

type Props = {
  title: string
  durationValue: string
  durationUnit: string
  averageRating: number
  reviewCount: number
  languageLabel: string
  languageSubLabel: string
  descriptionBody: string
}

/**
 * Mobile-web title + duration/rating/language info row + value props + short description — Figma
 * [node 10144:18552](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18552).
 * Centered layout, distinct from the left-aligned desktop {@link OasisTitleMeta}.
 */
export function OasisMobileTitleInfo({
  title,
  durationValue,
  durationUnit,
  averageRating,
  reviewCount,
  languageLabel,
  languageSubLabel,
  descriptionBody,
}: Props) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <p className="w-full text-center text-[24px] font-medium leading-7 tracking-[0.2px] text-black">{title}</p>

      <div className="flex w-full items-center justify-center gap-6">
        <div className="flex flex-col items-center justify-center whitespace-nowrap">
          <p className="text-center text-[16px] font-medium leading-6 text-black">{durationValue}</p>
          <p className="text-[12px] leading-4 text-[#333]">{durationUnit}</p>
        </div>
        <span aria-hidden className="h-10 w-px bg-[#d9d9d9]" />
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-center text-[16px] font-medium leading-6 tracking-[0.05px] text-black">
              {averageRating}
            </p>
            <SingleStarIcon />
          </div>
          <p className="whitespace-nowrap text-[12px] leading-4 text-[#333]">
            {reviewCount.toLocaleString()} reviews
          </p>
        </div>
        <span aria-hidden className="h-10 w-px bg-[#d9d9d9]" />
        <div className="flex flex-col items-center justify-center whitespace-nowrap">
          <p className="text-center text-[16px] font-medium leading-6 text-black">{languageLabel}</p>
          <p className="text-[12px] leading-4 text-[#333]">{languageSubLabel}</p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <span className="rounded bg-[#ccf3ea] px-1 py-[2.5px] text-[11px] leading-[15px] tracking-[0.05px] text-[#003327]">
          Free 24h cancellation
        </span>
        <span className="rounded bg-[#f5f5f5] px-1 py-[2.5px] text-[11px] leading-[15px] tracking-[0.05px] text-black">
          Booked 99+ times today
        </span>
      </div>

      <p className="line-clamp-3 w-full text-center text-[14px] leading-5 tracking-[0.05px] text-[#4d4d4d]">
        <span
          className="float-right ml-1 cursor-pointer whitespace-nowrap underline decoration-solid"
          style={{ shapeOutside: 'inset(calc(100% - 20px) 0 0 0)' }}
        >
          More
        </span>
        {descriptionBody}
      </p>
    </div>
  )
}
