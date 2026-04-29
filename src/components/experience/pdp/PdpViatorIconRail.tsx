import type { IconRailItem } from '../../../data/viatorListing'

function ClockIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.5 6.75C12.5 6.33579 12.1642 6 11.75 6C11.3358 6 11 6.33579 11 6.75V12.25C11 12.6642 11.3358 13 11.75 13H16.5C16.9142 13 17.25 12.6642 17.25 12.25C17.25 11.8358 16.9142 11.5 16.5 11.5H12.5V6.75Z"
        fill="#008768"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z"
        fill="#008768"
      />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 2C7.23122 2 6 3.23122 6 4.75V19.25C6 20.7688 7.23122 22 8.75 22H15.25C16.7688 22 18 20.7688 18 19.25V4.75C18 3.23122 16.7688 2 15.25 2H8.75ZM16.5 16.5V4.75C16.5 4.05964 15.9404 3.5 15.25 3.5H8.75C8.05964 3.5 7.5 4.05964 7.5 4.75V16.5H16.5ZM7.5 18H16.5V19.25C16.5 19.9404 15.9404 20.5 15.25 20.5H8.75C8.05964 20.5 7.5 19.9404 7.5 19.25V18Z"
        fill="#008768"
      />
    </svg>
  )
}

function LangIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7.25 16C7.66421 16 8 15.6642 8 15.25C8 14.8358 7.66421 14.5 7.25 14.5C6.83579 14.5 6.5 14.8358 6.5 15.25C6.5 15.6642 6.83579 16 7.25 16Z"
        fill="#008768"
      />
      <path
        d="M11 15.25C11 15.6642 10.6642 16 10.25 16C9.83579 16 9.5 15.6642 9.5 15.25C9.5 14.8358 9.83579 14.5 10.25 14.5C10.6642 14.5 11 14.8358 11 15.25Z"
        fill="#008768"
      />
      <path
        d="M13.25 16C13.6642 16 14 15.6642 14 15.25C14 14.8358 13.6642 14.5 13.25 14.5C12.8358 14.5 12.5 14.8358 12.5 15.25C12.5 15.6642 12.8358 16 13.25 16Z"
        fill="#008768"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 2C6.93578 2 5.42247 3.28832 5.07501 5H4.25C3.00736 5 2 6.00736 2 7.25V17.25C2 18.4926 3.00736 19.5 4.25 19.5H5V21.25C5 21.5099 5.13459 21.7513 5.3557 21.888C5.57681 22.0246 5.85292 22.0371 6.08541 21.9208L10.9271 19.5H17.25C18.4926 19.5 19.5 18.4926 19.5 17.25V16.2866C20.9565 15.7718 22 14.3828 22 12.75V5.75C22 3.67893 20.3211 2 18.25 2H8.75ZM17.25 5H6.62803C6.93691 4.12611 7.77034 3.5 8.75 3.5H18.25C19.4926 3.5 20.5 4.50736 20.5 5.75V12.75C20.5 13.5301 20.103 14.2175 19.5 14.6211V7.25C19.5 6.00736 18.4926 5 17.25 5ZM4.25 6.5C3.83579 6.5 3.5 6.83579 3.5 7.25V17.25C3.5 17.6642 3.83579 18 4.25 18H6.5V20.0365L10.5729 18H17.25C17.6642 18 18 17.6642 18 17.25V7.25C18 6.83579 17.6642 6.5 17.25 6.5H4.25Z"
        fill="#008768"
      />
    </svg>
  )
}

const iconMap = {
  clock: ClockIcon,
  mobile: MobileIcon,
  language: LangIcon,
} as const

type Props = { items: readonly IconRailItem[] }

/**
 * Features row — flex wrap, 16px gap, neutral/80 borders; DS icons #008768;
 * copy global/body title (16px / 400 / #000).
 */
export function PdpViatorIconRail({ items }: Props) {
  return (
    <ul
      className="box-border flex w-full flex-row flex-wrap content-start items-start gap-4 border-y border-[#d9d9d9] py-4 font-sans"
      aria-label="Quick facts"
    >
      {items.map((it) => {
        const Ic = iconMap[it.icon]
        return (
          <li key={it.id} className="flex min-h-6 max-w-full items-center gap-2">
            <Ic />
            <span className="whitespace-nowrap text-base font-normal leading-[1.5] text-[#000000]">
              {it.label ? (
                <>
                  {it.label}: {it.value}
                </>
              ) : (
                it.value
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
