import type { ComponentPropsWithoutRef, ReactNode } from 'react'

/** Space-050 shell + Global/Body micro 02 Medium — PDP / booking label tags. */
const SHELL =
  'inline-flex items-center justify-center gap-1 rounded-[6px] p-1 text-center font-sans text-[12px] font-medium not-italic leading-4 tracking-[0.05px]'

const VARIANT_CLASS: Record<'neutral' | 'outlined' | 'secondary', string> = {
  neutral: 'h-6 w-fit shrink-0 whitespace-nowrap bg-[#F5F5F5] text-[#4D4D4D]',
  outlined: 'border border-[#e0e0e0] bg-white text-[#4D4D4D]',
  /** Cohort / emphasis — secondary/95 · secondary/30 ([Figma 17671:82254](https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17671-82254)). */
  secondary: 'h-6 w-fit shrink-0 whitespace-nowrap bg-[#EFEEF7] text-[#3B3366]',
}

export type TagVariant = keyof typeof VARIANT_CLASS

type TagProps = {
  variant?: TagVariant
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<'span'>, 'className' | 'children'>

/** Small label pill for meta rows and booking badges. */
export function Tag({ variant = 'outlined', className, children, ...rest }: TagProps) {
  return (
    <span
      {...rest}
      className={[SHELL, VARIANT_CLASS[variant], className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  )
}
