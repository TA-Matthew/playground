/** Stable URLs only — no expiring Figma MCP CDN links. Icons and traveler grid photos live in `/public/figma-assets/`; other placeholders use Lorem Picsum where noted. */
const base = import.meta.env.BASE_URL

function asset(file: string): string {
  return `${base}figma-assets/${file}`
}

/** Unique seeds → stable placeholder frames across reloads. */
function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

export const figma = {
  starSolid: asset('star-solid.svg'),
  upvoteShape: asset('upvote.svg'),
  /** Mirrored thumb (see `upvote.svg`) for “not helpful” feedback. */
  thumbDownShape: asset('thumb-down.svg'),
  chevron: asset('chevron-down.svg'),
  checkmarkStar: asset('checkmark-star.svg'),
  starSolidLg: asset('star-solid-lg.svg'),
  starHalf: asset('star-half.svg'),
  /** Traveler photos grid — `object-cover` in UI crops portrait sources to the fixed layout. */
  travelPhotoHero: asset('traveler-photo-hero.png'),
  travelPhoto1: asset('traveler-photo-01.png'),
  travelPhoto2: asset('traveler-photo-02.png'),
  travelPhoto3: asset('traveler-photo-03.png'),
  seeAllPhotos: asset('traveler-photo-see-all.png'),
  aiTitleGradient: asset('ai-title-gradient.svg'),
  reviewPhoto1: picsum('q2-ai-review-card-1', 162, 162),
  reviewPhoto2: picsum('q2-ai-review-card-2', 162, 162),
  reviewPhoto3: picsum('q2-ai-review-card-3', 162, 162),
  reviewPhoto4: picsum('q2-ai-review-card-4', 162, 162),
  seeMoreArrow: asset('see-more-arrow.svg'),
  aiSparkle: asset('ai-sparkle.svg'),
  filterChipUp: asset('filter-chip-up.svg'),
  filterChipRemove: asset('filter-chip-remove.svg'),
  filterChipDown: asset('filter-chip-down.svg'),
  searchIcon: asset('search.svg'),
  readMoreChevron: asset('chevron-down.svg'),
  starOutline: asset('star-outline.svg'),
  pagePrev: asset('page-prev.svg'),
  pageNext: asset('page-next.svg'),
} as const
