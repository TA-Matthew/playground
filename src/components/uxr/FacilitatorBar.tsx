import type { VariantId } from '../../data/variants'

type Props = {
  variant: VariantId
  onVariantChange: (v: VariantId) => void
  onCopyParticipantLink: () => void
  copyFeedback: boolean
}

export function FacilitatorBar({
  variant,
  onVariantChange,
  onCopyParticipantLink,
  copyFeedback,
}: Props) {
  return (
    <div
      className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 px-5 py-4 text-[13px] text-amber-950 shadow-sm ring-1 ring-amber-100/80"
      role="region"
      aria-label="Facilitator controls"
    >
      <div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
            UXR — Variations
          </span>
          <div className="inline-flex rounded-xl border border-amber-200/90 bg-white/90 p-1 shadow-sm">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                variant === 'a'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-950 hover:bg-amber-50'
              }`}
              onClick={() => onVariantChange('a')}
            >
              Variant A
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                variant === 'b'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-950 hover:bg-amber-50'
              }`}
              onClick={() => onVariantChange('b')}
            >
              Variant B
            </button>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-950 shadow-sm transition hover:bg-amber-50 hover:shadow active:scale-[0.99]"
          onClick={onCopyParticipantLink}
        >
          {copyFeedback ? 'Copied to clipboard' : 'Copy participant link'}
        </button>
      </div>
      <p className="mt-3 border-t border-amber-200/60 pt-3 text-[12px] leading-relaxed text-amber-900/75">
        Participant links always include <code className="rounded bg-white/70 px-1">hideUi=1</code> and the
        current variant. Use the discreet corner control to show these tools again locally without changing
        the shared URL.
      </p>
    </div>
  )
}
