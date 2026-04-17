export function AdditionalInfo() {
  return (
    <div className="mt-1 grid gap-8 md:grid-cols-2 md:gap-12">
      <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-stone-700 marker:text-stone-400">
        <li>Confirmation will be received at time of booking, unless booked within 1 day of travel.</li>
        <li>Not wheelchair accessible</li>
        <li>Near public transportation</li>
      </ul>
      <div className="space-y-4 text-[15px] leading-relaxed text-stone-700">
        <p>
          Please note that there is no hotel pickup/drop off available for this tour. All visitors
          must pass through airport-style security. During high season the wait at security may be
          up to 30 minutes.
        </p>
        <p>
          St Peter’s Basilica and/or the Sistine Chapel may be subject to last-minute closures for
          religious ceremonies. When this occurs, an extended itinerary within the Museums will be
          offered in place of time spent inside the Chapel or Basilica.
        </p>
      </div>
    </div>
  )
}
