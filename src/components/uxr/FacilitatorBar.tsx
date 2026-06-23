import { useEffect, useState, type RefObject } from 'react'
import type { ProductHighlightIconStyleId } from '../../data/productHighlightIconStyles'
import type { ProductHighlightBase, ProductHighlightIconRail } from '../../data/productHighlightLayouts'
import type { AvailabilityCommerceModeId } from '../../data/availabilityShortcutCommerce'
import { AVAILABILITY_COMMERCE_MODE_OPTIONS } from '../../data/availabilityShortcutCommerce'
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
  b: { label: 'Single', title: 'Variant B — single meeting point' },
  b2: { label: 'B2 (multiple meeting)', title: 'B2 (multiple meeting)' },
  c: { label: 'Variant C' },
  c2: {
    label: 'C2 (multiple meeting)',
    title: 'C2 (multiple meeting — inline under Read more, no accordion)',
  },
  d2: {
    label: 'Multiple',
    title: 'D2 — multiple meeting points (mobile: meeting dropdown above map, map between meeting and POIs)',
  },
}

/** Pill toggle group — width hugs On/Off (or option) buttons. */
const PILL_GROUP_CLASS =
  'inline-flex w-fit flex-wrap gap-1 rounded-xl border border-amber-200/90 bg-white/90 p-1 shadow-sm'

const CONTROL_GROUP_CLASS = 'flex w-fit flex-col gap-2'

type Props = {
  variant: VariantId
  /** Primary variants in the facilitator strip (order preserved). */
  allowedVariants: VariantId[]
  /** Older variants — second row labeled Archive (order preserved). */
  archivedVariants?: VariantId[]
  onVariantChange: (v: VariantId) => void
  onOpenParticipantLinkModal: () => void
  participantLinkButtonRef?: RefObject<HTMLButtonElement | null>
  /** Product highlight project only — base tab + icon-rail toggles (encoded as `phLayout`). */
  highlightLayoutControls?: {
    base: ProductHighlightBase
    iconRail: ProductHighlightIconRail
    onBaseChange: (base: ProductHighlightBase) => void
    onIconRailChange: (iconRail: ProductHighlightIconRail) => void
  }
  /** Grey / Outline / Large icon wells on highlight rows (`phIconStyle`). */
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
  /** Logistics map — hero image above teardrop on selected / hovered pins. */
  mapPinPhotoThumbnailControls?: {
    enabled: boolean
    onEnabledChange: (enabled: boolean) => void
  }
  /** Show/hide the book-ahead label on mobile. */
  bookAheadMobileControls?: {
    enabled: boolean
    onEnabledChange: (enabled: boolean) => void
  }
  /** Availability shortcut — shortcuts in main column vs sticky commerce (`asCommerce`). */
  availabilityCommerceControls?: {
    commerceMode: AvailabilityCommerceModeId
    onCommerceModeChange: (commerceMode: AvailabilityCommerceModeId) => void
  }
}

function FacilitatorChevronDown({
  className,
  open,
}: {
  readonly className?: string
  readonly open: boolean
}) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className ?? 'h-4 w-4'}`}
      viewBox="0 0 24 24"
      fill="none"
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

function VariantPillGroup({
  ids,
  variant,
  onVariantChange,
  inactiveClassName = 'text-amber-950 hover:bg-amber-50',
}: {
  readonly ids: VariantId[]
  readonly variant: VariantId
  readonly onVariantChange: (v: VariantId) => void
  readonly inactiveClassName?: string
}) {
  return (
    <div className={PILL_GROUP_CLASS}>
      {ids.map((id) => {
        const ui = FACILITATOR_VARIANT_UI[id]
        return (
          <button
            key={id}
            type="button"
            title={ui.title}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              variant === id
                ? 'bg-amber-600 text-white shadow-sm'
                : inactiveClassName
            }`}
            onClick={() => onVariantChange(id)}
          >
            {ui.label}
          </button>
        )
      })}
    </div>
  )
}

export function FacilitatorBar({
  variant,
  allowedVariants,
  archivedVariants = [],
  onVariantChange,
  onOpenParticipantLinkModal,
  participantLinkButtonRef,
  highlightLayoutControls,
  highlightIconStyleControls,
  highlightConciseSummaryControls,
  highlightTopProductControls,
  mapPinPhotoThumbnailControls,
  bookAheadMobileControls,
  availabilityCommerceControls,
}: Props) {
  const hasArchive = archivedVariants.length > 0
  const viewingArchived = hasArchive && archivedVariants.includes(variant)
  const [archiveOpen, setArchiveOpen] = useState(viewingArchived)

  useEffect(() => {
    if (viewingArchived) setArchiveOpen(true)
  }, [viewingArchived])

  const singleVariant = allowedVariants.length === 1 && !hasArchive

  const copyButton = (
    <div className="order-2 w-full shrink-0 md:absolute md:right-0 md:top-0 md:order-none md:w-auto">
      <button
        ref={participantLinkButtonRef}
        type="button"
        className="inline-flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-950 shadow-sm transition hover:bg-amber-50 hover:shadow active:scale-[0.99] md:w-auto"
        onClick={onOpenParticipantLinkModal}
      >
        Copy participant link
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
            Meeting points
          </span>
          <VariantPillGroup
            ids={allowedVariants}
            variant={variant}
            onVariantChange={onVariantChange}
          />
          {hasArchive ? (
            <>
              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-lg py-1 pr-0.5 pl-1 text-left text-sm font-medium text-amber-900/85 transition hover:bg-amber-100/50 hover:text-amber-950"
                aria-expanded={archiveOpen}
                onClick={() => setArchiveOpen((open) => !open)}
              >
                <span>Show archived designs</span>
                <FacilitatorChevronDown open={archiveOpen} />
              </button>
              {viewingArchived && !archiveOpen ? (
                <span className="text-[12px] text-amber-900/70">
                  Viewing {FACILITATOR_VARIANT_UI[variant].label} — open archived designs to switch
                </span>
              ) : null}
              {archiveOpen ? (
                <VariantPillGroup
                  ids={archivedVariants}
                  variant={variant}
                  onVariantChange={onVariantChange}
                  inactiveClassName="text-amber-900/75 hover:bg-amber-50/80"
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

          {mapPinPhotoThumbnailControls ? (
            <div className={`flex flex-col gap-2 ${singleVariant ? '' : 'mt-5'}`}>
              <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
                Map pin thumbnails
              </span>
              <div className={PILL_GROUP_CLASS}>
                {(
                  [
                    { on: true as const, label: 'On' },
                    { on: false as const, label: 'Off' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    title={
                      opt.on
                        ? 'Square photo above teardrop on hover / selection'
                        : 'Teardrop only — no photo thumbnail'
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      mapPinPhotoThumbnailControls.enabled === opt.on
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-950 hover:bg-amber-50'
                    }`}
                    onClick={() => mapPinPhotoThumbnailControls.onEnabledChange(opt.on)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {availabilityCommerceControls ? (
            <div className={`flex flex-col gap-2 ${singleVariant ? '' : 'mt-5'}`}>
              <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
                Options
              </span>
              <div className={PILL_GROUP_CLASS}>
                {AVAILABILITY_COMMERCE_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    title={opt.title}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      availabilityCommerceControls.commerceMode === opt.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-950 hover:bg-amber-50'
                    }`}
                    onClick={() => availabilityCommerceControls.onCommerceModeChange(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
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
                <span className="text-[11px] font-medium text-amber-900/80">Top 1% product</span>
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
            {bookAheadMobileControls ? (
              <div className={CONTROL_GROUP_CLASS}>
                <span className="text-[11px] font-medium text-amber-900/80">Book-ahead (mobile)</span>
                <div className={PILL_GROUP_CLASS}>
                  {(
                    [
                      { on: true as const, label: 'On' },
                      { on: false as const, label: 'Off' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        bookAheadMobileControls.enabled === opt.on
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-amber-50'
                      }`}
                      onClick={() => bookAheadMobileControls.onEnabledChange(opt.on)}
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
            Top 1% product
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
