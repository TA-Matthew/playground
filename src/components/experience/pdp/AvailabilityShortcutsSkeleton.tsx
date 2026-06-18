/** Loading placeholder for availability shortcut cards — 3-column grid. */
export function AvailabilityShortcutsSkeleton() {
  return (
    <ul
      className="grid grid-cols-3 gap-4"
      data-availability-shortcuts
      aria-busy="true"
      aria-label="Loading availability shortcuts"
    >
      <AvailabilityShortcutCardSkeleton />
      <AvailabilityShortcutCardSkeleton />
      <AvailabilityShortcutCardSkeleton />
    </ul>
  )
}

function AvailabilityShortcutCardSkeleton() {
  return (
    <li>
      <article
        data-availability-shortcut-card
        className="flex min-h-[152px] flex-col justify-between rounded-2xl border border-[#e8e8e8] bg-white px-4 py-4"
      >
        <div className="flex flex-col gap-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-6 w-[min(100%,180px)]" />
          <Bone className="h-5 w-28" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Bone className="h-6 w-20" />
          <Bone className="h-9 w-[88px] rounded-lg" />
        </div>
      </article>
    </li>
  )
}

function Bone({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`availability-skeleton-bone bg-[#e8e8e8] ${className}`.trim()} aria-hidden />
  )
}
