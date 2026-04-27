import { useId } from 'react'

const GREEN = '#00C295'
const MUTED = '#d9d9d9'

const STAR_D =
  'M12 2.2L14.1 7.1l4.6.4-3.5 3.4 1 4.7L12 16.1 7.8 15.6l1-4.7-3.5-3.4 4.6-.4L12 2.2z'

type Props = { value: number; size?: number }

/**
 * Viator PDP–style five-star row (Figma primary/30 #00C295) with support for partial stars.
 */
export function ViatorGreenStarRow({ value, size = 18 }: Props) {
  const baseId = useId().replace(/:/g, '')
  const clamped = Math.min(5, Math.max(0, value))

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fillEnd = Math.min(1, Math.max(0, clamped - i))
        const w = size
        const h = size
        if (fillEnd >= 1) {
          return (
            <svg
              key={i}
              width={w}
              height={h}
              viewBox="0 0 24 24"
              className="shrink-0"
              aria-hidden
            >
              <path fill={GREEN} d={STAR_D} />
            </svg>
          )
        }
        if (fillEnd > 0) {
          const gradId = `${baseId}-g${i}`
          return (
            <svg
              key={i}
              width={w}
              height={h}
              viewBox="0 0 24 24"
              className="shrink-0"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={GREEN} />
                  <stop offset={`${fillEnd * 100}%`} stopColor={GREEN} />
                  <stop offset={`${fillEnd * 100}%`} stopColor={MUTED} />
                </linearGradient>
              </defs>
              <path fill={`url(#${gradId})`} d={STAR_D} />
            </svg>
          )
        }
        return (
          <svg
            key={i}
            width={w}
            height={h}
            viewBox="0 0 24 24"
            className="shrink-0"
            aria-hidden
          >
            <path fill={MUTED} d={STAR_D} />
          </svg>
        )
      })}
    </div>
  )
}
