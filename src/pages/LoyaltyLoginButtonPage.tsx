import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, type MotionValue, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import './LoyaltyLoginButtonPage.css'

/** Figma linear (Custom): 0% / 50% / 100% — 100% opacity per stop. */
const LOYALTY_BTN_GRADIENT =
  'linear-gradient(90deg, #FF2478 0%, #F71B35 50%, #F76148 100%)'

const STOPS: readonly (readonly [string, string])[] = [
  ['#FF2478', '0%'],
  ['#F71B35', '50%'],
  ['#F76148', '100%'],
]

const BLACK = '#000000'
const RING_DEFAULT = '#D9D9D9'

/**
 * Physical stroke weight (px). 2px reads clearly on 1x/retina; 1.5px is easy to look “hairline”.
 * The ring = `padding` on the outer, inner = white, label inside — no mask / z-fighting.
 */
const STROKE_PX = 2

/** Start after a short beat, hold at full gradient (slider-controlled), then ease back. */
const IN_DELAY_S = 0.4
const FADE_IN_S = 0.55
const FADE_OUT_S = 0.6

/** Default hold at blend = 1. Slider uses 0.5s steps. */
const HOLD_GRADIENT_DEFAULT_S = 3
const HOLD_GRADIENT_MIN_S = 0.5
const HOLD_GRADIENT_MAX_S = 10
const HOLD_GRADIENT_STEP_S = 0.5

const labelClass =
  'm-0 whitespace-nowrap text-center text-[13px] font-medium leading-4 not-italic'

const ease = [0.4, 0, 0.2, 1] as const

const labelTextClip: Record<string, string> = {
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
}

function parseHex(s: string): { r: number; g: number; b: number } {
  const h = s.replace('#', '')
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function toHex(c: { r: number; g: number; b: number }): string {
  const f = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${f(c.r)}${f(c.g)}${f(c.b)}`
}

function lerpHex(a: string, b: string, t: number): string {
  const t2 = Math.min(1, Math.max(0, t))
  const A = parseHex(a)
  const B = parseHex(b)
  return toHex({
    r: A.r + (B.r - A.r) * t2,
    g: A.g + (B.g - A.g) * t2,
    b: A.b + (B.b - A.b) * t2,
  })
}

/** One `background-clip: text` model: t=0 → flat black, t=1 → loyalty 3 stops. */
function labelGradientForBlend(t: number): string {
  const t2 = Math.min(1, Math.max(0, t))
  if (t2 === 0) {
    return `linear-gradient(90deg, ${BLACK} 0%, ${BLACK} 50%, ${BLACK} 100%)`
  }
  if (t2 === 1) {
    return LOYALTY_BTN_GRADIENT
  }
  const parts = STOPS.map(([stop, pos]) => {
    return `${lerpHex(BLACK, stop, t2)} ${pos}`
  })
  return `linear-gradient(90deg, ${parts.join(', ')})`
}

/** t=0: two-stop “flat” so `backgroundImage` is always a gradient. */
function ringBackgroundForBlend(t: number): string {
  const t2 = Math.min(1, Math.max(0, t))
  if (t2 === 0) {
    return `linear-gradient(90deg, ${RING_DEFAULT} 0%, ${RING_DEFAULT} 100%)`
  }
  if (t2 === 1) {
    return LOYALTY_BTN_GRADIENT
  }
  const parts = STOPS.map(([stop, pos]) => {
    return `${lerpHex(RING_DEFAULT, stop, t2)} ${pos}`
  })
  return `linear-gradient(90deg, ${parts.join(', ')})`
}

function sleep(ms: number) {
  return new Promise<void>((r) => {
    setTimeout(r, ms)
  })
}

const btnShell =
  'relative m-0 box-border inline-block max-w-full shrink-0 overflow-visible border-0 bg-transparent p-0 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500'

function inflowSizer() {
  return (
    <span
      className="invisible block select-none whitespace-nowrap px-4 py-3 text-center text-[13px] font-medium leading-4 not-italic"
      aria-hidden
    >
      Log in discounts
    </span>
  )
}

type BlendCtaProps = {
  labelBackground: MotionValue<string>
  ringBackground: MotionValue<string>
  /** When true, a looping white sheen (`.loyalty-cta-shim__streak`) follows `shimOpacity`. */
  showSheen: boolean
  /** Sheen layer opacity: same in / hold / as blend (0 = off). Only used when `showSheen`. */
  shimOpacity?: MotionValue<number>
}

/**
 * Loyalty 3-stop lerp in border + type; optional medium `soft-light` sheen (fixed 2s sweep loop in CSS).
 */
function LoyaltyCtaBlend({ labelBackground, ringBackground, showSheen, shimOpacity }: Readonly<BlendCtaProps>) {
  return (
    <button
      type="button"
      className={btnShell}
      aria-label={showSheen ? 'Log in discounts, with sheen' : 'Log in discounts, no sheen'}
    >
      {inflowSizer()}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 box-border flex max-h-none max-w-none items-stretch justify-stretch overflow-hidden rounded-full"
        style={{ padding: STROKE_PX, backgroundImage: ringBackground }}
        aria-hidden
      >
        <div className="box-border flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-full bg-white px-4 py-3 [box-shadow:none]">
          <motion.span className={labelClass} style={{ ...labelTextClip, backgroundImage: labelBackground }}>
            Log in discounts
          </motion.span>
        </div>
      </motion.div>
      {showSheen && shimOpacity ? (
        <motion.div
          className="loyalty-cta-shim pointer-events-none absolute inset-0 z-10"
          style={{ opacity: shimOpacity }}
          aria-hidden
        >
          <div className="loyalty-cta-shim__streak" />
        </motion.div>
      ) : null}
    </button>
  )
}

export function LoyaltyLoginButtonPage() {
  const reduceMotion = useReducedMotion()
  const [playId, setPlayId] = useState(0)
  const [holdGradientSec, setHoldGradientSec] = useState(HOLD_GRADIENT_DEFAULT_S)
  const holdGradientSecRef = useRef(HOLD_GRADIENT_DEFAULT_S)
  holdGradientSecRef.current = holdGradientSec

  const blend = useMotionValue(0)
  const labelBackground = useTransform(blend, labelGradientForBlend)
  const ringBackground = useTransform(blend, ringBackgroundForBlend)

  useEffect(() => {
    if (reduceMotion) {
      blend.set(0)
      return
    }
    blend.set(0)
    let cancelled = false
    let stopCurrent: (() => void) | null = null

    const run = async () => {
      await sleep(IN_DELAY_S * 1000)
      if (cancelled) {
        return
      }
      const a1 = animate(blend, 1, { duration: FADE_IN_S, ease })
      stopCurrent = () => a1.stop()
      await a1
      if (cancelled) {
        return
      }
      await sleep(holdGradientSecRef.current * 1000)
      if (cancelled) {
        return
      }
      const a2 = animate(blend, 0, { duration: FADE_OUT_S, ease })
      stopCurrent = () => a2.stop()
      await a2
    }

    void run()

    return () => {
      cancelled = true
      stopCurrent?.()
      blend.set(0)
    }
  }, [blend, playId, reduceMotion])

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-stone-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            <span aria-hidden className="text-stone-400">
              ←
            </span>
            All projects
          </Link>
        </div>

        <header className="mb-14 border-b border-stone-200 pb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-600">Loyalty &amp; pricing</p>
          <h1 id="main" className="mt-2 text-3xl font-medium tracking-tight text-stone-900 md:text-4xl" tabIndex={-1}>
            Log in button animation
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600">
            3 loyalty stops (0% / 50% / 100%), linear lerp in the <strong>ring + type</strong> — two variants: <strong>with</strong> a
            medium sheen (soft-light), or <strong>without</strong>. Adjust how long the gradient <strong>holds</strong>{' '}
            at full strength below (0.5s steps). Same in / hold / out blend on both.{' '}
            <strong>Replay</strong> restarts the sequence to {RING_DEFAULT}.
          </p>
        </header>

        <section
          aria-labelledby="demo-heading"
          className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-16"
        >
          <h2 id="demo-heading" className="sr-only">
            Demo
          </h2>

          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-stone-500">
            Load: delay → in → hold → out to {RING_DEFAULT} — Replay re-runs both
          </p>

          <div className="mt-6 flex w-full max-w-2xl flex-col items-stretch gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-16">
            <div className="flex flex-1 flex-col items-center">
              <p className="mb-3 text-center text-sm font-medium text-stone-800">With sheen</p>
              <LoyaltyCtaBlend
                showSheen
                labelBackground={labelBackground}
                ringBackground={ringBackground}
                shimOpacity={blend}
              />
            </div>
            <div className="flex flex-1 flex-col items-center">
              <p className="mb-3 text-center text-sm font-medium text-stone-800">No sheen</p>
              <LoyaltyCtaBlend
                showSheen={false}
                labelBackground={labelBackground}
                ringBackground={ringBackground}
              />
            </div>
          </div>

          <div className="mt-8 flex w-full max-w-md flex-col gap-2 px-2">
            <label className="text-sm font-medium text-stone-800" htmlFor="loyalty-gradient-hold">
              Hold at full gradient:{' '}
              <span className="tabular-nums text-stone-600">{holdGradientSec}s</span>
              <span className="font-normal text-stone-500"> (0.5s steps; applies after fade-in, before fade-out)</span>
            </label>
            <input
              id="loyalty-gradient-hold"
              type="range"
              min={HOLD_GRADIENT_MIN_S}
              max={HOLD_GRADIENT_MAX_S}
              step={HOLD_GRADIENT_STEP_S}
              value={holdGradientSec}
              onChange={(e) => {
                setHoldGradientSec(Number(e.target.value))
              }}
              className="w-full accent-stone-700"
              aria-valuemin={HOLD_GRADIENT_MIN_S}
              aria-valuemax={HOLD_GRADIENT_MAX_S}
              aria-valuenow={holdGradientSec}
              aria-valuetext={`${holdGradientSec} seconds hold`}
            />
          </div>

          <button
            type="button"
            className="mt-10 rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
            onClick={() => {
              setPlayId((n) => n + 1)
            }}
          >
            Replay
          </button>

          <p className="mt-16 max-w-md text-center text-sm text-stone-500 sm:mt-20">
            Stops:{' '}
            <code className="text-[0.9em] text-stone-700">#FF2478</code> 0% · <code className="text-[0.9em] text-stone-700">#F71B35</code>{' '}
            50% · <code className="text-[0.9em] text-stone-700">#F76148</code> 100% · {STROKE_PX}px ring · sheen (left
            only) uses blend for opacity · flat <code className="text-[0.85em]">#D9D9D9</code> when the blend is off
          </p>
        </section>
      </div>
    </div>
  )
}
