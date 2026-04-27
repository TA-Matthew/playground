import { viatorListing } from '../../../data/viatorListing'

const giftIcon = (
  <svg
    className="mt-0.5 size-6 shrink-0 text-[#186b6d]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M12 9V21M3 9h18M8 5a2 2 0 0 0 0 4h8a2 2 0 0 0 0-4M8 5a2 2 0 0 1 2-2h.5A1.5 1.5 0 0 1 12 4.5V5M16 5a2 2 0 0 0-2-2h-.5A1.5 1.5 0 0 0 12 4.5V5" />
  </svg>
)

/**
 * Figma 20632:95844 — inline Viator Rewards message below gallery + features.
 */
export function PdpListingRewardsCallout() {
  const c = viatorListing.rewardsCallout
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-[#d0e5ff] bg-[#e2efff] p-3 sm:p-4"
      role="status"
    >
      {giftIcon}
      <div className="min-w-0 text-sm text-[#333]">
        <p className="font-semibold text-[#1a1a1a]">{c.title}</p>
        {c.subtitle ? <p className="mt-1 text-xs text-[#4d4d4d] sm:text-sm">{c.subtitle}</p> : null}
      </div>
    </div>
  )
}
