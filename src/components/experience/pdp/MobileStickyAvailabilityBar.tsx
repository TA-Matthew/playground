import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'

type Props = {
  readonly visible: boolean
  readonly onCheckAvailability: () => void
}

/**
 * MW-only sticky footer CTA — slides in once the shortcut shelf's own "Select" button
 * scrolls out of view, so exactly one primary CTA is on screen at a time.
 */
export function MobileStickyAvailabilityBar({ visible, onCheckAvailability }: Props) {
  const reduceMotion = useReducedMotion()

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[150] lg:hidden">
      <AnimatePresence>
        {visible ? (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto flex items-center gap-3 border-t border-[#e0e0e0] bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
          >
            <button
              type="button"
              className="flex-1 rounded-[10px] bg-[#2d8564] py-3.5 text-center text-[15px] font-bold leading-tight tracking-tight text-white shadow-none transition hover:bg-[#256b51] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256b51] active:scale-[0.99]"
              onClick={onCheckAvailability}
            >
              Check Availability
            </button>
            <button
              type="button"
              className="grid size-11 shrink-0 place-content-center rounded-full border border-[#b3b3b3] bg-white text-black shadow-sm"
              aria-label="Add to wishlist"
            >
              <HeartIcon />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

function HeartIcon() {
  return (
    <svg className="size-5 shrink-0 text-black" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12.8197 5.57912L11.999 6.40163L11.1757 5.57838C9.07663 3.47931 5.67337 3.47931 3.5743 5.57838C1.47523 7.67744 1.47523 11.0807 3.5743 13.1798L11.4697 21.0751C11.7626 21.368 12.2374 21.368 12.5303 21.0751L20.4318 13.1783C22.5262 11.0723 22.5298 7.67857 20.4303 5.57912C18.3274 3.47623 14.9226 3.47623 12.8197 5.57912ZM19.3682 12.1206L12 19.4842L4.63496 12.1191C3.12168 10.6058 3.12168 8.15232 4.63496 6.63904C6.14824 5.12575 8.60176 5.12575 10.115 6.63904L11.4725 7.99648C11.7703 8.29435 12.255 8.28854 12.5457 7.98363L13.8803 6.63978C15.3974 5.12268 17.8526 5.12268 19.3697 6.63978C20.8833 8.15343 20.8807 10.5997 19.3682 12.1206Z"
        fill="currentColor"
      />
    </svg>
  )
}
