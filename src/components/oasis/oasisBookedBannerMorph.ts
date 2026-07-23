import type { Transition } from 'framer-motion'

/**
 * Shared `layoutId` between the gallery's full "Typically booked" card
 * ({@link OasisMobileGallery}) and the slim strip docked in the sticky footer
 * ({@link OasisMobileStickyBar}). Framer Motion uses this to treat the two as
 * one element and animate/reshape between their positions instead of
 * crossfading two separate banners.
 */
export const BOOKED_BANNER_LAYOUT_ID = 'oasis-booked-banner'

export const BOOKED_BANNER_MORPH_TRANSITION: Transition = { type: 'spring', stiffness: 320, damping: 30 }
