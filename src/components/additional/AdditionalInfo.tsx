export function AdditionalInfo() {
  return (
    <div className="mt-1">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <ul className="pdp-tour-summary-body list-disc space-y-3 pl-5 marker:text-black">
          <li>Confirmation will be received at time of booking</li>
          <li>Not wheelchair accessible</li>
          <li>Stroller accessible</li>
        </ul>
        <ul className="pdp-tour-summary-body list-disc space-y-4 pl-5 marker:text-black">
          <li>
            Unforeseen events: The Vatican is its own country and therefore the Pope can decide also
            last minute to close St. Peter&apos;s Basilica for ad hoc events. It is a very rare event
            during the year but it is possible and we will do our best to inform you. If it is too
            late to inform you, our guide will extend the tour in the Vatican. Not to worry that the
            incredible collection of Vatican Museums and the masterpiece of Michelangelo in the
            Sistine Chapel will still be included.
          </li>
          <li>
            Most of our tours include the Vatican Museums, Sistine Chapel, and St. Peter&apos;s
            Basilica. However, there are two specific options with different inclusions. You will find
            below:
          </li>
          <li>
            Museums & SISTINE CHAPEL Tour – Includes the Vatican Museums and Sistine Chapel but does
            NOT include St. Peter&apos;s Basilica.
          </li>
        </ul>
      </div>
      <div className="mt-6 flex justify-start md:mt-8">
        <button type="button" className="pdp-neutral-outline-btn-md">
          Show 4 more
        </button>
      </div>
    </div>
  )
}
