/**
 * Motion tokens (Research/Design/references.md, decision 36). Calibrated from
 * Lasso, Stripe, Ramp and Mercury, scaled to a 380px panel: quick ease-out
 * curves, transform and opacity only, reveal once and then stay still.
 */

/** Things arriving: Stripe's expo-out. */
export const EASE_ENTER = [0.16, 1, 0.3, 1] as const;
/** Things changing state: Stripe's quart-out. */
export const EASE_STATE = [0.25, 1, 0.5, 1] as const;

/** Seconds. fast = hover and color; base = tabs, expand, exits; reveal = bars and cards; signature = dissolve and range plot. */
export const DUR = { fast: 0.15, base: 0.3, reveal: 0.6, signature: 0.8 } as const;

/** Layout changes and shared elements (Lasso uses bounce 0.2 at desktop scale). */
export const SPRING = { type: "spring", bounce: 0.15, visualDuration: 0.45 } as const;

/** How far cards rise when they arrive, in px. */
export const RISE = 8;
/** Delay between siblings in a reveal, in seconds. */
export const STAGGER = 0.04;

/** The dither grid's column pitch, in px: fills advance one dot column at a time. */
export const DOT = 3;
