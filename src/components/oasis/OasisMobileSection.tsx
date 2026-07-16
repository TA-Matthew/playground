import type { ReactNode } from 'react'

/**
 * Mobile-web section wrapper — Figma [node 9937:8620](https://www.figma.com/design/8TMWFcCFxTled8jPX2ZbwH/PDP-ideas?node-id=9937-8620):
 * a static heading + top divider, no accordion chevron (unlike the desktop {@link CollapsibleSection}).
 */
export function OasisMobileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#d9d9d9] py-6">
      <h2 className="text-[20px] font-medium leading-[1.2] tracking-[0.2px] text-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
