import type { OasisReview, OasisStarDistribution } from '../../data/oasisStonehenge'

type Props = {
  averageRating: number
  reviewCount: number
  distribution: OasisStarDistribution[]
  photos: string[]
  reviews: OasisReview[]
}

export function OasisReviewsMw({ averageRating, reviewCount, distribution, photos, reviews }: Props) {
  const maxCount = Math.max(...distribution.map((d) => d.count))

  return (
    <section className="border-t border-stone-200 py-6">
      <h2 className="text-lg font-medium text-stone-900">Reviews</h2>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-6">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-4xl font-medium text-stone-900">{averageRating.toFixed(1)}</p>
          <StarRow rating={Math.round(averageRating)} />
          <p className="text-xs text-stone-500">{reviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="w-2 text-sm text-stone-700">{d.stars}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible">
        {photos.map((src) => (
          <img key={src} src={src} alt="" className="size-[110px] shrink-0 rounded-lg object-cover lg:size-full" />
        ))}
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
        {reviews.map((r) => (
          <div key={r.id} className="w-[280px] shrink-0 rounded-2xl border border-stone-200 p-4 lg:w-auto lg:shrink">
            <StarRow rating={r.rating} />
            <p className="mt-1 text-sm font-medium text-stone-900">{r.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{r.text}</p>
            <p className="mt-2 text-xs text-stone-500">
              {r.author} · {r.date}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-full border border-stone-300 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 lg:w-auto lg:px-8"
      >
        Read all {reviewCount.toLocaleString()} reviews
      </button>
      <p className="mt-3 text-center text-xs text-stone-500">
        We perform <span className="underline">checks on reviews</span>
      </p>
    </section>
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
