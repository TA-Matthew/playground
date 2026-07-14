import type { OasisWhyLovedCard } from '../../data/oasisStonehenge'

type Props = {
  cards: OasisWhyLovedCard[]
}

/** Horizontally-scrollable "Why travelers loved this" quote cards. */
export function OasisWhyLoved({ cards }: Props) {
  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">Why travelers loved this</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-stone-200 p-4 lg:w-auto lg:shrink"
          >
            <span className="w-fit rounded bg-emerald-50 px-1 py-0.5 text-xs text-emerald-900">
              🙂 {card.badge}
            </span>
            <p className="text-sm leading-relaxed text-stone-800">
              “{renderQuote(card.quote, card.boldPhrase)}”
            </p>
            <StarRow rating={card.rating} />
          </div>
        ))}
      </div>
    </section>
  )
}

function renderQuote(quote: string, boldPhrase: string) {
  const idx = quote.indexOf(boldPhrase)
  if (idx === -1) return quote
  return (
    <>
      {quote.slice(0, idx)}
      <span className="font-medium text-stone-900">{boldPhrase}</span>
      {quote.slice(idx + boldPhrase.length)}
    </>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill={i < rating ? '#008768' : '#d9d9d9'} aria-hidden>
          <path d="M8 1.2l2.1 4.6 5 .6-3.7 3.4.9 4.9L8 12.2l-4.3 2.5.9-4.9L.9 6.4l5-.6L8 1.2z" />
        </svg>
      ))}
    </div>
  )
}
