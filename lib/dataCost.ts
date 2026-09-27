/**
 * Estimates what a lesson costs to watch, in megabytes.
 *
 * The honesty rule here matters more than the arithmetic. An estimate is
 * only shown when we know the video's REAL length from
 * `lessons.duration_seconds`; there is no fallback guess. Showing an invented
 * figure to someone deciding whether they can afford to open a lesson is
 * worse than showing nothing, because they would budget against it.
 *
 * Bitrates below are typical YouTube streaming rates including audio. They
 * are approximations of a variable thing — a talking-head lesson uses less
 * than screen-recorded motion — so every figure is rendered with "about" and
 * the quality it assumes, never as a precise promise.
 */

export type VideoQuality = "360p" | "480p" | "720p";

/** Megabits per second, video plus audio. */
const BITRATE_MBPS: Record<VideoQuality, number> = {
  "360p": 0.46,
  "480p": 0.96,
  "720p": 2.13,
};

/**
 * The quality the app tells learners to pick in DataSaverNote, so estimates
 * match the advice rather than contradicting it.
 */
export const DEFAULT_QUALITY: VideoQuality = "480p";

export function estimateDataCostMb(
  durationSeconds: number,
  quality: VideoQuality = DEFAULT_QUALITY,
): number {
  const megabits = BITRATE_MBPS[quality] * durationSeconds;
  return megabits / 8;
}

/**
 * "about 12 MB at 480p" — or null when the duration is unknown, which is the
 * signal to show general guidance instead of a number.
 */
export function formatDataCost(
  durationSeconds: number | null,
  quality: VideoQuality = DEFAULT_QUALITY,
): string | null {
  if (!durationSeconds || durationSeconds <= 0) return null;

  const mb = estimateDataCostMb(durationSeconds, quality);
  // Below 1 MB the rounding is noise, and "0 MB" would read as free.
  if (mb < 1) return `under 1 MB at ${quality}`;
  return `about ${Math.round(mb)} MB at ${quality}`;
}

/** Compact form for a dense list: "~12 MB". */
export function formatDataCostShort(
  durationSeconds: number | null,
  quality: VideoQuality = DEFAULT_QUALITY,
): string | null {
  if (!durationSeconds || durationSeconds <= 0) return null;
  const mb = estimateDataCostMb(durationSeconds, quality);
  return mb < 1 ? "~1 MB" : `~${Math.round(mb)} MB`;
}
