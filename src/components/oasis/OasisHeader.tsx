import { Link } from 'react-router-dom'

function SearchIcon({ width = 16, height = 16 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-9.5-8.9C1 8 2.4 4.5 6 4.5c2.1 0 3.5 1.2 6 3.7 2.5-2.5 3.9-3.7 6-3.7 3.6 0 5 3.5 3.5 6.6C19 15.65 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightTiny() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-stone-400">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1.1.5 1.1 1.1V20c0 .6-.5 1-1.1 1C10.6 21 3 13.4 3 4.1 3 3.5 3.4 3 4 3h3.3c.6 0 1.1.5 1.1 1.1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h16v11H8l-4 4V4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const BREADCRUMBS = ['Home', 'Italy', 'Rome', 'Things to do in Rome']

/**
 * Desktop-only nav + breadcrumb/contacts row — Figma
 * [node 10033:18938](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=10033-18938).
 * Mobile uses its own {@link OasisMobileTopBar}, not a collapsed version of this.
 */
export function OasisHeader() {
  return (
    <header className="hidden border-b border-stone-200 bg-white md:block">
      <div className="mx-auto flex w-full max-w-[1308px] items-center gap-4 px-6 py-3 lg:px-8 xl:px-0">
        <Link
          to="/"
          className="shrink-0 font-serif text-[22px] font-semibold tracking-tight text-[#008768]"
        >
          viator
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-stone-500 transition hover:border-stone-400">
            <SearchIcon />
            <span className="truncate text-sm">Search for things to do</span>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 text-stone-700">
          <button type="button" className="inline-flex" aria-label="Wishlist">
            <HeartIcon />
          </button>
          <button type="button" className="inline-flex" aria-label="Account">
            <UserIcon />
          </button>
        </div>
      </div>

      <div className="border-t border-stone-100">
        <div className="mx-auto flex w-full max-w-[1308px] items-center justify-between gap-4 px-6 py-3 lg:px-8 xl:px-0">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm text-stone-500"
          >
            {BREADCRUMBS.map((crumb, i) => (
              <span key={crumb} className="inline-flex shrink-0 items-center gap-1">
                {i > 0 ? <ChevronRightTiny /> : null}
                <span className={i === BREADCRUMBS.length - 1 ? 'text-stone-800' : ''}>{crumb}</span>
              </span>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-5 text-xs text-stone-600 lg:flex">
            <span className="inline-flex items-center gap-1.5">
              <PhoneIcon />
              Book online or call
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ChatIcon />
              Chat now
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Mobile-web top bar — Figma [node 9937:8620](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620):
 * just the logo plus a search icon and hamburger menu — no breadcrumb, no search pill, no contacts row.
 */
export function OasisMobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-[13px] md:hidden">
      <Link
        to="/"
        className="shrink-0 font-serif text-[20px] font-semibold tracking-tight text-[#008768]"
      >
        viator
      </Link>
      <div className="flex shrink-0 items-center gap-4 text-stone-800">
        <button type="button" className="inline-flex" aria-label="Search">
          <SearchIcon width={24} height={24} />
        </button>
        <button type="button" className="inline-flex" aria-label="Open menu">
          <HamburgerIcon />
        </button>
      </div>
    </header>
  )
}
