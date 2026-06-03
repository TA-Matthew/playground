/** White disc + emerald stroke check — matches map committed-meeting badge (`logisticsTeardropMarkup`). */
export function MeetingCommittedCheckBadge({
  className = '',
  size = 'md',
}: {
  readonly className?: string
  /** `sm` = D2 map (16px); `md` = dropdown trigger / list (20px). */
  readonly size?: 'sm' | 'md'
}) {
  const badgeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const iconClass = size === 'sm' ? 'h-[10px] w-[10px]' : 'h-3 w-3'

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-600 ${badgeClass} ${className}`.trim()}
      aria-hidden
    >
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
