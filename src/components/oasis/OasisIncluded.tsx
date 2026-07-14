type Props = {
  inclusions: string[]
}

export function OasisIncluded({ inclusions }: Props) {
  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">What's included</h2>
      <ul className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-8">
        {inclusions.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-stone-800">
            <CheckIcon /> {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-6 w-full rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 lg:w-auto lg:px-8"
      >
        Read full details
      </button>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden>
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="#008768"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
