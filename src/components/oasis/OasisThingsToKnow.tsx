function WalkingIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="14" cy="4" r="1.6" fill="currentColor" />
      <path
        d="M12.5 7l-2 3 1.5 2-1 5m3-10l3 1.5-1 3.5 3 3M9 21l2-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WheelchairIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="9" cy="4" r="1.6" fill="currentColor" />
      <path
        d="M9 7v6h6l3 6M9 13l-3 7M6 10h7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="16" r="4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function BusIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 10h16M7 20v-2m10 2v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="16" r="0.8" fill="currentColor" />
      <circle cx="16" cy="16" r="0.8" fill="currentColor" />
    </svg>
  )
}

function TwoPeopleIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 20c0-3.3 2.2-5.5 5-5.5s5 2.2 5 5.5M14 20c0-2.6 1.6-4.5 4-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StrollerIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <path
        d="M6 8h9l4 6M9 8V5.5A1.5 1.5 0 0 1 10.5 4h1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="19" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="19" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 14h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function FaceChildIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" />
      <circle cx="15" cy="11" r="0.9" fill="currentColor" />
      <path d="M9 15c1 1 5 1 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#4d4d4d]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2.9-1.2 1.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12 17v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const FACTS = [
  {
    id: 'activity',
    icon: <WalkingIcon />,
    title: 'Activity level: Low',
    subtitle: 'Most travelers can participate this experience',
  },
  { id: 'wheelchair', icon: <WheelchairIcon />, title: 'Wheelchair accessible' },
  { id: 'transit', icon: <BusIcon />, title: 'Near public transportation' },
  { id: 'group', icon: <TwoPeopleIcon />, title: 'Maximum of 20 travelers' },
  { id: 'stroller', icon: <StrollerIcon />, title: 'Stroller accessible' },
  { id: 'infants', icon: <FaceChildIcon />, title: 'Infants must sit on laps' },
] as const

const SUPPLIER_NOTES = [
  'We regret that we are unable to accommodate guests with wheelchairs or any impairments requiring special assistance. We are also unable to accommodate strollers or baby carriages on our group tours.',
  "St Peter's Basilica & Sistine Chapel are subject to last-minute closures for religious ceremonies. When this occurs, we're happy to offer customers an extended tour of the Vatican Museums. While we endeavour to tell tour groups ahead of time if there are any planned disruptions to the Basilica's opening hours, this is not always possible and in these cases we are unable to provide refunds or discounts.",
]

/**
 * Icon-fact grid — Figma [node 10033:22967](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-22967)
 * (desktop) / node 9941:12129 (mobile, single column). Replaces the plain bulleted {@link AdditionalInfo}
 * text for the Oasis "Things to know" section.
 */
export function OasisThingsToKnow() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {FACTS.map((fact) => (
          <div key={fact.id} className="flex items-start gap-4">
            {fact.icon}
            <div className="min-w-0 flex-1">
              <p className="text-base leading-6 text-black">{fact.title}</p>
              {'subtitle' in fact ? (
                <p className="text-sm leading-5 text-[#4d4d4d]">{fact.subtitle}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <InfoIcon />
          <p className="text-base leading-6 text-black">Notes from the tour supplier</p>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-5 text-[#4d4d4d] sm:flex-row sm:gap-6">
          {SUPPLIER_NOTES.map((note) => (
            <p key={note.slice(0, 24)} className="flex-1">
              • {note}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button type="button" className="pdp-neutral-outline-btn-md">
          Show more
        </button>
        <p className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-[#4d4d4d]">
          <QuestionIcon />
          Questions? Visit our <span className="underline">Help Center.</span>
        </p>
      </div>
    </div>
  )
}
