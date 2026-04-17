/**
 * KILIMANJARO (Viator B2C Web DS) — component API contracts.
 * Spec: /KILIMANJARO-DS-SPEC.md — implementation lives in future primitives.
 */
import type { ReactNode } from 'react'

export type ButtonIntent = 'primary' | 'secondary' | 'tertiary' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type IconPosition = 'none' | 'leading' | 'trailing' | 'both'

export type KilimanjaroButtonProps = {
  intent?: ButtonIntent
  size?: ButtonSize
  /** Full width in auto-layout terms */
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  iconPosition?: IconPosition
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export type InputSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success'

export type KilimanjaroInputProps = {
  size?: InputSize
  state?: InputState
  label?: string
  helperText?: string
  errorText?: string
  optional?: boolean
  disabled?: boolean
  readOnly?: boolean
  leftAdornment?: ReactNode
  rightAdornment?: ReactNode
}

export type CardElevation = 'none' | 'sm' | 'md'

export type KilimanjaroCardProps = {
  elevation?: CardElevation
  interactive?: boolean
  children: ReactNode
}

export type KilimanjaroModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Primary action area (e.g. footer buttons) */
  footer?: ReactNode
  children: ReactNode
}

/** Accordion — Figma: Accordion (11565:24151); Compact + Divider + Desktop/Mobile */
export type KilimanjaroAccordionDisplay = 'desktop' | 'mobile'

export type KilimanjaroAccordionProps = {
  title: string
  children: ReactNode
  /** Figma Compact=Yes — shorter row (56px desktop vs 82px). */
  compact?: boolean
  /** Figma Divider=Yes — horizontal rules above/below the header row. */
  divider?: boolean
  display?: KilimanjaroAccordionDisplay
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** id for aria-controls / region labelling */
  id?: string
}
