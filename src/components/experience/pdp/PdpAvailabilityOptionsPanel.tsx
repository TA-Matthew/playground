import {
  getTourGradeOption,
  TOUR_GRADE_OPTIONS,
} from '../../../data/availabilityShortcutOptions'
import type { AvailabilityTravelerCounts } from '../../../data/availabilityShortcutTravelers'
import { TourGradeOptionCard } from './TourGradeOptionCard'

type Props = {
  readonly selectedOptionId: string
  readonly travelerCounts: AvailabilityTravelerCounts
  readonly dateLabel: string
  readonly onSelectedOptionChange: (optionId: string) => void
}

/**
 * Post-select availability options — expanded first tour grade + collapsed siblings.
 * @see https://www.figma.com/design/XLfn1VEQ5xuNYjx2FF9D2Y/B2C-Web---Page-templates?node-id=17670-82160
 */
export function PdpAvailabilityOptionsPanel({
  selectedOptionId,
  travelerCounts,
  dateLabel,
  onSelectedOptionChange,
}: Props) {
  const selected = getTourGradeOption(selectedOptionId) ?? TOUR_GRADE_OPTIONS[0]
  const collapsedOptions = TOUR_GRADE_OPTIONS.filter((option) => option.id !== selected.id)

  return (
    <div className="relative flex flex-col gap-4 pb-4 lg:pb-6">
      {selected.scarcityLabel ? (
        <span className="absolute -top-3 left-6 z-10 inline-flex rounded-md bg-[#feece9] px-1 py-1 text-xs font-medium leading-4 text-[#ae3e38]">
          {selected.scarcityLabel}
        </span>
      ) : null}

      <TourGradeOptionCard
        option={selected}
        variant="expanded"
        travelerCounts={travelerCounts}
        dateLabel={dateLabel}
      />

      {collapsedOptions.map((option) => (
        <TourGradeOptionCard
          key={option.id}
          option={option}
          variant="collapsed"
          travelerCounts={travelerCounts}
          onSelect={() => onSelectedOptionChange(option.id)}
        />
      ))}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          className="rounded-lg border-[1.5px] border-[#0d0d0d] bg-white px-6 py-2.5 text-base font-medium leading-6 text-[#0d0d0d] transition hover:bg-neutral-50"
        >
          Show 2 More
        </button>
      </div>
    </div>
  )
}
