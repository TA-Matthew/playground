import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode, useState } from 'react'
import { WhatsIncludedAccordionChevronUpIcon } from '../experience/pdp/WhatsIncludedAccordionChevronIcon'

type Props = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
  /** Optional `id` on the heading for `aria-labelledby` / jump links. */
  headingId?: string
  /**
   * By default the section omits the bottom border when it is the last child of its parent
   * (`last:border-b-0`). Set when embedded in a stack where this block should still show a bottom rule.
   */
  disableLastBorderReset?: boolean
  /**
   * Full-width top rule `#d9d9d9`; no padding above the row (accordion button keeps its own `py-*`).
   */
  dividerTop?: boolean
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  headingId,
  disableLastBorderReset = false,
  dividerTop = false,
}: Readonly<Props>) {
  const [open, setOpen] = useState(defaultOpen)
  const prefersReducedMotion = useReducedMotion()
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const }

  const sectionClass = [
    dividerTop ? 'border-t border-[#d9d9d9]' : '',
    'border-b border-[#d9d9d9] pb-0',
    disableLastBorderReset ? '' : 'last:border-b-0 last:pb-0',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={sectionClass}
      aria-labelledby={headingId}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left md:py-5"
        aria-expanded={open}
      >
        <h2
          id={headingId}
          className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black group-hover:underline underline-offset-[0.22em] [text-decoration-skip-ink:none]"
        >
          {title}
        </h2>
        <span
          className="inline-flex shrink-0 items-center justify-center text-[#4d4d4d] transition group-hover:text-black"
          aria-hidden
        >
          <span
            className={`block transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
          >
            <WhatsIncludedAccordionChevronUpIcon />
          </span>
        </span>
      </button>
      <motion.div
        aria-hidden={!open}
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
        }}
        transition={panelTransition}
        className="overflow-hidden"
      >
        <div className={`pb-10 ${open ? '' : 'pointer-events-none'}`}>{children}</div>
      </motion.div>
    </section>
  )
}
