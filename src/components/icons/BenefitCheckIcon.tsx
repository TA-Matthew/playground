/** Circle + check — same asset as booking sidebar benefits (fill `#008768`). */
export function BenefitCheckIcon({
  className = 'h-5 w-5 shrink-0',
}: {
  readonly className?: string
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10ZM13.3536 8.35355C13.5488 8.15829 13.5488 7.84171 13.3536 7.64645C13.1583 7.45118 12.8417 7.45118 12.6464 7.64645L9 11.2929L7.35355 9.64645C7.15829 9.45118 6.84171 9.45118 6.64645 9.64645C6.45118 9.84171 6.45118 10.1583 6.64645 10.3536L8.64645 12.3536C8.84171 12.5488 9.15829 12.5488 9.35355 12.3536L13.3536 8.35355Z"
        fill="#008768"
      />
    </svg>
  )
}
