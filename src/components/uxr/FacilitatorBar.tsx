import type { ProductHighlightIconStyleId } from '../../data/productHighlightIconStyles'
import type { ProductHighlightBase, ProductHighlightIconRail } from '../../data/productHighlightLayouts'
import type { VariantId } from '../../data/variants'

const FACILITATOR_VARIANT_UI: Record<
  VariantId,
  {
    label: string
    title?: string
  }
> = {
  a: { label: 'Variant A' },
  a2: {
    label: 'A2 (multiple meeting)',
    title: 'A2 (multiple meeting — pickup card only)',
  },
  b: { label: 'Variant B' },
  b2: { label: 'B2 (multiple meeting)', title: 'B2 (multiple meeting)' },
  c: { label: 'Variant C' },
  c2: {
    label: 'C2 (multiple meeting)',
    title: 'C2 (multiple meeting — inline under Read more, no accordion)',
  },
}

/** Pill toggle group — width hugs On/Off (or option) buttons. */
const PILL_GROUP_CLASS =
  'inline-flex w-fit flex-wrap gap-1 rounded-xl border border-amber-200/90 bg-white/90 p-1 shadow-sm'

const CONTROL_GROUP_CLASS = 'flex w-fit flex-col gap-2'

type Props = {
  variant: VariantId
  /** Which variants appear in the facilitator strip (order preserved). */
  allowedVariants: VariantId[]
  onVariantChange: (v: VariantId) => void
  onCopyParticipantLink: () => void
  copyFeedback: boolean
  /** Product highlight project only — base tab + icon-rail toggles (encoded as `phLayout`). */
  highlightLayoutControls?: {
    base: ProductHighlightBase
    iconRail: ProductHighlightIconRail
    onBaseChange: (base: ProductHighlightBase) => void
    onIconRailChange: (iconRail: ProductHighlightIconRail) => void
  }
  /** Grey / Outline / Stylised / Large icon wells on highlight rows (`phIconStyle`). */
  highlightIconStyleControls?: {
    iconStyle: ProductHighlightIconStyleId
    onIconStyleChange: (iconStyle: ProductHighlightIconStyleId) => void
  }
  /** Intro paragraph above highlight rows (`phConciseSummary`). */
  highlightConciseSummaryControls?: {
    conciseSummary: boolean
    onConciseSummaryChange: (on: boolean) => void
  }
  /** Gold trophy first row (`phTopProduct`). */
  highlightTopProductControls?: {
    topProduct: boolean
    onTopProductChange: (on: boolean) => void
  }
}

export function FacilitatorBar({
  variant,
  allowedVariants,
  onVariantChange,
  onCopyParticipantLink,
  copyFeedback,
  highlightLayoutControls,
  highlightIconStyleControls,
  highlightConciseSummaryControls,
  highlightTopProductControls,
}: Props) {
  const singleVariant = allowedVariants.length === 1

  const copyButton = (
    <div className="order-2 w-full shrink-0 md:absolute md:right-0 md:top-0 md:order-none md:w-auto">
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-950 shadow-sm transition hover:bg-amber-50 hover:shadow active:scale-[0.99] md:w-auto"
        onClick={onCopyParticipantLink}
      >
        {copyFeedback ? 'Copied to clipboard' : 'Copy participant link'}
      </button>
    </div>
  )

  return (
    <div
      className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 px-5 py-4 text-[13px] text-amber-950 shadow-sm ring-1 ring-amber-100/80"
      role="region"
      aria-label="Facilitator controls"
    >
      <div className="relative flex flex-col gap-4">
        <div className="order-1 min-w-0 md:pr-48">
          {!singleVariant ? (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
            UXR — Variations
          </span>
          <div className={PILL_GROUP_CLASS}>
            {allowedVariants.map((id) => {
              const ui = FACILITATOR_VARIANT_UI[id]
              return (
                <button
                  key={id}
                  type="button"
                  title={ui.title}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    variant === id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-950 hover:bg-amber-50'
                  }`}
                  onClick={() => onVariantChange(id)}
                >
                  {ui.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

          {highlightLayoutControls ? (
            <div className={`flex w-full flex-col gap-3 ${singleVariant ? '' : 'mt-5'}`}>
          <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
            Product highlight — layout
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
            <div className={CONTROL_GROUP_CLASS}>
              <span className="text-[11px] font-medium text-amber-900/80">Columns</span>
              <div className={PILL_GROUP_CLASS}>
                {(
                  [
                    { id: 'expedia' as const, label: '1 column' },
                    { id: 'headout' as const, label: '2 column' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      highlightLayoutControls.base === opt.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-950 hover:bg-amber-50'
                    }`}
                    onClick={() => highlightLayoutControls.onBaseChange(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={CONTROL_GROUP_CLASS}>
              <span className="text-[11px] font-medium text-amber-900/80">Icon rail</span>
              <div className={PILL_GROUP_CLASS}>
                {(
                  [
                    { id: 'expedia' as const, label: 'Expedia rail' },
                    { id: 'klook' as const, label: 'Klook labels' },
                    { id: 'viator' as const, label: 'Viator' },
                    { id: 'deferred' as const, label: 'Deferred' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      highlightLayoutControls.iconRail === opt.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-950 hover:bg-amber-50'
                    }`}
                    onClick={() => highlightLayoutControls.onIconRailChange(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {highlightIconStyleControls ? (
              <div className={CONTROL_GROUP_CLASS}>
                <span className="text-[11px] font-medium text-amber-900/80">Icon styling</span>
                <div className={PILL_GROUP_CLASS}>
                  {(
                    [
                      { id: 'large' as const, label: 'Large' },
                      { id: 'grey' as const, label: 'Grey' },
                      { id: 'outline' as const, label: 'Outline' },
                      { id: 'stylised' as const, label: 'Stylised' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        highlightIconStyleControls.iconStyle === opt.id
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-amber-50'
                      }`}
                      onClick={() => highlightIconStyleControls.onIconStyleChange(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {highlightTopProductControls ? (
              <div className={CONTROL_GROUP_CLASS}>
                <span className="text-[11px] font-medium text-amber-900/80">Top product</span>
                <div className={PILL_GROUP_CLASS}>
                  {(
                    [
                      { on: false as const, label: 'Off' },
                      { on: true as const, label: 'On' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        highlightTopProductControls.topProduct === opt.on
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-amber-50'
                      }`}
                      onClick={() => highlightTopProductControls.onTopProductChange(opt.on)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {highlightConciseSummaryControls ? (
              <div className={CONTROL_GROUP_CLASS}>
                <span className="text-[11px] font-medium text-amber-900/80">Concise summary</span>
                <div className={PILL_GROUP_CLASS}>
                  {(
                    [
                      { on: false as const, label: 'Off' },
                      { on: true as const, label: 'On' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        highlightConciseSummaryControls.conciseSummary === opt.on
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-amber-50'
                      }`}
                      onClick={() => highlightConciseSummaryControls.onConciseSummaryChange(opt.on)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
          ) : highlightTopProductControls ? (
            <div className="flex w-full flex-col gap-3">
          <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
            Top product
          </span>
          <div className={CONTROL_GROUP_CLASS}>
            <div className={PILL_GROUP_CLASS}>
              {(
                [
                  { on: false as const, label: 'Off' },
                  { on: true as const, label: 'On' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    highlightTopProductControls.topProduct === opt.on
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-950 hover:bg-amber-50'
                  }`}
                  onClick={() => highlightTopProductControls.onTopProductChange(opt.on)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
          ) : null}
        </div>

        {copyButton}
      </div>
    </div>
  )
}
