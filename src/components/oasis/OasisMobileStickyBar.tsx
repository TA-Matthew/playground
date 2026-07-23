import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BOOKED_BANNER_LAYOUT_ID, BOOKED_BANNER_MORPH_TRANSITION } from './oasisBookedBannerMorph'

function DialIcon() {
  return (
    <svg width={20} height={10} viewBox="0 0 20 10" fill="none" aria-hidden className="shrink-0">
      <path d="M10 0.5A9.5 9.5 0 0 1 19.5 9.5h-19A9.5 9.5 0 0 1 10 0.5Z" fill="#D9D9D9" />
      <path d="M10 9.5L5 1.3A9.5 9.5 0 0 0 0.5 9.5H10Z" fill="#00C295" />
      <path d="M10 9.5L15 1.3A9.5 9.5 0 0 1 19.5 9.5H10Z" fill="#D9D9D9" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <span aria-hidden className="text-[24px] leading-none">
      🔥
    </span>
  )
}

type Props = {
  priceAmount: string
  exceptionalDealLabel: string
  onCheckAvailability: () => void
  /** Once true, the floating "Typically booked" card morphs into the slim strip docked in the footer. */
  showBookedBanner?: boolean
}

/**
 * Mobile-web sticky booking bar — Figma
 * [node 10144:18906](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10144-18906),
 * "Frame 2147230554": a green "Free cancellation up to 24 hours" strip, then a price + exceptional-deal
 * tag on the left and a "Check availability" pill CTA on the right, pinned to the viewport bottom.
 *
 * Also owns the "Typically booked" banner's docked state: it floats 24px above this footer (a plain
 * flow `mb-6` — no measurement needed since it sits directly above the price row) until
 * `showBookedBanner`, then morphs (shared `layoutId`) into a slim strip flush above the price row.
 */
export function OasisMobileStickyBar({
  priceAmount,
  exceptionalDealLabel,
  onCheckAvailability,
  showBookedBanner = false,
}: Props) {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : BOOKED_BANNER_MORPH_TRANSITION

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <AnimatePresence>
        {!showBookedBanner && (
          <motion.div
            layoutId={BOOKED_BANNER_LAYOUT_ID}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mx-auto mb-6 flex w-[342px] items-center justify-center gap-2 rounded-2xl bg-white p-4 drop-shadow-[0px_4px_12px_rgba(2,44,69,0.15)]"
          >
            <FlameIcon />
            <p className="whitespace-nowrap text-[14px] font-medium leading-[1.5] text-[#333]">
              Typically booked 8 days in advance
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#f5f5f5]">
        <AnimatePresence>
          {showBookedBanner && (
            <motion.div
              layoutId={BOOKED_BANNER_LAYOUT_ID}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transition}
              className="flex items-center justify-center gap-2 bg-[#f5f5f5] px-4 py-2.5"
            >
              <span aria-hidden className="text-[16px] leading-none">
                🔥
              </span>
              <p className="whitespace-nowrap text-[13px] font-medium leading-[1.3] text-[#333]">
                Typically booked 8 days in advance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-start justify-between gap-4 bg-white px-6 pb-6 pt-4 drop-shadow-[0px_0px_6px_rgba(0,0,0,0.25)]">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-[12px] leading-5 tracking-[0.05px] text-[#4d4d4d]">From</span>
            <span className="text-[20px] font-bold leading-[22px] tracking-[0.2px] text-black">{priceAmount}</span>
            <span className="text-[12px] leading-5 tracking-[0.05px] text-[#4d4d4d]">/person</span>
          </p>
          <span className="flex items-center gap-1 rounded-md border border-[#d9d9d9] p-1 text-[12px] font-medium leading-4 tracking-[0.05px] text-[#4d4d4d]">
            <DialIcon />
            {exceptionalDealLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckAvailability}
          className="shrink-0 rounded-xl bg-[#008768] px-6 py-[13px] text-[16px] font-bold leading-[1.2] text-white transition hover:bg-[#00654e]"
        >
          Check availability
        </button>
      </div>
    </div>
  )
}
