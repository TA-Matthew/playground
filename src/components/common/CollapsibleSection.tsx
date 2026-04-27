import { type ReactNode, useState } from 'react'

type Props = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-b border-[#d9d9d9] pb-10 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-[#f5f5f5]/80 md:py-5"
        aria-expanded={open}
      >
        <h2 className="text-2xl font-bold leading-[1.2] tracking-[0.2px] text-black">
          {title}
        </h2>
        <span
          className="inline-flex shrink-0 items-center justify-center text-[#4d4d4d] transition group-hover:text-black"
          aria-hidden
        >
          <ChevronIcon up={open} />
        </span>
      </button>
      {open ? <div className="mt-0">{children}</div> : null}
    </section>
  )
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${up ? 'rotate-180' : ''}`}
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
