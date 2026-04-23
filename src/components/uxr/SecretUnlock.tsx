/**
 * Low-visibility hit target: toggles session-only facilitator unlock so controls can be
 * recalled when the URL has hideUi=1 (participant-safe shared links stay unchanged).
 */
type Props = {
  onToggleUnlock: () => void
  title?: string
}

export function SecretUnlock({ onToggleUnlock, title = 'Facilitator unlock' }: Props) {
  return (
    <button
      type="button"
      onClick={onToggleUnlock}
      className="fixed bottom-4 left-4 z-50 h-11 w-11 cursor-pointer rounded-2xl border border-stone-200/60 bg-white/80 opacity-50 shadow-sm backdrop-blur-sm hover:opacity-90 hover:ring-2 hover:ring-amber-200/80"
      title={title}
      aria-label={title}
    />
  )
}
