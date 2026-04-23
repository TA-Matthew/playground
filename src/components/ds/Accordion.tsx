import { useId, useState } from 'react'
import type { KilimanjaroAccordionProps } from './kilimanjaro-component-api'

/**
 * KILIMANJARO Accordion — behaviour per Figma: full header row toggles; focus = browser default.
 * Figma: https://www.figma.com/design/kfEgE1oVxKplDJxEBW9nIT — component set 11565:24135+.
 */
export function Accordion({
  title,
  children,
  compact = false,
  divider = true,
  display = 'desktop',
  defaultOpen = false,
  open: openControlled,
  onOpenChange,
  className = '',
  id: idProp,
}: Readonly<KilimanjaroAccordionProps>) {
  const genId = useId()
  const baseId = idProp ?? `accordion-${genId.replaceAll(':', '')}`
  const panelId = `${baseId}-panel`
  const headerId = `${baseId}-header`

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openControlled !== undefined
  const open = isControlled ? openControlled : uncontrolledOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const padY = paddingClass(compact, display)

  return (
    <div
      className={`w-full min-w-0 ${divider ? 'border-t border-b' : ''} ${className}`.trim()}
      style={
        divider
          ? { borderColor: 'var(--semantic-accordion-border)' }
          : undefined
      }
    >
      <button
        id={headerId}
        type="button"
        className={`group flex w-full items-center gap-4 text-left ${padY} transition-colors active:bg-[var(--semantic-accordion-trigger-bg-pressed)] hover:bg-[var(--semantic-accordion-trigger-bg-hover)]`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span
          className={`min-w-0 flex-1 font-medium leading-8 text-[var(--semantic-accordion-title-fg)] ${
            display === 'mobile' ? 'text-base' : 'text-lg'
          }`}
        >
          {title}
        </span>
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[var(--semantic-accordion-chevron-fg)]"
          aria-hidden
        >
          <ChevronIcon open={open} />
        </span>
      </button>
      {open ? (
        <section
          id={panelId}
          aria-labelledby={headerId}
          className={`pb-8 pt-6 text-[var(--semantic-accordion-panel-fg)] ${
            divider ? 'border-t' : ''
          }`}
          style={
            divider
              ? { borderColor: 'var(--semantic-accordion-border)' }
              : undefined
          }
        >
          {children}
        </section>
      ) : null}
    </div>
  )
}

function paddingClass(
  compact: boolean,
  display: KilimanjaroAccordionProps['display'],
): string {
  if (compact) return 'py-3'
  if (display === 'mobile') return 'py-6'
  return 'py-6'
}

function ChevronIcon({ open }: Readonly<{ open: boolean }>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
