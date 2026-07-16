function SingleStarIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 1.24l1.67 3.54c.26.55.78.94 1.38 1.03l3.82.58-2.8 2.85c-.42.43-.61 1.04-.51 1.63l.65 3.97-3.34-1.84a1.5 1.5 0 0 0-1.44 0L4.09 14.8l.65-3.97c.1-.6-.09-1.2-.51-1.63L1.44 6.35l3.82-.58c.6-.09 1.12-.48 1.38-1.03L8 1.24Z"
        fill="#00C295"
      />
    </svg>
  )
}

type Props = {
  title: string
  averageRating: number
  reviewCount: number
  durationLabel: string
  languageLabel: string
}

/**
 * Title + reviews + location block — Figma
 * [node 10033:18955](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-18955).
 * Bespoke to the Oasis desktop PDP — replaces the shared `PdpViatorTitleMeta`.
 */
export function OasisTitleMeta({ title, averageRating, reviewCount, durationLabel, languageLabel }: Props) {
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded bg-[#ccf3ea] px-1 py-[2.5px] text-[11px] leading-[15px] tracking-[0.05px] text-[#003327]">
          Free 24h cancellation
        </span>
        <span className="rounded bg-[#ccf3ea] px-1 py-[2.5px] text-[12px] leading-4 tracking-[0.05px] text-[#003327]">
          90% recommend
        </span>
        <span className="rounded bg-[#f5f5f5] px-1 py-[2.5px] text-[12px] leading-4 tracking-[0.05px] text-black">
          Booked 99+ times today
        </span>
      </div>

      <h1 className="w-full text-[32px] font-medium leading-9 tracking-[0.2px] text-black">{title}</h1>

      <div className="flex items-center gap-2 text-[16px] tracking-[0.05px] text-black">
        <span className="inline-flex items-center gap-1 font-normal">
          {averageRating}
          <SingleStarIcon />
        </span>
        <span aria-hidden>·</span>
        <span>{reviewCount.toLocaleString()} reviews</span>
        <span aria-hidden>·</span>
        <span>{durationLabel}</span>
        <span aria-hidden>·</span>
        <span className="font-medium">{languageLabel}</span>
      </div>
    </div>
  )
}
