import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  SHARE_DURATION_PRESETS,
  buildParticipantParams,
  createExpiringParticipantUrl,
  formatShareExpiry,
  type ParticipantLinkExtras,
  type ShareDurationId,
} from '../../uxr/shareLink'
import type { VariantId } from '../../data/variants'

const PILL_GROUP_CLASS =
  'inline-flex w-fit flex-wrap gap-1 rounded-xl border border-amber-200/90 bg-white/90 p-1 shadow-sm'

type Props = {
  open: boolean
  onClose: () => void
  path: string
  variant: VariantId
  extras?: ParticipantLinkExtras
  onCopied?: () => void
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>
}

export function ParticipantLinkModal({
  open,
  onClose,
  path,
  variant,
  extras,
  onCopied,
  returnFocusRef,
}: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [durationId, setDurationId] = useState<ShareDurationId>('1d')
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const resetGenerated = useCallback(() => {
    setGeneratedUrl(null)
    setExpiresAt(null)
    setError(null)
    setCopyFeedback(false)
  }, [])

  useEffect(() => {
    if (!open) return
    resetGenerated()
    setDurationId('1d')
  }, [open, resetGenerated])

  useEffect(() => {
    if (!open) return
    resetGenerated()
  }, [durationId, variant, open, resetGenerated])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleClose = useCallback(() => {
    onClose()
    returnFocusRef?.current?.focus()
  }, [onClose, returnFocusRef])

  const handleCopy = useCallback(async () => {
    const preset = SHARE_DURATION_PRESETS.find((p) => p.id === durationId)
    if (!preset) return

    setLoading(true)
    setError(null)
    try {
      const params = buildParticipantParams(variant, extras)
      const result = await createExpiringParticipantUrl(path, params, preset.durationMs)
      setGeneratedUrl(result.url)
      setExpiresAt(result.expiresAt)
      await navigator.clipboard.writeText(result.url)
      setCopyFeedback(true)
      onCopied?.()
      window.setTimeout(() => setCopyFeedback(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create link')
    } finally {
      setLoading(false)
    }
  }, [durationId, variant, extras, path, onCopied])

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(100%,28rem)] max-w-lg rounded-2xl border border-amber-200/90 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-900/40"
      aria-labelledby={titleId}
      aria-modal="true"
      onClose={handleClose}
      onCancel={handleClose}
    >
      <div className="border-b border-amber-100/80 px-5 py-4">
        <h2 id={titleId} className="text-lg font-medium text-amber-950">
          Participant link
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Choose how long the link stays active, then copy it for your participant.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
            Link expires after
          </span>
          <div className={PILL_GROUP_CLASS} role="group" aria-label="Link duration">
            {SHARE_DURATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  durationId === preset.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-950 hover:bg-amber-50'
                }`}
                onClick={() => setDurationId(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {generatedUrl ? (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium uppercase tracking-widest text-amber-900/90">
              Link preview
            </label>
            <input
              type="text"
              readOnly
              value={generatedUrl}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700"
              onFocus={(e) => e.target.select()}
            />
            {expiresAt ? (
              <p className="text-sm text-stone-600">
                Expires {formatShareExpiry(expiresAt)}
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-amber-100/80 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          onClick={handleClose}
        >
          Close
        </button>
        <button
          type="button"
          className="rounded-xl border border-amber-300 bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
          disabled={loading}
          onClick={() => void handleCopy()}
        >
          {loading
            ? 'Creating link…'
            : copyFeedback
              ? 'Copied to clipboard'
              : 'Copy link'}
        </button>
      </div>
    </dialog>
  )
}
