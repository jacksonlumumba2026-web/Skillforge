/**
 * Prices in Kenyan shillings, in one place so the checkout routes, the
 * purchase UI and the bundle page cannot drift apart.
 *
 * BUNDLE_COURSE_COUNT is enforced server-side in the bundle initiate route,
 * not just in the picker — a client that posts nine or eleven course ids is
 * rejected. The picker only makes the rule visible.
 */
export const SINGLE_COURSE_PRICE = 500;
export const BUNDLE_PRICE = 1000;
export const BUNDLE_COURSE_COUNT = 10;
