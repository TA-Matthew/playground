import type { SVGProps } from 'react'

/**
 * Chevron-up from Figma (icon-only path bounds).
 */
export function WhatsIncludedAccordionChevronUpIcon({
  className = 'block shrink-0',
  ...rest
}: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      className={className}
      viewBox="844.895 11.995 14.212 9.107"
      width={18}
      height={12}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M857.303 19.712C857.693 20.1025 858.326 20.1025 858.717 19.712C859.107 19.3215 859.107 18.6883 858.717 18.2978L852.707 12.288C852.52 12.1005 852.265 11.9951 852 11.9951C851.735 11.9951 851.48 12.1011 851.292 12.2887L845.285 18.2958C844.895 18.6863 844.895 19.3195 845.285 19.71C845.676 20.1006 846.309 20.1006 846.699 19.71L852 14.4093L857.303 19.712ZM852 12.9951L851.292 12.2887C851.292 12.2887 851.293 12.288 852 12.9951Z"
        fill="currentColor"
      />
    </svg>
  )
}
