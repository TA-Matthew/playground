import { useEffect, useState } from 'react'

const REVEAL_DELAY_MS = 2000
const SCROLL_THRESHOLD_PX = 4

/**
 * Airbnb-style "usually booked" banner behavior: holds its initial spot for a grace period,
 * then docks into a slim sticky strip the first time the user scrolls after that grace period.
 */
export function useDockedBookedBanner() {
  const [readyToDock, setReadyToDock] = useState(false)
  const [docked, setDocked] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReadyToDock(true), REVEAL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!readyToDock || docked) return
    const handleScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD_PX) setDocked(true)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [readyToDock, docked])

  return docked
}
