function FlameIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 4c1 4-4 6-4 10a4 4 0 0 0 8 0c1.5 1 2.5 3 2.5 5A6.5 6.5 0 0 1 16 26a6.5 6.5 0 0 1-6.5-6.5c0-3 1.5-5 3-7-.5 1.5 0 2.5 1 2.5.8 0 1.5-1 1.2-2C14 10 15 6 16 4z"
        fill="#F0663C"
      />
    </svg>
  )
}

function ThumbsUpIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M11 14v12H7a1 1 0 0 1-1-1V15a1 1 0 0 1 1-1h4zm2 12h9.5a2 2 0 0 0 1.94-1.52l2-8A2 2 0 0 0 24.5 14H19l1-5.5a2 2 0 0 0-3.6-1.5L13 14v12z"
        stroke="#008768"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PeopleGroupIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="#333" strokeWidth="1.6" />
      <circle cx="21" cy="13" r="3.5" stroke="#333" strokeWidth="1.6" />
      <path
        d="M5 26c0-4 3-7 7-7s7 3 7 7M18 20c3.2.4 5 2.5 5 6"
        stroke="#333"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

const HIGHLIGHTS = [
  {
    id: 'trending',
    icon: <FlameIcon />,
    title: 'Trending now',
    subtitle: 'Most booked experience in the last 7 days',
  },
  {
    id: 'upvote',
    icon: <ThumbsUpIcon />,
    title: 'Value for money',
    subtitle: 'Over 90% of travelers praised its value',
  },
  {
    id: 'private',
    icon: <PeopleGroupIcon />,
    title: 'Private tour',
    subtitle: 'This experience is available as a private tour',
  },
] as const

/**
 * Highlights icon rows — Figma [node 10033:21718](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-21718),
 * shared verbatim on mobile (node 9941:7905 uses the same Trending / Upvote / People-group icon set).
 */
export function OasisHighlights() {
  return (
    <div className="flex w-full flex-col gap-5">
      {HIGHLIGHTS.map((item) => (
        <div key={item.id} className="flex items-start gap-4">
          <div className="shrink-0">{item.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium leading-6 text-black">{item.title}</p>
            <p className="text-sm leading-5 text-[#4d4d4d]">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
