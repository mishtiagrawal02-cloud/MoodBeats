/**
 * Small shared formatting helpers for study-flow displays.
 * Pure functions so check-in and receipt components always agree.
 */

/**
 * Formats a signed point delta for the impact badges.
 * Reduced stress is a positive outcome, so callers pass (pre - post) for stress.
 *   1  -> "+1 pts"
 *   3  -> "+3 pts"
 *  -1  -> "-1 pts"
 *   0  -> "0 pts"
 */
export function formatPointDelta(delta) {
  if (delta > 0) return `+${delta} pts`;
  if (delta < 0) return `${delta} pts`;
  return '0 pts';
}

/**
 * Formats a duration in minutes with correct pluralization.
 *   1 -> "1 minute", 2 -> "2 minutes", 0 -> "0 minutes"
 */
export function formatDurationLabel(mins) {
  const value = Math.max(0, Math.round(Number(mins) || 0));
  return `${value} ${value === 1 ? 'minute' : 'minutes'}`;
}
