/** Loading placeholder for {@link PdpAvailabilityOptionsPanel} — matches tour grade option cards. */
export function PdpAvailabilityOptionsSkeleton() {
  return (
    <div
      className="relative flex flex-col gap-4 pb-6"
      aria-busy="true"
      aria-label="Loading tour grade options"
    >
      <span className="absolute -top-3 left-6 z-10 inline-flex rounded-md bg-[#f5f5f5] px-3 py-1">
        <Bone className="h-4 w-24" />
      </span>

      <TourGradeOptionCardSkeleton variant="expanded" />

      <TourGradeOptionCardSkeleton variant="collapsed" />
      <TourGradeOptionCardSkeleton variant="collapsed" />

      <div className="flex justify-center pt-2">
        <Bone className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  )
}

function TourGradeOptionCardSkeleton({ variant }: { readonly variant: 'expanded' | 'collapsed' }) {
  if (variant === 'collapsed') {
    return (
      <div
        data-tour-grade-option-card
        data-variant="collapsed"
        className="flex w-full overflow-hidden rounded-lg border border-[#e8e8e8] bg-white"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 p-6">
          <Bone className="size-6 shrink-0 rounded-full" />
          <Bone className="h-6 w-[min(100%,240px)]" />
        </div>
        <div className="flex w-[min(100%,220px)] shrink-0 flex-col justify-center gap-2 border-l border-[#e8e8e8] p-6">
          <Bone className="ml-auto h-5 w-16" />
          <Bone className="ml-auto h-4 w-24" />
        </div>
      </div>
    )
  }

  return (
    <article
      data-tour-grade-option-card
      data-variant="expanded"
      className="relative flex min-h-[250px] w-full overflow-hidden rounded-2xl border border-[#d9d9d9] bg-white"
    >
      <div className="flex min-w-0 flex-1 gap-4 p-6">
        <Bone className="size-6 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Bone className="h-6 w-[min(100%,280px)]" />
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-[92%]" />
            <Bone className="mt-1 h-4 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Bone className="h-11 w-[92px] rounded-lg" />
            <Bone className="h-11 w-[92px] rounded-lg" />
            <Bone className="h-11 w-[92px] rounded-lg" />
            <Bone className="h-11 w-[92px] rounded-lg" />
          </div>
          <div className="rounded-lg bg-[#f5f5f5] px-4 py-3">
            <div className="flex flex-col gap-4">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-[88%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-[min(100%,280px)] shrink-0 flex-col justify-between border-l border-[#e8e8e8] p-6">
        <div className="flex flex-col items-end gap-2">
          <Bone className="h-5 w-20" />
          <Bone className="h-4 w-28" />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Bone className="h-11 w-full rounded-lg" />
          <Bone className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </article>
  )
}

function Bone({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`availability-skeleton-bone bg-[#e8e8e8] ${className}`.trim()} aria-hidden />
  )
}
