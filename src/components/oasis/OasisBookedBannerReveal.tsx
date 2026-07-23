import { motion, useReducedMotion } from 'framer-motion'

const EMBER_LETTER_STAGGER_S = 0.018
const EMBER_LETTER_DURATION_S = 0.4

/** Fades up in step with {@link BookedBannerEmberText} beside it — same drift, no separate flourish. */
export function BookedBannerFlameIcon({ className = 'text-[24px]' }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <span aria-hidden className={`${className} leading-none`}>
        🔥
      </span>
    )
  }

  return (
    <motion.span
      aria-hidden
      className={`inline-block ${className} leading-none`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: EMBER_LETTER_DURATION_S, ease: 'easeOut' }}
    >
      🔥
    </motion.span>
  )
}

/** Each letter drifts up and cools from ember-orange to grey, staggered — like embers settling into place. */
export function BookedBannerEmberText({
  text,
  className = 'text-[14px] font-medium leading-[1.5]',
}: {
  text: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <p className={`whitespace-nowrap ${className} text-[#333]`}>{text}</p>
  }

  return (
    <p className={`whitespace-nowrap ${className}`} aria-label={text}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: 8, color: '#f97316' }}
          animate={{ opacity: 1, y: 0, color: '#333333' }}
          transition={{ duration: EMBER_LETTER_DURATION_S, delay: index * EMBER_LETTER_STAGGER_S, ease: 'easeOut' }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </p>
  )
}
