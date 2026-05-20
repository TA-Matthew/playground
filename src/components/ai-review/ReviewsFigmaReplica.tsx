import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { VariantId } from '../../data/variants'
import { InfoCircleIcon } from '../experience/pdp/InfoCircleIcon'
import { FigmaStarRow, type StarKind } from '../experience/pdp/figmaListingUi'
import { figma } from './figmaAssets'
import './ai-review-animations.css'

/** AI review URL/query variant — matches {@link VariantId} (`a` chips, `b`/`c` matrix). */
export type AiSummaryLayoutVariant = VariantId

/** Per-review theme mention sentiment (used with theme + list filters) */
export type ThemeSentimentKind = 'positive' | 'negative'

const GRADIENT_CHIP =
  'linear-gradient(90deg, rgba(245, 205, 114, 0.08) 0%, rgba(252, 86, 73, 0.08) 19.031%, rgba(243, 68, 116, 0.08) 40.336%, rgba(175, 101, 226, 0.08) 59.135%, rgba(69, 135, 252, 0.08) 78.352%, rgba(154, 206, 243, 0.08) 92.973%)'

const RATING_COUNTS = {
  5: 26_354,
  4: 6_137,
  3: 2_068,
  2: 1_106,
  1: 1_410,
} as const

const RATING_TOTAL = Object.values(RATING_COUNTS).reduce((a, b) => a + b, 0)

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'size-4 shrink-0 text-black'}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3.85355 5.39645C3.65829 5.20118 3.34171 5.20118 3.14645 5.39645C2.95118 5.59171 2.95118 5.90829 3.14645 6.10355L7.64645 10.6036C7.84171 10.7988 8.15829 10.7988 8.35355 10.6036L12.8536 6.10355C13.0488 5.90829 13.0488 5.59171 12.8536 5.39645C12.6583 5.20119 12.3417 5.20119 12.1464 5.39645L8 9.54289L3.85355 5.39645Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckmarkStar({ className }: { className?: string }) {
  return (
    <div className={className ?? 'size-4 shrink-0'}>
      <img alt="" className="block size-full" src={figma.checkmarkStar} />
    </div>
  )
}

function RatingBar({ stars, count }: { stars: string; count: number }) {
  const pct = RATING_TOTAL > 0 ? (count / RATING_TOTAL) * 100 : 0
  return (
    <div className="flex w-full items-center gap-4">
      <p className="w-12 shrink-0 text-right text-sm leading-normal text-[#333]">{stars}</p>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#d9d9d9]">
        <div
          className="h-full rounded-full bg-[#00c295]"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="w-10 shrink-0 text-right text-sm tabular-nums text-[#333]">
        {count.toLocaleString()}
      </p>
    </div>
  )
}

function Upvote() {
  return (
    <button type="button" className="shrink-0 p-0.5" aria-label="Mark as helpful">
      <img alt="" className="size-6" src={figma.upvoteShape} />
    </button>
  )
}

export const THEME_IDS = [
  'skip-the-line',
  'sistine-chapel',
  'good-value',
  'small-group',
  'expert-guide',
  'audio-headsets',
] as const
export type ThemeId = (typeof THEME_IDS)[number]

/** Figma / UI metadata only — counts (travelers, +/−) come from {@link getThemeMentionMap}. */
const THEME_CHIPS: { id: ThemeId; label: string; endIcon: 'up' | 'down' | 'remove' }[] = [
  { id: 'skip-the-line', label: 'Wait time', endIcon: 'up' },
  { id: 'sistine-chapel', label: 'Points of interest', endIcon: 'up' },
  { id: 'good-value', label: 'Good value', endIcon: 'up' },
  { id: 'small-group', label: 'Tour planning', endIcon: 'remove' },
  { id: 'expert-guide', label: 'Guides', endIcon: 'remove' },
  { id: 'audio-headsets', label: 'Audio headsets', endIcon: 'down' },
]

function defaultSentimentOnThemeSelect(_id: ThemeId): ThemeSentimentKind {
  // Always default to positive sentiment in breakdown, even for “negative” themes like audio headsets.
  return 'positive'
}

const AI_REVIEW_DEFAULT_SUMMARY =
  'Travelers consistently praise the guides for their extensive knowledge, engaging explanations, and professionalism, which enhance appreciation of Vatican art, history, and architecture. The skip-the-line feature significantly reduces wait times, improving the overall visit. The tour covers key sites comprehensively with clear commentary. Organization and group management are generally smooth, though some note delayed starts, rushed pacing, and communication issues about closures. While many find the tour worth the cost, others consider it expensive relative to the experience, citing hurried visits and occasional logistical challenges.'

function ReadMore({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-2 flex cursor-pointer items-center gap-2 rounded p-0 text-black transition hover:bg-stone-100 active:bg-stone-200 [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
      <span className="text-sm leading-normal sm:text-base">Read more</span>
      <svg
        className="h-4 w-4 shrink-0"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M3.85355 5.39645C3.65829 5.20118 3.34171 5.20118 3.14645 5.39645C2.95118 5.59171 2.95118 5.90829 3.14645 6.10355L7.64645 10.6036C7.84171 10.7988 8.15829 10.7988 8.35355 10.6036L12.8536 6.10355C13.0488 5.90829 13.0488 5.59171 12.8536 5.39645C12.6583 5.20119 12.3417 5.20119 12.1464 5.39645L8 9.54289L3.85355 5.39645Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

const AI_REVIEW_SUMMARY_BY_THEME: Record<ThemeId, string> = {
  'skip-the-line':
    'Travelers enjoy the skip-the-line feature for significantly reducing wait times at the Vatican and related sites. This access allows guests to bypass extensive queues, maximizing time spent exploring and enhancing the overall visit experience.',
  'sistine-chapel':
    'Travelers consistently praise this Vatican tour for its comprehensive coverage of St. Peter’s Basilica, the Sistine Chapel, and the museums. Guides provide detailed, clear commentary, enhancing appreciation of the art, architecture, and historical significance.',
  'good-value':
    'Travelers value the guides for their extensive knowledge and engaging explanations of Vatican history, art, and architecture. The tours provide detailed, well-organized insights that enhance appreciation of the museums, Sistine Chapel, and St. Peter’s Basilica.',
  'small-group':
    'Travelers praise the tour’s organization, punctuality, and effective group management, highlighting smooth navigation through crowds and well-timed breaks. However, many flag issues with delayed starts, rushed pacing, incomplete itineraries, and poor communication about closures and changes.',
  'expert-guide':
    'Travelers consistently praise the tour guides for their extensive knowledge, engaging storytelling, and professionalism. Guides are described as friendly, patient, and skilled at managing groups and crowds, enhancing the overall educational and enjoyable experience.',
  'audio-headsets':
    'Headset feedback splits between “crystal clear in a noisy room” and “I fought the channel all morning.” The median experience is: fine once paired, a relief when the hall is packed, a minor annoyance when the battery or signal drops. Bring your own comfort tip if in‑ear buds bother you on long days.',
}

/** Sort matrix rows: {@link THEME_CHIPS} positive (`up`) → neutral (`remove`) → negative (`down`). */
function getMatrixThemeTier(themeId: ThemeId): number {
  const endIcon = THEME_CHIPS.find((c) => c.id === themeId)?.endIcon ?? 'up'
  if (endIcon === 'up') return 0
  if (endIcon === 'remove') return 1
  return 2
}

/**
 * Same Figma assets as variant A {@link ThemeChip} ({@link figma.filterChipUp} / Down / Remove).
 */
function MatrixSentimentIcon({ themeId }: { themeId: ThemeId }) {
  const endIcon = THEME_CHIPS.find((c) => c.id === themeId)?.endIcon ?? 'up'
  const src =
    endIcon === 'remove'
      ? figma.filterChipRemove
      : endIcon === 'up'
        ? figma.filterChipUp
        : figma.filterChipDown

  return (
    <div className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
      <img alt="" className="size-4 shrink-0" width={16} height={16} decoding="async" src={src} />
    </div>
  )
}

const MATRIX_ITEM_PREVIEW_LINES = 3

/** Collapsed trailing control label (must match measurement {@link matrixMeasureReplacePreview}). */
const MATRIX_ITEM_MORE_LABEL = '... more'

/** Hidden probe for {@link MatrixItem} line-fit (same typography as visible copy). */
function matrixMeasureReplacePreview(
  measureEl: HTMLDivElement,
  headingTitle: string,
  countDisplay: string,
  words: readonly string[],
  replaceAt: number,
): number {
  measureEl.replaceChildren()
  const prefix = document.createElement('span')
  prefix.className = 'font-medium'
  prefix.append(`${headingTitle} `)
  const countSpan = document.createElement('span')
  countSpan.className = 'tabular-nums'
  countSpan.append(`(${countDisplay}): `)
  prefix.append(countSpan)

  const bodySpan = document.createElement('span')
  bodySpan.className = 'font-normal'
  const before = words.slice(0, Math.max(0, replaceAt - 1)).join(' ')
  bodySpan.append(before)
  if (before.length > 0) bodySpan.append(' ')
  bodySpan.append(MATRIX_ITEM_MORE_LABEL)

  measureEl.append(prefix, bodySpan)
  return measureEl.scrollHeight
}

function matrixMeasureFullBody(
  measureEl: HTMLDivElement,
  headingTitle: string,
  countDisplay: string,
  bodyText: string,
): number {
  measureEl.replaceChildren()
  const prefix = document.createElement('span')
  prefix.className = 'font-medium'
  prefix.append(`${headingTitle} `)
  const countSpan = document.createElement('span')
  countSpan.className = 'tabular-nums'
  countSpan.append(`(${countDisplay}): `)
  prefix.append(countSpan)

  const bodySpan = document.createElement('span')
  bodySpan.className = 'font-normal'
  bodySpan.append(bodyText)

  measureEl.append(prefix, bodySpan)
  return measureEl.scrollHeight
}

function MatrixItem({
  themeId,
  column,
  headingTitle,
  body,
  isActive,
  mentionCount,
  onThemeClick,
  truncatePreview = true,
}: {
  themeId: ThemeId
  column: 'pos' | 'neg'
  headingTitle: string
  body: string
  isActive: boolean
  mentionCount: number
  onThemeClick: (id: ThemeId, column: 'pos' | 'neg') => void
  /** When false, full body is always shown (no three-line “… more” fit). */
  truncatePreview?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const countDisplay = mentionCount.toLocaleString()
  const containerRef = useRef<HTMLParagraphElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [resizeTick, setResizeTick] = useState(0)
  const [collapsedPreview, setCollapsedPreview] = useState<
    | { kind: 'pending' }
    | { kind: 'fits'; words: readonly string[] }
    | { kind: 'replace'; words: readonly string[]; replaceAt: number }
  >({ kind: 'pending' })

  const bodyWords = useMemo(() => body.trim().split(/\s+/).filter(Boolean), [body])

  useEffect(() => {
    const el = containerRef.current
    if (el == null) return
    const ro = new ResizeObserver(() => {
      setResizeTick((t) => t + 1)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (!truncatePreview) {
      setCollapsedPreview({ kind: 'fits', words: bodyWords })
      return
    }
    if (expanded) return
    const container = containerRef.current
    const measureEl = measureRef.current
    if (container == null || measureEl == null) return

    measureEl.className = 'pointer-events-none invisible absolute left-0 top-0 -z-10 break-words text-left text-[14px] leading-5 text-black [letter-spacing:0.05px]'
    measureEl.style.width = `${container.offsetWidth}px`

    const lineHeight = Number.parseFloat(getComputedStyle(measureEl).lineHeight) || 20
    const maxHeight = lineHeight * MATRIX_ITEM_PREVIEW_LINES

    if (bodyWords.length === 0) {
      setCollapsedPreview({ kind: 'fits', words: bodyWords })
      return
    }

    const fullH = matrixMeasureFullBody(measureEl, headingTitle, countDisplay, bodyWords.join(' '))
    if (fullH <= maxHeight) {
      setCollapsedPreview({ kind: 'fits', words: bodyWords })
      return
    }

    let lo = 1
    let hi = bodyWords.length
    let best = 0
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const h = matrixMeasureReplacePreview(measureEl, headingTitle, countDisplay, bodyWords, mid)
      if (h <= maxHeight) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    setCollapsedPreview({
      kind: 'replace',
      words: bodyWords,
      replaceAt: best > 0 ? best : 1,
    })
  }, [expanded, headingTitle, countDisplay, bodyWords, resizeTick, truncatePreview])

  const matrixToggleBaseStyles =
    'inline cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 align-baseline font-normal text-[#4D4D4D] no-underline decoration-solid [text-decoration-skip-ink:none] transition hover:text-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'

  return (
    <div className="flex items-start gap-2">
      <MatrixSentimentIcon themeId={themeId} />
      <p
        ref={containerRef}
        className="relative m-0 min-w-0 w-full flex-1 text-[14px] leading-5 text-black [letter-spacing:0.05px]"
      >
        <div ref={measureRef} aria-hidden />
        {expanded ? (
          <span className="block w-full min-w-0 break-words">
            <button
              type="button"
              onClick={() => onThemeClick(themeId, column)}
              aria-pressed={isActive}
              className="inline cursor-pointer p-0 align-baseline text-left font-medium text-black underline decoration-solid [text-decoration-skip-ink:none] transition hover:decoration-[currentColor] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {headingTitle}{' '}
              <span className="tabular-nums">({countDisplay})</span>:
            </button>{' '}
            <span className="font-normal">{body}</span>
          </span>
        ) : (
          <>
            {collapsedPreview.kind === 'pending' ? (
              <span className="block min-h-[3.75rem] w-full min-w-0 rounded-sm bg-stone-100/60" aria-hidden />
            ) : null}
            {collapsedPreview.kind === 'fits' ? (
              <span className="block w-full min-w-0 break-words">
                <button
                  type="button"
                  onClick={() => onThemeClick(themeId, column)}
                  aria-pressed={isActive}
                  className="inline cursor-pointer p-0 align-baseline text-left font-medium leading-5 text-black underline decoration-solid [text-decoration-skip-ink:none] transition hover:decoration-[currentColor] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {headingTitle}{' '}
                  <span className="tabular-nums">({countDisplay})</span>:
                </button>{' '}
                <span className="font-normal leading-5">{body}</span>
              </span>
            ) : null}
            {collapsedPreview.kind === 'replace' ? (
              <span className="block w-full min-w-0 break-words">
                <button
                  type="button"
                  onClick={() => onThemeClick(themeId, column)}
                  aria-pressed={isActive}
                  className="inline cursor-pointer p-0 align-baseline text-left font-medium leading-5 text-black underline decoration-solid [text-decoration-skip-ink:none] transition hover:decoration-[currentColor] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {headingTitle}{' '}
                  <span className="tabular-nums">({countDisplay})</span>:
                </button>{' '}
                <span className="font-normal leading-5">
                  {collapsedPreview.words.slice(0, Math.max(0, collapsedPreview.replaceAt - 1)).join(' ')}{' '}
                  <button
                    type="button"
                    aria-expanded={false}
                    aria-label="Read more"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(true)
                    }}
                    className={matrixToggleBaseStyles}
                  >
                    <span className="no-underline">... </span>
                    <span className="underline decoration-solid decoration-[currentColor] [text-decoration-skip-ink:none]">
                      more
                    </span>
                  </button>
                </span>
              </span>
            ) : null}
          </>
        )}
      </p>
    </div>
  )
}

/** A = conic border + long summary + theme chips; B/C = two-column +/− matrix (no theme chips in card). */
/** Variant B matrix copy + {@link ThemeId} for filtering (prototype mapping; some ids repeat across rows). */
type VariantBMatrixCell = { themeId: ThemeId; title: string; body: string }

const VARIANT_B_MATRIX_ROWS: ReadonlyArray<{ pos: VariantBMatrixCell; neg?: VariantBMatrixCell }> = [
  {
    pos: {
      themeId: 'sistine-chapel',
      title: 'Point of Interest',
      body:
        'The Vatican Museum and Sistine Chapel are widely praised for their stunning art, sculptures, and architecture. Visitors appreciate the opportunity to explore at their own pace and find the experience uniquely captivating and memorable.',
    },
  },
  {
    pos: {
      themeId: 'expert-guide',
      title: 'Tour Guide',
      body:
        'Tour guides are praised for their knowledge and ability to enrich the experience with historical context. However, some guests report poor communication, rudeness, and insufficient guidance, causing confusion. Overall, travelers value clear, informative guides who enhance understanding.',
    },
  },
  {
    pos: {
      themeId: 'expert-guide',
      title: 'Communication',
      body:
        'Communication and guidance at the site are mixed, with helpful staff and clear initial instructions appreciated. However, many travelers note unclear directions, lack of accompaniment, and unresponsive or rude customer service, making on-site support inconsistent despite early clarity.',
    },
    neg: {
      themeId: 'skip-the-line',
      title: 'Tour Planning',
      body:
        'Staff are praised for efficiently managing ticketing and initial procedures amid crowds. However, many travelers note unclear directions, lack of escorts through lines, and misleading expectations about guided tours, though the smooth start is still appreciated.',
    },
  },
  {
    pos: {
      themeId: 'good-value',
      title: 'Value for Money',
      body:
        'Value for money receives mixed feedback, with many travelers appreciating the convenience of skipping long lines as worth the extra cost. While some find the pricing excessive, others still recognize the benefit of faster access to the Vatican.',
    },
    neg: {
      themeId: 'audio-headsets',
      title: 'Audio Guide',
      body:
        'Audio guides receive mixed feedback, with some travelers appreciating the informative content and flexibility to explore at their own pace. However, many find the app and devices unreliable, lacking detail, and difficult to navigate, which detracts from the overall experience.',
    },
  },
]

/** Variant C: same matrix layout as B, ~15–20 word summaries — full text shown (no “… more” truncation). */
const VARIANT_C_MATRIX_ROWS: ReadonlyArray<{ pos: VariantBMatrixCell; neg?: VariantBMatrixCell }> = [
  {
    pos: {
      themeId: 'sistine-chapel',
      title: 'Point of Interest',
      body:
        'Vatican Museums and the Sistine Chapel earn praise for art and architecture; many enjoy exploring at their own pace.',
    },
  },
  {
    pos: {
      themeId: 'expert-guide',
      title: 'Tour Guide',
      body:
        'Guides add historical context and storytelling; some visitors cite rudeness, confusion, or uneven support.',
    },
  },
  {
    pos: {
      themeId: 'expert-guide',
      title: 'Communication',
      body:
        'Early instructions help, but directions and staff responsiveness vary once you are inside the venue.',
    },
    neg: {
      themeId: 'skip-the-line',
      title: 'Tour Planning',
      body:
        'Ticket desks feel organized at first; crowd lines and guided-tour expectations still frustrate many guests.',
    },
  },
  {
    pos: {
      themeId: 'good-value',
      title: 'Value for Money',
      body:
        'Skip-the-line access convinces most travelers the fare is fair, though some still call it pricey.',
    },
    neg: {
      themeId: 'audio-headsets',
      title: 'Audio Guide',
      body:
        'Self-guided audio suits some; others fight flaky apps, shallow narration, and confusing routing.',
    },
  },
]

const VARIANT_MATRIX_ROW_SOURCES = [VARIANT_B_MATRIX_ROWS, VARIANT_C_MATRIX_ROWS]

function getThemeChipLabel(themeId: ThemeId): string {
  return THEME_CHIPS.find((c) => c.id === themeId)?.label ?? themeId
}

/**
 * Copy for the mention breakdown line. Variant A uses {@link THEME_CHIPS} labels so they match
 * the chips. B/C/B2 use the first matching matrix heading for that {@link ThemeId} (prototype
 * mapping); otherwise the chip label.
 */
function getThemeBreakdownLabel(themeId: ThemeId, summaryLayout: AiSummaryLayoutVariant): string {
  if (summaryLayout === 'a') {
    return getThemeChipLabel(themeId)
  }
  for (const rows of VARIANT_MATRIX_ROW_SOURCES) {
    for (const row of rows) {
      const cells: VariantBMatrixCell[] =
        row.neg != null ? [row.pos, row.neg] : [row.pos]
      for (const cell of cells) {
        if (cell.themeId === themeId) return cell.title
      }
    }
  }
  return getThemeChipLabel(themeId)
}

/** Variant B matrix: how many theme rows show before tap-to-expand on narrow screens. */
const AI_SUMMARY_MOBILE_MATRIX_PREVIEW_COUNT = 3

/** 20px thumb icons; 44×44 tap target on mobile, 32×32 from sm. */
const helpfulFeedbackBtn =
  'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full p-0 [-webkit-tap-highlight-color:transparent] transition-colors sm:h-8 sm:w-8 sm:hover:bg-[#e8e8e8] sm:active:bg-[#dedede] max-sm:active:bg-[#dedede] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600'

/** [Figma — “Was this helpful?” + source](https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20618-93904) */
function AiReviewSummarySourceFooter({ className }: { className?: string }) {
  const [feedbackThanks, setFeedbackThanks] = useState(false)
  return (
    <div
      className={[
        'flex flex-col gap-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {feedbackThanks ? (
        <p
          className="ai-summary-body-fade-in text-sm font-normal leading-normal text-[#4D4D4D] [letter-spacing:0.05px]"
          aria-live="polite"
        >
          Thank you for your feedback!
        </p>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-wrap items-center gap-x-3 gap-y-2 max-sm:gap-y-0 sm:gap-x-4">
          <p className="shrink-0 text-sm font-normal leading-normal text-[#4D4D4D] [letter-spacing:0.05px]">
            Was this helpful?
          </p>
          <div className="flex items-center gap-1.5" role="group" aria-label="Feedback on this summary">
            <button
              type="button"
              className={helpfulFeedbackBtn}
              aria-label="Yes, this summary was helpful"
              onClick={() => {
                setFeedbackThanks(true)
              }}
            >
              <img
                alt=""
                className="h-5 w-5"
                src={figma.upvoteShape}
                width={20}
                height={20}
                decoding="async"
              />
            </button>
            <button
              type="button"
              className={helpfulFeedbackBtn}
              aria-label="No, this summary was not helpful"
              onClick={() => {
                setFeedbackThanks(true)
              }}
            >
              <img
                alt=""
                className="h-5 w-5"
                src={figma.thumbDownShape}
                width={20}
                height={20}
                decoding="async"
              />
            </button>
          </div>
        </div>
      )}
      <div className="flex w-full shrink-0 items-center justify-start gap-2 sm:max-w-[50%] sm:justify-end">
        <p className="text-left text-[10px] font-normal leading-[14px] text-[#808080] [letter-spacing:0.05px] sm:whitespace-nowrap sm:text-right">
          Real traveler reviews summarised by AI
        </p>
        <span
          className="inline-flex shrink-0"
          title="Summaries are generated from traveler-written reviews."
        >
          <InfoCircleIcon
            className="size-4 shrink-0 [&_path]:fill-[#808080]"
            aria-hidden
          />
        </span>
      </div>
    </div>
  )
}

function AiReviewSummaryFigmaBlock({
  activeTheme,
  onMatrixThemeClick,
  themeMentions,
  matrixRows = VARIANT_B_MATRIX_ROWS,
  truncateMatrixBody = true,
}: {
  activeTheme: ThemeId | null
  onMatrixThemeClick: (id: ThemeId, column: 'pos' | 'neg') => void
  themeMentions: Readonly<Record<ThemeId, { count: number }>>
  matrixRows?: ReadonlyArray<{ pos: VariantBMatrixCell; neg?: VariantBMatrixCell }>
  /** When false (variant C), matrix blurbs are short and always shown in full — no “… more”. */
  truncateMatrixBody?: boolean
}) {
  const [isMaxSm, setIsMaxSm] = useState(false)
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false)

  useEffect(() => {
    const mq = globalThis.matchMedia('(max-width: 639px)')
    const apply = () => {
      setIsMaxSm(mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => {
      mq.removeEventListener('change', apply)
    }
  }, [])

  const reduceMotion = useReducedMotion() === true

  const matrixSlotsSorted = useMemo(() => {
    const slots = matrixRows.flatMap((row) => {
      const posCell = {
        column: 'pos' as const,
        themeId: row.pos.themeId,
        headingTitle: row.pos.title,
        body: row.pos.body,
      }
      if (row.neg == null) return [posCell]
      return [
        posCell,
        {
          column: 'neg' as const,
          themeId: row.neg.themeId,
          headingTitle: row.neg.title,
          body: row.neg.body,
        },
      ]
    })
    slots.sort((a, b) => getMatrixThemeTier(a.themeId) - getMatrixThemeTier(b.themeId))
    return slots
  }, [matrixRows])

  const previewSlots = useMemo(
    () => matrixSlotsSorted.slice(0, AI_SUMMARY_MOBILE_MATRIX_PREVIEW_COUNT),
    [matrixSlotsSorted],
  )
  const overflowSlots = useMemo(
    () => matrixSlotsSorted.slice(AI_SUMMARY_MOBILE_MATRIX_PREVIEW_COUNT),
    [matrixSlotsSorted],
  )

  const matrixOverflowsPreview =
    matrixSlotsSorted.length > AI_SUMMARY_MOBILE_MATRIX_PREVIEW_COUNT
  const mobileSummaryCollapsed =
    isMaxSm && !mobileSummaryExpanded && matrixOverflowsPreview
  const showSourceFooter = !isMaxSm || !matrixOverflowsPreview || mobileSummaryExpanded
  const animateOverflowReveal =
    isMaxSm && matrixOverflowsPreview && mobileSummaryExpanded && overflowSlots.length > 0

  return (
    <AiSummaryBorderAnimatedFrame innerClassName="flex w-full flex-col gap-4 p-4 shadow-sm sm:gap-6 sm:rounded-[23px]">
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-1 pr-24 sm:flex-row sm:items-center sm:gap-2 sm:pr-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="ai-summary-icon-animated shrink-0"
              style={{
                WebkitMaskImage: `url('${figma.aiSparkle}')`,
                maskImage: `url('${figma.aiSparkle}')`,
              }}
              aria-hidden
            />
            <p className="ai-summary-title-animated min-w-0 text-base font-bold leading-normal">Review summary</p>
          </div>
          <p className="min-w-0 pl-6 text-xs font-normal leading-5 text-[#4D4D4D] [letter-spacing:0.05px] sm:flex-1 sm:pl-0 sm:text-sm">
            Select a theme to learn more
          </p>
        </div>
        <div className="absolute top-0 right-0 w-fit rounded-md bg-[#f7eeff] px-1 py-0.5 sm:relative sm:top-auto sm:right-auto">
          <p className="whitespace-nowrap text-center text-xs font-medium leading-4 text-[#351560]">
            From past 12 months
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className={`grid w-full grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 ${mobileSummaryCollapsed ? 'max-sm:pb-2' : ''}`}
        >
          {previewSlots.map((slot, i) => (
            <Fragment key={`${slot.themeId}-${slot.column}-${slot.headingTitle}-${i}`}>
              <MatrixItem
                themeId={slot.themeId}
                column={slot.column}
                headingTitle={slot.headingTitle}
                body={slot.body}
                isActive={activeTheme === slot.themeId}
                mentionCount={themeMentions[slot.themeId]?.count ?? 0}
                onThemeClick={onMatrixThemeClick}
                truncatePreview={truncateMatrixBody}
              />
            </Fragment>
          ))}
          {!mobileSummaryCollapsed &&
            overflowSlots.map((slot, i) => {
              const key = `${slot.themeId}-${slot.column}-${slot.headingTitle}-${previewSlots.length + i}`
              const item = (
                <MatrixItem
                  themeId={slot.themeId}
                  column={slot.column}
                  headingTitle={slot.headingTitle}
                  body={slot.body}
                  isActive={activeTheme === slot.themeId}
                  mentionCount={themeMentions[slot.themeId]?.count ?? 0}
                  onThemeClick={onMatrixThemeClick}
                  truncatePreview={truncateMatrixBody}
                />
              )
              if (animateOverflowReveal && !reduceMotion) {
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.42,
                      delay: i * 0.06,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="min-w-0"
                  >
                    {item}
                  </motion.div>
                )
              }
              return <Fragment key={key}>{item}</Fragment>
            })}
        </div>
        <AnimatePresence>
          {mobileSummaryCollapsed ? (
            <motion.button
              key="ai-summary-expand-scrim"
              type="button"
              initial={reduceMotion ? false : { opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-x-0 bottom-0 z-[1] flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-end bg-gradient-to-t from-white via-white/90 to-transparent pb-3 pt-16 [-webkit-tap-highlight-color:transparent]"
              aria-expanded={false}
              aria-label="Expand review summary to show all themes"
              onClick={() => {
                setMobileSummaryExpanded(true)
              }}
            >
              <span className="text-sm font-medium leading-5 text-[#4D4D4D] underline decoration-solid decoration-[currentColor] [text-decoration-skip-ink:none]">
                Show more
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
      {showSourceFooter ? (
        animateOverflowReveal && !reduceMotion ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: overflowSlots.length * 0.06 + 0.08,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <AiReviewSummarySourceFooter />
          </motion.div>
        ) : (
          <AiReviewSummarySourceFooter />
        )
      ) : null}
    </AiSummaryBorderAnimatedFrame>
  )
}

function AiThemeSummaryParagraph({
  activeTheme,
  topSpacing = true,
}: {
  activeTheme: ThemeId | null
  /** When false, omit top margin (e.g. paragraph follows a rule). */
  topSpacing?: boolean
}) {
  const reduceMotion = useReducedMotion() === true
  const [filterEngaged, setFilterEngaged] = useState(false)
  useEffect(() => {
    if (activeTheme != null) setFilterEngaged(true)
  }, [activeTheme])

  const [isExpanded, setIsExpanded] = useState(false)
  useEffect(() => {
    setIsExpanded(false)
  }, [activeTheme])

  const text =
    activeTheme == null
      ? AI_REVIEW_DEFAULT_SUMMARY
      : (AI_REVIEW_SUMMARY_BY_THEME[activeTheme] ?? AI_REVIEW_DEFAULT_SUMMARY)

  const useFade = !reduceMotion && (activeTheme != null || filterEngaged)
  const showReadMore = activeTheme == null && !isExpanded

  return (
    <div
      key={activeTheme ?? 'all'}
      className={[
        topSpacing ? 'mt-4' : '',
        'min-h-0 sm:min-h-0',
        useFade ? 'ai-summary-body-fade-in' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      {showReadMore ? (
        <>
          <p className="m-0 text-sm leading-6 text-black [letter-spacing:0.05px] sm:text-base line-clamp-3">
            {text}
          </p>
          <ReadMore onClick={() => setIsExpanded(true)} />
        </>
      ) : (
        <p className="m-0 text-sm leading-6 text-black [letter-spacing:0.05px] sm:text-base">{text}</p>
      )}
    </div>
  )
}

function ThemeFiltersSectionHeading({
  activeTheme,
  onClear,
}: {
  activeTheme: ThemeId | null
  onClear: () => void
}) {
  const reduceMotion = useReducedMotion() === true
  const prevRef = useRef<ThemeId | null | undefined>(undefined)
  const prev = prevRef.current
  /** Animate only when the label flips (null ↔ theme). Same copy when swapping themes: no animation. */
  const labelModeChanges =
    prev !== undefined &&
    ((prev === null && activeTheme !== null) || (prev !== null && activeTheme === null))
  const useFade = !reduceMotion && labelModeChanges

  useLayoutEffect(() => {
    prevRef.current = activeTheme
  }, [activeTheme])

  return (
    <div
      key={activeTheme == null ? 'select-theme' : 'scroll'}
      className={[
        'text-sm leading-normal text-[#4d4d4d]',
        useFade ? 'ai-summary-body-fade-in' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {activeTheme == null ? (
        'Select a theme to learn more'
      ) : (
        <p className="m-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span>Scroll down to read more</span>
          <span aria-hidden className="shrink-0 text-[#4d4d4d]">
            •
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 cursor-pointer rounded border-0 bg-transparent p-0 text-left font-inherit text-sm font-normal leading-normal text-[#4d4d4d] no-underline transition [text-decoration-skip-ink:none] underline-offset-2 hover:underline hover:decoration-[#4d4d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 [-webkit-tap-highlight-color:transparent] max-sm:-m-2 max-sm:inline-flex max-sm:min-h-11 max-sm:min-w-11 max-sm:items-center max-sm:justify-center max-sm:p-2"
            aria-label="Clear theme and show all reviews"
          >
            Clear
          </button>
        </p>
      )}
    </div>
  )
}

type ThemeMention = { count: number; positive: number; negative: number }

type ThemeChipProps = (typeof THEME_CHIPS)[number] & ThemeMention & {
  isSelected: boolean
  onSelect: (id: ThemeId) => void
}

function ThemeChip(props: ThemeChipProps) {
  const { id, label, count, endIcon, isSelected, onSelect } = props
  const start =
    endIcon === 'remove' ? (
      <img alt="" className="size-4 shrink-0" src={figma.filterChipRemove} width={16} height={16} />
    ) : (
      <div className="size-4 shrink-0 overflow-hidden">
        <img alt="" className="size-full" src={endIcon === 'up' ? figma.filterChipUp : figma.filterChipDown} width={16} height={16} />
      </div>
    )
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      className={[
        'inline-flex h-10 max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 py-3 text-left transition',
        'hover:shadow-[0_2px_4px_0_rgba(2,44,69,0.25)] hover:ring-1 hover:ring-stone-300/60',
        'active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
        isSelected
          ? 'border border-black bg-white shadow-sm'
          : 'border border-transparent',
      ].join(' ')}
      style={{ backgroundImage: isSelected ? undefined : GRADIENT_CHIP }}
    >
      {start}
      <span
        className={[
          'min-w-0 text-sm font-medium leading-5',
          isSelected ? 'text-stone-900' : 'text-[#333]',
        ].join(' ')}
      >
        {label}
      </span>
      <span className="shrink-0 text-xs leading-4 text-[#333] tabular-nums">{count}</span>
    </button>
  )
}

/** 20px AI sparkle; static multi-stop gradient (same stops as :root --ai-grad-* in ai-review-animations.css). */
function ThemeBreakdownAiStarIcon() {
  const uid = useId().replaceAll(':', '')
  const gradId = `theme-mention-ai-star-${uid}`
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5cd72" />
          <stop offset="20%" stopColor="#fc5649" />
          <stop offset="40%" stopColor="#f34474" />
          <stop offset="50%" stopColor="#af65e2" />
          <stop offset="65%" stopColor="#4587fc" />
          <stop offset="80%" stopColor="#9acef3" />
          <stop offset="100%" stopColor="#f5cd72" />
        </linearGradient>
      </defs>
      <path
        d="M2.72897 10.795C1.85225 10.6399 1.85225 9.36009 2.72897 9.205C5.90515 8.64311 8.43138 6.18309 9.12078 2.98067L9.17363 2.73519C9.36331 1.8541 10.5971 1.84862 10.7943 2.72799L10.8585 3.01407C11.5734 6.20136 14.1003 8.64062 17.2677 9.20094C18.1488 9.35683 18.1488 10.6431 17.2677 10.799C14.1003 11.3593 11.5734 13.7986 10.8585 16.9858L10.7943 17.2719C10.5971 18.1513 9.36331 18.1458 9.17363 17.2648L9.12078 17.0193C8.43138 13.8169 5.90515 11.3569 2.72897 10.795Z"
        fill={`url(#${gradId})`}
        stroke={`url(#${gradId})`}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** First theme mention row appearance per page load — plays sheen once (see `.theme-mention-text-sheen-overlay`). */
let themeMentionSheenSessionConsumed = false

function ThemeMentionBreakdown({
  activeTheme,
  sentimentFilter,
  onSetSentiment,
  themeMentions,
  onClear,
  summaryLayout,
}: {
  activeTheme: ThemeId | null
  sentimentFilter: ThemeSentimentKind
  onSetSentiment: (next: ThemeSentimentKind) => void
  themeMentions: Readonly<Record<ThemeId, ThemeMention>>
  onClear?: () => void
  summaryLayout: AiSummaryLayoutVariant
}) {
  const reduceMotion = useReducedMotion() === true
  const [mentionSheenPlay, setMentionSheenPlay] = useState(false)

  useEffect(() => {
    if (activeTheme == null) return
    if (themeMentionSheenSessionConsumed) return
    if (reduceMotion) {
      themeMentionSheenSessionConsumed = true
      return
    }
    setMentionSheenPlay(true)
    const id = globalThis.setTimeout(() => {
      setMentionSheenPlay(false)
      themeMentionSheenSessionConsumed = true
    }, 3080)
    return () => {
      globalThis.clearTimeout(id)
    }
  }, [activeTheme, reduceMotion])

  if (activeTheme == null) return null
  const m = themeMentions[activeTheme]
  if (!m) return null
  const breakdownLabel = getThemeBreakdownLabel(activeTheme, summaryLayout)
  const t = { ...m }

  const mentionLine = (
    <>
      {t.count.toLocaleString()} travelers mention{' '}
      <span className="whitespace-nowrap font-medium">‘{breakdownLabel}’</span>
    </>
  )

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p
        className="min-w-0 text-base leading-6 text-[#333] [letter-spacing:0.05px] sm:flex sm:min-w-0 sm:flex-1 sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1"
        aria-live="polite"
      >
          <span className="relative inline-flex w-full max-w-full flex-wrap items-center justify-start gap-x-1.5 gap-y-1 text-left sm:w-auto">
            <ThemeBreakdownAiStarIcon />
            <span className="inline-grid min-w-0">
              <span className="col-start-1 row-start-1 min-w-0 leading-6 text-[#333]">{mentionLine}</span>
              {mentionSheenPlay ? (
                <span
                  className="theme-mention-text-sheen-overlay col-start-1 row-start-1 min-w-0 leading-6"
                  aria-hidden
                >
                  {mentionLine}
                </span>
              ) : null}
            </span>
          </span>
        <span
          className="mt-5 flex w-full min-w-0 items-center justify-between gap-2 sm:ml-0 sm:mt-0 sm:inline-flex sm:w-auto sm:justify-start sm:gap-2"
        >
          <span className="inline-flex min-w-0 flex-1 items-center gap-3 sm:flex-initial sm:flex-none">
            <button
              type="button"
              disabled={t.positive === 0}
              aria-pressed={sentimentFilter === 'positive'}
              onClick={() => {
                if (t.positive > 0) onSetSentiment('positive')
              }}
              className={[
                'whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium tabular-nums transition',
                'text-[#00A680]',
                t.positive === 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:underline',
                sentimentFilter === 'positive' ? 'bg-[#e6f7f2] ring-1 ring-[#00A680]/35' : '',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#00A680]',
              ].join(' ')}
            >
              {t.positive.toLocaleString()} positive
            </button>
            <button
              type="button"
              disabled={t.negative === 0}
              aria-pressed={sentimentFilter === 'negative'}
              onClick={() => {
                if (t.negative > 0) onSetSentiment('negative')
              }}
              className={[
                'whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium tabular-nums transition',
                'text-[#E03E3E]',
                t.negative === 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:underline',
                sentimentFilter === 'negative' ? 'bg-[#fdeded] ring-1 ring-[#E03E3E]/30' : '',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#E03E3E]',
              ].join(' ')}
            >
              {t.negative.toLocaleString()} negative
            </button>
          </span>
          {onClear != null && (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 self-center p-0 text-right text-sm font-medium text-[#333] underline decoration-[#d9d9d9] decoration-1 underline-offset-2 transition [-webkit-tap-highlight-color:transparent] hover:text-black hover:decoration-[#999] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:hidden"
            >
              Show all reviews
            </button>
          )}
        </span>
      </p>
      {onClear != null && (
        <button
          type="button"
          onClick={onClear}
          className="hidden min-h-0 w-auto min-w-0 shrink-0 rounded-none px-0 py-0.5 text-left text-sm font-medium text-[#333] underline decoration-[#d9d9d9] decoration-1 underline-offset-2 transition [-webkit-tap-highlight-color:transparent] hover:text-black hover:decoration-[#999] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:ml-2 sm:block"
        >
          Show all reviews
        </button>
      )}
    </div>
  )
}

/** 2px ring when idle and under the conic during the intro; matches app neutrals (e.g. #d9d9d9) */
const AI_CARD_BORDER_DEFAULT =
  'linear-gradient(145deg, #d9d9d9 0%, #c9c9c9 40%, #dedede 70%, #d4d4d4 100%)' as const

/** How long the Google-style iridescent border runs after the block becomes visible (ms) */
const AI_BORDER_INTRO_MS = 4_500

type AiBorderPhase = 'wait' | 'play' | 'fade' | 'done'

/**
 * Conic “Google-style” border intro on scroll, then fade to neutral — shared by variant A and B
 * summary cards.
 */
function AiSummaryBorderAnimatedFrame({
  children,
  innerClassName,
}: {
  children: ReactNode
  innerClassName: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [borderPhase, setBorderPhase] = useState<AiBorderPhase>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'done'
      : 'wait',
  )

  useLayoutEffect(() => {
    if (borderPhase !== 'wait') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setBorderPhase('play')
            io.unobserve(e.target)
          }
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [borderPhase])

  useEffect(() => {
    if (borderPhase !== 'play') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const t = window.setTimeout(() => {
      setBorderPhase('fade')
    }, AI_BORDER_INTRO_MS)
    return () => {
      clearTimeout(t)
    }
  }, [borderPhase])

  useEffect(() => {
    if (borderPhase !== 'fade') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const t = window.setTimeout(() => {
      setBorderPhase('done')
    }, 700)
    return () => {
      clearTimeout(t)
    }
  }, [borderPhase])

  const isPlaying = borderPhase === 'play'
  const isFading = borderPhase === 'fade'
  const showRotor = isPlaying || isFading
  const showGlow = isPlaying

  return (
    <div
      ref={wrapRef}
      role="region"
      aria-label="Review summary"
      className={[
        /* 1px ring, fixed — never toggle padding (avoids jump) */
        'ai-border-frame relative overflow-hidden rounded-3xl p-px',
        showGlow ? 'ai-border-card-glow--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: AI_CARD_BORDER_DEFAULT }}
    >
      {showRotor && (
        <div
          className={[
            'ai-border-rotor-google pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%]',
            isFading ? 'ai-border-rotor--exiting' : null,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        />
      )}
      <div
        className={['relative z-10 rounded-[22px] bg-white', innerClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

function AiReviewSummaryBlock({
  activeTheme,
  onSelectTheme,
  onClear,
  themeMentions,
}: {
  activeTheme: ThemeId | null
  onSelectTheme: (id: ThemeId) => void
  onClear: () => void
  themeMentions: Readonly<Record<ThemeId, ThemeMention>>
}) {
  return (
    <AiSummaryBorderAnimatedFrame innerClassName="p-4 sm:rounded-[23px]">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex w-full min-w-0 items-center gap-2 pr-24 sm:pr-0">
          <span
            className="ai-summary-icon-animated shrink-0"
            style={{
              WebkitMaskImage: `url('${figma.aiSparkle}')`,
              maskImage: `url('${figma.aiSparkle}')`,
            }}
            aria-hidden
          />
          <p className="ai-summary-title-animated min-w-0 flex-1 text-base font-bold leading-normal">Review summary</p>
        </div>
        <div className="absolute top-0 right-0 w-fit shrink-0 rounded-md bg-[#f7eeff] px-1 py-0.5 sm:relative sm:top-auto sm:right-auto">
          <p className="whitespace-nowrap text-right text-xs font-medium leading-4 text-[#351560] sm:text-center">
            From past 12 months
          </p>
        </div>
      </div>
      <div className="mt-4">
        <ThemeFiltersSectionHeading activeTheme={activeTheme} onClear={onClear} />
        <p id="theme-filter-desc" className="sr-only">
          Select a theme to filter the review list. Use Clear next to the scroll prompt, or select
          the same theme again, to return to all reviews. When a theme is selected, the visible
          heading may prompt you to scroll for more, and a short breakdown of how many travelers
          mention the theme, and how many positive versus negative mentions, appears below the
          search and sort options, above the review list. The list starts in a default view for
          that theme: mostly positive themes use positive, and the mostly critical audio-headset
          theme uses negative first; use the positive or negative counts to switch.
        </p>
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-describedby="theme-filter-desc"
        >
          {THEME_CHIPS.map((c) => {
            const m = themeMentions[c.id]
            return (
              <ThemeChip
                key={c.id}
                {...c}
                {...m}
                isSelected={activeTheme === c.id}
                onSelect={onSelectTheme}
              />
            )
          })}
        </div>
      </div>
      <hr className="my-4 border-0 border-t border-[#e8e8e8]" />
      <AiThemeSummaryParagraph activeTheme={activeTheme} topSpacing={false} />
      <AiReviewSummarySourceFooter className="mt-4" />
    </AiSummaryBorderAnimatedFrame>
  )
}

type Review = {
  id: string
  pattern: StarKind[] | 'five'
  title: string
  byline: string
  body: string
  readMore?: boolean
  photos?: readonly string[]
  /** Themes for prototype filtering (matches theme chip ids) */
  themes: readonly ThemeId[]
  /**
   * Per-theme mention sentiment. When a theme and sentiment (positive/negative) are active, the
   * list keeps reviews where this matches for the active theme.
   */
  themeSentiment: Partial<Record<ThemeId, ThemeSentimentKind>>
}

function getThemeMentionMap(reviews: readonly Review[]): Record<ThemeId, ThemeMention> {
  return Object.fromEntries(
    THEME_IDS.map((id) => {
      let count = 0
      let positive = 0
      let negative = 0
      for (const r of reviews) {
        if (!r.themes.includes(id)) continue
        const s = r.themeSentiment[id]
        if (s == null) continue
        count += 1
        if (s === 'positive') positive += 1
        if (s === 'negative') negative += 1
      }
      return [id, { count, positive, negative }] as const
    }),
  ) as Record<ThemeId, ThemeMention>
}

/**
 * Prototype reviews; {@link getThemeMentionMap} drives theme chip + “N travelers mention” numbers.
 * Volume is intentionally high so counts feel like a real catalog (updated whenever reviews change).
 */
type CopySlot = { title: string; byline: string; body: string }

function buildPrototypeReviews(): Review[] {
  const p4 = (['solid', 'solid', 'solid', 'solid', 'outline'] as const) as StarKind[]
  const p3 = (['solid', 'solid', 'solid', 'outline', 'outline'] as const) as StarKind[]
  const p2 = (['solid', 'solid', 'outline', 'outline', 'outline'] as const) as StarKind[]
  const p1 = (['solid', 'outline', 'outline', 'outline', 'outline'] as const) as StarKind[]
  const r: Review[] = []
  let n = 0
  const push = (b: Omit<Review, 'id'>) => {
    r.push({ id: `rev-${n++}`, ...b })
  }

  const skipPos: CopySlot[] = [
    {
      title: 'Worth the extra for fast entry',
      byline: 'MeganK_Canada, June 2025',
      body:
        'Honestly the general line looked brutal from the bus stop. We split off with our guide, badges scanned, and we were at the turnstile before I even finished my coffee. Zero regrets.',
    },
    {
      title: 'In and out in under 20 mins',
      byline: 'James, UK · May 2025',
      body:
        "I'm not a morning person and I was dreading another European queue. This was organized — we didn't push, we just kept moving. Kids didn't melt down. Parent win.",
    },
    {
      title: 'Skip was legit',
      byline: 'A_Rodriguez_77, Mar 2025',
      body:
        'I read a ton of “skip the line is fake” reviews. For us it wasn’t. Arrived 15 min early, group went through the priority lane, security was a breeze. Would book again.',
    },
    {
      title: 'Saved our afternoon',
      byline: 'Tom & Lisa, US · Apr 2025',
      body:
        'We only had a half day in the city. Being inside while other people were still coiling around the piazza felt almost unfair, but in a good way. Guide had our tickets on her phone, smooth.',
    },
    {
      title: 'Husband uses a cane — this helped a lot',
      byline: 'Brenda S., Australia',
      body:
        "Standing in one spot for 90+ minutes just wasn't an option. Shorter access path, fewer bottlenecks. The skip isn't magic but it cut the wait enough that he made it the whole way.",
    },
    {
      title: 'Felt VIP without being obnoxious',
      byline: 'ChiaraB, May 2025',
      body:
        'I hate feeling like I’m buying privilege but the museum was packed and I didn’t have to use half my vacation in a line. Felt more like a reservation than a stunt.',
    },
    {
      title: 'Get this if you hate lines',
      byline: 'Anonymous, Feb 2025',
      body: 'I’m 6’3” and still got boxed in a crowd once we were *inside* — I can only imagine the main gate. The timed entry with this tour actually worked.',
    },
  ]
  for (const o of skipPos) {
    push({
      pattern: 'five',
      ...o,
      themes: ['skip-the-line' as const],
      themeSentiment: { 'skip-the-line': 'positive' as const },
    })
  }

  const skipNeg: CopySlot[] = [
    {
      title: '“Skip” still means a crowd at meet-up',
      byline: 'Evan P., Mar 2025',
      body:
        'The ticket said skip. What it didn’t say was 40 people in matching stickers waiting on one corner while three other groups argued about radios. I’d rather queue alone in peace than that chaos.',
    },
    {
      title: 'We still waited. Long.',
      byline: 'Heloise_M, Apr 2025',
      body:
        'Maybe 35 minutes? Maybe 50? I stopped counting. They blamed security but the “priority” line moved just as slow as the people next to us. Felt scammed relative to the price jump.',
    },
    {
      title: 'Not worth the premium for us',
      byline: 'DG · Feb 2025',
      body:
        "If I’d just arrived at 7:30 with a prebooked ticket I think I’d be in the same place. Maybe we got unlucky. Didn't feel 2x better than a normal line.",
    },
  ]
  for (const o of skipNeg) {
    push({ pattern: p2, ...o, themes: ['skip-the-line' as const], themeSentiment: { 'skip-the-line': 'negative' as const } })
  }

  const sistinePos: CopySlot[] = [
    {
      title: 'Neck still hurts, zero regrets',
      byline: 'Luis G., Mar 2025',
      body:
        'I knew the ceiling from posters. Seeing it in person the colors just hit different. Yes it’s full of people and you don’t get to lounge — you still do it. Bucket list for real.',
    },
    {
      title: 'Short time but unforgettable',
      byline: 'Norah, Ireland · May 2025',
      body:
        'The guard basically herds everyone through but we knew that going in. 15 min of gawking and trying not to trip. If you get even one minute with the right lighting it’s enough.',
    },
    {
      title: 'Brought a compact binoculars — yes really',
      byline: 'Franklin_T, Apr 2025',
      body: 'Dorky but the detail in the far corners? Worth the pocket space. Otherwise you’re just staring at a beautiful blur.',
    },
    {
      title: 'Crowded, loud, and I’d still go back',
      byline: 'Yumi · June 2025',
      body:
        'I’m an introvert. It was a lot. But the Last Judgment wall is wild in person, all that muscle and stress in the bodies. Felt more human than any photo.',
    },
    {
      title: 'Guide’s prep made the 10 min count',
      byline: 'Peter & Jen, US',
      body:
        "She had us look at a mini print first so I wasn't lost when we walked in. Otherwise I'd have been craning and confused. She knew people would be rushed.",
    },
    {
      title: 'Cried a little, not even embarrassed',
      byline: 'Renee D., Mar 2025',
      body:
        "I’m not religious, just tired from travel. Then you're in that room and the hush is real. Something about 500 year old paint under one roof. Didn't see that coming.",
    },
    {
      title: 'Photos not allowed, thank goodness',
      byline: 'Leo, Spain · 2025',
      body: 'No screens glowing everywhere — for once people actually looked up. Refreshing, even with the shuffling and elbows.',
    },
  ]
  for (const o of sistinePos) {
    push({ pattern: p4, ...o, themes: ['sistine-chapel' as const], themeSentiment: { 'sistine-chapel': 'positive' as const } })
  }

  const sistineNeg: CopySlot[] = [
    {
      title: 'Closed. Email didn’t say.',
      byline: 'B.Mitchell, Conclave week',
      body:
        "We understood things change. What we don't understand is finding out in the courtyard from another tourist. A push notification would have been nice.",
    },
    {
      title: 'Felt more like a conveyor belt',
      byline: 'Tasha W., Apr 2025',
      body:
        "If you're claustrophobic, skip. Guards whistle, everyone shuffles, you're out before your eyes adjust. I get why they do it — doesn’t make it a ‘spiritual’ moment for me personally.",
    },
  ]
  for (const o of sistineNeg) {
    push({ pattern: p2, ...o, themes: ['sistine-chapel' as const], themeSentiment: { 'sistine-chapel': 'negative' as const } })
  }

  const valuePos: CopySlot[] = [
    {
      title: 'We ran the numbers — still cheaper than DIY',
      byline: 'AccountantHank, US',
      body: 'Entry + metro + a bad lunch in Rome = more than I paid here with the guide. Not fancy but solid math.',
    },
    {
      title: 'Would pay again for the earpiece alone',
      byline: 'Min-Ji, S. Korea · 2025',
      body: 'Halls are long. Having someone in your ear explaining *why* the map room matters beats reading Wikipedia with dead phone battery.',
    },
    {
      title: 'Good use of 4 hours',
      byline: 'Carlos & Mateo, May 2025',
      body: "We could've wandered and missed half the floors. Felt we hit the big rooms without the panic googling. Value for us was the route, not a fancy lunch after.",
    },
  ]
  for (const o of valuePos) {
    push({ pattern: p4, ...o, themes: ['good-value' as const], themeSentiment: { 'good-value': 'positive' as const } })
  }

  push({
    pattern: p2,
    title: 'Paying to stand in a hallway is rough',
    byline: 'Sheila O., Mar 2025',
    body:
      'Half the “tour” was us waiting for another group to move. I get delays happen, but the clock didn’t stop. Felt like I paid a premium to wait indoors instead of out.',
    themes: ['good-value' as const],
    themeSentiment: { 'good-value': 'negative' as const },
  })

  const smallPos: CopySlot[] = [
    {
      title: 'Thirteen of us, actually counted',
      byline: 'Harriet, New Zealand',
      body:
        "Guide would literally turn around to check if stragglers were ok. I’ve been on 40-person 'small' tours. This was the first time the headcount felt honest.",
    },
    {
      title: 'I asked three dumb questions',
      byline: 'Derek, Canada',
      body: "He laughed (kindly) and answered all of them. I wouldn't have had the nerve in a 50 person blob.",
    },
    {
      title: 'Husband is hard of hearing on one side',
      byline: 'Gina L., US',
      body: 'We could always stay close enough to catch her without sprinting. Radio helped too. If it had been 30+ people I think we would have bailed partway through.',
    },
  ]
  for (const o of smallPos) {
    push({ pattern: p3, ...o, themes: ['small-group' as const], themeSentiment: { 'small-group': 'positive' as const } })
  }

  const smallNeg: CopySlot[] = [
    {
      title: '“Small” is doing a lot of work in the ad copy',
      byline: 'J.F., UK · Apr 2025',
      body: 'I stopped counting at 30. Maybe they merged with another company last minute. Left a bad taste relative to the brochure photo of six smiling people.',
    },
    {
      title: 'Couldn’t hear a word past the third room',
      byline: 'Amir, Toronto',
      body:
        'I’m 5’6" and the guide is fine but when you have three rows of people with backpacks you’re just watching necks. Don’t call it intimate.',
    },
  ]
  for (const o of smallNeg) {
    push({ pattern: p2, ...o, themes: ['small-group' as const], themeSentiment: { 'small-group': 'negative' as const } })
  }

  const expertPos: CopySlot[] = [
    {
      title: 'She had receipts for the Renaissance beef',
      byline: 'Claire V., art teacher',
      body: 'The Raphael vs Michelangelo bit wasn’t a joke — she walked us through what was propaganda vs what the contracts actually said. I teach this stuff; she knew more than my textbook blurb.',
    },
    {
      title: "Didn't know I needed papal real estate law",
      byline: 'Steve_runs_hills, US',
      body: 'Genuinely fun tangents about which pope paid for which wing. I thought I was here for paintings. Left with a head full of power politics. Not boring once.',
    },
  ]
  for (const o of expertPos) {
    push({ pattern: 'five', ...o, themes: ['expert-guide' as const], themeSentiment: { 'expert-guide': 'positive' as const } })
  }

  push({
    pattern: p4,
    title: 'Finally — no scratchy screech',
    byline: 'Moira, Scotland',
    body:
      'I’ve been on way too many tours with cheap packs that make everyone sound like a robot on helium. This one was clear, could adjust volume without removing the whole thing from my head.',
    themes: ['audio-headsets' as const],
    themeSentiment: { 'audio-headsets': 'positive' as const },
  })

  const audioNeg: CopySlot[] = [
    {
      title: 'Spent 20 min pairing mine',
      byline: 'Chuck, Apr 2025',
      body: 'The channel kept hopping. I missed half the first gallery while a guy in a vest tried to resync. Not relaxing.',
    },
    {
      title: 'Died right before the Raphael rooms',
      byline: 'Ingrid, Germany',
      body: "They had a backup but the backup had tape on it. I followed along reading placards. Defeated the point.",
    },
    {
      title: 'Hurt behind my ear after 2 hours',
      byline: 'Jules, US',
      body: 'Might be my glasses arms + plastic combo. I ended up just holding the speaker. Looked silly but I could hear again.',
    },
    {
      title: 'Sounded like a walkie in a well',
      byline: 'Tony_M, May 2025',
      body: "Echo, crackle, half sentences. I kept looking at the guide to lip-read. I'd rather hear nothing and read the walls.",
    },
  ]
  for (const o of audioNeg) {
    push({ pattern: p1, ...o, themes: ['audio-headsets' as const], themeSentiment: { 'audio-headsets': 'negative' as const } })
  }

  // --- More reviews so theme totals read like a real product (chips = {@link getThemeMentionMap}) ---

  const t = (title: string, byline: string, body: string): CopySlot => ({ title, byline, body })

  const skipPosExtra: CopySlot[] = [
    t('Second year in a row with this add-on', 'Greta, Sweden', "Last year I winged it and lost an hour. This time we were past the first checkpoint while I could still see our hotel from the window."),
    t('Teen actually put her phone down', 'Rob_NJ, May 2025', "I expected eye rolls. She was just relieved we weren’t the family stuck in the switchback. I’ll call that a win."),
    t('Heat wave day — this saved us', 'Imani K., Aug 2025', 'It was 36°C. Even a 25 minute line would have been dangerous for my mom. We got in before the sun hit the courtyard full blast.'),
    t('Business trip, one shot', 'D.Wu, Singapore', "I had one morning. The skip didn’t get me a private room but it did get me in the door before my flight anxiety spiraled."),
    t('Worth it with two kids under 8', 'Sofia + fam, Mar 2025', 'Strollers, bathroom breaks, snack stops — the less time in a static line, the better. We used every minute *inside* instead of counting tiles.'),
    t('Arrived 8 min late, still made it', 'EddieC, Apr 2025', "I was that person. They held the group at the second gate, not the first. I was stressed but I didn’t miss the day."),
    t('Compared to Paris last fall', 'Marla, US', "That museum was a disaster. This felt… managed. Not perfect, but the line experience was night and day."),
    t('Elderly parents in tow', 'Joon, Canada', "Dad doesn’t do well with shoving. The priority line was wider, less shove-y. That alone was worth the fee to me."),
    t('I’m a planner and I still needed this', 'H.B., UK', "I had PDFs, screenshots, and I still would have panicked. Having a human with a lanyard say 'this way' was stupidly calming."),
    t('Audio tour later in the day', 'L.R., Oct 2025', "We did the main hall first, break for coffee, back for the smaller rooms. Skip let us split the day without re-queueing from zero."),
    t('Solo traveler — no drama', 'Carmen, Mexico', "I don’t love asking strangers to hold a spot. I paid not to need that social awkwardness. Worked."),
    t('Bachelorette weekend, half hungover', 'Kiki + 3, Jun 2025', "Not our finest morning. The fact we didn’t stand in a spiral of regret for an hour? Priceless. Don’t ask about the rest."),
    t('Last ticket window of the day', 'Naveed, Mar 2025', "I was sure we’d be rushed out. We still had enough buffer that the ‘skip’ part didn’t feel like a prank at 4pm."),
    t('Group text was wrong about the gate', 'M.O., US', "Half our friends went to the wrong side of the piazza. The tour meetup + skip route was the only part that actually worked as written."),
    t('Wheelchair + companion', 'Pat & Jo, May 2025', "The accessible path is still busy but we weren’t stuck behind a family of 12 with one scanner. That difference matters."),
    t('Honeymoon, didn’t want to bicker', 'Alicia & Sam, Apr 2025', "We promised not to fight on day 3. Not waiting 90 min in a fight-or-flight line helped keep the peace. Cheaper than therapy."),
    t('Photographer, heavy backpack', 'Felix, DE', "Security still checked me, but the queue length was the real enemy. I’d miss light in the side galleries if I’d been outside longer."),
    t('Third visit to Rome, first time I did this', 'Vittorio, IT', "I used to be snobby about ‘tourist’ tickets. I’m reformed. My knees are not 25 anymore."),
  ]
  for (const o of skipPosExtra) {
    push({ pattern: 'five', ...o, themes: ['skip-the-line' as const], themeSentiment: { 'skip-the-line': 'positive' as const } })
  }

  const skipNegExtra: CopySlot[] = [
    t('Meetup was a free-for-all', 'SJ88, Mar 2025', "Fifty people with the same email printout. I’m not sure the skip even applied until we were already grumpy."),
    t('Faster line, same crush inside', 'Lena, Apr 2025', "You outrun the gate but the rooms are still packed. Felt a bit like paying to stand in a different kind of line."),
    t('Guide was 22 min late', 'Mitch, May 2025', "The skip is tied to a group. No guide on time = you’re not skipping anything, you’re just waiting with branded stickers."),
    t('“Priority” merged with everyone else', 'NoraD, Jun 2025', "We hit one scanner and then fed into the same blob as people who came off the bus. Felt like marketing."),
    t('Not clear it was for groups only', 'Beth, US', "I’m an independent traveler. I got pushed into a corral with 30 families. Not my scene."),
    t('Saved 12 min, paid a lot for it', 'Gareth, Apr 2025', "I timed it. Math wasn’t in my favor. I should’ve read the small print on what ‘skip’ actually means here."),
  ]
  for (const o of skipNegExtra) {
    push({ pattern: p2, ...o, themes: ['skip-the-line' as const], themeSentiment: { 'skip-the-line': 'negative' as const } })
  }

  const sistinePosExtra: CopySlot[] = [
    t('Colors don’t look like the postcards', 'Ana, Brazil', "More muted, more human, less plastic. I liked the real version better, weirdly."),
    t('I went for the side walls too', 'Quentin, FR', "Everyone looks up. The side panels are a whole other story. Worth stealing a glance on the way out when they whistle."),
    t('Brought my dad who never does museums', 'Riley, AUS', "He actually shut up, which is rare. He’s still talking about the ceiling a week later."),
    t('Short, loud, and still a highlight', 'Eva, Norway', "If you know it’s 12 minutes, you can pace yourself. If you think it’s an hour, you’re mad."),
    t('Restoration stories hit harder in person', 'Kurt, US', "Knowing what was repainted, what’s original — changes how you look at a crack. Guide context helped a lot here."),
    t('Didn’t love the shushing atmosphere', 'Priya, UK', "A bit pompous, but the art earns it. The ceiling is the main character; we’re the extras. Fine."),
    t('Came in with low expectations', 'Hugo, ES', "Crowds online look awful. In person, yes, crowded, but the volume of the room isn’t a photo. You get why it’s famous."),
    t("I'm 5'2\" and could still see enough", 'Ming, US', "Not a perfect line of sight, but the central panels read well enough if you know where to stand for 30s."),
    t('Gift shop didn’t ruin it', 'Dana, IRL', "I usually hate the exit through merch. I still floated out a bit. Buy the poster later online anyway."),
    t('Night before I watched a 20m doc', 'Caleb, US', "Cheesy but the doc + being there made the figures click. Otherwise it’s just pretty paint."),
    t('Elderly volunteer told us to look left first', 'Trudy, US', "Random, but it helped. Sometimes stranger tips beat the app."),
    t('More emotional than the Colosseum for me', 'Fede, AR', "Different kind of power. Slower, quieter stress in the work. I wasn’t ready."),
    t('I thought I’d feel rushed, didn’t', 'Asha, IN', "The guards are strict, but 10 focused minutes is enough if you know what to look for."),
    t('Sound of shoes on marble added something', 'Leif, NO', "Weird thing to say. But the hush and the shuffling is part of the place."),
    t('Brought compact zoom lens — borderline', 'Mira, US', "Security side-eyed me. I get it. Didn’t use it inside anyway — rules are rules. Still looked with eyes."),
    t('Second visit 15 years later', 'Olivia, NZ', "Felt older, the ceiling looks older in a good way. Still hits."),
    t('Cried at the Last Judgment, not the ceiling', 'Beth, CA', "Different kind of claustrophobia. Bodies piling, terror. I wasn’t ready for *that* wall emotionally."),
    t('Tour kids were loud, not the art’s fault', 'JP, US', "Still worth it. Put headphones on mentally and look up. The chaos is the price of a living monument."),
    t('Would still go on a “bad” day', 'Kiran, IN', "If the worst thing is a crowd, you’re in the luckiest art fight of your life. Still 5* for the room itself."),
  ]
  for (const o of sistinePosExtra) {
    push({ pattern: p4, ...o, themes: ['sistine-chapel' as const], themeSentiment: { 'sistine-chapel': 'positive' as const } })
  }

  const sistineNegExtra: CopySlot[] = [
    t('Too many bodies for “reverent”', 'Ivy, US', "I get it’s a church-y vibe but it’s also a sardine can. Spirituality and BO don’t mix for me idk."),
    t('Guards more memorable than the art', 'Wale, UK', "Whistles, arms out, 'move' — the enforcement theatre was half my memory. Tired of being scolded while paying full price."),
    t('My claustrophobia spiked', 'Celine, CA', "I knew the risk. Still thought I could muscle through. Had to step out. Not a knock on the art, just a warning to anxious folks."),
    t('Lighting was harsher than I wanted', 'Orla, IRL', "I wanted soft glow, got a bit of glare and a lot of heads. Felt more warehouse than spiritual."),
    t('Exit felt like a fire drill', 'Theo, DE', "They funnel you through gift shop energy even before you want to look back. I left annoyed instead of awed. Personal reaction."),
  ]
  for (const o of sistineNegExtra) {
    push({ pattern: p2, ...o, themes: ['sistine-chapel' as const], themeSentiment: { 'sistine-chapel': 'negative' as const } })
  }

  const valuePosExtra: CopySlot[] = [
    t('Bundled with guide = fewer dumb mistakes', 'Amber, US', "I would’ve walked past half the good rooms following the wrong arrow on Google Maps. Guide paid for itself in not-wasted time."),
    t('Kid ticket math worked out', 'Fiona, IRL', "I compared ticket window prices + the chaos tax. This netted lower stress per euro."),
    t('Came from a cruise, zero patience', 'Rodrigo, BR', "Cruise people know: time is a trap. I didn’t have capacity to self-navigate. Happy I didn’t have to think."),
    t('Split the cost 4 ways', 'The Quad, Apr 2025', "Dorm friend trip. $ per person for not losing each other? Fine."),
    t('Included radio vs renting elsewhere', 'Yvette, US', "Price-comparable, less hassle. I value one receipt."),
    t('I’d pay for route alone again', 'Hank2, US', "Not gourmet, not luxury — but efficient. That’s the value to me: efficiency."),
    t('Pensioner discount + tour still better', 'Urs, CH', "Even with my pass discounts, the packaged route beat my spreadsheet once I factored in lunch mistakes."),
    t('Avoided a scammy unofficial guide', 'Jada, ZA', "I almost booked a rando in the piazza. This felt legit, bonded, and not ‘surprise extra fees’."),
    t('Student budget, still worth it', 'Erin, US', "I skimped on dinner after. No regrets. Art > pasta that night."),
    t('Corporate card, I’m not the accountant', 'Marcus, UK', "But the receipt story was: fewer line items, fewer line headaches. Approve/10."),
    t('Compared to a bad taxi day in Rome', 'Irfan, IN', "That 40€ mistake taught me: pay once for a tight plan, then relax."),
    t('Anniversary, didn’t want to bicker about money', 'Val & Oli, US', "We set the budget for ‘don’t talk about it’ peace. It worked. Worth 10/10 in marriage points."),
  ]
  for (const o of valuePosExtra) {
    push({ pattern: p4, ...o, themes: ['good-value' as const], themeSentiment: { 'good-value': 'positive' as const } })
  }

  const valueNegExtra: CopySlot[] = [
    t('Hidden add-ons at the gate', 'Drew, US', "Price on the page wasn’t the price at the entrance after ‘mandatory’ fees. Left a bad taste even if the day was fine."),
    t('Could’ve self-guided for half', 'Irene, IT', "I go to churches for free. Paying a premium for what felt like a playlist on shuffle didn’t add up to me personally."),
    t('Rescheduled fee felt sneaky', 'Baz, AUS', "We had a medical flight change. The flex fee ate any ‘savings’ vs walking up."),
    t('Lunch recommendation was a tourist trap', 'Li, US', "Small thing, but if ‘value’ includes restaurant tips, I didn’t get value. Sandwich was 18€. Come on."),
  ]
  for (const o of valueNegExtra) {
    push({ pattern: p2, ...o, themes: ['good-value' as const], themeSentiment: { 'good-value': 'negative' as const } })
  }

  const smallPosExtra: CopySlot[] = [
    t('Fifteen max, actually', 'Brynn, US', "She said 15, I counted. Refreshing. I’ve been promised 'small' before and it was 40."),
    t('We could ask dumb questions in private', 'Geoff, CA', "She let us loiter 30s after a question. Big tour would’ve rolled eyes."),
    t('Husband uses a rollator', 'Darlene, US', "Bigger group would have left us behind. This was manageable."),
    t('Took a photo of the group size in my notes', 'Skyler, US', "Receipts! I was ready to chargeback if it wasn’t 12. It was 11. Good enough."),
    t('Guide remembered our names on hour 2', 'Heather, US', "Sounds small. It made us behave better tbh. Humans not cattle."),
    t('Could hear without yelling', 'Aidan, IRL', "I usually lip-read. This group was tight enough the guide wasn’t 50 feet away."),
  ]
  for (const o of smallPosExtra) {
    push({ pattern: p3, ...o, themes: ['small-group' as const], themeSentiment: { 'small-group': 'positive' as const } })
  }

  const smallNegExtra: CopySlot[] = [
    t('Merged with another bus at the gate', 'Luisa, US', "Suddenly 26 people, one guide. I get logistics; I don’t get calling it a small experience."),
    t('Backpacks at ear level', 'Dan, AUS', "I’m short. I saw nylon all day. Not the guide’s fault, but the group was too wide for the halls."),
    t('Photo stops turned into a queue', 'Mei, US', "Three people at a time, rest waiting. Felt like a line inside a 'small' group. Irony noted."),
    t('Still better than 60', 'Kris, UK', "So 2* not 1* — but don’t expect boutique if you’re in peak season. Manage expectations."),
    t('Strangers at every turn', 'Paula, UK', "We kept bumping into a second 'small' pack from the same company. Felt like 24 in a narrow hall."),
    t('Pace set by the slowest', 'Gabe, US', "Fair in theory, but 16 different bathroom clocks meant we always waited. Felt full anyway."),
    t('Still felt like a bubble tour', 'Ren, JP', "Small, yes — but the bubble was 18 people in matching stickers. I wanted solo freedom more than small."),
  ]
  for (const o of smallNegExtra) {
    push({ pattern: p2, ...o, themes: ['small-group' as const], themeSentiment: { 'small-group': 'negative' as const } })
  }

  const expertPosExtra: CopySlot[] = [
    t('Knew the ceiling dates without looking at her notes', 'Nadia, US', "I test guides. She passed. I asked a weird follow-up; she had the answer. Respect."),
    t('Tied the art to the politics of the day', 'Oren, IL', "Not a dry list of names. She made you feel why a pope would pay for a ceiling like that. Helped the whole day click."),
    t('Spoke clearly for non-native English', 'Pilar, ES', "I’m B2. She didn’t mumble, didn’t rush, checked in if we were with her. Big deal."),
    t('Handled a rude tourist gracefully', 'Yvonne, US', "Some guy talked over her. She pivoted, didn’t escalate. The rest of us appreciated the professionalism."),
    t('Answered my kid’s question without dumbing it down', 'Owen, US', "My 12yo stumped us with a theology question. The guide met her at eye level. I almost teared up."),
    t('Connected sculpture to things we’d seen in Florence', 'Marta, IT', "We’d been in Uffizi two days before. She threaded the story. I love when guides respect your trip arc."),
    t('No script voice', 'Jules2, US', "Some tours sound like TTS. She had opinions, even mild hot takes. Felt human."),
  ]
  for (const o of expertPosExtra) {
    push({ pattern: 'five', ...o, themes: ['expert-guide' as const], themeSentiment: { 'expert-guide': 'positive' as const } })
  }

  const expertNegExtra: CopySlot[] = [
    t('Facts felt Wikipedia-speed', 'Quinn, US', "A firehose of names. I zoned out after 20 minutes. Needed fewer stats, more story threads."),
    t('Accent was hard in echoey halls', 'Bjorn, NO', "Not a knock on the person — just the conditions. I caught maybe 60% and read plaques for the rest."),
    t('Felt more like a lecturer than a guide', 'Aisha, UK', "Good info, but no air in the room for questions. I stopped raising my hand after two brush-offs."),
    t('Crick in my neck from the pace', 'Dante, US', "We were always half a room behind. She would start before half of us were through the door."),
    t('Good with art, not with time checks', 'Ellie, AUS', "I missed a bathroom break because the window was unclear. I blamed the plan, not the art."),
    t('Dad jokes in the Sistine line', 'Van, US', "Some of us like levity, some wanted quiet awe. Read the room energy was one star."),
    t('Too many tangents, lost the through-line', 'Pri2, IN', "Every room started a new Wikipedia tab in my head. I wanted one story with chapters."),
    t('I wanted depth, got breadth', 'Joel, CA', "A mile wide and an inch deep on a dozen pieces. I’d have taken half the works with real detail."),
    t('Hard to follow in the long halls', 'Renee, UK', "She knew her stuff, but the pacing was off—half the group was still entering while she was three paintings ahead. I only caught every third sentence."),
    t('Mic clipped, voice dipped', 'Hassan, US', "I asked her to turn up; she said it was max. Maybe the room ate the high end, but I fought the audio more than the crowds."),
    t('Tour guide, not a story guide', 'Petra, DE', "Dates and room numbers—fine. I was hoping for one tight narrative. It felt more like a museum inventory read aloud."),
  ]
  for (const o of expertNegExtra) {
    push({ pattern: p2, ...o, themes: ['expert-guide' as const], themeSentiment: { 'expert-guide': 'negative' as const } })
  }

  const audioPosExtra: CopySlot[] = [
    t('Crisp in the map room', 'Ivy2, US', "Echoey space, but the mix was good. I could still hear the soft jokes she threw in."),
    t('Left channel died, they swapped in 2 min', 'Mando, US', "Stuff happens. Team had a plan. I didn’t miss the next beat."),
  ]
  for (const o of audioPosExtra) {
    push({ pattern: p4, ...o, themes: ['audio-headsets' as const], themeSentiment: { 'audio-headsets': 'positive' as const } })
  }

  const audioNegExtra: CopySlot[] = [
    t('Sanitize between groups — still gross', 'Vera, US', "I get they wipe them. They still feel like rental bowling shoes for your face. Not the tour’s fault fully, but yuck."),
    t('Wind noise on the roof terrace', 'Cody, US', "Outside leg of the day the mic had static. I cupped the earpiece like it was 2003."),
    t('Shared channel = hearing other groups', 'Faye, US', "Wrong frequency for 5 minutes. Comedy of errors. Fixed, but I missed a whole paragraph."),
    t('Ear infection paranoia', 'Luz, US', "Yes I used the wipe. Still overthought it. Maybe I should’ve just read the book."),
    t('Battery icon lied', 'Miles, AUS', "Said 80%, died 10 min later. Gave up and shadowed the guide. Worked, but I paid for audio not cardio."),
    t('Lost signal behind thick walls', 'Noor, US', "Old building + RF = not always the gear’s fault. Annoying anyway."),
    t('Squeal when two packs got close', 'Gus, US', "If you get near someone on the same channel, feedback. Happened in a tight spiral staircase."),
  ]
  for (const o of audioNegExtra) {
    push({ pattern: p1, ...o, themes: ['audio-headsets' as const], themeSentiment: { 'audio-headsets': 'negative' as const } })
  }

  // Multi-theme “hero” (photos); counts in shared buckets
  push({
    pattern: p4,
    title: 'Bigger in person than the Netflix doc made it look',
    byline: 'Tim S., family trip · May 2025',
    body:
      'Came in skeptical — thought we’d be rushed and bored. The museums are a maze in a good way, marble everywhere, random corridor turns into a ceiling you can’t unsee. Chapel was roped (event day) so we only got the back half of the plan, but our guide didn’t just shrug; she reordered the day so we still left feeling we got the money’s worth. Kids asked fewer “how much longer” questions than usual, which I’ll count as a miracle. Bring water and a sense of humor about stairs.',
    photos: [figma.reviewPhoto1, figma.reviewPhoto2, figma.reviewPhoto3, figma.reviewPhoto4],
    themes: ['sistine-chapel', 'expert-guide', 'good-value' as const],
    themeSentiment: {
      'sistine-chapel': 'positive' as const,
      'expert-guide': 'positive' as const,
      'good-value': 'positive' as const,
    },
  })
  return r
}

const REVIEWS: Review[] = buildPrototypeReviews()
const THEME_MENTIONS: Readonly<Record<ThemeId, ThemeMention>> = getThemeMentionMap(REVIEWS)

function ReviewsListBlock({
  reviews,
  listKey,
}: {
  reviews: readonly Review[]
  listKey: string
}) {
  const reduce = useReducedMotion() === true
  const tFast = reduce ? 0.01 : 0.2

  return (
    <AnimatePresence mode="sync" initial={false}>
      {reviews.length === 0 ? (
        <motion.p
          key="no-reviews"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: tFast, ease: [0.4, 0, 0.2, 1] }}
          className="text-base text-[#4d4d4d]"
        >
          No reviews match this filter yet.
        </motion.p>
      ) : (
        <motion.div
          key={listKey}
          className="flex flex-col gap-12"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: tFast, ease: [0.4, 0, 0.2, 1] }}
        >
          {reviews.map((r) => (
            <ReviewBlock key={r.id} r={r} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ReviewBlock({ r }: { r: Review }) {
  const pat: StarKind[] =
    r.pattern === 'five' ? (['solid', 'solid', 'solid', 'solid', 'solid'] as const) : r.pattern
  return (
    <div className="flex w-full max-w-[864px] items-start justify-center gap-3">
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <div className="space-y-2">
            <div className="space-y-2">
              <FigmaStarRow pattern={pat} size={16} />
              <p
                className="text-base font-bold leading-[1.4] text-black"
                style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
              >
                {r.title}
              </p>
            </div>
            <p className="text-sm leading-normal text-[#4d4d4d]">{r.byline}</p>
          </div>
        </div>
        <div className="space-y-4 text-base leading-normal text-black">
          <p className="whitespace-pre-wrap">{r.body}</p>
          {r.readMore && <ReadMore onClick={() => {}} />}
          {r.photos && r.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {r.photos.map((src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-md"
                >
                  <img alt="" className="h-full w-full object-cover" src={src} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pt-0.5">
        <Upvote />
      </div>
    </div>
  )
}

function Pagination() {
  const items: { key: string; t: string; current?: boolean }[] = [
    { key: '1', t: '1' },
    { key: 'e1', t: '...' },
    { key: '6', t: '6' },
    { key: '7', t: '7', current: true },
    { key: '8', t: '8' },
    { key: 'e2', t: '...' },
    { key: '15', t: '15' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-white"
        aria-label="Previous page"
      >
        <img alt="" className="size-5" src={figma.pagePrev} />
      </button>
      {items.map((it) => (
        <div
          key={it.key}
          className={[
            'flex size-10 items-center justify-center rounded-full text-base font-medium',
            it.current ? 'bg-black text-white' : 'bg-white text-black',
          ].join(' ')}
        >
          {it.t}
        </div>
      ))}
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-white"
        aria-label="Next page"
      >
        <img alt="" className="size-5" src={figma.pageNext} />
      </button>
    </div>
  )
}

type ReviewsFigmaReplicaProps = {
  /** `a` = conic + paragraph + theme chips; `b` = [Figma 20579:86717](https://www.figma.com/design/5lTovMIkLFFcyrjQUTRGbY/Q2-Decide-Availability-2026?node-id=20579-86717) matrix, no chips in the card. */
  summaryLayout?: AiSummaryLayoutVariant
}

export function ReviewsFigmaReplica({ summaryLayout = 'a' }: ReviewsFigmaReplicaProps) {
  const [activeTheme, setActiveTheme] = useState<ThemeId | null>(null)
  const [sentimentFilter, setSentimentFilter] = useState<ThemeSentimentKind | null>(null)
  const reviewsFilterRef = useRef<HTMLDivElement>(null)
  const pendingMatrixScrollToFilter = useRef(false)

  const scrollToReviewsFilter = useCallback(() => {
    const el = reviewsFilterRef.current
    if (el == null) return
    // After commit/paint so the list isn’t mid-unmount; scroll-margin keeps 48px below top.
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  useEffect(() => {
    if (!pendingMatrixScrollToFilter.current) return
    pendingMatrixScrollToFilter.current = false
    scrollToReviewsFilter()
  }, [activeTheme, sentimentFilter, scrollToReviewsFilter])

  useEffect(() => {
    if (activeTheme == null) {
      setSentimentFilter(null)
    }
  }, [activeTheme])

  const filteredReviews = useMemo(() => {
    if (activeTheme == null) return REVIEWS
    let list = REVIEWS.filter((r) => r.themes.includes(activeTheme))
    const effectiveSentiment: ThemeSentimentKind = sentimentFilter ?? 'positive'
    list = list.filter((r) => r.themeSentiment[activeTheme] === effectiveSentiment)
    return list
  }, [activeTheme, sentimentFilter])

  const reviewListKey = useMemo(
    () =>
      `${activeTheme ?? 'all'}|${sentimentFilter ?? 'all'}|${filteredReviews.map((r) => r.id).join('|')}`,
    [activeTheme, sentimentFilter, filteredReviews],
  )

  /** Only used for variant A (chips in {@link AiReviewSummaryBlock}): toggle theme, never auto-scroll. */
  const onSelectTheme = (id: ThemeId) => {
    setActiveTheme((prev) => {
      const next = prev === id ? null : id
      if (next === null) {
        setSentimentFilter(null)
      } else {
        setSentimentFilter(defaultSentimentOnThemeSelect(id))
      }
      return next
    })
  }

  /** Variant B matrix: column only picks the theme; breakdown + list default to positive (same as chips), including “neutral/remove” and minus-column themes. */
  const onMatrixThemeClick = (id: ThemeId, _column: 'pos' | 'neg') => {
    if (activeTheme === id) {
      requestAnimationFrame(() => scrollToReviewsFilter())
      return
    }
    setSentimentFilter(defaultSentimentOnThemeSelect(id))
    setActiveTheme(id)
    pendingMatrixScrollToFilter.current = true
  }

  const clearReviewFilters = () => {
    setActiveTheme(null)
    setSentimentFilter(null)
  }

  return (
    <div className="w-full border-t border-[#d9d9d9] bg-white">
      <div className="mx-auto flex w-full max-w-[864px] flex-col gap-12 px-0 py-10 sm:py-12">
        {/* Traveler photos */}
        <section className="space-y-6" aria-labelledby="traveler-photos-h">
          <h2
            id="traveler-photos-h"
            className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black"
          >
            Traveler Photos
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <div className="relative h-[200px] min-h-[200px] flex-1 overflow-hidden rounded-lg sm:h-[320px] sm:min-h-[320px]">
              <img
                alt=""
                className="absolute inset-0 size-full object-cover"
                src={figma.travelPhotoHero}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              {/*
                Fixed row heights so intrinsic photo dimensions cannot stretch the grid (was min-h only).
                sm top row: 320 − gap-2 − bottom row = 320 − 8 − 140 = 172px.
              */}
              <div className="grid h-[100px] grid-cols-2 gap-2 sm:h-[172px]">
                <div className="relative h-full min-h-0 overflow-hidden rounded-lg">
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    src={figma.travelPhoto1}
                  />
                </div>
                {/*
                  Mobile: hero + this row only (3 photos); "See more" + scrim on the bottom-right
                  tile. sm+: plain second thumb; third row has photo 4 + separate See more tile.
                */}
                <div className="relative h-full min-h-0 overflow-hidden rounded-lg">
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    src={figma.travelPhoto2}
                  />
                  <div className="absolute inset-0 rounded-lg bg-black/60 sm:hidden" aria-hidden />
                  <div className="absolute inset-0 z-10 flex items-center justify-center sm:hidden">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="flex items-center justify-center rounded-full border-[1.5px] border-white p-2">
                        <div className="size-6 overflow-hidden">
                          <img alt="" className="size-full" src={figma.seeMoreArrow} />
                        </div>
                      </div>
                      <span className="text-base">See more</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden h-[100px] grid-cols-2 gap-2 sm:grid sm:h-[140px]">
                <div className="relative h-full min-h-0 overflow-hidden rounded-lg">
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    src={figma.travelPhoto3}
                  />
                </div>
                <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-lg">
                  <img
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    src={figma.seeAllPhotos}
                  />
                  <div className="absolute inset-0 rounded-lg bg-black/60" />
                  <div className="relative z-10 flex flex-col items-center gap-3 text-white">
                    <div className="flex items-center justify-center rounded-full border-[1.5px] border-white p-2">
                      <div className="size-6 overflow-hidden">
                        <img alt="" className="size-full" src={figma.seeMoreArrow} />
                      </div>
                    </div>
                    <span className="text-base">See more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews summary */}
        <div className="space-y-12">
          <section
            className="border-b border-[#d9d9d9] pb-6"
            aria-labelledby="reviews-section-h"
          >
            <h2
              id="reviews-section-h"
              className="inline-flex items-center gap-1.5 text-[28px] font-medium leading-[1.2] tracking-[0.2px] text-black"
            >
              Reviews
            </h2>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr]">
              <div className="flex flex-col items-center gap-2 text-center lg:items-center">
                <p
                  className="text-4xl font-black leading-tight text-black"
                  style={{ fontFeatureSettings: "'lnum' 1" }}
                >
                  4.7
                </p>
                <FigmaStarRow
                  size={24}
                  pattern={['solid', 'solid', 'solid', 'solid', 'half']}
                />
                <p className="text-sm font-bold leading-normal text-black">
                  based on {RATING_TOTAL.toLocaleString()} reviews
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#4d4d4d]">
                  Total reviews and rating from Viator & Tripadvisor
                </p>
                <div className="space-y-2">
                  <RatingBar stars="5 stars" count={RATING_COUNTS[5]} />
                  <RatingBar stars="4 stars" count={RATING_COUNTS[4]} />
                  <RatingBar stars="3 stars" count={RATING_COUNTS[3]} />
                  <RatingBar stars="2 stars" count={RATING_COUNTS[2]} />
                  <RatingBar stars="1 star" count={RATING_COUNTS[1]} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <CheckmarkStar />
              <p className="text-[13px] leading-normal text-black">
                <span>We perform </span>
                <span className="underline decoration-solid [text-decoration-skip-ink:none]">
                  checks on reviews
                </span>
              </p>
            </div>
          </section>

          {/* AI review summary + filters + list */}
          <div className="space-y-8">
            {summaryLayout === 'a' ? (
              <AiReviewSummaryBlock
                activeTheme={activeTheme}
                onSelectTheme={onSelectTheme}
                onClear={clearReviewFilters}
                themeMentions={THEME_MENTIONS}
              />
            ) : (
              <AiReviewSummaryFigmaBlock
                activeTheme={activeTheme}
                onMatrixThemeClick={onMatrixThemeClick}
                themeMentions={THEME_MENTIONS}
                matrixRows={summaryLayout === 'c' ? VARIANT_C_MATRIX_ROWS : VARIANT_B_MATRIX_ROWS}
                truncateMatrixBody={summaryLayout !== 'c'}
              />
            )}

            <div
              ref={reviewsFilterRef}
              className="w-full min-w-0 max-w-full scroll-mt-[48px] space-y-5 sm:space-y-6"
            >
              {/*
                Mobile: count stacks below the scroll row (left-aligned). sm+: one row, count on the end.
                Hidden when a theme is selected from the summary (breakdown + list still reflect the filter).
              */}
              {activeTheme == null && (
              <div className="flex w-full min-w-0 max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div
                  className="flex min-h-10 w-full min-w-0 flex-1 touch-pan-x items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide sm:min-w-0 sm:flex-wrap sm:overflow-x-visible sm:pb-0"
                >
                  <button
                    type="button"
                    className="inline-flex h-10 w-12 shrink-0 items-center justify-center border-0 bg-transparent p-0"
                    aria-label="Search reviews"
                  >
                    <img
                      alt=""
                      className="pointer-events-none block h-10 w-12 select-none"
                      src={figma.searchIcon}
                      width={48}
                      height={40}
                    />
                  </button>
                  <div
                    className="hidden h-0 w-px self-stretch bg-[#d9d9d9] sm:block"
                    style={{ minHeight: 24 }}
                    aria-hidden
                  />
                  {(['All travelers', 'Ratings', 'Most recent'] as const).map((label) => (
                    <div
                      key={label}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <span className="whitespace-nowrap text-sm font-medium leading-5 text-[#333]">
                        {label}
                      </span>
                      <ChevronDown />
                    </div>
                  ))}
                </div>
                  <p
                    className="w-full shrink-0 text-left text-sm leading-5 text-[#333] tabular-nums sm:ml-auto sm:w-auto sm:shrink-0 sm:text-right sm:text-base sm:leading-normal"
                    style={{ fontFeatureSettings: "'lnum' 1" }}
                  >
                    {RATING_TOTAL.toLocaleString()}{' '}
                    {RATING_TOTAL === 1 ? 'review' : 'reviews'}
                  </p>
              </div>
              )}
              <ThemeMentionBreakdown
                activeTheme={activeTheme}
                sentimentFilter={sentimentFilter ?? 'positive'}
                onSetSentiment={setSentimentFilter}
                themeMentions={THEME_MENTIONS}
                onClear={clearReviewFilters}
                summaryLayout={summaryLayout}
              />
            </div>

            <div className="min-h-0">
              <ReviewsListBlock
                listKey={reviewListKey}
                reviews={filteredReviews}
              />
            </div>

            <div className="pt-2">
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
