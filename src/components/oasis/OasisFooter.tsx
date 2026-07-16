import { CollapsibleSection } from '../common/CollapsibleSection'

type FooterColumn = {
  title: string
  links: string[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Help Center',
    links: ['Contact support', 'Cancellation policy', 'COVID-19 updates', 'Trust & safety'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Blog'],
  },
  {
    title: 'Supplier sign up',
    links: ['List your experience', 'Partner portal', 'Affiliate program'],
  },
  {
    title: 'Travel Guides',
    links: ['Rome travel guide', 'Italy travel guide', 'Top attractions'],
  },
]

function AppStoreBadge() {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 px-3 text-xs text-white">
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.7 12.4c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.8 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 2-.9 2.7-2 .4-.6.7-1.2 1-1.9-1.3-.5-2.5-1.8-2.5-3.2z" />
      </svg>
      <span>App Store</span>
    </span>
  )
}

function GooglePlayBadge() {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 px-3 text-xs text-white">
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 3.5l11 8.5-11 8.5V3.5zM16 12l3.5 2.7-11.9 6.9L16 12zm4.6-4-3.6 2.7L4 3.5l16.6 4.5z" />
      </svg>
      <span>Google Play</span>
    </span>
  )
}

function SocialIcon({ path }: { path: string }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white">
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </span>
  )
}

const SOCIAL_ICON_PATHS = [
  'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  'M22 5.9a8.4 8.4 0 0 1-2.4.66 4.2 4.2 0 0 0 1.84-2.3 8.4 8.4 0 0 1-2.65 1 4.2 4.2 0 0 0-7.16 3.8A11.9 11.9 0 0 1 3 4.9a4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5 4.2 4.2 0 0 0 3.36 4.1 4.2 4.2 0 0 1-1.9.07 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 18.6a11.9 11.9 0 0 0 6.4 1.9c7.7 0 11.9-6.4 11.9-11.9v-.5A8.4 8.4 0 0 0 22 5.9z',
  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a4.7 4.7 0 1 1 0 9.4A4.7 4.7 0 0 1 12 5zm5.4-.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
]

/**
 * Oasis PDP footer — Figma [PDP ideas](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620):
 * link columns collapse into an accordion on mobile.
 */
export function OasisFooter() {
  return (
    <footer className="bg-[#0d0d0d] text-white">
      <div className="mx-auto w-full max-w-[1308px] px-4 py-10 sm:px-6 lg:px-8 xl:px-0">
        <div className="hidden grid-cols-4 gap-8 md:grid">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                {column.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divide-y divide-white/15 md:hidden">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="text-white [&_h2]:text-base [&_button]:py-4">
              <CollapsibleSection title={column.title} defaultOpen={false} disableLastBorderReset>
                <ul className="space-y-2.5 pb-2 text-sm text-white/70">
                  {column.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
          <div className="flex gap-3">
            {SOCIAL_ICON_PATHS.map((path) => (
              <SocialIcon key={path} path={path} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Viator, Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Privacy & Cookies Statement</span>
            <span>Terms & Conditions</span>
            <span>USD $</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
