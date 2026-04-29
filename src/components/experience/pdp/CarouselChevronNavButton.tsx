import type { ButtonHTMLAttributes } from 'react'

/** 16×16 DS chevron — neutral stroke via black fill inside white circle shell. */
function ChevronRight16() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.34467 4.27935C5.05178 3.98646 5.05178 3.51159 5.34467 3.21869C5.63756 2.9258 6.11244 2.9258 6.40533 3.21869L10.6564 7.46979C10.9493 7.76269 10.9493 8.23756 10.6564 8.53045L6.40533 12.7816C6.11244 13.0744 5.63756 13.0744 5.34467 12.7816C5.05178 12.4887 5.05178 12.0138 5.34467 11.7209L9.06544 8.00012L5.34467 4.27935Z"
        fill="black"
      />
    </svg>
  )
}

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** `sm` 32×32 · `md` 36×36 tap target — same DS shell everywhere */
  diameter?: 'sm' | 'md'
}

/** White + `#D9D9D9` border circle nav (filter chips, reels, promoted shelf). */
export function CarouselChevronNavButton({
  diameter = 'md',
  className = '',
  ...rest
}: Props) {
  const dim = diameter === 'sm' ? 'size-8' : 'size-9'
  return (
    <button
      type="button"
      {...rest}
      className={`pointer-events-auto z-30 box-border grid shrink-0 ${dim} place-items-center rounded-full border border-[#d9d9d9] bg-[#FFFFFF] p-0 text-black shadow-[0_2px_3px_0_rgba(0,0,0,0.2)] outline-none ring-0 ${className}`.trim()}
    >
      <ChevronRight16 />
    </button>
  )
}
