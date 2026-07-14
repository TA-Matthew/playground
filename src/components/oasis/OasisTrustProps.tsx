import type { ReactElement } from 'react'
import type { OasisTrustProp } from '../../data/oasisStonehenge'

const ICONS: Record<OasisTrustProp['id'], ReactElement> = {
  deal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 3h8l2 4H6l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M4 7h16l-1.2 12.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8L4 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5v6M13.5 11.5h-2.2a1.3 1.3 0 0 0 0 2.6h1.4a1.3 1.3 0 0 1 0 2.6h-2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  trending: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c4 0 6.5-2.8 6.5-6.2 0-2.6-1.5-4-2.5-5.5.3 2-.6 3-1.5 3.3.6-2.6-.6-5.4-3-6.6.6 2.4-.4 4-2 5.3C7.7 12.4 6 13.4 6 15.5 6 18.5 8.5 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  value: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 21V10M2 12v7a2 2 0 0 0 2 2h10.5a2 2 0 0 0 1.94-1.51l1.7-6.5A1.5 1.5 0 0 0 16.68 11H13l.7-4.5A1.5 1.5 0 0 0 12.24 4.5L7 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

type Props = {
  items: OasisTrustProp[]
}

export function OasisTrustProps({ items }: Props) {
  return (
    <section className="flex flex-col gap-5 border-t border-stone-200 py-6 lg:grid lg:grid-cols-3 lg:gap-6">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-4">
          <span className="text-stone-900">{ICONS[item.id]}</span>
          <div>
            <p className="text-base font-medium text-stone-900">{item.title}</p>
            <p className="text-sm text-stone-500">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
